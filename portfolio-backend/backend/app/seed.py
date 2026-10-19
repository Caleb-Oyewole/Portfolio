from sqlalchemy.orm import Session

from . import models
from .config import settings
from .security import hash_password


def ensure_admin(db: Session):
    if not db.query(models.AdminUser).first():
        db.add(models.AdminUser(email=settings.admin_email, password_hash=hash_password(settings.admin_password)))
        db.commit()


def seed_content(db: Session):
    """Placeholder content so the frontend has something to render. Replace via the admin API."""
    if db.query(models.Profile).first():
        return
    db.add(models.Profile(
        name="Your Name",
        headline="Full-Stack Developer",
        bio="**Computer Engineer and Data Engineering specialist crafting scalable backend architectures, intelligent data pipelines, and full-stack web applications. Proficient in Python, FastAPI, Docker, Next.js, and modern JavaScript, with a strong track record of building AI-driven solutions and high-impact hackathon prototypes. Eager to bridge the gap between heavy data infrastructure and seamless, high-performance software engineering.**",
        location="Ile-Ife, Osun State, Nigeria",
        email="oyewolecaleb729@gmail.com",
        github_url="https://github.com/your-handle",
        linkedin_url="https://www.linkedin.com/in/oyewole-caleb-295a8b294/",
        available=True,
        stats=[{"value": "3+", "label": "Projects"}],
    ))
    db.add_all([
        models.Skill(name="Python", category="Backend", order=1),
        models.Skill(name="FastAPI", category="Backend", order=2),
        models.Skill(name="React", category="Frontend", order=3),
    ])
    db.add(models.Project(
        title="Sample Project", description="Describe what you built.",
        tags=["Python", "FastAPI"], github_url="https://github.com/your-handle", order=1,
    ))
    db.add(models.Achievement(title="Sample Achievement", category="Category", description="What happened.", icon="🏆", order=1))
    db.commit()
