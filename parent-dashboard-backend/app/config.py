import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Load .env sitting next to the backend project root, if present.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# HS256 signing key for JWTs. MUST be set via the environment in production.
# The insecure fallback keeps local dev frictionless but is refused if the
# app thinks it is running for real (see assert_production_config).
DEV_SECRET = "dev-only-insecure-secret-change-me"
SECRET_KEY = os.getenv("SECRET_KEY", DEV_SECRET)

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h

# Comma-separated list of origins allowed to call the API from a browser.
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if o.strip()
]

ENV = os.getenv("ENV", "development")

# Where the frontend lives — used to build links in outgoing emails.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

# Transactional email (Resend). Unset -> emails are logged, not sent, which
# keeps local dev and tests offline.
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "NovaPath <onboarding@resend.dev>")

VERIFY_TOKEN_EXPIRE_HOURS = int(os.getenv("VERIFY_TOKEN_EXPIRE_HOURS", "168"))  # 7 days
RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "60"))


def _normalize_db_url(raw: str) -> str:
    """Accept the URL shapes hosts hand out and target the psycopg v3 driver.

    Neon/Render give `postgresql://…` (sometimes the legacy `postgres://`);
    SQLAlchemy needs an explicit driver, so map both to `postgresql+psycopg://`.
    """
    if raw.startswith("postgres://"):
        raw = "postgresql://" + raw[len("postgres://"):]
    if raw.startswith("postgresql://"):
        raw = "postgresql+psycopg://" + raw[len("postgresql://"):]
    return raw


# No DATABASE_URL -> local SQLite file. Set it in production to a Postgres URL.
DATABASE_URL = _normalize_db_url(os.getenv("DATABASE_URL", "sqlite:///./db.sqlite3"))


def assert_production_config() -> None:
    """Fail fast on an unsafe production configuration."""
    if ENV == "development":
        return
    if SECRET_KEY == DEV_SECRET:
        sys.exit("ENV is not 'development' but SECRET_KEY is still the dev default. Set a real SECRET_KEY.")
    if DATABASE_URL.startswith("sqlite"):
        sys.exit("ENV is not 'development' but DATABASE_URL is unset. Point it at Postgres.")
