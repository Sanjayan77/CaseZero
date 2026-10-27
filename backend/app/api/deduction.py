import json
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Investigation, Case
from app.schemas.schemas import AccusationSubmitRequest, AccusationResultOut, ScoreBreakdownSchema
from app.services.scoring_service import ScoringService

router = APIRouter(prefix="/api/investigations/{id}", tags=["Deduction & Scoring"])

def _get_user_investigation(id: int, user_id: int, db: Session) -> Investigation:
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    if inv.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return inv

@router.post("/accusation", response_model=AccusationResultOut)
def submit_final_accusation(
    id: int,
    request: AccusationSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    case = inv.case

    # Compute deterministic score breakdown
    score_breakdown = ScoringService.evaluate_accusation(
        case=case,
        suspect_name=request.suspect_name,
        motive=request.motive,
        method=request.method,
        timeline_explanation=request.timeline_explanation,
        supporting_evidence_codes=request.supporting_evidence_codes,
        written_deduction=request.written_deduction
    )

    # Persist completion and score
    inv.status = "completed"
    inv.completed_at = datetime.datetime.utcnow()
    inv.final_score = score_breakdown.total_score
    inv.score_breakdown = json.dumps(score_breakdown.model_dump())
    inv.accusation_data = json.dumps(request.model_dump())
    db.commit()
    db.refresh(inv)

    decisive_codes = json.loads(case.decisive_evidence_codes)
    suspect_resolutions = ScoringService.get_suspect_resolutions()

    return AccusationResultOut(
        investigation_id=inv.id,
        status=inv.status,
        final_score=inv.final_score,
        score_breakdown=score_breakdown,
        actual_culprit=case.culprit_suspect_name,
        actual_motive=case.canonical_motive,
        actual_method=case.canonical_method,
        actual_timeline_solution=case.canonical_timeline_solution,
        canonical_explanation=case.canonical_solution_explanation,
        decisive_evidence=decisive_codes,
        suspect_resolutions=suspect_resolutions
    )

@router.get("/results", response_model=AccusationResultOut)
def get_accusation_results(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    if inv.status != "completed" or not inv.score_breakdown:
        raise HTTPException(
            status_code=400,
            detail="Investigation results are sealed until final accusation is submitted."
        )

    case = inv.case
    breakdown_data = json.loads(inv.score_breakdown)
    score_breakdown = ScoreBreakdownSchema(**breakdown_data)
    decisive_codes = json.loads(case.decisive_evidence_codes)
    suspect_resolutions = ScoringService.get_suspect_resolutions()

    return AccusationResultOut(
        investigation_id=inv.id,
        status=inv.status,
        final_score=inv.final_score,
        score_breakdown=score_breakdown,
        actual_culprit=case.culprit_suspect_name,
        actual_motive=case.canonical_motive,
        actual_method=case.canonical_method,
        actual_timeline_solution=case.canonical_timeline_solution,
        canonical_explanation=case.canonical_solution_explanation,
        decisive_evidence=decisive_codes,
        suspect_resolutions=suspect_resolutions
    )
