import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Investigation, TimelineEvent
from app.schemas.schemas import TimelineEventOut

router = APIRouter(prefix="/api/investigations/{id}/timeline", tags=["Timeline"])

def _get_user_investigation(id: int, user_id: int, db: Session) -> Investigation:
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    if inv.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return inv

@router.get("", response_model=List[TimelineEventOut])
def get_timeline(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    events = db.query(TimelineEvent).filter(TimelineEvent.case_id == inv.case_id).all()

    results = []
    for ev in events:
        suspects = json.loads(ev.associated_suspects) if ev.associated_suspects else []
        ev_codes = json.loads(ev.supporting_evidence_codes) if ev.supporting_evidence_codes else []
        results.append(TimelineEventOut(
            id=ev.id,
            time_marker=ev.time_marker,
            title=ev.title,
            location=ev.location,
            description=ev.description,
            is_established_fact=ev.is_established_fact,
            associated_suspects=suspects,
            conflicting_claims=ev.conflicting_claims,
            supporting_evidence_codes=ev_codes
        ))
    return results
