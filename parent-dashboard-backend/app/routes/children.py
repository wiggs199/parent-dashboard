from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db

router = APIRouter()

# Create a new child
@router.post("/", response_model=schemas.ChildRead)
def create_child(child: schemas.ChildCreate, db: Session = Depends(get_db)):
    db_child = models.Child(name=child.name)
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    return db_child

# Get all children
@router.get("/", response_model=List[schemas.ChildRead])
def get_children(db: Session = Depends(get_db)):
    return db.query(models.Child).all()

# Get a specific child
@router.get("/{child_id}", response_model=schemas.ChildRead)
def get_child(child_id: int, db: Session = Depends(get_db)):
    child = db.query(models.Child).filter(models.Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child
