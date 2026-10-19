import hashlib
import hmac
import os
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import AdminUser

ITERATIONS = 390_000
bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return f"pbkdf2_sha256${ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, iters, salt, digest = stored.split("$")
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), int(iters))
        return hmac.compare_digest(dk.hex(), digest)
    except ValueError:
        return False


def create_token(subject: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes)
    return jwt.encode({"sub": subject, "exp": exp}, settings.secret_key, algorithm="HS256")


def get_current_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> AdminUser:
    unauthorized = HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    if not creds:
        raise unauthorized
    try:
        payload = jwt.decode(creds.credentials, settings.secret_key, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise unauthorized
    admin = db.query(AdminUser).filter(AdminUser.email == payload.get("sub")).first()
    if not admin:
        raise unauthorized
    return admin


def rate_limit(max_calls: int, window_seconds: int):
    """Simple in-memory per-IP limiter (fine for one instance; use Redis if you scale out)."""
    hits: dict[str, deque] = defaultdict(deque)

    def dep(request: Request):
        ip = request.client.host if request.client else "unknown"
        q = hits[ip]
        cutoff = time.monotonic() - window_seconds
        while q and q[0] < cutoff:
            q.popleft()
        if len(q) >= max_calls:
            raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many requests, try again later")
        q.append(time.monotonic())

    return dep
