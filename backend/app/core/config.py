import os
from pathlib import Path
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv

# Explicitly load .env from backend directory first, then root if present
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
backend_env = BACKEND_DIR / ".env"
root_env = BACKEND_DIR.parent / ".env"

if backend_env.exists():
    load_dotenv(dotenv_path=backend_env, override=True)
if root_env.exists():
    load_dotenv(dotenv_path=root_env, override=False)

def get_db_url() -> str:
    raw_url = os.getenv("DATABASE_URL", "sqlite:///./casezero.db")
    if raw_url.startswith("postgres://"):
        raw_url = raw_url.replace("postgres://", "postgresql://", 1)
    if raw_url in ("sqlite:///./casezero.db", "sqlite:///casezero.db"):
        db_path = (BACKEND_DIR / "casezero.db").resolve()
        db_str = str(db_path).replace("\\", "/")
        return f"sqlite:///{db_str}" if not db_str.startswith("/") else f"sqlite:////{db_str.lstrip('/')}"
    return raw_url

class Settings(BaseModel):
    PROJECT_NAME: str = "CaseZero Investigation API"
    VERSION: str = "1.2.0"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "casezero_noir_super_secret_jwt_key_2026_investigation")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = get_db_url()
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY") or ""
    AI_API_KEY: str = os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY") or ""
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-3.5-flash-lite")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")  # gemini | openai | auto
    AI_BASE_URL: Optional[str] = os.getenv("AI_BASE_URL", None)
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "casezero_support")
    WEATHER_API_TIMEOUT: float = float(os.getenv("WEATHER_API_TIMEOUT", "3.0"))

settings = Settings()

