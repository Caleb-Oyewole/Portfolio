# Portfolio frontend (React + Vite)

```bash
npm install
cp .env.example .env     # set VITE_API_URL to your backend address
npm run dev              # http://localhost:5173  (the origin your backend's CORS allows)
npm run build            # production build in dist/
```

Start the backend first (`uvicorn app.main:app --reload`), otherwise the site shows its built-in fallback content.

## Where to edit things
| What | Where |
|---|---|
| Name, headline, bio, photo, links, stats | Your backend: `PUT /api/admin/profile` |
| GitHub projects | Backend `.env`: `GITHUB_USERNAME`, `GITHUB_FEATURED_REPOS` |
| Achievements, skills (marquee) | Backend admin API |
| **Niches** (the hover panels) | `src/content.js` |
| Colours | `:root` variables at the top of `src/styles/global.css` |

## Newsletter links
The backend emails links to `FRONTEND_URL/newsletter/confirm/<token>` and `/newsletter/unsubscribe/<token>`.
Those pages live here (`src/pages`). Set `FRONTEND_URL` in the backend to this site's address.

## Deploying
- Set `VITE_API_URL` to your deployed backend address in the host's environment settings.
- Build command `npm run build`, publish directory `dist`.
- `public/_redirects` (Netlify, Render) and `vercel.json` (Vercel) send every path to `index.html`, so opening a confirm link directly works.
- On the backend, set `FRONTEND_ORIGINS` and `FRONTEND_URL` to the deployed site address.
