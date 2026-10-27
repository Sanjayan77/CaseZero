from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Investigation, DiscoveredEvidence, Evidence, Suspect
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/investigations/{id}/assistant", tags=["Assistant Detective"])

class AssistantChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, str]]] = []

class AssistantChatResponse(BaseModel):
    response: str
    is_real_ai: bool = True
    model_used: Optional[str] = None
    error: Optional[str] = None

def _get_user_investigation(id: int, user_id: int, db: Session) -> Investigation:
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    if inv.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return inv

@router.post("/chat", response_model=AssistantChatResponse)
async def chat_with_assistant(
    id: int,
    request: AssistantChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)

    # 1. Gather all currently discovered evidence
    discoveries = db.query(DiscoveredEvidence).filter(
        DiscoveredEvidence.investigation_id == inv.id
    ).join(Evidence).all()

    evidence_data = [
        {
            "code": d.evidence.evidence_code,
            "title": d.evidence.title,
            "category": d.evidence.category,
            "description": d.evidence.short_description,
            "inspected": d.inspected,
            "pinned": d.pinned,
            "notes": d.player_notes,
            "details": d.evidence.forensic_details or ""
        }
        for d in discoveries
    ]

    # 2. Gather suspects and alibis
    suspects = db.query(Suspect).filter(Suspect.case_id == inv.case_id).all()
    suspects_data = [
        {
            "name": s.name,
            "role": s.role,
            "alibi": s.known_alibi,
            "relationship": s.relationship_to_victim
        }
        for s in suspects
    ]

    # 3. Investigation overview
    investigation_data = {
        "id": inv.id,
        "case_id": inv.case_id,
        "status": inv.status
    }

    # 4. Invoke AI Service
    result = await ai_service.generate_assistant_response(
        user_message=request.message,
        investigation_data=investigation_data,
        discovered_evidence=evidence_data,
        suspects=suspects_data,
        chat_history=request.chat_history
    )

    return AssistantChatResponse(
        response=result.get("response", "No response generated."),
        is_real_ai=result.get("is_real_ai", True),
        model_used=result.get("model_used"),
        error=result.get("error")
    )
