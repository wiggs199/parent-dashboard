from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import mailer, models, schemas
from app.database import get_db
from app.security import (
    create_access_token,
    create_email_verification_token,
    create_password_reset_token,
    get_current_parent,
    hash_password,
    read_purpose_token,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

_LINK_DEAD = "This link is invalid or has expired."


@router.post("/signup", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def signup(
    payload: schemas.ParentSignup,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email = payload.email.lower()
    if db.query(models.Parent).filter(models.Parent.email == email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    parent = models.Parent(
        email=email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
    )
    db.add(parent)
    db.commit()
    db.refresh(parent)

    token = create_email_verification_token(parent.id)
    background.add_task(mailer.send_welcome_and_verify, parent.email, parent.name or "", token)

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


@router.post("/verify-email", response_model=schemas.ParentRead)
def verify_email(payload: schemas.TokenInput, db: Session = Depends(get_db)):
    parent_id = read_purpose_token(payload.token, "verify_email")
    parent = (
        db.query(models.Parent).filter(models.Parent.id == parent_id).first()
        if parent_id is not None
        else None
    )
    if parent is None:
        raise HTTPException(status_code=400, detail=_LINK_DEAD)
    if not parent.email_verified:
        parent.email_verified = True
        db.commit()
        db.refresh(parent)
    return parent


@router.post("/resend-verification", response_model=schemas.MessageResponse)
def resend_verification(
    background: BackgroundTasks,
    parent: models.Parent = Depends(get_current_parent),
):
    if parent.email_verified:
        return schemas.MessageResponse(message="Your email is already confirmed.")
    token = create_email_verification_token(parent.id)
    background.add_task(mailer.send_verify, parent.email, token)
    return schemas.MessageResponse(message="Confirmation email sent.")


@router.post("/forgot-password", response_model=schemas.MessageResponse)
def forgot_password(
    payload: schemas.ForgotPasswordInput,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    parent = db.query(models.Parent).filter(models.Parent.email == payload.email.lower()).first()
    if parent is not None:
        token = create_password_reset_token(parent.id)
        background.add_task(mailer.send_password_reset, parent.email, token)
    # Same response whether or not the address exists — don't leak membership.
    return schemas.MessageResponse(
        message="If that email has an account, a reset link is on its way."
    )


@router.post("/reset-password", response_model=schemas.Token)
def reset_password(payload: schemas.ResetPasswordInput, db: Session = Depends(get_db)):
    parent_id = read_purpose_token(payload.token, "reset_password")
    parent = (
        db.query(models.Parent).filter(models.Parent.id == parent_id).first()
        if parent_id is not None
        else None
    )
    if parent is None:
        raise HTTPException(status_code=400, detail=_LINK_DEAD)

    parent.hashed_password = hash_password(payload.new_password)
    parent.email_verified = True  # a successful email reset also confirms the address
    db.commit()
    return schemas.Token(access_token=create_access_token(parent.id))
