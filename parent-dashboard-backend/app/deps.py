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
