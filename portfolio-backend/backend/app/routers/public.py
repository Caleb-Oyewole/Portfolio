import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import settings
from ..database import get_db
from ..email_service import send_email
from ..security import rate_limit

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/profile", response_model=schemas.ProfileOut)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(models.Profile).first()
    if not profile:
        raise HTTPException(404, "Profile not set up yet")
    return profile


@router.get("/projects", response_model=list[schemas.ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).order_by(models.Project.order, models.Project.id).all()


@router.get("/projects/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.get("/achievements", response_model=list[schemas.AchievementOut])
def list_achievements(db: Session = Depends(get_db)):
    return db.query(models.Achievement).order_by(models.Achievement.order, models.Achievement.id).all()


@router.get("/skills", response_model=list[schemas.SkillOut])
def list_skills(db: Session = Depends(get_db)):
    return db.query(models.Skill).order_by(models.Skill.order, models.Skill.id).all()


@router.post(
    "/contact",
    response_model=schemas.Message,
    status_code=201,
    dependencies=[Depends(rate_limit(5, 3600))],
)
def send_contact(data: schemas.ContactIn, bg: BackgroundTasks, db: Session = Depends(get_db)):
    if data.website:  # honeypot tripped: pretend success, store nothing
        return {"detail": "Message sent"}
    db.add(models.ContactMessage(name=data.name, email=data.email, subject=data.subject, message=data.message))
    db.commit()
    inbox = settings.contact_inbox or settings.admin_email
    bg.add_task(
        send_email,
        inbox,
        f"[Portfolio] {data.subject or 'New message'} - {data.name}",
        f"From: {data.name} <{data.email}>\n\n{data.message}",
        data.email,
    )
    return {"detail": "Message sent"}


@router.post(
    "/newsletter/subscribe",
    response_model=schemas.Message,
    dependencies=[Depends(rate_limit(5, 3600))],
)
def subscribe(data: schemas.SubscribeIn, bg: BackgroundTasks, db: Session = Depends(get_db)):
    generic = {"detail": "Check your inbox to confirm your subscription"}
    if data.website:
        return generic
    email = data.email.lower()
    sub = db.query(models.Subscriber).filter(models.Subscriber.email == email).first()
    if sub and sub.confirmed:
        return generic  # don't reveal whether an address is already subscribed
    if not sub:
        sub = models.Subscriber(email=email, token=secrets.token_urlsafe(32))
        db.add(sub)
        db.commit()
    link = f"{settings.frontend_url.rstrip('/')}/newsletter/confirm/{sub.token}"
    bg.add_task(send_email, email, "Confirm your subscription", f"Please confirm your subscription:\n\n{link}\n")
    return generic


@router.post("/newsletter/confirm/{token}", response_model=schemas.Message)
def confirm(token: str, db: Session = Depends(get_db)):
    sub = db.query(models.Subscriber).filter(models.Subscriber.token == token).first()
    if not sub:
        raise HTTPException(404, "Invalid or expired link")
    if not sub.confirmed:
        sub.confirmed = True
        sub.confirmed_at = datetime.now(timezone.utc)
        db.commit()
    return {"detail": "Subscription confirmed"}


@router.post("/newsletter/unsubscribe/{token}", response_model=schemas.Message)
def unsubscribe(token: str, db: Session = Depends(get_db)):
    sub = db.query(models.Subscriber).filter(models.Subscriber.token == token).first()
    if not sub:
        raise HTTPException(404, "Invalid link")
    db.delete(sub)
    db.commit()
    return {"detail": "You have been unsubscribed"}
