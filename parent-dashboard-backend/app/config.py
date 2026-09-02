import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Load .env sitting next to the backend project root, if present.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# HS256 signing key for JWTs. MUST be set via the environment in production.
# The insecure fallback keeps local dev frictionless but is refused if the
# app thinks it is running for real (see main.py's startup check).
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


def assert_production_config() -> None:
    """Fail fast if we are running outside dev with the throwaway secret."""
    if ENV != "development" and SECRET_KEY == DEV_SECRET:
        sys.exit("ENV is not 'development' but SECRET_KEY is still the dev default. Set a real SECRET_KEY.")
