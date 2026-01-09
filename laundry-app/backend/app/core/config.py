from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Laundry Management System"
    API_V1_STR: str = "/api/v1"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            self.BACKEND_CORS_ORIGINS = [i.strip() for i in self.BACKEND_CORS_ORIGINS.split(",")]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./laundry.db"

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
