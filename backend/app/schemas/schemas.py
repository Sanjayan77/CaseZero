import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# Auth Schemas
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    badge_title: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Case Schemas (Strictly sanitizes and omits canonical solution data!)
class CasePublic(BaseModel):
    id: int
    case_id: str
    title: str
    summary: str
    victim_name: str
    victim_role: str
    crime_location: str
    crime_time_est: str
    objective: str
    difficulty: str
    status: str
    cover_image: Optional[str] = None
    crime_scene_image: Optional[str] = None

    class Config:
        from_attributes = True

class CaseDetail(CasePublic):
    initial_facts: str

# Suspect Schemas
class SuspectOut(BaseModel):
    id: int
    suspect_key: str
    name: str
    role: str
    relationship_to_victim: str
    public_bio: str
    known_alibi: str
    portrait_image: str
    speaking_style: str

    class Config:
        from_attributes = True

# Evidence Schemas
class EvidenceOut(BaseModel):
    id: int
    evidence_code: str
    title: str
    type: str
    category: str
    short_description: str
    full_description: str
    image_url: Optional[str] = None
    forensic_details: Optional[str] = None
    significance: str
    initial_discovered: bool

    class Config:
        from_attributes = True

class DiscoveredEvidenceOut(BaseModel):
    id: int
    evidence_id: int
    evidence: EvidenceOut
    discovered_at: datetime.datetime
    inspected: bool
    inspected_at: Optional[datetime.datetime] = None
    pinned: bool
    player_notes: str

    class Config:
        from_attributes = True

class EvidenceInspectRequest(BaseModel):
    pinned: Optional[bool] = None
    player_notes: Optional[str] = None

# Interview Schemas
class InterviewMessageOut(BaseModel):
    id: int
    sender: str
    content: str
    referenced_evidence_code: Optional[str] = None
    emotion: Optional[str] = "neutral"
    is_fallback: bool = False
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class InterviewOut(BaseModel):
    id: int
    suspect_id: int
    suspect: SuspectOut
    status: str
    last_interaction_at: datetime.datetime
    messages: List[InterviewMessageOut] = []

    class Config:
        from_attributes = True

class SendMessageRequest(BaseModel):
    content: str
    referenced_evidence_code: Optional[str] = None

# Evidence Board Schemas
class BoardNodeSchema(BaseModel):
    node_id: str
    node_type: str  # evidence, suspect, event, note
    ref_code: Optional[str] = None
    title: str
    content: Optional[str] = None
    pos_x: float
    pos_y: float
    color: Optional[str] = "#D5AA63"

class BoardEdgeSchema(BaseModel):
    edge_id: str
    source_node_id: str
    target_node_id: str
    label: str = "related_to"

class BoardStateResponse(BaseModel):
    nodes: List[BoardNodeSchema]
    edges: List[BoardEdgeSchema]

class BoardSyncRequest(BaseModel):
    nodes: List[BoardNodeSchema]
    edges: List[BoardEdgeSchema]

# Timeline Schemas
class TimelineEventOut(BaseModel):
    id: int
    time_marker: str
    title: str
    location: str
    description: str
    is_established_fact: bool
    associated_suspects: List[str]
    conflicting_claims: Optional[str] = None
    supporting_evidence_codes: List[str] = []

    class Config:
        from_attributes = True

# Accusation & Deduction Schemas
class AccusationSubmitRequest(BaseModel):
    suspect_name: str
    motive: str
    method: str
    timeline_explanation: str
    supporting_evidence_codes: List[str]
    written_deduction: str

class ScoreBreakdownSchema(BaseModel):
    culprit_score: int          # max 35
    motive_score: int           # max 15
    method_score: int           # max 15
    timeline_score: int         # max 15
    evidence_score: int         # max 15
    explanation_score: int      # max 5
    total_score: int            # max 100
    is_correct_culprit: bool
    evaluations: Dict[str, str]

class AccusationResultOut(BaseModel):
    investigation_id: int
    status: str
    final_score: int
    score_breakdown: ScoreBreakdownSchema
    actual_culprit: str
    actual_motive: str
    actual_method: str
    actual_timeline_solution: str
    canonical_explanation: str
    decisive_evidence: List[str]
    suspect_resolutions: Dict[str, str]

# Investigation Summary
class InvestigationOut(BaseModel):
    id: int
    case_id: int
    case: CasePublic
    status: str
    started_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    final_score: Optional[int] = None
    discovered_count: int = 0
    inspected_count: int = 0

    class Config:
        from_attributes = True
