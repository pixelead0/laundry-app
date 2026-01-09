from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Laundry Management System"
    API_V1_STR: str = "/api/v1"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            val = self.BACKEND_CORS_ORIGINS.strip()
            # Handle cases like '["*"]' or '"*"' from UI inputs
            if val.startswith("[") and val.endswith("]"):
                val = val[1:-1]
            val = val.replace('"', '').replace("'", "")
            self.BACKEND_CORS_ORIGINS = [i.strip() for i in val.split(",") if i.strip()]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./laundry.db"

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if not url or "${{" in url:
            # If the URL is empty or looks like an unresolved template
            return "sqlite+aiosqlite:///./laundry.db"

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
