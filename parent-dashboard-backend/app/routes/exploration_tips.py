from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app import models, schemas
from app.database import get_db

router = APIRouter()

# Add a tip
@router.post("/", response_model=schemas.ExplorationTipRead)
def add_tip(tip: schemas.ExplorationTipCreate, db: Session = Depends(get_db)):
    db_tip = models.ExplorationTip(**tip.dict(), created_at=datetime.utcnow())
    db.add(db_tip)
    db.commit()
    db.refresh(db_tip)
    return db_tip

# Get tips for a child
@router.get("/child/{child_id}", response_model=List[schemas.ExplorationTipRead])
def get_tips(child_id: int, db: Session = Depends(get_db)):
    return db.query(models.ExplorationTip).filter(models.ExplorationTip.child_id == child_id).all()
