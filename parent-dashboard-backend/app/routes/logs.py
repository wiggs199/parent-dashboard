from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import get_owned_child_or_404
from app.security import get_current_parent

router = APIRouter()


@router.post("", response_model=schemas.LogEntryRead, status_code=201)
def create_log(
    log: schemas.LogEntryCreate,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    get_owned_child_or_404(log.child_id, parent, db)

    db_log = models.LogEntry(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


@router.get("/child/{child_id}", response_model=List[schemas.LogEntryRead])
def get_logs(
    child_id: int,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    get_owned_child_or_404(child_id, parent, db)
    return (
        db.query(models.LogEntry)
        .filter(models.LogEntry.child_id == child_id)
        .order_by(models.LogEntry.date.desc(), models.LogEntry.id.desc())
        .all()
    )


@router.get("/summary/{child_id}")
def mock_summary(
    child_id: int,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    get_owned_child_or_404(child_id, parent, db)
    return {"summary": "This is a placeholder summary of your child's logs."}
