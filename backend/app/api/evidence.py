import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Investigation, Evidence, DiscoveredEvidence
from app.schemas.schemas import DiscoveredEvidenceOut, EvidenceInspectRequest

router = APIRouter(prefix="/api/investigations/{id}/evidence", tags=["Evidence"])

def _get_user_investigation(id: int, user_id: int, db: Session) -> Investigation:
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    if inv.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden access to this investigation")
    return inv

@router.get("", response_model=List[DiscoveredEvidenceOut])
def get_discovered_evidence(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    discoveries = db.query(DiscoveredEvidence).filter(
        DiscoveredEvidence.investigation_id == inv.id
    ).join(Evidence).order_by(Evidence.evidence_code).all()

    return [DiscoveredEvidenceOut.model_validate(d) for d in discoveries]

@router.post("/{evidence_id}/inspect", response_model=DiscoveredEvidenceOut)
def inspect_evidence(
    id: int,
    evidence_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    discovery = db.query(DiscoveredEvidence).filter(
        DiscoveredEvidence.investigation_id == inv.id,
        DiscoveredEvidence.evidence_id == evidence_id
    ).first()

    if not discovery:
        raise HTTPException(status_code=404, detail="Discovered evidence record not found")

    discovery.inspected = True
    discovery.inspected_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(discovery)

    return DiscoveredEvidenceOut.model_validate(discovery)

@router.post("/{evidence_id}/pin", response_model=DiscoveredEvidenceOut)
def toggle_pin_evidence(
    id: int,
    evidence_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    discovery = db.query(DiscoveredEvidence).filter(
        DiscoveredEvidence.investigation_id == inv.id,
        DiscoveredEvidence.evidence_id == evidence_id
    ).first()

    if not discovery:
        raise HTTPException(status_code=404, detail="Discovered evidence record not found")

    discovery.pinned = not discovery.pinned
    db.commit()
    db.refresh(discovery)

    return DiscoveredEvidenceOut.model_validate(discovery)

@router.post("/{evidence_id}/note", response_model=DiscoveredEvidenceOut)
def update_evidence_note(
    id: int,
    evidence_id: int,
    notes: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    discovery = db.query(DiscoveredEvidence).filter(
        DiscoveredEvidence.investigation_id == inv.id,
        DiscoveredEvidence.evidence_id == evidence_id
    ).first()

    if not discovery:
        raise HTTPException(status_code=404, detail="Discovered evidence record not found")

    discovery.player_notes = notes
    db.commit()
    db.refresh(discovery)

    return DiscoveredEvidenceOut.model_validate(discovery)

from pydantic import BaseModel
class DiscoverEvidenceRequest(BaseModel):
    evidence_code: str

@router.post("/discover", response_model=DiscoveredEvidenceOut)
def discover_evidence_by_code(
    id: int,
    request: DiscoverEvidenceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    ev = db.query(Evidence).filter(
        Evidence.case_id == inv.case_id,
        Evidence.evidence_code == request.evidence_code
    ).first()
    if not ev:
        raise HTTPException(status_code=404, detail=f"Evidence {request.evidence_code} not found")

    discovery = db.query(DiscoveredEvidence).filter(
        DiscoveredEvidence.investigation_id == inv.id,
        DiscoveredEvidence.evidence_id == ev.id
    ).first()

    if not discovery:
        discovery = DiscoveredEvidence(
            investigation_id=inv.id,
            evidence_id=ev.id,
            discovered_at=datetime.datetime.utcnow(),
            inspected=True,
            inspected_at=datetime.datetime.utcnow()
        )
        db.add(discovery)
        db.commit()
        count = db.query(DiscoveredEvidence).filter(DiscoveredEvidence.investigation_id == inv.id).count()
        inv.discovered_count = count
        db.commit()
        db.refresh(discovery)

    return DiscoveredEvidenceOut.model_validate(discovery)

