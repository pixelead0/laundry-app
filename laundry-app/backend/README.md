# Laundry App Backend

A professional FastAPI backend for the Laundry Management System.

## 🏗️ Architecture

- **`app/api`**: REST API Routers and WebSocket endpoints.
- **`app/core`**: Configuration and settings (Pydantic).
- **`app/db`**: Database session and connection logic.
- **`app/models`**: SQLAlchemy ORM models.
- **`app/schemas`**: Pydantic data transfer objects (DTOs).
- **`app/services`**: Business logic isolation (Waitlist calculation).

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
# From project root
python -m uvicorn backend.app.main:app --port 8000 --reload
```
