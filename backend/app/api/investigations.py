from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Investigation, Case, DiscoveredEvidence
from app.schemas.schemas import InvestigationOut, CasePublic

router = APIRouter(prefix="/api/investigations", tags=["Investigations"])

@router.get("", response_model=List[InvestigationOut])
def list_user_investigations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    investigations = db.query(Investigation).filter(Investigation.user_id == current_user.id).all()
    results = []
    for inv in investigations:
        disc_cnt = db.query(DiscoveredEvidence).filter(DiscoveredEvidence.investigation_id == inv.id).count()
        insp_cnt = db.query(DiscoveredEvidence).filter(
            DiscoveredEvidence.investigation_id == inv.id,
            DiscoveredEvidence.inspected == True
        ).count()
        results.append(InvestigationOut(
            id=inv.id,
            case_id=inv.case_id,
            case=CasePublic.model_validate(inv.case),
            status=inv.status,
            started_at=inv.started_at,
            completed_at=inv.completed_at,
            final_score=inv.final_score,
            discovered_count=disc_cnt,
            inspected_count=insp_cnt
        ))
    return results

@router.get("/{id}", response_model=InvestigationOut)
def get_investigation(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")
    if inv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this investigation")

    disc_cnt = db.query(DiscoveredEvidence).filter(DiscoveredEvidence.investigation_id == inv.id).count()
    insp_cnt = db.query(DiscoveredEvidence).filter(
        DiscoveredEvidence.investigation_id == inv.id,
        DiscoveredEvidence.inspected == True
    ).count()

    return InvestigationOut(
        id=inv.id,
        case_id=inv.case_id,
        case=CasePublic.model_validate(inv.case),
        status=inv.status,
        started_at=inv.started_at,
        completed_at=inv.completed_at,
        final_score=inv.final_score,
        discovered_count=disc_cnt,
        inspected_count=insp_cnt
    )
