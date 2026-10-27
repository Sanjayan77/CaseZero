import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Case, Investigation, Evidence, DiscoveredEvidence, EvidenceBoardNode
from app.schemas.schemas import CasePublic, CaseDetail, InvestigationOut

router = APIRouter(prefix="/api/cases", tags=["Cases"])

@router.get("", response_model=List[CasePublic])
def list_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).all()
    return [CasePublic.model_validate(c) for c in cases]

@router.get("/{case_id}", response_model=CaseDetail)
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case file not found")
    return CaseDetail.model_validate(case)

@router.post("/{case_id}/start", response_model=InvestigationOut)
def start_or_resume_case(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case file not found")

    investigation = db.query(Investigation).filter(
        Investigation.user_id == current_user.id,
        Investigation.case_id == case.id
    ).first()

    if not investigation:
        investigation = Investigation(
            user_id=current_user.id,
            case_id=case.id,
            status="in_progress",
            started_at=datetime.datetime.utcnow()
        )
        db.add(investigation)
        db.commit()
        db.refresh(investigation)

        # Unlock initial discovered evidence items
        initial_evidences = db.query(Evidence).filter(
            Evidence.case_id == case.id,
            Evidence.initial_discovered == True
        ).all()

        for ev in initial_evidences:
            disc = DiscoveredEvidence(
                investigation_id=investigation.id,
                evidence_id=ev.id,
                discovered_at=datetime.datetime.utcnow(),
                inspected=False
            )
            db.add(disc)

        # Add initial starting nodes to the Evidence Board
        board_nodes = [
            EvidenceBoardNode(
                investigation_id=investigation.id,
                node_id="node_victim",
                node_type="event",
                title="Adrian Vale (Deceased)",
                content="Found slumped at study desk. 20:25-20:35.",
                pos_x=420.0,
                pos_y=220.0,
                color="#D9535D"
            ),
            EvidenceBoardNode(
                investigation_id=investigation.id,
                node_id="node_locked_door",
                node_type="evidence",
                ref_code="EV-01",
                title="Locked Study Door",
                content="Brass deadbolt thrown shut from inside.",
                pos_x=220.0,
                pos_y=120.0,
                color="#D5AA63"
            ),
            EvidenceBoardNode(
                investigation_id=investigation.id,
                node_id="node_scotch",
                node_type="evidence",
                ref_code="EV-02",
                title="Poisoned Scotch Glass",
                content="Digitalis Purpurea residue.",
                pos_x=620.0,
                pos_y=120.0,
                color="#D5AA63"
            )
        ]
        for bn in board_nodes:
            db.add(bn)

        db.commit()
        db.refresh(investigation)

    discovered_count = db.query(DiscoveredEvidence).filter(
        DiscoveredEvidence.investigation_id == investigation.id
    ).count()

    inspected_count = db.query(DiscoveredEvidence).filter(
        DiscoveredEvidence.investigation_id == investigation.id,
        DiscoveredEvidence.inspected == True
    ).count()

    inv_out = InvestigationOut(
        id=investigation.id,
        case_id=investigation.case_id,
        case=CasePublic.model_validate(case),
        status=investigation.status,
        started_at=investigation.started_at,
        completed_at=investigation.completed_at,
        final_score=investigation.final_score,
        discovered_count=discovered_count,
        inspected_count=inspected_count
    )
    return inv_out
