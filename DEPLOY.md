# Deploying: backend on Render, frontend on Vercel

Do it in this order, because each side needs the other's URL.

## 1. Backend on Render
1. Push this repo to GitHub (secrets stay out: `.env` is git-ignored).
2. Render dashboard -> **New -> Blueprint** -> select the repo. It reads `render.yaml` and creates
   the `portfolio-api` web service and a `portfolio-db` Postgres database.
3. When asked for the secret values, enter:
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`: your admin login (use a NEW strong password; the old one was shown in screenshots)
   - `BREVO_API_KEY`, `MAIL_FROM`, `CONTACT_INBOX`: see `NEWSLETTER-EMAIL-SETUP.md`
   - `GITHUB_TOKEN`: a GitHub token with no scopes (public data only) so the projects never hit GitHub's rate limit
   - `FRONTEND_URL` and `CORS_ORIGINS`: put a placeholder (`https://example.com`) for now; you fix them in step 3
4. Wait for the deploy, then open `https://<your-service>.onrender.com/api/health`. You should see `{"status":"ok"}`.
   The first start also creates the tables, your admin account and the starter profile/achievements.

## 2. Frontend on Vercel
1. Vercel -> **Add New -> Project** -> import the same repo.
2. **Root Directory:** `portfolio-frontend`. Framework preset: Vite (build `npm run build`, output `dist`).
3. **Environment Variable:** `VITE_API_URL` = `https://<your-service>.onrender.com` (no trailing slash, no `/api`).
4. Deploy. `vercel.json` already makes `/admin` and the newsletter links work on refresh.

## 3. Connect them
Back in Render -> portfolio-api -> Environment, set:
- `FRONTEND_URL` = your Vercel URL (used in confirm/unsubscribe links)
- `CORS_ORIGINS` = the same URL
Save (Render redeploys). Then open your Vercel site, check projects load, and sign in at `/admin`.

## 4. Check email
In Render -> portfolio-api -> Shell: `python send_test_email.py you@gmail.com`
It prints the real error if sending fails. Then subscribe from the site's footer and click the link in the email.

## Things to know (free tiers)
- The Render free web service sleeps when idle, so the first visit after a quiet period takes about a minute.
- Free Render Postgres databases have a time limit and can be deleted after it ends. If that matters, use a permanent
  free Postgres (Neon or Supabase) and paste its connection string into `DATABASE_URL` instead.
- Render blocks outgoing SMTP on free services, so Gmail SMTP will not work there. Brevo (HTTPS) does.
- Changing `ADMIN_PASSWORD` later does nothing to an existing admin. Run `python reset_admin.py` in the Render Shell.
