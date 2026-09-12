from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app import models, schemas
from app.ai import AIUnavailable, generate_activity_summary
from app.database import get_db
from app.deps import get_owned_child_or_404, get_owned_log_or_404
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


@router.patch("/{log_id}", response_model=schemas.LogEntryRead)
def update_log(
    log_id: int,
    payload: schemas.LogEntryUpdate,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    log = get_owned_log_or_404(log_id, parent, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(log, field, value)
    db.commit()
    db.refresh(log)
    return log


@router.delete("/{log_id}", status_code=204)
def delete_log(
    log_id: int,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    log = get_owned_log_or_404(log_id, parent, db)
    db.delete(log)
    db.commit()
    return Response(status_code=204)


@router.get("/summary/{child_id}")
def get_summary(
    child_id: int,
    date_from: Optional[str] = Query(None, alias="from"),
    date_to: Optional[str] = Query(None, alias="to"),
    types: Optional[str] = Query(None, description="comma-separated log types"),
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    """On-demand AI summary of a child's logs, filtered the same way the
    export page is. Never called automatically — the parent asks for it."""
    child = get_owned_child_or_404(child_id, parent, db)

    q = db.query(models.LogEntry).filter(models.LogEntry.child_id == child_id)
    if date_from:
        q = q.filter(models.LogEntry.date >= date_from)
    if date_to:
        q = q.filter(models.LogEntry.date <= date_to)
    if types:
        wanted = [t.strip() for t in types.split(",") if t.strip()]
        if wanted:
            q = q.filter(models.LogEntry.type.in_(wanted))

    logs = q.order_by(models.LogEntry.date.asc(), models.LogEntry.id.asc()).all()
    entries = [
        {
            "date": str(log.date),
            "type": log.type,
            "time_of_day": log.time_of_day,
            "mood_rating": log.mood_rating,
            "practiced_items": log.practiced_items,
            "notes": log.notes,
        }
        for log in logs
    ]

    try:
        summary = generate_activity_summary(child.name, entries)
    except AIUnavailable:
        raise HTTPException(status_code=503, detail="AI summary isn't set up yet.")

    return {"summary": summary}
