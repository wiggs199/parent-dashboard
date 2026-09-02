from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import shutil
import os

from app import models, schemas
from app.database import get_db

router = APIRouter()

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Upload document
@router.post("/", response_model=schemas.DocumentRead)
def upload_document(child_id: int, type: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_doc = models.Document(child_id=child_id, type=type, filename=file.filename)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

# Get documents for a child
@router.get("/child/{child_id}", response_model=List[schemas.DocumentRead])
def get_documents(child_id: int, db: Session = Depends(get_db)):
    return db.query(models.Document).filter(models.Document.child_id == child_id).all()
