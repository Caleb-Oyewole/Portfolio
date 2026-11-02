# Portfolio

Personal portfolio website of **Oyewole Caleb Oluwapelumi**: a **FastAPI** backend that serves the content and a **React (Vite)** frontend that presents it. They are built and deployed independently, and live together in this one repository.

> Live site: _coming soon_ &nbsp;·&nbsp; API docs: `/docs` on the running backend

## Highlights

- **Content lives in an API, not in the code.** Profile, achievements and skills are edited through protected admin endpoints, so updating the site never needs a redeploy.
- **Live GitHub projects.** The backend reads your public repos (featured list, topic tag, or star count) and the frontend turns them into hover-to-reveal project cards.
- **Contact form and newsletter** with a spam honeypot, per-IP rate limiting and double opt-in confirmation (confirm and unsubscribe pages live in the frontend).
- **Animated frontend.** Letter-by-letter hero, scroll-reveal sections, ghost watermark headings, hover detail panels and a floating details card, in a forest green, grey, black and white palette. Respects `prefers-reduced-motion`.

## Repository layout

```
Portfolio/
├── portfolio-backend/
│   └── backend/                 FastAPI service
│       ├── app/
│       │   ├── main.py          app, CORS, router registration
│       │   ├── config.py        settings loaded from .env
│       │   ├── database.py      SQLAlchemy engine and session
│       │   ├── models.py        database tables
│       │   ├── schemas.py       request/response models (Pydantic)
│       │   ├── security.py      password hashing, JWT, rate limiting
│       │   ├── email_service.py SMTP sending (prints to console if SMTP is unset)
│       │   └── routers/
│       │       ├── public.py    open endpoints
│       │       ├── admin.py     login + protected content management
│       │       └── github.py    GitHub profile and projects
│       ├── seed.py              creates tables, admin user, placeholder content
│       ├── reset_admin.py       resets the admin login from .env
│       ├── requirements.txt
│       └── .env.example
├── portfolio-frontend/          React + Vite single-page app
│   ├── src/
│   │   ├── components/          Hero, About, Work, Niches, Achievements, Contact, ...
│   │   ├── pages/               Home, newsletter confirm / unsubscribe, 404
│   │   ├── hooks/useSite.jsx    loads and merges all backend data
│   │   ├── content.js           niche descriptions (edit these)
│   │   ├── api.js               all backend calls
│   │   └── styles/global.css    design tokens and styles
│   └── .env.example
└── README.md
```

## Tech stack

| Layer | Tools |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy, Pydantic, PyJWT, Uvicorn |
| Database | SQLite locally, PostgreSQL recommended in production |
| Frontend | React 18, Vite, React Router, Framer Motion, Lenis (smooth scroll) |
| Integrations | GitHub REST API, SMTP email |

## Getting started

**Prerequisites:** Python 3.11+, Node.js 18+, Git.

### 1. Backend

From the repository root (Git Bash shown; in PowerShell activate with `.venv\Scripts\Activate.ps1`):

```bash
python -m venv .venv
source .venv/Scripts/activate            # macOS/Linux: source .venv/bin/activate
cd portfolio-backend/backend
pip install -r requirements.txt
cp .env.example .env                     # then fill in the values (see Configuration)
python seed.py                           # tables, admin user, placeholder content
uvicorn app.main:app --reload
```

The API runs at <http://127.0.0.1:8000> and interactive docs are at <http://127.0.0.1:8000/docs>.

**First login:** in `/docs`, call `POST /api/admin/login` with your admin email and password, copy the `access_token` from the response, click **Authorize** and paste it. Then use `PUT /api/admin/profile` to fill in your real details. If you ever lose access, run `python reset_admin.py` to reset the admin to the values in `.env`.

### 2. Frontend

In a second terminal:

```bash
cd portfolio-frontend
npm install
cp .env.example .env                     # VITE_API_URL=http://127.0.0.1:8000
npm run dev
```

The site runs at <http://localhost:5173>. Start the backend first, otherwise the site shows its built-in fallback content.

## Configuration

Both apps are configured with environment variables. `.env` files are git-ignored; the `.env.example` next to each one is the source of truth for exact names.

**Backend** (`portfolio-backend/backend/.env`)

| Setting | Purpose |
|---|---|
| `SECRET_KEY` | Signs login tokens. Use a long random string. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin login created by `seed.py` / `reset_admin.py` |
| `FRONTEND_URL` | Frontend address, used in newsletter confirm and unsubscribe links |
| CORS origins, database URL | See `.env.example` / `config.py` for the exact names |
| `SMTP_*`, `MAIL_FROM`, `CONTACT_INBOX` | Real email sending and where contact messages go. With no SMTP host, emails print to the terminal. |
| `GITHUB_USERNAME` | Whose repos to show |
| `GITHUB_FEATURED_REPOS` | Comma-separated repo names to always show first |
| `GITHUB_MIN_STARS`, `GITHUB_TOPIC` | Also show repos with enough stars or this GitHub topic (default `portfolio`) |
| `GITHUB_TOKEN`, `GITHUB_CACHE_MINUTES` | Optional: higher GitHub rate limit, and how long results are cached |

> Restart the server after editing `.env`. `--reload` only watches Python files.

**Frontend** (`portfolio-frontend/.env`)

| Setting | Purpose |
|---|---|
| `VITE_API_URL` | Address of the backend, with no trailing slash and no `/api` |

## API overview

All routes are served under `/api`.

**Public**

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/profile` | Profile details |
| GET | `/projects`, `/projects/{id}` | Manually added projects |
| GET | `/achievements`, `/skills` | Achievements and skills |
| GET | `/github/profile`, `/github/projects` | GitHub profile link and selected repos |
| POST | `/contact` | Send a contact message (rate limited) |
| POST | `/newsletter/subscribe` | Start a subscription (rate limited) |
| POST | `/newsletter/confirm/{token}` | Confirm a subscription |
| POST | `/newsletter/unsubscribe/{token}` | Unsubscribe |

**Admin** (needs a bearer token from `POST /admin/login`)

| Method | Route | Purpose |
|---|---|---|
| POST | `/admin/login` | Get an access token |
| GET | `/admin/me`, `/admin/stats` | Who am I, and dashboard counts |
| GET / POST / PUT / DELETE | `/admin/projects`, `/admin/achievements`, `/admin/skills` | Manage content |
| PUT | `/admin/profile` | Create or update the profile |
| GET / PATCH / DELETE | `/admin/messages` | Read inbox, mark read, delete |
| GET / DELETE | `/admin/subscribers` | List and remove subscribers |
| GET / POST | `/admin/newsletter/issues`, `/admin/newsletter/send` | Past issues, send a plain-text issue |

## How the newsletter works

1. A visitor subscribes in the site footer. The backend stores them as unconfirmed and emails a link to `FRONTEND_URL/newsletter/confirm/<token>`.
2. That page in the frontend calls the backend to confirm, then shows "You're in!".
3. Every issue sent from `POST /api/admin/newsletter/send` ends with an unsubscribe link to `FRONTEND_URL/newsletter/unsubscribe/<token>`.

Because those links point at the frontend, `FRONTEND_URL` must be the real site address in production.

## Customising the site

| To change | Edit |
|---|---|
| Name, headline, bio, photo, links, hero stats | `PUT /api/admin/profile` |
| Achievements and the skills marquee | Admin API (`/api/admin/achievements`, `/api/admin/skills`) |
| Which GitHub repos appear | Backend `.env` (`GITHUB_*`) or tag a repo with the `portfolio` topic |
| Niche panels | `portfolio-frontend/src/content.js` |
| Colours | `:root` variables at the top of `portfolio-frontend/src/styles/global.css` |

## Deployment

The two apps deploy separately from this same repo, each from its own folder.

**Backend** (for example Render)
- Root directory: `portfolio-backend/backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips='*'`
- Set the environment variables from the table above in the host's dashboard. Use a PostgreSQL database URL in production (a hosted SQLite file would be wiped on redeploy), and set the CORS origins and `FRONTEND_URL` to the deployed frontend address.
- Run `seed.py` once against the production database to create the admin user.

**Frontend** (for example Vercel or Netlify)
- Root directory: `portfolio-frontend`
- Build: `npm run build`, publish directory: `dist`
- Set `VITE_API_URL` to the deployed backend address.
- `vercel.json` and `public/_redirects` send every path to `index.html`, so confirm and unsubscribe links work when opened directly.

## Security notes

- Never commit `.env` or the local `portfolio.db`; both are git-ignored. If a secret is ever committed, rotate it, because deleting the file does not remove it from Git history.
- Passwords are hashed with PBKDF2, admin routes require a signed token, and public form endpoints are rate limited and protected by a honeypot field.
- The rate limiter keeps its counts in memory, which is fine for a single server instance.

## Status and roadmap

Working: backend API, admin login, GitHub integration, animated frontend, contact form, newsletter subscribe / confirm / unsubscribe.

Not built yet:
- Automatic monthly newsletter sending (issues are sent manually through the admin API)
- An admin dashboard UI (content is managed through `/docs` for now)
- Individual project detail pages
- Production deployment
