from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import get_owned_child_or_404
from app.security import get_current_parent

router = APIRouter()


@router.post("", response_model=schemas.ExplorationTipRead, status_code=201)
def add_tip(
    tip: schemas.ExplorationTipCreate,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    get_owned_child_or_404(tip.child_id, parent, db)

    if tip.logentry_id is not None:
        log = (
            db.query(models.LogEntry)
            .filter(
                models.LogEntry.id == tip.logentry_id,
                models.LogEntry.child_id == tip.child_id,
            )
            .first()
        )
        if not log:
            raise HTTPException(status_code=404, detail="LogEntry not found")

    db_tip = models.ExplorationTip(**tip.model_dump())
    db.add(db_tip)
    db.commit()
    db.refresh(db_tip)
    return db_tip


@router.get("/child/{child_id}", response_model=List[schemas.ExplorationTipRead])
def get_tips(
    child_id: int,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    get_owned_child_or_404(child_id, parent, db)
    return (
        db.query(models.ExplorationTip)
        .filter(models.ExplorationTip.child_id == child_id)
        .all()
    )
