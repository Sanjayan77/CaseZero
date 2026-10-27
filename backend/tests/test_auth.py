def test_register_and_login(client):
    reg_res = client.post("/api/auth/register", json={
        "username": "detective_holmes",
        "email": "holmes@casezero.com",
        "password": "Password123!"
    })
    assert reg_res.status_code == 200
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["username"] == "detective_holmes"

    login_res = client.post("/api/auth/login", json={
        "username": "detective_holmes",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data

def test_duplicate_user_rejected(client):
    client.post("/api/auth/register", json={
        "username": "unique_detective",
        "email": "unique@casezero.com",
        "password": "Password123!"
    })
    dup_res = client.post("/api/auth/register", json={
        "username": "unique_detective",
        "email": "other@casezero.com",
        "password": "Password123!"
    })
    assert dup_res.status_code == 400

def test_demo_login(client):
    res = client.post("/api/auth/demo")
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert res.json()["user"]["username"] == "investigator_noir"
