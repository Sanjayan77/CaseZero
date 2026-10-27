def get_auth_headers(client, username="player_one"):
    res = client.post("/api/auth/register", json={
        "username": username,
        "email": f"{username}@example.com",
        "password": "Password123!"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_start_case_and_inspect_evidence(client):
    headers = get_auth_headers(client, "gameplay_tester")

    # Start case
    start_res = client.post("/api/cases/CZ-001/start", headers=headers)
    assert start_res.status_code == 200
    inv = start_res.json()
    inv_id = inv["id"]

    # Get evidence
    ev_res = client.get(f"/api/investigations/{inv_id}/evidence", headers=headers)
    assert ev_res.status_code == 200
    evidence_list = ev_res.json()
    assert len(evidence_list) >= 8

    # Inspect first piece of evidence
    first_ev = evidence_list[0]
    ev_id = first_ev["evidence_id"]
    insp_res = client.post(f"/api/investigations/{inv_id}/evidence/{ev_id}/inspect", headers=headers)
    assert insp_res.status_code == 200
    assert insp_res.json()["inspected"] is True

    # Add note
    note_res = client.post(
        f"/api/investigations/{inv_id}/evidence/{ev_id}/note",
        headers=headers,
        json={"notes": "Examined under microscope. Found monofilament residue."}
    )
    assert note_res.status_code == 200
    assert "monofilament" in note_res.json()["player_notes"]

def test_interrogate_suspect(client):
    headers = get_auth_headers(client, "interrogator")
    start_res = client.post("/api/cases/CZ-001/start", headers=headers)
    inv_id = start_res.json()["id"]

    # Get suspects
    sus_res = client.get(f"/api/investigations/{inv_id}/suspects", headers=headers)
    assert sus_res.status_code == 200
    suspects = sus_res.json()
    assert len(suspects) == 5

    # Interview Marcus Reed
    marcus = next(s for s in suspects if "marcus" in s["name"].lower())
    msg_res = client.post(
        f"/api/investigations/{inv_id}/interviews/{marcus['id']}/messages",
        headers=headers,
        json={"content": "Where were you between 20:25 and 20:40?"}
    )
    assert msg_res.status_code == 200
    reply = msg_res.json()
    assert reply["sender"] == "suspect"
    assert len(reply["content"]) > 10

def test_evidence_board_sync(client):
    headers = get_auth_headers(client, "board_tester")
    start_res = client.post("/api/cases/CZ-001/start", headers=headers)
    inv_id = start_res.json()["id"]

    board_get = client.get(f"/api/investigations/{inv_id}/board", headers=headers)
    assert board_get.status_code == 200
    assert len(board_get.json()["nodes"]) >= 3

    # Sync custom board node and edge
    sync_res = client.put(
        f"/api/investigations/{inv_id}/board",
        headers=headers,
        json={
            "nodes": [
                {
                    "node_id": "custom_note_1",
                    "node_type": "note",
                    "title": "Alibi Contradiction",
                    "content": "Marcus dropped call at 20:26",
                    "pos_x": 300.0,
                    "pos_y": 150.0,
                    "color": "#D5AA63"
                }
            ],
            "edges": []
        }
    )
    assert sync_res.status_code == 200
    assert sync_res.json()["nodes"][0]["node_id"] == "custom_note_1"
