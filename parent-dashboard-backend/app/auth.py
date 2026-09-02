from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas
from .database import SessionLocal

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Signup
@router.post("/signup")
def signup(user: schemas.ChildBase, db: Session = Depends(get_db)):
    # implement creating parent
    return {"message": "signup placeholder"}

# Login
@router.post("/login")
def login():
    return {"message": "login placeholder"}
