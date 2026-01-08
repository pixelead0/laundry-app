from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.models.machine import Machine

app = FastAPI(title=settings.PROJECT_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_router) # Top level or prefixed

# Startup
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed data
    async with SessionLocal() as session:
        result = await session.execute(select(Machine))
        machines = result.scalars().all()
        if not machines:
            for i in range(1, 6):
                session.add(Machine(name=f"W{i}", type="washer", capacity="10kg", status="free"))
            for i in range(1, 6):
                session.add(Machine(name=f"D{i}", type="dryer", capacity="15kg", status="free"))
            await session.commit()
