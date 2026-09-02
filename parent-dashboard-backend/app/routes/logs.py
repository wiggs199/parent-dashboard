from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db

router = APIRouter()

# Create a log entry
@router.post("/", response_model=schemas.LogEntryRead)
def create_log(log: schemas.LogEntryCreate, db: Session = Depends(get_db)):
    db_log = models.LogEntry(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# Get all logs for a child
@router.get("/child/{child_id}", response_model=List[schemas.LogEntryRead])
def get_logs(child_id: int, db: Session = Depends(get_db)):
    return db.query(models.LogEntry).filter(models.LogEntry.child_id == child_id).all()

@router.get("/summary/{child_id}")
def mock_summary(child_id: int):
    return {"summary": "This is a placeholder summary of your child's logs."}
