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
