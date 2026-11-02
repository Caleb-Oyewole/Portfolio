"""One-off helper: bring an EXISTING database up to date with the latest content.

Run from this folder (backend/), with your venv active:
    python update_content.py

It is safe to run more than once. It:
  * sets the "Projects" highlight number to 25+ (other highlight numbers are kept)
  * removes the "Sample Project" / "Sample Achievement" placeholders if they still exist
  * adds the three achievements below if they are not there yet (matched by title)
It uses DATABASE_URL from your .env, so to update the deployed database run it with the
production DATABASE_URL set, or just make the same edits in /admin.
"""
from app.database import SessionLocal
from app import models
from app.seed import ACHIEVEMENTS

db = SessionLocal()

profile = db.query(models.Profile).first()
if profile:
    stats = [dict(s) for s in (profile.stats or [])]
    for s in stats:
        if str(s.get("label", "")).strip().lower() in ("project", "projects"):
            s["value"] = "25+"
            break
    else:
        stats.insert(0, {"value": "25+", "label": "Projects"})
    profile.stats = stats  # assign a new list so SQLAlchemy sees the JSON change
    print("Highlight numbers:", stats)
else:
    print("No profile yet. Start the API once (uvicorn app.main:app) and run this again.")

for model, title in ((models.Achievement, "Sample Achievement"), (models.Project, "Sample Project")):
    for row in db.query(model).filter(model.title == title).all():
        db.delete(row)
        print("Removed placeholder:", title)

have = {a.title.lower() for a in db.query(models.Achievement).all()}
for a in ACHIEVEMENTS:
    if a["title"].lower() not in have:
        db.add(models.Achievement(**a))
        print("Added achievement:", a["title"])

db.commit()
print("Done. Refresh your site.")
