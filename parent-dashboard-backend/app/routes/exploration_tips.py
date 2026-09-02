from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db

router = APIRouter()


# Add a tip
@router.post("", response_model=schemas.ExplorationTipRead)
def add_tip(tip: schemas.ExplorationTipCreate, db: Session = Depends(get_db)):
    child = db.query(models.Child).filter(models.Child.id == tip.child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    if tip.logentry_id is not None:
        log = db.query(models.LogEntry).filter(models.LogEntry.id == tip.logentry_id).first()
        if not log:
            raise HTTPException(status_code=404, detail="LogEntry not found")

    db_tip = models.ExplorationTip(**tip.model_dump())
    db.add(db_tip)
    db.commit()
    db.refresh(db_tip)
    return db_tip


# Get tips for a child
@router.get("/child/{child_id}", response_model=List[schemas.ExplorationTipRead])
def get_tips(child_id: int, db: Session = Depends(get_db)):
    return db.query(models.ExplorationTip).filter(models.ExplorationTip.child_id == child_id).all()
