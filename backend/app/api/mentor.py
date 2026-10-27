from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Investigation
from app.services.mentor_service import MentorService

router = APIRouter(prefix="/api/investigations/{id}/mentor", tags=["Detective Mentor"])

class DraftTheoryRequest(BaseModel):
    suspect_name: str
    motive: str = ""
    method: str = ""
    timeline: Optional[str] = ""
    timeline_explanation: Optional[str] = ""
    evidence_codes: Optional[List[str]] = []
    supporting_evidence_codes: Optional[List[str]] = []
    written_deduction: Optional[str] = ""

def _get_user_investigation(id: int, user_id: int, db: Session) -> Investigation:
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    if inv.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return inv

@router.get("")
def get_mentor_guidance(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    return MentorService.get_mentor_guidance(inv, db)

@router.get("/explain/{evidence_code}")
def explain_evidence(
    id: int,
    evidence_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    return MentorService.explain_evidence(evidence_code)

@router.post("/pre-review")
def review_draft_theory(
    id: int,
    draft: DraftTheoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    effective_timeline = draft.timeline or draft.timeline_explanation or ""
    effective_ev_codes = draft.evidence_codes or draft.supporting_evidence_codes or []
    return MentorService.evaluate_draft_theory(
        suspect_name=draft.suspect_name,
        motive=draft.motive,
        method=draft.method,
        timeline=effective_timeline,
        evidence_codes=effective_ev_codes
    )
