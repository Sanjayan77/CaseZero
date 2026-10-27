def get_auth_headers(client, username="score_tester"):
    res = client.post("/api/auth/register", json={
        "username": username,
        "email": f"{username}@example.com",
        "password": "Password123!"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_correct_accusation_scoring(client):
    headers = get_auth_headers(client, "clever_detective")
    start_res = client.post("/api/cases/CZ-001/start", headers=headers)
    inv_id = start_res.json()["id"]

    acc_res = client.post(
        f"/api/investigations/{inv_id}/accusation",
        headers=headers,
        json={
            "suspect_name": "Marcus Reed",
            "motive": "Embezzlement of $22.5 million into offshore Aegis Holdings Ltd. Adrian threatened to report him to the SEC at 9:00 AM.",
            "method": "Digitalis Purpurea poison in Adrian's scotch, locked door using monofilament nylon thread under the door gap.",
            "timeline_explanation": "Left table at 20:25 claiming call; call dropped at 20:26 on terrace. Sighted by Oliver Grant at 20:37 fleeing study wing.",
            "supporting_evidence_codes": ["EV-01", "EV-02", "EV-03", "EV-04", "EV-14", "EV-06", "EV-07", "EV-08"],
            "written_deduction": "Marcus Reed killed Adrian to cover up multi-million dollar fraud. His alibi collapsed when telecommunications proved his call dropped at 20:26. Forensics proved he poisoned the scotch and simulated a locked room using monofilament thread."
        }
    )
    assert acc_res.status_code == 200
    data = acc_res.json()
    assert data["final_score"] >= 80
    assert data["score_breakdown"]["is_correct_culprit"] is True
    assert data["actual_culprit"] == "Marcus Reed"

def test_wrong_accusation_scoring(client):
    headers = get_auth_headers(client, "flawed_detective")
    start_res = client.post("/api/cases/CZ-001/start", headers=headers)
    inv_id = start_res.json()["id"]

    acc_res = client.post(
        f"/api/investigations/{inv_id}/accusation",
        headers=headers,
        json={
            "suspect_name": "Evelyn Vale",
            "motive": "Divorce settlement dispute.",
            "method": "Stabbed with letter opener.",
            "timeline_explanation": "She walked in at 20:30.",
            "supporting_evidence_codes": ["EV-09"],
            "written_deduction": "I suspect Evelyn did it."
        }
    )
    assert acc_res.status_code == 200
    data = acc_res.json()
    assert data["score_breakdown"]["is_correct_culprit"] is False
    assert data["score_breakdown"]["culprit_score"] == 0
