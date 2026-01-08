from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker,  declarative_base

# Default to SQLite for simplicity in this environment, but easy to switch to Postgres
DATABASE_URL = "sqlite+aiosqlite:///./laundry.db"

engine = create_async_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session
