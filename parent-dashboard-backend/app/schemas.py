from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

LogType = Literal["exercise", "exploration"]


# -----------------------------
# Auth / Parent Schemas
# -----------------------------
class ParentSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    name: Optional[str] = Field(default=None, max_length=120)


class ParentRead(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# -----------------------------
# Child Schemas
# -----------------------------
class ChildBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class ChildCreate(ChildBase):
    pass


class ChildRead(ChildBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# LogEntry Schemas
# -----------------------------
class LogEntryBase(BaseModel):
    child_id: int
    date: date
    type: LogType
    practiced_items: Optional[str] = None
    mood_rating: Optional[int] = Field(default=None, ge=1, le=5)
    notes: Optional[str] = None


class LogEntryCreate(LogEntryBase):
    pass


class LogEntryRead(LogEntryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# Document Schemas
# -----------------------------
class DocumentRead(BaseModel):
    id: int
    child_id: int
    type: str
    filename: str

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# ExplorationTip Schemas
# -----------------------------
class ExplorationTipBase(BaseModel):
    child_id: int
    logentry_id: Optional[int] = None
    tip_text: str = Field(min_length=1)


class ExplorationTipCreate(ExplorationTipBase):
    pass


class ExplorationTipRead(ExplorationTipBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
