from app.database import SessionLocal
from app.config import settings
from app.models import AdminUser
from app.security import hash_password

db = SessionLocal()
print("Admins currently in DB:", [a.email for a in db.query(AdminUser).all()])

admin = db.query(AdminUser).first()
if admin:
    admin.email = settings.admin_email
    admin.password_hash = hash_password(settings.admin_password)
else:
    db.add(AdminUser(email=settings.admin_email, password_hash=hash_password(settings.admin_password)))
db.commit()
print("Admin set to:", settings.admin_email)