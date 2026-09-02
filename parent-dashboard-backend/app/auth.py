from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.security import (
    create_access_token,
    get_current_parent,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def signup(payload: schemas.ParentSignup, db: Session = Depends(get_db)):
    email = payload.email.lower()
    existing = db.query(models.Parent).filter(models.Parent.email == email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    parent = models.Parent(
        email=email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
    )
    db.add(parent)
    db.commit()
    db.refresh(parent)
    return schemas.Token(access_token=create_access_token(parent.id))


@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # OAuth2PasswordRequestForm calls the field "username"; we use it as email.
    email = form_data.username.lower()
    parent = db.query(models.Parent).filter(models.Parent.email == email).first()
    if not parent or not verify_password(form_data.password, parent.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return schemas.Token(access_token=create_access_token(parent.id))


@router.get("/me", response_model=schemas.ParentRead)
def read_me(parent: models.Parent = Depends(get_current_parent)):
    return parent
