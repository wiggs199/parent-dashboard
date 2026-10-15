from datetime import date, datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

LogType = Literal[
    "home_practice",
    "activity",
    "appointment",
    "observation",
    "milestone",
]
TimeOfDay = Literal["morning", "afternoon", "evening"]
CURRENT_YEAR = datetime.now().year


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
    email_verified: bool = False

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str


class TokenInput(BaseModel):
    token: str


class ForgotPasswordInput(BaseModel):
    email: EmailStr


class ResetPasswordInput(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=72)


# -----------------------------
# Child Schemas
# -----------------------------
class ChildBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class ChildCreate(ChildBase):
    # Required — it's the one medical basic every parent knows, and it
    # keeps documents/exports meaningful.
    birth_year: int = Field(ge=1990, le=CURRENT_YEAR)


class HandoffContact(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    phone: str = Field(min_length=1, max_length=30)


class ChildUpdate(BaseModel):
    """Partial update — only the fields sent are changed."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    birth_year: Optional[int] = Field(default=None, ge=1990, le=CURRENT_YEAR)
    focus_areas: Optional[List[str]] = Field(default=None, max_length=12)
    profile_notes: Optional[str] = Field(default=None, max_length=4000)

    # Handoff card — all optional, parent fills in only what they want on
    # the shareable card. Never touched by AI: allergies/contacts are
    # safety-relevant, so this is always exactly what the parent typed.
    handoff_helps: Optional[str] = Field(default=None, max_length=2000)
    handoff_avoid: Optional[str] = Field(default=None, max_length=2000)
    handoff_communication: Optional[str] = Field(default=None, max_length=2000)
    handoff_medical: Optional[str] = Field(default=None, max_length=2000)
    handoff_contacts: Optional[List[HandoffContact]] = Field(default=None, max_length=4)

    @field_validator("focus_areas")
    @classmethod
    def _clean_focus_areas(cls, v):
        if v is None:
            return v
        seen = []
        for item in v:
            s = str(item).strip()[:40]
            if s and s not in seen:
                seen.append(s)
        return seen


class ChildRead(ChildBase):
    id: int
    birth_year: Optional[int] = None
    focus_areas: List[str] = Field(default_factory=list)
    profile_notes: Optional[str] = None
    handoff_helps: Optional[str] = None
    handoff_avoid: Optional[str] = None
    handoff_communication: Optional[str] = None
    handoff_medical: Optional[str] = None
    handoff_contacts: List[HandoffContact] = Field(default_factory=list)
    # The owner needs their own child's token to build the share link —
    # safe here since ChildRead only ever goes to the authenticated owner.
    handoff_token: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class HandoffLinkRead(BaseModel):
    token: str


class HandoffRead(BaseModel):
    """What a public, unauthenticated viewer of a handoff link sees.

    Deliberately narrow — only the fields a parent explicitly filled in for
    this purpose. Never the full profile, never logs or documents, never
    the token itself.
    """

    name: str
    birth_year: Optional[int] = None
    handoff_helps: Optional[str] = None
    handoff_avoid: Optional[str] = None
    handoff_communication: Optional[str] = None
    handoff_medical: Optional[str] = None
    handoff_contacts: List[HandoffContact] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# LogEntry Schemas
# -----------------------------
class LogEntryBase(BaseModel):
    child_id: int
    date: date
    time_of_day: Optional[TimeOfDay] = None
    type: LogType
    practiced_items: Optional[str] = None
    mood_rating: Optional[int] = Field(default=None, ge=1, le=5)
    notes: Optional[str] = None


class LogEntryCreate(LogEntryBase):
    pass


class LogEntryUpdate(BaseModel):
    # partial update — child_id is fixed once created
    date: Optional[date] = None
    time_of_day: Optional[TimeOfDay] = None
    type: Optional[LogType] = None
    practiced_items: Optional[str] = None
    mood_rating: Optional[int] = Field(default=None, ge=1, le=5)
    notes: Optional[str] = None


class LogEntryRead(LogEntryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# Document Schemas
# -----------------------------
DocumentCategory = Literal["therapist", "school", "insurance", "other"]


class DocumentUpdate(BaseModel):
    filename: Optional[str] = Field(default=None, min_length=1, max_length=200)
    category: Optional[DocumentCategory] = None


class DocumentRead(BaseModel):
    id: int
    child_id: int
    category: DocumentCategory
    filename: str
    content_type: Optional[str] = None
    size_bytes: Optional[int] = None
    uploaded_at: Optional[datetime] = None

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
