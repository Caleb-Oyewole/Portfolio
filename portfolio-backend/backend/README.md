# Portfolio API (FastAPI)

## Run locally
```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # then edit SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
uvicorn app.main:app --reload
```
Interactive docs: http://localhost:8000/docs

## Public endpoints (`/api`)
GET /health, /profile, /projects, /projects/{id}, /achievements, /skills
POST /contact, /newsletter/subscribe, /newsletter/confirm/{token}, /newsletter/unsubscribe/{token}

## Admin endpoints (`/api/admin`, Bearer token from POST /api/admin/login)
me, stats, CRUD for projects/achievements/skills, PUT profile,
messages (list, mark read, delete), subscribers (list, delete),
newsletter (send, issues)

## Deploy
Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
Set the env vars from `.env.example`. Use a Postgres `DATABASE_URL` in production
(SQLite files are wiped on most free hosts). Set `CORS_ORIGINS` and `FRONTEND_URL`
to your deployed frontend URL.
