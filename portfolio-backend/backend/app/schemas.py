from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---- content ----
class ProfileIn(BaseModel):
    name: str
    headline: str = ""
    bio: str = ""
    location: str = ""
    email: str = ""
    github_url: str = ""
    linkedin_url: str = ""
    photo_url: str = ""
    available: bool = True
    stats: list[dict] = []


class ProfileOut(ProfileIn, ORM):
    id: int


class ProjectIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    details: str = ""
    tags: list[str] = []
    github_url: str = ""
    live_url: str = ""
    image_url: str = ""
    order: int = 0


class ProjectOut(ProjectIn, ORM):
    id: int


class AchievementIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    category: str = ""
    description: str = ""
    icon: str = ""
    order: int = 0


class AchievementOut(AchievementIn, ORM):
    id: int


class SkillIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category: str = ""
    order: int = 0


class SkillOut(SkillIn, ORM):
    id: int


# ---- contact ----
class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(default="", max_length=200)
    message: str = Field(min_length=5, max_length=5000)
    website: str = ""  # honeypot: real users leave this empty


class ContactOut(ORM):
    id: int
    name: str
    email: str
    subject: str
    message: str
    is_read: bool
    created_at: datetime


# ---- newsletter ----
class SubscribeIn(BaseModel):
    email: EmailStr
    website: str = ""  # honeypot


class SubscriberOut(ORM):
    id: int
    email: str
    confirmed: bool
    created_at: datetime
    confirmed_at: datetime | None


class NewsletterIn(BaseModel):
    subject: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1)


class NewsletterOut(ORM):
    id: int
    subject: str
    body: str
    recipient_count: int
    sent_at: datetime


# ---- auth ----
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class Message(BaseModel):
    detail: str
