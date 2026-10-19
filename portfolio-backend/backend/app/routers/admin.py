from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import settings
from ..database import SessionLocal, get_db
from ..email_service import send_email
from ..security import create_token, get_current_admin, rate_limit, verify_password

auth_router = APIRouter(prefix="/admin", tags=["admin"])
router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


@auth_router.post("/login", response_model=schemas.TokenOut, dependencies=[Depends(rate_limit(10, 600))])
def login(data: schemas.LoginIn, db: Session = Depends(get_db)):
    admin = db.query(models.AdminUser).filter(models.AdminUser.email == data.email).first()
    if not admin or not verify_password(data.password, admin.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return {"access_token": create_token(admin.email)}


@router.get("/me")
def me(admin: models.AdminUser = Depends(get_current_admin)):
    return {"email": admin.email}


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    return {
        "projects": db.query(models.Project).count(),
        "achievements": db.query(models.Achievement).count(),
        "unread_messages": db.query(models.ContactMessage).filter_by(is_read=False).count(),
        "subscribers": db.query(models.Subscriber).filter_by(confirmed=True).count(),
    }


# ---- generic CRUD for ordered content (projects / achievements / skills) ----
def add_crud(path: str, Model, In, Out):
    @router.get(f"/{path}", response_model=list[Out], name=f"admin_list_{path}")
    def list_(db: Session = Depends(get_db)):
        return db.query(Model).order_by(Model.order, Model.id).all()

    @router.post(f"/{path}", response_model=Out, status_code=201, name=f"admin_create_{path}")
    def create(data: In, db: Session = Depends(get_db)):
        obj = Model(**data.model_dump())
        db.add(obj)
        db.commit()
        return obj

    @router.put(f"/{path}/{{item_id}}", response_model=Out, name=f"admin_update_{path}")
    def update(item_id: int, data: In, db: Session = Depends(get_db)):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(404, "Not found")
        for k, v in data.model_dump().items():
            setattr(obj, k, v)
        db.commit()
        return obj

    @router.delete(f"/{path}/{{item_id}}", status_code=204, name=f"admin_delete_{path}")
    def delete(item_id: int, db: Session = Depends(get_db)):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(404, "Not found")
        db.delete(obj)
        db.commit()


add_crud("projects", models.Project, schemas.ProjectIn, schemas.ProjectOut)
add_crud("achievements", models.Achievement, schemas.AchievementIn, schemas.AchievementOut)
add_crud("skills", models.Skill, schemas.SkillIn, schemas.SkillOut)


@router.put("/profile", response_model=schemas.ProfileOut)
def upsert_profile(data: schemas.ProfileIn, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).first() or models.Profile(name=data.name)
    for k, v in data.model_dump().items():
        setattr(profile, k, v)
    db.add(profile)
    db.commit()
    return profile


# ---- inbox ----
@router.get("/messages", response_model=list[schemas.ContactOut])
def messages(db: Session = Depends(get_db)):
    return db.query(models.ContactMessage).order_by(models.ContactMessage.created_at.desc()).all()


@router.patch("/messages/{msg_id}/read", response_model=schemas.ContactOut)
def mark_read(msg_id: int, db: Session = Depends(get_db)):
    msg = db.get(models.ContactMessage, msg_id)
    if not msg:
        raise HTTPException(404, "Not found")
    msg.is_read = True
    db.commit()
    return msg


@router.delete("/messages/{msg_id}", status_code=204)
def delete_message(msg_id: int, db: Session = Depends(get_db)):
    msg = db.get(models.ContactMessage, msg_id)
    if not msg:
        raise HTTPException(404, "Not found")
    db.delete(msg)
    db.commit()


# ---- subscribers & newsletter ----
@router.get("/subscribers", response_model=list[schemas.SubscriberOut])
def subscribers(db: Session = Depends(get_db)):
    return db.query(models.Subscriber).order_by(models.Subscriber.created_at.desc()).all()


@router.delete("/subscribers/{sub_id}", status_code=204)
def delete_subscriber(sub_id: int, db: Session = Depends(get_db)):
    sub = db.get(models.Subscriber, sub_id)
    if not sub:
        raise HTTPException(404, "Not found")
    db.delete(sub)
    db.commit()


@router.get("/newsletter/issues", response_model=list[schemas.NewsletterOut])
def issues(db: Session = Depends(get_db)):
    return db.query(models.NewsletterIssue).order_by(models.NewsletterIssue.sent_at.desc()).all()


def _deliver(subject: str, body: str, recipients: list[tuple[str, str]]):
    base = settings.frontend_url.rstrip("/")
    for email, token in recipients:
        footer = f"\n\n--\nUnsubscribe: {base}/newsletter/unsubscribe/{token}"
        send_email(email, subject, body + footer)


@router.post("/newsletter/send", response_model=schemas.NewsletterOut, status_code=201)
def send_newsletter(data: schemas.NewsletterIn, bg: BackgroundTasks, db: Session = Depends(get_db)):
    subs = db.query(models.Subscriber).filter_by(confirmed=True).all()
    issue = models.NewsletterIssue(subject=data.subject, body=data.body, recipient_count=len(subs))
    db.add(issue)
    db.commit()
    bg.add_task(_deliver, data.subject, data.body, [(s.email, s.token) for s in subs])
    return issue
