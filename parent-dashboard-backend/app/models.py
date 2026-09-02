from sqlalchemy import Boolean, Column, Integer, String, Text, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class Parent(Base):
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    email_verified = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=_utcnow)

    children = relationship(
        "Child", back_populates="parent", cascade="all, delete-orphan"
    )


class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("parents.id"), nullable=False, index=True)
    name = Column(String, nullable=False)

    parent = relationship("Parent", back_populates="children")
    logs = relationship(
        "LogEntry", back_populates="child", cascade="all, delete-orphan"
    )
    documents = relationship(
        "Document", back_populates="child", cascade="all, delete-orphan"
    )
    exploration_tips = relationship(
        "ExplorationTip", back_populates="child", cascade="all, delete-orphan"
    )


class LogEntry(Base):
    __tablename__ = "logentries"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False, index=True)
    date = Column(Date)
    type = Column(String)  # e.g., "exercise" or "exploration"
    practiced_items = Column(Text, nullable=True)
    mood_rating = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    child = relationship("Child", back_populates="logs")
    exploration_tips = relationship(
        "ExplorationTip", back_populates="logentry", cascade="all, delete-orphan"
    )


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False, index=True)
    type = Column(String)        # e.g., "pdf", "image"
    filename = Column(String)    # actual stored filename

    child = relationship("Child", back_populates="documents")


class ExplorationTip(Base):
    __tablename__ = "explorationtips"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False, index=True)
    logentry_id = Column(Integer, ForeignKey("logentries.id"), nullable=True)
    tip_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=_utcnow)

    child = relationship("Child", back_populates="exploration_tips")
    logentry = relationship("LogEntry", back_populates="exploration_tips")
