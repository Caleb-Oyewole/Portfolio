from sqlalchemy.orm import Session

from . import models
from .config import settings
from .security import hash_password


def ensure_admin(db: Session):
    if not db.query(models.AdminUser).first():
        db.add(models.AdminUser(email=settings.admin_email, password_hash=hash_password(settings.admin_password)))
        db.commit()


ACHIEVEMENTS = [
    {"title": "Hackathon Winner (1×)", "category": "GDG OAU", "description": "Winner of a hackathon organised by GDG OAU.", "icon": "🏆", "order": 1},
    {"title": "Diploma in Data Engineering", "category": "AltSchool Africa", "description": "Completed a diploma in Data Engineering at AltSchool Africa.", "icon": "🎓", "order": 2},
    {"title": "Logistics Lead", "category": "IEEE SPAW 3.0", "description": "Led logistics for IEEE SPAW 3.0.", "icon": "🧭", "order": 3},
]
SKILLS = [("Python", "Backend"), ("FastAPI", "Backend"), ("React", "Frontend")]


def seed_content(db: Session):
    """Starting content for a brand-new database. Edit anything later from /admin."""
    if db.query(models.Profile).first():
        return
    db.add(models.Profile(
        name="Oyewole Caleb Oluwapelumi",
        headline="CS Student & Full-Stack Developer",
        bio="Computer Engineer and Data Engineering specialist crafting scalable backend architectures, intelligent data pipelines, and full-stack web applications. Proficient in Python, FastAPI, Docker, Next.js, and modern JavaScript, with a strong track record of building AI-driven solutions and high-impact hackathon prototypes.",
        location="Ile-Ife, Osun State, Nigeria",
        email="oyewolecaleb729@gmail.com",
        github_url="https://github.com/Caleb-Oyewole",
        linkedin_url="https://www.linkedin.com/in/oyewole-caleb-295a8b294/",
        available=True,
        stats=[{"value": "25+", "label": "Projects"}],
    ))
    db.add_all([models.Skill(name=n, category=c, order=i) for i, (n, c) in enumerate(SKILLS, 1)])
    db.add_all([models.Achievement(**a) for a in ACHIEVEMENTS])
    db.commit()
