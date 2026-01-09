from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.models.machine import Machine

app = FastAPI(title=settings.PROJECT_NAME)

# CORS
origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print(f"Backend starting with CORS origins: {origins}")

# Routes
app.include_router(api_router) # Top level or prefixed

# Health check endpoint for production monitoring
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.8.0",
        "service": "laundry-backend"
    }

# Startup
async def seed_db(db):
    result = await db.execute(select(Machine))
    machines = result.scalars().all()
    if not machines:
        for i in range(1, 6):
            db.add(Machine(name=f"W{i}", type="washer", capacity="10kg", status="free"))
        for i in range(1, 6):
            db.add(Machine(name=f"D{i}", type="dryer", capacity="15kg", status="free"))
        await db.commit()

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed data
    async with SessionLocal() as session:
        await seed_db(session)
