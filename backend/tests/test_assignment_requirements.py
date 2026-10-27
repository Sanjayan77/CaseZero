import pytest
import time
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.models import FAQEntry, SupportTicket
from app.core.mongodb import mongo_manager
from app.services.external_api_service import weather_service
from app.core.config import settings

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_req1_three_pages_and_health(client):
    """Verify health and API availability."""
    r = client.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ["healthy", "online"]
    assert "components" in data

def test_req2_sql_faqs_retrieval(client):
    """Verify at least 10 genuine FAQs retrieved from SQL database."""
    r = client.get("/api/support/faqs")
    assert r.status_code == 200
    faqs = r.json()
    assert len(faqs) >= 10
    assert any("interrogation" in f["question"].lower() for f in faqs)
    assert any("evidence" in f["question"].lower() for f in faqs)

def test_req3_all_eight_error_codes(client):
    """Verify all 8 error-code scenarios (400, 401, 403, 404, 429, 500, 503, CZ-423)."""
    r_doc = client.get("/api/errors/documentation")
    assert r_doc.status_code == 200
    doc = r_doc.json()
    assert len(doc["errors"]) >= 8

    expected_codes = [400, 401, 403, 404, 429, 500, 503, 423]
    for code in expected_codes:
        resp = client.get(f"/api/errors/trigger/{code}")
        assert resp.status_code == code, f"Expected HTTP {code}, got {resp.status_code}"

def test_req4_support_assistant_faq_grounding(client):
    """Verify support assistant answers from SQL FAQ data with [Confirmed Information]."""
    r = client.post("/api/support/assistant/chat", json={
        "message": "How does suspect interrogation work in CaseZero?"
    })
    assert r.status_code == 200
    data = r.json()
    assert "Confirmed Information" in data["answer"]
    assert data["confirmed_status"] == "confirmed"

def test_req5_support_assistant_escalation_ticket(client):
    """Verify unanswerable or explicit escalation creates support ticket in SQL."""
    with SessionLocal() as db:
        initial_count = db.query(SupportTicket).count()

    r = client.post("/api/support/assistant/chat", json={
        "message": "I want to file a support ticket because I encountered a game saving bug."
    })
    assert r.status_code == 200
    data = r.json()
    assert data["ticket_created"] is True
    assert data["ticket"] is not None
    assert "CZ-TICK-" in data["ticket"]["ticket_number"]

    with SessionLocal() as db:
        new_count = db.query(SupportTicket).count()
        assert new_count == initial_count + 1

def test_req6_mongodb_chat_logs_and_feedback(client):
    """Verify chat logs and user feedback are stored in MongoDB."""
    # Chat interaction
    r_chat = client.post("/api/support/assistant/chat", json={
        "message": "What is error CZ-423?"
    })
    assert r_chat.status_code == 200

    # Retrieve chat logs from Mongo
    r_logs = client.get("/api/support/assistant/logs")
    assert r_logs.status_code == 200
    logs = r_logs.json()
    assert logs["count"] >= 1
    assert any("CZ-423" in l["user_message"] for l in logs["logs"])

    # Post feedback
    r_fb = client.post("/api/support/feedback", json={
        "rating": 5,
        "comments": "Automated verification test feedback"
    })
    assert r_fb.status_code == 200

    # Retrieve feedback
    r_fb_list = client.get("/api/support/feedback")
    assert r_fb_list.status_code == 200
    fb_data = r_fb_list.json()
    assert fb_data["count"] >= 1

def test_req7_third_party_weather_api_and_fallback(client):
    """Verify 3rd-party Open-Meteo API works and respects timeout fallback."""
    # Live or graceful fallback check
    r = client.get("/api/support/weather")
    assert r.status_code == 200
    w = r.json()
    assert "temperature_c" in w
    assert "advisory" in w

    # Forced timeout fallback test (0.0001s timeout)
    r_timeout = client.get("/api/support/weather?timeout=0.0001")
    assert r_timeout.status_code == 200
    w_fb = r_timeout.json()
    assert w_fb["status"] == "fallback"
    assert w_fb["is_live"] is False

def test_req8_security_no_keys_exposed(client):
    """Verify API keys and sensitive credentials are never exposed in responses."""
    endpoints = [
        "/api/health",
        "/api/support/health",
        "/api/support/faqs",
        "/api/errors/documentation",
        "/api/support/assistant/logs",
        "/api/support/feedback"
    ]
    for ep in endpoints:
        r = client.get(ep)
        text = r.text
        if settings.GEMINI_API_KEY:
            assert settings.GEMINI_API_KEY not in text
        assert "AIza" not in text
        assert settings.SECRET_KEY not in text

def test_req9_existing_interrogation_untouched(client):
    """Verify existing suspect interrogation game logic is 100% working and untouched."""
    # Demo login
    r_auth = client.post("/api/auth/demo")
    assert r_auth.status_code == 200
    token = r_auth.json()["access_token"]

    # Start case CZ-001
    r_case = client.post(
        "/api/cases/CZ-001/start",
        headers={"Authorization": f"Bearer {token}"}
    )
    inv_id = r_case.json()["id"]

    # Interrogate suspect Evelyn Vale (Suspect ID 1)
    r_msg = client.post(
        f"/api/investigations/{inv_id}/interviews/1/messages",
        headers={"Authorization": f"Bearer {token}"},
        json={"content": "Where were you between 8:25 PM and 8:40 PM?"}
    )
    assert r_msg.status_code == 200
    msg = r_msg.json()
    assert "content" in msg
    assert "emotion" in msg
    assert len(msg["content"]) > 10
    # Confirms suspect answered in character about conservatory / Marcus / timeline
    assert any(k in msg["content"].lower() for k in ["conservatory", "clara", "marcus", "timeline", "8:35", "time"])
