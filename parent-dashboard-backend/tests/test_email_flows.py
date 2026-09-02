def test_signup_starts_unverified_and_sends_welcome(client, mailbox):
    r = client.post(
        "/auth/signup",
        json={"email": "New@Example.com", "password": "supersecret", "name": "New"},
    )
    assert r.status_code == 201
    headers = {"Authorization": f"Bearer {r.json()['access_token']}"}

    me = client.get("/auth/me", headers=headers).json()
    assert me["email_verified"] is False

    assert len(mailbox) == 1
    kind, to, token = mailbox[0]
    assert kind == "welcome" and to == "new@example.com" and token


def test_verify_email_flow(client, mailbox):
    r = client.post("/auth/signup", json={"email": "v@example.com", "password": "supersecret"})
    headers = {"Authorization": f"Bearer {r.json()['access_token']}"}
    _, _, token = mailbox[0]

    ok = client.post("/auth/verify-email", json={"token": token})
    assert ok.status_code == 200
    assert ok.json()["email_verified"] is True
    assert client.get("/auth/me", headers=headers).json()["email_verified"] is True

    # a second use is harmless
    assert client.post("/auth/verify-email", json={"token": token}).status_code == 200


def test_verify_email_rejects_bad_token(client):
    assert client.post("/auth/verify-email", json={"token": "nonsense"}).status_code == 400


def test_resend_verification(client, mailbox, auth_headers):
    headers = auth_headers(email="r@example.com")
    mailbox.clear()
    r = client.post("/auth/resend-verification", headers=headers)
    assert r.status_code == 200
    assert len(mailbox) == 1 and mailbox[0][0] == "verify"


def test_forgot_password_is_quiet_about_membership(client, mailbox):
    client.post("/auth/signup", json={"email": "known@example.com", "password": "supersecret"})
    mailbox.clear()

    r1 = client.post("/auth/forgot-password", json={"email": "known@example.com"})
    r2 = client.post("/auth/forgot-password", json={"email": "stranger@example.com"})
    assert r1.status_code == r2.status_code == 200
    assert r1.json() == r2.json()  # identical response, no leak

    # only the real account got an email
    assert [m for m in mailbox if m[0] == "reset"] == [
        ("reset", "known@example.com", mailbox[0][2])
    ]


def test_reset_password_flow(client, mailbox):
    client.post("/auth/signup", json={"email": "p@example.com", "password": "oldpassword1"})
    mailbox.clear()
    client.post("/auth/forgot-password", json={"email": "p@example.com"})
    _, _, token = mailbox[0]

    r = client.post(
        "/auth/reset-password", json={"token": token, "new_password": "brandnewpass"}
    )
    assert r.status_code == 200 and "access_token" in r.json()

    # old password no longer works, new one does
    assert client.post(
        "/auth/login", data={"username": "p@example.com", "password": "oldpassword1"}
    ).status_code == 401
    assert client.post(
        "/auth/login", data={"username": "p@example.com", "password": "brandnewpass"}
    ).status_code == 200

    # reset also verified the address
    headers = {"Authorization": f"Bearer {r.json()['access_token']}"}
    assert client.get("/auth/me", headers=headers).json()["email_verified"] is True


def test_reset_password_rejects_bad_token(client):
    r = client.post(
        "/auth/reset-password", json={"token": "nope", "new_password": "whatever12"}
    )
    assert r.status_code == 400


def test_verify_token_not_accepted_for_reset(client, mailbox):
    client.post("/auth/signup", json={"email": "x@example.com", "password": "supersecret"})
    _, _, verify_token = mailbox[0]
    # a verification token must not double as a reset token
    r = client.post(
        "/auth/reset-password",
        json={"token": verify_token, "new_password": "supersecret2"},
    )
    assert r.status_code == 400
