from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def now():
    return datetime.now(timezone.utc)


class Profile(Base):
    __tablename__ = "profile"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    headline: Mapped[str] = mapped_column(String(200), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str] = mapped_column(String(120), default="")
    email: Mapped[str] = mapped_column(String(200), default="")
    github_url: Mapped[str] = mapped_column(String(300), default="")
    linkedin_url: Mapped[str] = mapped_column(String(300), default="")
    photo_url: Mapped[str] = mapped_column(String(500), default="")
    available: Mapped[bool] = mapped_column(Boolean, default=True)
    stats: Mapped[list] = mapped_column(JSON, default=list)  # [{"value": "3+", "label": "Projects"}]


class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[str] = mapped_column(Text, default="")  # long write-up for the detail page
    tags: Mapped[list] = mapped_column(JSON, default=list)
    github_url: Mapped[str] = mapped_column(String(300), default="")
    live_url: Mapped[str] = mapped_column(String(300), default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    order: Mapped[int] = mapped_column(Integer, default=0)


class Achievement(Base):
    __tablename__ = "achievements"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(200), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    icon: Mapped[str] = mapped_column(String(20), default="")
    order: Mapped[int] = mapped_column(Integer, default=0)


class Skill(Base):
    __tablename__ = "skills"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(String(100), default="")
    order: Mapped[int] = mapped_column(Integer, default=0)


class ContactMessage(Base):
    __tablename__ = "contact_messages"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(200))
    subject: Mapped[str] = mapped_column(String(200), default="")
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class Subscriber(Base):
    __tablename__ = "subscribers"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    token: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class NewsletterIssue(Base):
    __tablename__ = "newsletter_issues"
    id: Mapped[int] = mapped_column(primary_key=True)
    subject: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    recipient_count: Mapped[int] = mapped_column(Integer, default=0)
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class AdminUser(Base):
    __tablename__ = "admin_users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(200), unique=True)
    password_hash: Mapped[str] = mapped_column(String(300))
