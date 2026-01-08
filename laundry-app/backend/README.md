# Laundry App Backend

A professional FastAPI backend for the Laundry Management System with production-ready deployment infrastructure.

## 🏗️ Architecture

- **`app/api`**: REST API Routers and WebSocket endpoints.
- **`app/core`**: Configuration and settings (Pydantic).
- **`app/db`**: Database session and connection logic.
- **`app/models`**: SQLAlchemy ORM models.
- **`app/schemas`**: Pydantic data transfer objects (DTOs).
- **`app/services`**: Business logic isolation (MachineService, TurnService, WaitlistService).
- **`tests/`**: Comprehensive test suite with 94% coverage.

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Virtual Environment (recommended)

### Installation

```bash
cd laundry-app/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Running

The project includes a unified `start.sh` script in the root, but to run the backend manually:

```bash
# From backend directory
python -m uvicorn app.main:app --port 8000 --reload
```

## 🐳 Docker Deployment

### Local Docker Build

```bash
cd laundry-app/backend
docker build -t laundry-backend .
docker run -p 8000:8000 -e DATABASE_URL="sqlite+aiosqlite:///./laundry.db" laundry-backend
```

### Docker Compose (Recommended)

From the project root:

```bash
docker-compose up backend
```

**Note**: The Dockerfile uses [UV](https://github.com/astral-sh/uv), a fast Python package installer, for significantly faster dependency installation compared to pip.

### Entrypoint Script

The `entrypoint.sh` script handles dynamic PORT configuration for Railway deployment:

```bash
#!/bin/sh
# Reads PORT environment variable (Railway) or defaults to 8000
PORT=${PORT:-8000}
exec python -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --workers 4
```

## 🗄️ Database Configuration

### SQLite (Development)

```bash
export DATABASE_URL="sqlite+aiosqlite:///./laundry.db"
```

### PostgreSQL (Production)

```bash
export DATABASE_URL="postgresql+asyncpg://user:password@host:5432/dbname"
```

**Required Dependencies**:
- SQLite: `aiosqlite`
- PostgreSQL: `asyncpg` (not `psycopg2`)

## 🏥 Health Check

The backend exposes a health check endpoint:

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.8.0",
  "service": "laundry-backend"
}
```

## 🧪 Testing

```bash
# Install test dependencies
pip install -r requirements-test.txt

# Run tests with coverage
pytest tests/ --cov=app --cov-report=term-missing
```

**Coverage**: 94% (32 passing tests)
