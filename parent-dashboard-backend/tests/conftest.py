import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app


@pytest.fixture()
def client(tmp_path):
    """A TestClient backed by a fresh throwaway SQLite file per test."""
    engine = create_engine(
        f"sqlite:///{tmp_path/'test.db'}",
        connect_args={"check_same_thread": False},
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    # keep uploaded test files out of the real uploads/ dir
    from app import storage

    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    saved_local_dir = storage._LOCAL_DIR
    storage._LOCAL_DIR = upload_dir

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    storage._LOCAL_DIR = saved_local_dir


@pytest.fixture()
def mailbox(monkeypatch):
    """Capture outgoing mail instead of sending it. Each entry: (kind, to, token)."""
    from app import mailer

    sent = []
    monkeypatch.setattr(
        mailer, "send_welcome_and_verify",
        lambda to, name, token: sent.append(("welcome", to, token)),
    )
    monkeypatch.setattr(
        mailer, "send_verify",
        lambda to, token: sent.append(("verify", to, token)),
    )
    monkeypatch.setattr(
        mailer, "send_password_reset",
        lambda to, token: sent.append(("reset", to, token)),
    )
    return sent


@pytest.fixture()
def auth_headers(client):
    """Return a helper that signs up a parent and yields Authorization headers."""

    def _make(email="parent@example.com", password="supersecret", name=None):
        r = client.post(
            "/auth/signup",
            json={"email": email, "password": password, "name": name},
        )
        assert r.status_code == 201, r.text
        return {"Authorization": f"Bearer {r.json()['access_token']}"}

    return _make
