import os
import time
import uuid
import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.mongodb import mongo_manager
from app.core.config import settings
from app.models.models import FAQEntry, SupportTicket
from app.services.support_assistant_service import support_assistant_service
from app.services.external_api_service import weather_service
from app.services.ai_service import ai_service
from app.core.logging_middleware import request_logger

router = APIRouter(prefix="/api/support", tags=["Support, FAQs & Health"])

SERVER_START_TIME = time.time()

# --- Pydantic Models ---
class FAQOut(BaseModel):
    id: int
    question: str
    answer: str
    category: str
    order_index: int

    class Config:
        from_attributes = True

class SupportChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, str]]] = []
    session_id: Optional[str] = None
    user_email: Optional[str] = "investigator@casezero.local"
    user_name: Optional[str] = "Investigator"

class CreateTicketRequest(BaseModel):
    subject: str
    description: str
    category: Optional[str] = "Investigation Support"
    priority: Optional[str] = "normal"
    user_email: Optional[str] = "investigator@casezero.local"
    user_name: Optional[str] = "Investigator"

class TicketOut(BaseModel):
    id: int
    ticket_number: str
    user_email: str
    user_name: str
    subject: str
    description: str
    category: str
    status: str
    priority: str
    source: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FeedbackRequest(BaseModel):
    session_id: Optional[str] = "web-session"
    rating: int  # 1 to 5
    comments: Optional[str] = None
    category: Optional[str] = "general"

# --- Endpoints ---

@router.get("/faqs", response_model=List[FAQOut])
def get_faqs(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieves official FAQ items stored in the SQL database."""
    query = db.query(FAQEntry)
    if category and category.lower() != "all":
        query = query.filter(FAQEntry.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(
            (FAQEntry.question.ilike(f"%{search}%")) |
            (FAQEntry.answer.ilike(f"%{search}%"))
        )
    return query.order_by(FAQEntry.order_index, FAQEntry.id).all()

@router.post("/assistant/chat")
async def chat_with_support_assistant(
    request: SupportChatRequest,
    db: Session = Depends(get_db)
):
    """
    Website Support Assistant chat endpoint.
    - Answers grounded in SQL FAQs and Error Code catalog
    - Distinguishes confirmed vs unconfirmed information
    - Auto-creates support tickets in SQL on low confidence or user request
    - Persists chat interactions into MongoDB
    """
    result = await support_assistant_service.handle_user_query(
        message=request.message,
        db=db,
        session_id=request.session_id,
        chat_history=request.chat_history,
        user_email=request.user_email,
        user_name=request.user_name
    )
    return result

@router.post("/tickets", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_support_ticket(
    request: CreateTicketRequest,
    db: Session = Depends(get_db)
):
    """Explicitly submits a support ticket into the SQL database."""
    ticket_num = f"CZ-TICK-{datetime.datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    ticket = SupportTicket(
        ticket_number=ticket_num,
        user_email=request.user_email or "investigator@casezero.local",
        user_name=request.user_name or "Investigator",
        subject=request.subject,
        description=request.description,
        category=request.category or "Investigation Support",
        priority=request.priority or "normal",
        status="open",
        source="user_submission"
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@router.get("/tickets", response_model=List[TicketOut])
def list_support_tickets(
    status_filter: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Lists support tickets stored in the SQL database."""
    query = db.query(SupportTicket)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(SupportTicket.status == status_filter.lower())
    return query.order_by(SupportTicket.created_at.desc()).limit(limit).all()

@router.post("/feedback")
def submit_feedback(request: FeedbackRequest):
    """Stores user satisfaction feedback in MongoDB."""
    if request.rating < 1 or request.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
    
    log_id = mongo_manager.save_feedback(
        session_id=request.session_id or str(uuid.uuid4()),
        rating=request.rating,
        comments=request.comments,
        category=request.category or "general"
    )
    return {
        "status": "success",
        "message": "Feedback recorded in MongoDB database.",
        "record_id": log_id,
        "is_mock": mongo_manager.is_mock
    }

@router.get("/feedback")
def list_feedback(limit: int = 20):
    """Retrieves recent user feedback from MongoDB."""
    items = mongo_manager.get_feedback(limit=limit)
    return {
        "count": len(items),
        "database": mongo_manager.db_name,
        "is_mock": mongo_manager.is_mock,
        "feedback": items
    }

@router.get("/assistant/logs")
def list_assistant_chat_logs(limit: int = 20):
    """Retrieves assistant chat history logs archived in MongoDB."""
    logs = mongo_manager.get_chat_logs(limit=limit)
    return {
        "count": len(logs),
        "database": mongo_manager.db_name,
        "is_mock": mongo_manager.is_mock,
        "logs": logs
    }


@router.get("/weather")
async def get_weather_advisory(timeout: Optional[float] = None):
    """
    Retrieves weather advisory from Open-Meteo 3rd-party API
    with configurable timeout and graceful offline fallback.
    """
    return await weather_service.get_weather_advisory(timeout=timeout)

@router.get("/health")
async def comprehensive_health_check(db: Session = Depends(get_db)):
    """
    Comprehensive system health check reporting:
    - Application & Uptime
    - SQL database connectivity, FAQ count & Support ticket count
    - MongoDB status and mode
    - Gemini AI connectivity
    - Open-Meteo 3rd-party API connectivity
    - Request logging metrics
    """
    uptime_sec = int(time.time() - SERVER_START_TIME)

    # 1. SQL Check
    try:
        faq_count = db.query(FAQEntry).count()
        ticket_count = db.query(SupportTicket).count()
        sql_health = {
            "status": "connected",
            "engine": "SQLite (SQLAlchemy)",
            "database_file": "casezero.db",
            "faq_entries_count": faq_count,
            "support_tickets_count": ticket_count
        }
    except Exception as e:
        sql_health = {"status": "error", "error": str(e)}

    # 2. MongoDB Check
    mongo_health = mongo_manager.check_health()

    # 3. Gemini Check
    ai_health = await ai_service.check_health()

    # 4. Third-Party Weather API Check
    weather_data = await weather_service.get_weather_advisory()
    weather_health = {
        "status": "connected" if weather_data.get("is_live") else "fallback_mode",
        "provider": "Open-Meteo API",
        "latency_ms": weather_data.get("latency_ms", 0),
        "is_live": weather_data.get("is_live", False)
    }

    # 5. Logging stats
    logging_stats = {
        "total_logged_requests": len(request_logger.recent_logs),
        "recent_entries_buffered": min(len(request_logger.recent_logs), 10)
    }

    overall_status = "healthy"
    if sql_health.get("status") != "connected":
        overall_status = "degraded"

    return {
        "status": overall_status,
        "service": "CaseZero Investigation & Support Platform",
        "version": settings.VERSION,
        "uptime_seconds": uptime_sec,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "components": {
            "sql_database": sql_health,
            "mongodb": mongo_health,
            "gemini_ai": ai_health,
            "third_party_api": weather_health,
            "request_logging": logging_stats
        }
    }
