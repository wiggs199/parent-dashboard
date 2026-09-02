from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


def _utcnow():
    return datetime.now(timezone.utc)

class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    logs = relationship("LogEntry", back_populates="child")
    documents = relationship("Document", back_populates="child")
    exploration_tips = relationship("ExplorationTip", back_populates="child")

class LogEntry(Base):
    __tablename__ = "logentries"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    date = Column(Date)
    type = Column(String)  # e.g., "exercise" or "exploration"
    practiced_items = Column(Text, nullable=True)
    mood_rating = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    child = relationship("Child", back_populates="logs")
    exploration_tips = relationship("ExplorationTip", back_populates="logentry")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    type = Column(String)        # e.g., "pdf", "image"
    filename = Column(String)    # actual stored filename

    child = relationship("Child", back_populates="documents")

class ExplorationTip(Base):
    __tablename__ = "explorationtips"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    logentry_id = Column(Integer, ForeignKey("logentries.id"), nullable=True)
    tip_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=_utcnow)

    child = relationship("Child", back_populates="exploration_tips")
    logentry = relationship("LogEntry", back_populates="exploration_tips")
