import pytest
from app.services.ai_service import ai_service
from app.services.mentor_service import mentor_service
from app.models.models import Investigation, DiscoveredEvidence, Interview, InterviewMessage, Suspect, Evidence, Case

def test_different_questions_produce_different_responses():
    """Verify that different questions (location vs relationship vs suspicion) produce distinct answers."""
    prompt = "Poised, cold, aristocratic. Alibi: In conservatory reading with Clara Bennett from 20:20 to 20:45"

    resp_location = ai_service._generate_contextual_fallback(
        suspect_name="Evelyn Vale",
        personality_prompt=prompt,
        player_message="Where were you between 8:25 PM and 8:40 PM?",
        dialogue_history=[],
        referenced_evidence=None,
    )

    resp_relationship = ai_service._generate_contextual_fallback(
        suspect_name="Evelyn Vale",
        personality_prompt=prompt,
        player_message="What was your business relationship with Adrian Vale?",
        dialogue_history=[],
        referenced_evidence=None,
    )

    resp_suspicions = ai_service._generate_contextual_fallback(
        suspect_name="Evelyn Vale",
        personality_prompt=prompt,
        player_message="Whom do you suspect among the guests?",
        dialogue_history=[],
        referenced_evidence=None,
    )

    # All three must be substantially distinct
    text_loc = resp_location["response"]
    text_rel = resp_relationship["response"]
    text_susp = resp_suspicions["response"]

    assert text_loc != text_rel
    assert text_loc != text_susp
    assert text_rel != text_susp
    assert "conservatory" in text_loc.lower() or "clara" in text_loc.lower()
    assert "divorce" in text_rel.lower() or "pre-nup" in text_rel.lower() or "estate" in text_rel.lower()
    assert "marcus" in text_susp.lower() or "cfo" in text_susp.lower() or "books" in text_susp.lower()

def test_follow_up_uses_previous_dialogue_context():
    """Verify that follow-up questions like 'Why?' or 'Are you sure?' use previous messages."""
    prompt = "Poised, cold, aristocratic. Alibi: In conservatory reading with Clara Bennett from 20:20 to 20:45"
    history = [
        {"sender": "player", "content": "Where were you between 8:25 PM and 8:40 PM?"},
        {"sender": "suspect", "content": "I was in the east conservatory with Clara Bennett discussing the estate foundation."},
    ]

    resp_why = ai_service._generate_contextual_fallback(
        suspect_name="Evelyn Vale",
        personality_prompt=prompt,
        player_message="Why?",
        dialogue_history=history,
        referenced_evidence=None,
    )

    assert "because" in resp_why["response"].lower() or "study" in resp_why["response"].lower() or "audit" in resp_why["response"].lower()

    resp_sure = ai_service._generate_contextual_fallback(
        suspect_name="Evelyn Vale",
        personality_prompt=prompt,
        player_message="Are you sure about that?",
        dialogue_history=history,
        referenced_evidence=None,
    )

    assert "oath" in resp_sure["response"].lower() or "certain" in resp_sure["response"].lower() or "sworn" in resp_sure["response"].lower() or "sure" in resp_sure["response"].lower()

def test_evidence_presentation_in_interrogation():
    """Verify confronting suspect with specific evidence code generates evidence-grounded response."""
    prompt = "Poised, cold, aristocratic. Alibi: In conservatory reading with Clara Bennett from 20:20 to 20:45"
    ref_ev = {
        "evidence_code": "EV-004",
        "title": "Disputed Ledger & Wire Transfer Receipts",
        "category": "finance"
    }

    resp_doc = ai_service._generate_contextual_fallback(
        suspect_name="Evelyn Vale",
        personality_prompt=prompt,
        player_message="I found a financial document. What do you know about it?",
        dialogue_history=[],
        referenced_evidence=ref_ev,
    )

    content = resp_doc["response"].lower()
    assert "ledger" in content or "wire" in content or "financial" in content or "ev-004" in content or "transfer" in content

def test_ai_status_diagnostics_endpoint(client):
    """Verify GET /api/ai/status reports honest diagnostics without exposing private keys."""
    resp = client.get("/api/ai/status")
    assert resp.status_code == 200
    data = resp.json()

    assert "status" in data
    assert "provider" in data
    assert "model" in data
    assert "real_ai_active" in data
    assert "message" in data
    assert "env_var_name" in data
    # Status must be one of the four honest states
    assert data["status"] in ["connected", "connecting", "unavailable", "development_fallback"]
    # Private API keys must never be exposed
    assert "api_key" not in data
    assert "AI_KEY" not in str(data)

def test_mentor_guidance_and_hints(client, db_session):
    """Verify Detective Morgan guidance endpoint returns objectives and hints."""
    # Register and start case
    reg = client.post("/api/auth/register", json={
        "username": "junior_det_01",
        "email": "det01@casezero.local",
        "password": "Password123!"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    start = client.post("/api/cases/CZ-001/start", headers=headers)
    inv_id = start.json()["id"]

    # Request mentor guidance
    resp = client.get(f"/api/investigations/{inv_id}/mentor", headers=headers)
    assert resp.status_code == 200
    mentor = resp.json()

    assert mentor["mentor_name"] == "Detective Morgan"
    assert "hints" in mentor
    assert len(mentor["hints"]["level_1_nudge"]) > 0
    assert len(mentor["hints"]["level_2_stronger"]) > 0
    assert len(mentor["hints"]["level_3_deduction"]) > 0
    assert len(mentor["objectives"]) == 7

def test_mentor_explain_evidence(client, db_session):
    """Verify senior mentor explains discovered evidence with 3 structured sections."""
    reg = client.post("/api/auth/register", json={
        "username": "junior_det_02",
        "email": "det02@casezero.local",
        "password": "Password123!"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    start = client.post("/api/cases/CZ-001/start", headers=headers)
    inv_id = start.json()["id"]

    # Explain EV-001
    resp = client.get(f"/api/investigations/{inv_id}/mentor/explain/EV-001", headers=headers)
    assert resp.status_code == 200
    expl = resp.json()

    assert expl["evidence_code"] == "EV-001"
    assert "what_we_found" in expl
    assert "what_it_tells_us" in expl
    assert "why_it_matters" in expl
    assert "senior_advice" in expl

def test_pre_accusation_theory_review(client, db_session):
    """Verify senior detective pre-accusation evaluation without altering scores."""
    reg = client.post("/api/auth/register", json={
        "username": "junior_det_03",
        "email": "det03@casezero.local",
        "password": "Password123!"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    start = client.post("/api/cases/CZ-001/start", headers=headers)
    inv_id = start.json()["id"]

    draft = {
        "suspect_name": "Marcus Reed",
        "motive": "Embezzled $22.5M from Aegis Holdings and faced SEC audit.",
        "method": "Digitalis Purpurea slipped into 25-year scotch; locked study using monofilament thread under door.",
        "timeline_explanation": "Marcus left terrace at 20:26 when call dropped, reached study at 20:30, seen in corridor at 20:37 by Oliver.",
        "supporting_evidence_codes": ["EV-001", "EV-002", "EV-003", "EV-004"],
        "written_deduction": "Marcus Reed executed the murder to prevent disclosure of his offshore embezzlement."
    }

    resp = client.post(f"/api/investigations/{inv_id}/mentor/pre-review", json=draft, headers=headers)
    assert resp.status_code == 200
    rev = resp.json()

    assert rev["review_verdict"] in ["strong", "promising", "incomplete"]
    assert len(rev["senior_feedback"]) > 0
    assert isinstance(rev["strengths"], list)
    assert isinstance(rev["cautions"], list)
    assert isinstance(rev["questions_to_answer"], list)

def test_suspect_isolation(client, db_session):
    """Verify switching suspects isolates conversation history."""
    reg = client.post("/api/auth/register", json={
        "username": "junior_det_04",
        "email": "det04@casezero.local",
        "password": "Password123!"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    start = client.post("/api/cases/CZ-001/start", headers=headers)
    inv_id = start.json()["id"]

    # Send message to Suspect 1 (Evelyn)
    msg1 = client.post(
        f"/api/investigations/{inv_id}/interviews/1/messages",
        headers=headers,
        json={"content": "Where were you at 8:30 PM?"}
    )
    assert msg1.status_code == 200

    # Retrieve Suspect 2 (Marcus) interview
    intv2 = client.get(f"/api/investigations/{inv_id}/interviews/2", headers=headers)
    assert intv2.status_code == 200
    messages_marcus = intv2.json()["messages"]
    # Marcus must not have Evelyn's questions or responses
    for m in messages_marcus:
        assert m["content"] != "Where were you at 8:30 PM?"
