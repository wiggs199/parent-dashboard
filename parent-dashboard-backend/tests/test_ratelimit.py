import io

import pytest

from app.ratelimit import limiter


@pytest.fixture()
def rate_limited():
    limiter.enabled = True
    limiter.reset()
    yield
    limiter.enabled = False
    limiter.reset()


def test_login_is_rate_limited(client, rate_limited):
    # limit is 10/minute
    bad = {"username": "nobody@example.com", "password": "wrong"}
    codes = [client.post("/auth/login", data=bad).status_code for _ in range(12)]
    assert codes[:10] == [401] * 10
    assert 429 in codes[10:]


def test_signup_is_rate_limited(client, rate_limited):
    # limit is 5/hour
    codes = []
    for i in range(7):
        r = client.post(
            "/auth/signup", json={"email": f"u{i}@example.com", "password": "supersecret"}
        )
        codes.append(r.status_code)
    assert codes[:5] == [201] * 5
    assert codes[5:] == [429, 429]


def test_forgot_password_is_rate_limited(client, rate_limited):
    codes = [
        client.post("/auth/forgot-password", json={"email": "x@example.com"}).status_code
        for _ in range(7)
    ]
    assert 429 in codes


def test_limit_keys_on_forwarded_ip(client, rate_limited):
    # a different X-Forwarded-For is a different bucket
    bad = {"username": "nobody@example.com", "password": "wrong"}
    for _ in range(11):
        client.post("/auth/login", data=bad)  # exhausts IP "testclient"
    blocked = client.post("/auth/login", data=bad)
    assert blocked.status_code == 429

    other = client.post(
        "/auth/login", data=bad, headers={"X-Forwarded-For": "203.0.113.9"}
    )
    assert other.status_code == 401


def test_ai_summary_is_rate_limited(client, auth_headers, rate_limited):
    # limit is 20/hour. No ANTHROPIC_API_KEY in tests -> each allowed call
    # still reaches the handler and returns a clean 503, which is enough to
    # tell "rate limited" (429) apart from "let through" (503).
    a = auth_headers(email="ai-rl@example.com")
    child = client.post(
        "/children", json={"name": "Kid", "birth_year": 2018}, headers=a
    ).json()

    codes = [
        client.get(f"/logs/summary/{child['id']}", headers=a).status_code
        for _ in range(22)
    ]
    assert codes[:20] == [503] * 20
    assert codes[20:] == [429, 429]


def test_ai_extract_is_rate_limited(client, auth_headers, rate_limited):
    # limit is 15/hour.
    a = auth_headers(email="extract-rl@example.com")
    child = client.post(
        "/children", json={"name": "Kid", "birth_year": 2018}, headers=a
    ).json()
    doc = client.post(
        "/documents",
        data={"child_id": child["id"], "category": "other"},
        files={"file": ("report.pdf", io.BytesIO(b"%PDF-1.4 fake"), "application/pdf")},
        headers=a,
    ).json()

    codes = [
        client.post(f"/documents/{doc['id']}/extract", headers=a).status_code
        for _ in range(17)
    ]
    assert codes[:15] == [503] * 15
    assert codes[15:] == [429, 429]
