# Project Context: Laundry Management App (MVP)

This document serves as the master context for the Laundry Management Application. It outlines the architecture, tech stack, codebase structure, and operational instructions.

## 1. Project Overview
**Goal**: A "super aesthetic" premium web application to manage laundry machines (washers/dryers) with real-time status and advanced waitlist management.
**Status**: v1.6.0 (Premium UI/UX, Feature-Based Architecture, Modular Backend).
**Target Users**:
- **Public**: View-only dashboard featuring a glassmorphism UI, real-time machine statuses, and categorized waitlists.
- **Admin**: Comprehensive staff dashboard with machine CRUD, failure reporting, and interactive waitlist management.
- **UI Language**: Spanish (Español).

## 2. Technology Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI (Modular Structure)
- **Database Logic**: SQLAlchemy (Async)
- **Database Driver**: `aiosqlite` (SQLite) for MVP.
- **Config**: `pydantic-settings` (Environment variables).
- **Real-time**: WebSockets (native FastAPI).
- **Server**: Uvicorn.

### Frontend
- **Framework**: Next.js 15 (App Router / Turbopack)
- **Language**: TypeScript (Strict)
- **Styling**: Tailwind CSS 4 + ShadcnUI
- **Design System**: Glassmorphism (Backdrop-blur, Vibrant Gradients, Premium Shadows)
- **Animations**: Framer Motion (Micro-interactions, Page transitions)
- **State Management**: Zustand (Optimized with Selectors)
- **Error Handling**: Global React Error Boundary
- **Networking**: Environment-based configuration (`.env.local`)

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

### Database Models (`backend/app/models/`)
- **Machine**: `id`, `name`, `type` (Enum: washer/dryer), `capacity`, `status` (Enum: free/occupied/maintenance), `default_cycle_time`, `machine_order`, `current_cycle_end`, `current_turn_id`.
- **Turn**: `id`, `customer_name`, `customer_phone`, `status` (Enum: waiting/in_progress/completed/cancelled), `type` (Enum: washer/dryer), `machine_id`.

## 4. Project Structure (Key Files)

```text
laundry-app/
├── start.sh              # Unified Startup script (Backend + Frontend)
├── backend/
│   ├── app/              # Source root
│   │   ├── api/v1/       # API Routers (machines, turns, websocket)
│   │   ├── core/         # Config & Enums
│   │   ├── db/           # Env-based DB session
│   │   ├── models/       # SQLAlchemy ORM models (Machine, Turn)
│   │   ├── schemas/      # Pydantic DTOs
│   │   ├── services/     # Business Logic (WaitlistService)
│   │   └── main.py       # App entry point
│   ├── README.md         # Backend documentation
│   └── requirements.txt  # Python dependencies
└── frontend/
    ├── app/              # Next.js App Router (Layout, Page, Admin)
    ├── components/
    │   ├── features/     # Domain-specific components (Machines, Waitlist)
    │   ├── layout/       # Shared UI Shell & navigation
    │   └── ui/           # Primitive shadcn-based components
    ├── services/         # Centralized API service (api.ts)
    ├── hooks/            # Shared logic (useTimer, useWebSocket, useMachineActions)
    ├── stores/           # Global Zustand store
    └── README.md         # Dedicated frontend documentation
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
# Run as module from backend directory
python3 -m uvicorn app.main:app --port 8000 --reload
```

#### Frontend
```bash
cd laundry-app/frontend
npm install
npm run dev
```

## 6. Key Implementation Details
- **Enums**: All status and type fields use strict Enums (`app.core.enums`) instead of magic strings.
- **Premium UI**: Uses custom Tailwind utilities for glassmorphism and `framer-motion` for high-end micro-interactions.
- **Error Boundaries**: A global `ErrorBoundary` wraps the application to prevent white-screen crashes, providing a graceful recovery UI.
- **Custom Hooks**: Business logic is separated from UI components, improving testability and code reuse.
- **Environment Config**: Base URLs for API and WebSockets are controlled via `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`.
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

## 12. Versioning & Branching Policy
> [!IMPORTANT]
> **CRITICAL REQUISITES**:
> 1. **History Integrity**: Always maintain a clean and descriptive commit history follow standard conventional commits.
> 2. **Branching Strategy**: Create dedicated `release/vX.X.X` branches for every major/minor version release to preserve code state.
> 3. **Release Tags**: Every version documented in `CHANGELOG.md` MUST have a corresponding Git tag (e.g., `v1.6.0`).
> 4. **On-Demand Releases**: Branches and releases must be created immediately upon request or when a significant hito is reached.
