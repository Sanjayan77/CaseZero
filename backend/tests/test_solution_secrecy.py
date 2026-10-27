def test_solution_data_not_leaked_in_case_endpoints(client):
    case_res = client.get("/api/cases/CZ-001")
    assert case_res.status_code == 200
    data = case_res.json()

    # Verify hidden solution fields are not in response payload
    forbidden_keys = [
        "culprit_suspect_name",
        "canonical_motive",
        "canonical_method",
        "canonical_timeline_solution",
        "canonical_solution_explanation",
        "decisive_evidence_codes"
    ]
    for key in forbidden_keys:
        assert key not in data, f"Security violation: {key} leaked in public case endpoint!"

def test_results_sealed_until_accusation(client):
    res = client.post("/api/auth/register", json={
        "username": "sneaky_player",
        "email": "sneaky@casezero.com",
        "password": "Password123!"
    })
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    start_res = client.post("/api/cases/CZ-001/start", headers=headers)
    inv_id = start_res.json()["id"]

    # Attempting to fetch results before submitting accusation must fail with 400
    res_sealed = client.get(f"/api/investigations/{inv_id}/results", headers=headers)
    assert res_sealed.status_code == 400
    assert "sealed" in res_sealed.json()["detail"].lower()
