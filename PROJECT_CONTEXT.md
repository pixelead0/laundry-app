# Project Context: Laundry Management App (MVP)

This document serves as the master context for the Laundry Management Application. It outlines the architecture, tech stack, codebase structure, and operational instructions.

## 1. Project Overview
**Goal**: A "super aesthetic" web application to manage laundry machines (washers/dryers), eliminating manual tracking.
**Status**: v1.4.0 (Split Waitlists, Maintenance Handling, negative timers).
**Target Users**:
- **Public**: View-only dashboard showing machine status, stacked waitlists (Washer/Dryer), and overdue alerts.
- **Admin**: Staff dashboard with separate queue tabs, machine configuration, and failure reporting.
- **UI Language**: Spanish (Español).

## 2. Technology Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Database Logic**: SQLAlchemy (Async)
- **Database Driver**: `aiosqlite` (SQLite) for MVP.
- **Real-time**: WebSockets (native FastAPI).
- **Server**: Uvicorn.

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: custom "shadcn/ui" implementations.
- **Data Fetching**: Dynamic host detection (supports network access).
- **State Management**: Zustand (`useMachineStore`).

## 3. Architecture

### Pages
- **Public Dashboard (`/`)**: Read-only. Shows machine status, timers, and active/waiting list.
- **Admin Dashboard (`/admin`)**: Interactive. Allows assigning machines, joining waitlist, and forcing completion.

### Data Flow
1.  **Frontend** fetches initial state (`GET /machines`, `GET /turns`).
2.  **Frontend** connects to WebSocket (`ws://<host>:8000/ws`).
3.  **Actions** (Assign/Add Turn) sent via REST API.
4.  **Backend** updates DB and broadcasts changes.
5.  **Frontend** updates UI in real-time.

### Database Models (`backend/models.py`)
- **Machine**: `id`, `name`, `type` (washer/dryer), `capacity`, `status`, `default_cycle_time`, `machine_order`, `current_cycle_end`, `current_turn_id`.
- **Turn**: `id`, `customer_name`, `customer_phone`, `status` (waiting/in_progress/completed/cancelled), `type` (washer/dryer), `machine_id`.

## 4. Project Structure (Key Files)

```text
laundry-app/
├── start.sh              # Startup script (Backend + Frontend)
├── backend/
│   ├── main.py           # Entry point, API, WebSocket
│   ├── models.py         # SQLAlchemy models
│   └── database.py       # Async engine setup
└── frontend/
    ├── app/
    │   ├── page.tsx      # Public Dashboard
    │   └── admin/
    │       └── page.tsx  # Admin Dashboard
    ├── components/
    │   ├── Waitlist.tsx  # Queue & Active Turns list
    │   └── ...
    └── stores/
        └── useMachineStore.ts # State definitions
```

## 5. Setup & Running

### Quick Start
```bash
# Runs Backend (8000) and Frontend (3000) concurrently
./start.sh
```

### Manual Setup

#### Backend
```bash
cd laundry-app/backend
python3 -m pip install -r requirements.txt
# Run as module to allow absolute imports
cd ..
python3 -m uvicorn backend.main:app --port 8000 --reload
```

#### Frontend
```bash
cd laundry-app/frontend
npm install
npm run dev
```

## 6. Key Implementation Details
- **Network Access**: Frontend uses `window.location.hostname` for dynamic host detection.
- **Split Waitlists**: Customers join specific Washer or Dryer queues. Public view displays them stacked; Admin uses tabs.
- **Resilience**: Assignment can be cancelled or reported as failure, returning the customer to the waitlist automatically.
- **Negative Timers**: Overdue machines pulse red and show negative time (e.g., `-2m 15s`) to alert staff.
- **Log Management**: `start.sh` redirects logs to `backend.log` and `frontend.log` with terminal prefixing.

## 7. Future Roadmap
- **Authentication**: Secure the `/admin` route.
- **PostgreSQL**: Switch from SQLite to PostgreSQL for production.
- **Payment Integration**: Connect to POS systems.

## 8. API Reference

### REST Endpoints
- `GET /machines`
- `GET /turns` (Filtered by status and type)
- `POST /turns` (Join Waitlist with `type`)
- `POST /machines/{id}/assign?duration_minutes=X&turn_id=Y`
- `POST /machines/{id}/complete`
- `POST /machines/{id}/maintenance` (Reports failure)
- `POST /machines/{id}/recover` (Back from maintenance)
- `POST /machines/{id}/cancel` (Undo assignment)

### WebSocket
- `ws://<host>:8000/ws`
    - Emits: `machine_update` events with `turn_id`.

## 9. Configuration
- **Database**: `sqlite+aiosqlite:///./laundry.db` inside `backend/`.
- **Ports**: 8000 (API), 3000 (Web).

## 10. Documentation Policy
> [!IMPORTANT]
> **CRITICAL**: All documentation files (`PROJECT_CONTEXT.md`, `walkthrough.md`, `implementation_plan.md`) MUST be updated immediately after any code change. This ensures the documentation never drifts from the codebase.

## 11. Changelog
See [CHANGELOG.md](CHANGELOG.md) for version history.
