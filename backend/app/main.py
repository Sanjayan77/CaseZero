from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.game_data.seed_case_001 import seed_case_001
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
    assistant
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Seed Case CZ-001
with SessionLocal() as db:
    seed_case_001(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CaseZero Full-Stack Forensic Detective Web Application API"
)

# CORS Middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    settings.FRONTEND_ORIGIN
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "CaseZero Investigation API",
        "version": settings.VERSION,
        "database": "connected"
    }
