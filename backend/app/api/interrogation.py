import json
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import (
    User, Investigation, Suspect, Interview, InterviewMessage, Evidence, DiscoveredEvidence
)
from app.schemas.schemas import SuspectOut, InterviewOut, InterviewMessageOut, SendMessageRequest
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/investigations/{id}", tags=["Interrogation"])

def _get_user_investigation(id: int, user_id: int, db: Session) -> Investigation:
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    if inv.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return inv

@router.get("/suspects", response_model=List[SuspectOut])
def get_investigation_suspects(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    suspects = db.query(Suspect).filter(Suspect.case_id == inv.case_id).all()
    return [SuspectOut.model_validate(s) for s in suspects]

@router.get("/interviews/{suspect_id}", response_model=InterviewOut)
def get_or_create_interview(
    id: int,
    suspect_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    suspect = db.query(Suspect).filter(Suspect.id == suspect_id, Suspect.case_id == inv.case_id).first()
    if not suspect:
        raise HTTPException(status_code=404, detail="Suspect profile not found")

    interview = db.query(Interview).filter(
        Interview.investigation_id == inv.id,
        Interview.suspect_id == suspect.id
    ).first()

    if not interview:
        interview = Interview(
            investigation_id=inv.id,
            suspect_id=suspect.id,
            status="uninterviewed",
            last_interaction_at=datetime.datetime.utcnow()
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)

        # Initial greeting from suspect
        initial_greeting = f"I am {suspect.name}. I understand you are investigating Adrian's death. Ask what you must, Detective."
        msg = InterviewMessage(
            interview_id=interview.id,
            sender="suspect",
            content=initial_greeting,
            emotion="neutral",
            created_at=datetime.datetime.utcnow()
        )
        db.add(msg)
        db.commit()
        db.refresh(interview)

    return InterviewOut.model_validate(interview)

@router.post("/interviews/{suspect_id}/messages", response_model=InterviewMessageOut)
async def send_interrogation_message(
    id: int,
    suspect_id: int,
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    suspect = db.query(Suspect).filter(Suspect.id == suspect_id, Suspect.case_id == inv.case_id).first()
    if not suspect:
        raise HTTPException(status_code=404, detail="Suspect not found")

    interview = db.query(Interview).filter(
        Interview.investigation_id == inv.id,
        Interview.suspect_id == suspect.id
    ).first()

    if not interview:
        interview = Interview(
            investigation_id=inv.id,
            suspect_id=suspect.id,
            status="in_progress",
            last_interaction_at=datetime.datetime.utcnow()
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)

    # Validate referenced evidence if provided
    ref_evidence_data = None
    if request.referenced_evidence_code:
        # Check that player actually discovered this evidence
        ev = db.query(Evidence).filter(
            Evidence.case_id == inv.case_id,
            Evidence.evidence_code == request.referenced_evidence_code
        ).first()
        if ev:
            disc = db.query(DiscoveredEvidence).filter(
                DiscoveredEvidence.investigation_id == inv.id,
                DiscoveredEvidence.evidence_id == ev.id
            ).first()
            if not disc:
                raise HTTPException(
                    status_code=400,
                    detail=f"You cannot present evidence {request.referenced_evidence_code} before discovering it."
                )
            ref_evidence_data = {
                "evidence_code": ev.evidence_code,
                "title": ev.title,
                "category": ev.category,
                "short_description": ev.short_description
            }

    # Record player message
    player_msg = InterviewMessage(
        interview_id=interview.id,
        sender="player",
        content=request.content,
        referenced_evidence_code=request.referenced_evidence_code,
        created_at=datetime.datetime.utcnow()
    )
    db.add(player_msg)
    interview.status = "in_progress"
    interview.last_interaction_at = datetime.datetime.utcnow()
    db.commit()

    # Load recent conversation history
    past_messages = db.query(InterviewMessage).filter(
        InterviewMessage.interview_id == interview.id
    ).order_by(InterviewMessage.created_at.desc()).limit(8).all()
    past_messages.reverse()

    dialogue_history = [{"sender": m.sender, "content": m.content} for m in past_messages]

    # Load discovered evidence summary for AI context
    discoveries = db.query(DiscoveredEvidence).filter(
        DiscoveredEvidence.investigation_id == inv.id
    ).join(Evidence).all()

    discovered_evidence_list = [
        {"code": d.evidence.evidence_code, "title": d.evidence.title}
        for d in discoveries
    ]

    # Generate response
    ai_result = await ai_service.generate_suspect_response(
        suspect_name=suspect.name,
        suspect_role=suspect.role,
        personality_prompt=suspect.personality_prompt,
        known_facts=json.loads(suspect.known_facts),
        private_secrets=json.loads(suspect.private_secrets),
        discovered_evidence=discovered_evidence_list,
        dialogue_history=dialogue_history,
        player_message=request.content,
        referenced_evidence=ref_evidence_data
    )

    # Save suspect response
    suspect_msg = InterviewMessage(
        interview_id=interview.id,
        sender="suspect",
        content=ai_result["response"],
        emotion=ai_result.get("emotion", "neutral"),
        is_fallback=ai_result.get("is_fallback", False),
        created_at=datetime.datetime.utcnow()
    )
    db.add(suspect_msg)

    # Dynamic clue discovery through interrogation
    # E.g. When Marcus is confronted with dropped call EV-04 or Aegis wire EV-03, discover EV-08 (cufflinks) and EV-14 (monofilament thread)
    unlocked_codes = []
    if "marcus" in suspect.name.lower() and (request.referenced_evidence_code in ["EV-03", "EV-04"] or "phone" in request.content.lower() or "aegis" in request.content.lower()):
        unlocked_codes.extend(["EV-08", "EV-14", "EV-04"])
    elif "nina" in suspect.name.lower() and ("bag" in request.content.lower() or "digitalis" in request.content.lower() or request.referenced_evidence_code == "EV-05"):
        unlocked_codes.append("EV-04")

    for code in unlocked_codes:
        ev_to_unlock = db.query(Evidence).filter(
            Evidence.case_id == inv.case_id,
            Evidence.evidence_code == code
        ).first()
        if ev_to_unlock:
            already = db.query(DiscoveredEvidence).filter(
                DiscoveredEvidence.investigation_id == inv.id,
                DiscoveredEvidence.evidence_id == ev_to_unlock.id
            ).first()
            if not already:
                db.add(DiscoveredEvidence(
                    investigation_id=inv.id,
                    evidence_id=ev_to_unlock.id,
                    discovered_at=datetime.datetime.utcnow()
                ))

    db.commit()
    db.refresh(suspect_msg)

    return InterviewMessageOut.model_validate(suspect_msg)
