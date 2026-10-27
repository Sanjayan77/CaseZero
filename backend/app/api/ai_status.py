from fastapi import APIRouter
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/ai", tags=["AI Diagnostics"])

@router.get("/status")
async def get_ai_status():
    """
    Honest diagnostics reporting whether real LLM provider is connected or running in fallback.
    Never leaks API secrets or hidden case data.
    """
    return await ai_service.check_health()

@router.post("/test")
async def test_ai_connection():
    """
    Run an explicit test request to verify the AI connection.
    """
    return await ai_service.check_health()

