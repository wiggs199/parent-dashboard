from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app import models


def get_owned_child_or_404(
    child_id: int, parent: models.Parent, db: Session
) -> models.Child:
    """Return the child only if it belongs to this parent, else 404.

    Uses 404 (not 403) so the API does not reveal whether a child id exists
    under another account.
    """
    child = (
        db.query(models.Child)
        .filter(models.Child.id == child_id, models.Child.parent_id == parent.id)
        .first()
    )
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")
    return child


def get_owned_log_or_404(
    log_id: int, parent: models.Parent, db: Session
) -> models.LogEntry:
    """Return the log only if it belongs to one of this parent's children."""
    log = (
        db.query(models.LogEntry)
        .join(models.Child, models.LogEntry.child_id == models.Child.id)
        .filter(models.LogEntry.id == log_id, models.Child.parent_id == parent.id)
        .first()
    )
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log not found")
    return log


def get_owned_document_or_404(
    doc_id: int, parent: models.Parent, db: Session
) -> models.Document:
    doc = (
        db.query(models.Document)
        .join(models.Child, models.Document.child_id == models.Child.id)
        .filter(models.Document.id == doc_id, models.Child.parent_id == parent.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc
