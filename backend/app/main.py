from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.game_data.seed_case_001 import seed_case_001
from app.game_data.seed_faqs import seed_faqs
from app.core.logging_middleware import RequestLoggingMiddleware
from app.api import (
    auth,
    cases,
    investigations,
    evidence,
    interrogation,
    board,
    timeline,
    deduction,
    mentor,
    ai_status,
    assistant,
    support,
    diagnostics_and_errors
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Seed Case CZ-001 and FAQs
with SessionLocal() as db:
    seed_case_001(db)
    seed_faqs(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CaseZero Full-Stack Forensic Detective Web Application API"
)

# Request Logging Middleware (logs timestamps, method, path, status, and duration; masks secrets)
app.add_middleware(RequestLoggingMiddleware)

# CORS Middleware
raw_origins = [o.strip() for o in settings.FRONTEND_ORIGIN.split(",") if o.strip()]
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    *raw_origins
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(investigations.router)
app.include_router(evidence.router)
app.include_router(interrogation.router)
app.include_router(board.router)
app.include_router(timeline.router)
app.include_router(deduction.router)
app.include_router(mentor.router)
app.include_router(ai_status.router)
app.include_router(assistant.router)
app.include_router(support.router)
app.include_router(diagnostics_and_errors.router)

@app.get("/api/health")
async def health_check():
    from app.api.support import comprehensive_health_check
    with SessionLocal() as session:
        return await comprehensive_health_check(session)


