from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app import models
from app.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    RESET_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
    VERIFY_TOKEN_EXPIRE_HOURS,
)
from app.database import get_db

# bcrypt truncates silently past 72 bytes; reject instead so a long password
# is not quietly weakened.
MAX_PASSWORD_BYTES = 72

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(parent_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(parent_id),
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)


def _purpose_token(parent_id: int, purpose: str, expires: timedelta) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {"sub": str(parent_id), "purpose": purpose, "iat": now, "exp": now + expires},
        SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def create_email_verification_token(parent_id: int) -> str:
    return _purpose_token(parent_id, "verify_email", timedelta(hours=VERIFY_TOKEN_EXPIRE_HOURS))


def create_password_reset_token(parent_id: int) -> str:
    return _purpose_token(parent_id, "reset_password", timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES))


def read_purpose_token(token: str, expected_purpose: str) -> Optional[int]:
    """Return the parent id if the token is valid and for the expected purpose."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("purpose") != expected_purpose:
            return None
        return int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        return None


def get_current_parent(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.Parent:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        parent_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise credentials_error

    parent = db.query(models.Parent).filter(models.Parent.id == parent_id).first()
    if parent is None:
        raise credentials_error
    return parent
