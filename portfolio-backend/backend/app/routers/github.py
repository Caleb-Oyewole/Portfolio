"""GitHub integration: your profile link + your best repos, pulled live from GitHub.

Selection rule (a repo is shown if it is NOT a fork / archived AND any of these is true):
  1. its name is listed in GITHUB_FEATURED_REPOS  (your "working & fairly complete" list)
  2. it has the GitHub topic set in GITHUB_TOPIC   (default: "portfolio")
  3. it has at least GITHUB_MIN_STARS stars         (your "starred" ones)
Featured repos come first, then by stars, then by latest push.
"""
import time
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException
from pydantic_settings import BaseSettings, SettingsConfigDict


class GithubSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    github_username: str = "Caleb-Oyewole"
    github_token: str = ""            # optional: raises the rate limit from 60 to 5000 req/hour
    github_featured_repos: str = "Vendly, Sentinel, etl_dags, kwizz, mongodb-eduhub-project, PortWise, Portfolio"   # comma-separated repo names
    github_min_stars: int = 1
    github_topic: str = "portfolio"
    github_cache_minutes: int = 30


cfg = GithubSettings()
router = APIRouter(prefix="/api/github", tags=["github"])

_cache: dict[str, tuple[float, Any]] = {}


def _headers() -> dict:
    h = {"Accept": "application/vnd.github+json", "User-Agent": "portfolio-api"}
    if cfg.github_token:
        h["Authorization"] = f"Bearer {cfg.github_token}"
    return h


async def _get(url: str, params: dict | None = None) -> Any:
    """GET with an in-memory cache; falls back to stale data if GitHub is unreachable."""
    key = url + str(params)
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < cfg.github_cache_minutes * 60:
        return hit[1]
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, params=params, headers=_headers())
        if r.status_code == 404:
            raise HTTPException(404, "GitHub user not found")
        r.raise_for_status()
        data = r.json()
    except HTTPException:
        raise
    except Exception:
        if hit:
            return hit[1]
        raise HTTPException(502, "Could not reach GitHub")
    _cache[key] = (time.time(), data)
    return data


def _require_user() -> str:
    if not cfg.github_username:
        raise HTTPException(503, "GITHUB_USERNAME is not configured")
    return cfg.github_username


@router.get("/profile")
async def github_profile():
    user = _require_user()
    d = await _get(f"https://api.github.com/users/{user}")
    return {
        "username": d["login"],
        "name": d.get("name"),
        "bio": d.get("bio"),
        "avatar_url": d["avatar_url"],
        "profile_url": d["html_url"],
        "followers": d["followers"],
        "public_repos": d["public_repos"],
    }


@router.get("/projects")
async def github_projects(limit: int = 12):
    user = _require_user()
    repos = await _get(
        f"https://api.github.com/users/{user}/repos",
        {"per_page": 100, "sort": "pushed", "type": "owner"},
    )
    featured = {n.strip().lower() for n in cfg.github_featured_repos.split(",") if n.strip()}
    topic = cfg.github_topic.lower()
    out = []
    for r in repos:
        if r["fork"] or r["archived"] or r["name"].lower() == user.lower():
            continue
        is_featured = r["name"].lower() in featured
        topics = r.get("topics", [])
        if not (is_featured or (topic and topic in topics) or r["stargazers_count"] >= cfg.github_min_stars):
            continue
        out.append({
            "name": r["name"],
            "description": r["description"],
            "url": r["html_url"],
            "homepage": r["homepage"] or None,
            "language": r["language"],
            "topics": topics,
            "stars": r["stargazers_count"],
            "forks": r["forks_count"],
            "pushed_at": r["pushed_at"],
            "featured": is_featured,
        })
    out.sort(key=lambda x: (not x["featured"], -x["stars"], x["pushed_at"]), reverse=False)
    return {"profile_url": f"https://github.com/{user}", "projects": out[:limit]}