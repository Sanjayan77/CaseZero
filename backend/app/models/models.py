import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    badge_title = Column(String(100), default="Junior Detective")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    investigations = relationship("Investigation", back_populates="user", cascade="all, delete-orphan")


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., CZ-001
    title = Column(String(150), nullable=False)
    summary = Column(Text, nullable=False)
    victim_name = Column(String(100), nullable=False)
    victim_role = Column(String(150), nullable=False)
    crime_location = Column(String(150), nullable=False)
    crime_time_est = Column(String(100), nullable=False)
    initial_facts = Column(Text, nullable=False)  # JSON or multi-line text
    objective = Column(Text, nullable=False)
    difficulty = Column(String(50), default="Intermediate")
    status = Column(String(50), default="Active")
    cover_image = Column(String(255), nullable=True)
    crime_scene_image = Column(String(255), nullable=True)

    # PRIVATE CANONICAL SOLUTION (Hidden from client until post-accusation reveal)
    culprit_suspect_name = Column(String(100), nullable=False)
    canonical_motive = Column(Text, nullable=False)
    canonical_method = Column(Text, nullable=False)
    canonical_timeline_solution = Column(Text, nullable=False)
    canonical_solution_explanation = Column(Text, nullable=False)
    decisive_evidence_codes = Column(Text, nullable=False)  # JSON list
    supporting_evidence_codes = Column(Text, nullable=False)  # JSON list

    suspects = relationship("Suspect", back_populates="case", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="case", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="case")


class Suspect(Base):
    __tablename__ = "suspects"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    suspect_key = Column(String(50), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False)
    relationship_to_victim = Column(String(150), nullable=False)
    public_bio = Column(Text, nullable=False)
    known_alibi = Column(Text, nullable=False)
    portrait_image = Column(String(255), nullable=False)
    speaking_style = Column(String(150), nullable=False)

    # Suspect Knowledge Boundaries & Rules
    personality_prompt = Column(Text, nullable=False)
    known_facts = Column(Text, nullable=False)       # JSON list of facts this suspect genuinely knows
    private_secrets = Column(Text, nullable=False)   # JSON list of secrets they defend
    contradictions = Column(Text, nullable=False)    # JSON list of statements that contradict evidence

    case = relationship("Case", back_populates="suspects")
    interviews = relationship("Interview", back_populates="suspect")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    evidence_code = Column(String(50), index=True, nullable=False)  # e.g., EV-01
    title = Column(String(150), nullable=False)
    type = Column(String(50), nullable=False)  # photo, report, document, physical, message
    category = Column(String(50), nullable=False) # forensics, finance, timeline, alibi
    short_description = Column(Text, nullable=False)
    full_description = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    forensic_details = Column(Text, nullable=True) # JSON with technical notes
    significance = Column(String(50), default="corroborative") # decisive, corroborative, misleading, exonerating
    initial_discovered = Column(Boolean, default=True)

    case = relationship("Case", back_populates="evidence_items")
    discoveries = relationship("DiscoveredEvidence", back_populates="evidence")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    time_marker = Column(String(50), nullable=False) # e.g. "20:15"
    title = Column(String(150), nullable=False)
    location = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    is_established_fact = Column(Boolean, default=True)
    associated_suspects = Column(Text, nullable=False) # JSON list of names
    conflicting_claims = Column(Text, nullable=True)
    supporting_evidence_codes = Column(Text, nullable=True) # JSON list

    case = relationship("Case", back_populates="timeline_events")


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="in_progress") # in_progress, submitted, completed
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    final_score = Column(Integer, nullable=True)
    score_breakdown = Column(Text, nullable=True) # JSON
    accusation_data = Column(Text, nullable=True) # JSON

    __table_args__ = (
        UniqueConstraint("user_id", "case_id", name="uq_user_case_investigation"),
    )

    user = relationship("User", back_populates="investigations")
    case = relationship("Case", back_populates="investigations")
    discovered_evidence = relationship("DiscoveredEvidence", back_populates="investigation", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="investigation", cascade="all, delete-orphan")
    board_nodes = relationship("EvidenceBoardNode", back_populates="investigation", cascade="all, delete-orphan")
    board_edges = relationship("EvidenceBoardEdge", back_populates="investigation", cascade="all, delete-orphan")


class DiscoveredEvidence(Base):
    __tablename__ = "discovered_evidence"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    evidence_id = Column(Integer, ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False)
    discovered_at = Column(DateTime, default=datetime.datetime.utcnow)
    inspected = Column(Boolean, default=False)
    inspected_at = Column(DateTime, nullable=True)
    pinned = Column(Boolean, default=False)
    player_notes = Column(Text, default="")

    __table_args__ = (
        UniqueConstraint("investigation_id", "evidence_id", name="uq_investigation_evidence"),
    )

    investigation = relationship("Investigation", back_populates="discovered_evidence")
    evidence = relationship("Evidence", back_populates="discoveries")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    suspect_id = Column(Integer, ForeignKey("suspects.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="uninterviewed") # uninterviewed, in_progress, completed
    last_interaction_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("investigation_id", "suspect_id", name="uq_investigation_suspect_interview"),
    )

    investigation = relationship("Investigation", back_populates="interviews")
    suspect = relationship("Suspect", back_populates="interviews")
    messages = relationship("InterviewMessage", back_populates="interview", cascade="all, delete-orphan", order_by="InterviewMessage.created_at")


class InterviewMessage(Base):
    __tablename__ = "interview_messages"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(20), nullable=False) # "player", "suspect", "system"
    content = Column(Text, nullable=False)
    referenced_evidence_code = Column(String(50), nullable=True)
    emotion = Column(String(50), default="neutral") # neutral, defensive, shaken, confident, evasive
    is_fallback = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    interview = relationship("Interview", back_populates="messages")


class EvidenceBoardNode(Base):
    __tablename__ = "evidence_board_nodes"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    node_id = Column(String(50), nullable=False) # unique key on the board
    node_type = Column(String(50), nullable=False) # "evidence", "suspect", "event", "note"
    ref_code = Column(String(50), nullable=True)
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=True)
    pos_x = Column(Float, default=100.0)
    pos_y = Column(Float, default=100.0)
    color = Column(String(50), default="#D5AA63")

    investigation = relationship("Investigation", back_populates="board_nodes")


class EvidenceBoardEdge(Base):
    __tablename__ = "evidence_board_edges"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    edge_id = Column(String(50), nullable=False)
    source_node_id = Column(String(50), nullable=False)
    target_node_id = Column(String(50), nullable=False)
    label = Column(String(100), default="related_to") # supports, contradicts, present_at, related_to, unverified

    investigation = relationship("Investigation", back_populates="board_edges")


class FAQEntry(Base):
    __tablename__ = "faq_entries"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String(300), nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100), default="General")
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(50), unique=True, index=True, nullable=False)
    user_email = Column(String(150), default="investigator@casezero.local")
    user_name = Column(String(100), default="Investigator")
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Investigation Support")
    status = Column(String(50), default="open")  # open, in_progress, resolved, closed
    priority = Column(String(50), default="normal")  # low, normal, high, urgent
    source = Column(String(50), default="assistant_escalation")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

