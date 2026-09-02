from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional

# -----------------------------
# Child Schemas
# -----------------------------
class ChildBase(BaseModel):
    name: str

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
    type: str  # "exercise" or "exploration"
    practiced_items: Optional[str] = None
    mood_rating: Optional[int] = None
    notes: Optional[str] = None

class LogEntryCreate(LogEntryBase):
    pass

class LogEntryRead(LogEntryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# -----------------------------
# Document Schemas
# -----------------------------
class DocumentBase(BaseModel):
    child_id: int
    type: str
    filename: str

class DocumentCreate(DocumentBase):
    pass

class DocumentRead(DocumentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# -----------------------------
# ExplorationTip Schemas
# -----------------------------
class ExplorationTipBase(BaseModel):
    child_id: int
    logentry_id: Optional[int] = None
    tip_text: str

class ExplorationTipCreate(ExplorationTipBase):
    pass

class ExplorationTipRead(ExplorationTipBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
