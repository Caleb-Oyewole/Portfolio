from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, SessionLocal, engine
from .routers import admin, public
from .seed import ensure_admin, seed_content



@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        ensure_admin(db)
        seed_content(db)
    yield


app = FastAPI(title="Portfolio API", version="1.0.0", lifespan=lifespan)

from .routers import github
app.include_router(github.router)

@app.get("/", include_in_schema=False)
def root():
    return {"name": "Portfolio API", "docs": "/docs", "health": "/api/health"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router, prefix="/api")
app.include_router(admin.auth_router, prefix="/api")
app.include_router(admin.router, prefix="/api")
