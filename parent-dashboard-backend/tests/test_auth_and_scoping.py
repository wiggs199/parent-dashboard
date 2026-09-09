import io


def test_health_is_public(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_endpoints_require_auth(client):
    assert client.get("/children").status_code == 401
    assert client.post("/children", json={"name": "X", "birth_year": 2018}).status_code == 401


def test_signup_and_login(client):
    r = client.post(
        "/auth/signup",
        json={"email": "A@Example.com", "password": "supersecret", "name": "Parent A"},
    )
    assert r.status_code == 201
    assert "access_token" in r.json()

    # email is normalised to lower-case -> duplicate is rejected
    assert client.post(
        "/auth/signup", json={"email": "a@example.com", "password": "supersecret"}
    ).status_code == 409

    # too-short password fails validation
    assert client.post(
        "/auth/signup", json={"email": "z@example.com", "password": "short"}
    ).status_code == 422

    assert client.post(
        "/auth/login", data={"username": "a@example.com", "password": "supersecret"}
    ).status_code == 200
    assert client.post(
        "/auth/login", data={"username": "a@example.com", "password": "wrong"}
    ).status_code == 401


def test_bad_token_rejected(client):
    assert client.get("/auth/me", headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_children_are_scoped_to_parent(client, auth_headers):
    a = auth_headers(email="a@example.com")
    b = auth_headers(email="b@example.com")

    child_a = client.post("/children", json={"name": "Kid A", "birth_year": 2018}, headers=a).json()
    client.post("/children", json={"name": "Kid B", "birth_year": 2018}, headers=b)

    assert [c["name"] for c in client.get("/children", headers=a).json()] == ["Kid A"]
    assert [c["name"] for c in client.get("/children", headers=b).json()] == ["Kid B"]
    # B cannot see A's child, and gets 404 (not 403) so ids don't leak
    assert client.get(f"/children/{child_a['id']}", headers=b).status_code == 404


def test_logs_documents_tips_respect_child_ownership(client, auth_headers):
    a = auth_headers(email="a@example.com")
    b = auth_headers(email="b@example.com")
    child_a = client.post("/children", json={"name": "Kid A", "birth_year": 2018}, headers=a).json()

    good_log = {
        "child_id": child_a["id"],
        "date": "2026-09-02",
        "type": "activity",
        "mood_rating": 4,
        "notes": "painting",
    }
    assert client.post("/logs", json=good_log, headers=a).status_code == 201
    assert client.post("/logs", json=good_log, headers=b).status_code == 404

    assert client.post(
        "/logs",
        json={**good_log, "mood_rating": 9},
        headers=a,
    ).status_code == 422
    assert client.post(
        "/logs",
        json={**good_log, "type": "banana"},
        headers=a,
    ).status_code == 422

    assert len(client.get(f"/logs/child/{child_a['id']}", headers=a).json()) == 1
    assert client.get(f"/logs/child/{child_a['id']}", headers=b).status_code == 404
    assert client.get(f"/logs/summary/{child_a['id']}", headers=b).status_code == 404

    up = client.post(
        "/documents",
        data={"child_id": child_a["id"], "category": "school"},
        files={"file": ("../../evil.txt", io.BytesIO(b"hi"), "text/plain")},
        headers=a,
    )
    assert up.status_code == 201
    assert up.json()["filename"] == "evil.txt"  # path stripped
    assert client.post(
        "/documents",
        data={"child_id": child_a["id"], "category": "school"},
        files={"file": ("x.txt", io.BytesIO(b"hi"), "text/plain")},
        headers=b,
    ).status_code == 404

    assert client.post(
        "/explorationtips",
        json={"child_id": child_a["id"], "tip_text": "Keep sessions short"},
        headers=a,
    ).status_code == 201
    assert client.post(
        "/explorationtips",
        json={"child_id": child_a["id"], "tip_text": "x"},
        headers=b,
    ).status_code == 404
