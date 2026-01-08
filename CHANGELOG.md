# Changelog

All notable changes to this project will be documented in this file.

## [v1.8.0] - Production Deployment Infrastructure
### Added
- **Railway Deployment Configuration**: Complete Railway.app deployment setup
  - `railway.toml`: Dockerfile-based deployment configuration
  - `entrypoint.sh`: Dynamic PORT handling for Railway environment
  - Health check endpoint configuration
  - Automatic restart policies
- **Docker Containerization**: Multi-stage Docker builds for production
  - Backend Dockerfile with optimized Python 3.11 slim image
  - Frontend Dockerfile with Next.js production build
  - `docker-compose.yml`: Complete local development stack with PostgreSQL
  - Non-root user security in containers
- **PostgreSQL Support**: Production-ready database infrastructure
  - Migration from SQLite to PostgreSQL with `asyncpg` driver
  - Database connection pooling and async support
  - Docker Compose PostgreSQL service with health checks
- **CI/CD Pipeline**: GitHub Actions workflow for automated deployment
  - Automated testing on push to `main` and `dev` branches
  - Docker image building and publishing on version tags
  - Integration with Railway deployment webhooks
- **Production Environment Configuration**:
  - `.env.production.example` files for both backend and frontend
  - Environment-based configuration for DATABASE_URL, CORS, and secrets

### Changed
- **Database Driver**: Migrated from `psycopg2` to `asyncpg` for better async performance
- **Deployment Strategy**: Moved from manual deployment to automated CI/CD
- **Container Architecture**: Implemented multi-stage builds for smaller image sizes
- **Package Manager**: Migrated to UV for significantly faster dependency installation

### Fixed
- Docker PATH permission issues by using `python -m uvicorn`
- Railway PORT variable handling with dedicated entrypoint script
- Dependency installation in Docker builder stage

## [v1.7.0] - Testing Infrastructure & Service Layer Refactoring
### Added
- **Comprehensive Test Suite**: Achieved **94% test coverage** across backend and frontend
  - Backend: 32 passing tests with pytest
  - Frontend: 9 unit tests (Vitest) + E2E smoke tests (Playwright)
- **Service Layer Architecture**: Refactored backend to use Service Layer Pattern
  - `MachineService`: 100% coverage (115 statements)
  - `TurnService`: Centralized turn and waitlist logic
  - `WaitlistService`: 98% coverage
- **Professional Testing Infrastructure**:
  - AsyncMock for database and WebSocket operations
  - Comprehensive fixtures in `tests/conftest.py`
  - Coverage reporting with `pytest-cov`
  - Frontend testing with Vitest and Playwright
- **Documentation Updates**:
  - Added testing section to `README.md`
  - Updated `walkthrough.md` with refactoring details
  - Comprehensive test coverage reports

### Changed
- **Backend Architecture**: Migrated from monolithic endpoints to thin API wrappers
  - `app/api/v1/endpoints/machines.py`: Now delegates to `MachineService`
  - `app/api/v1/endpoints/turns.py`: Now delegates to `TurnService`
- **Improved Testability**: Business logic isolated from HTTP layer
- **Enhanced Maintainability**: Service methods are pure functions, easier to test and modify

## [v1.6.0] - Premium UI/UX Polish
### Added
- **Glassmorphism Design**: Implemented a modern design system with backdrop-blur, subtle borders, and premium shadows.
- **Premium Aesthetics**: Added text-glow effects, vibrant status gradients, and immersive background decorations.
- **Micro-interactions**: Enhanced usage of `framer-motion` for smoother transitions and interactive feedback on MachineCards and Waitlist.
- **Global Error Boundary**: Added a global React Error Boundary to capture and display errors gracefully with a recovery UI.

## [v1.5.0] - Professional Restructuring
### Added
- **Feature-Based Architecture**: Reorganized frontend components into domain-driven folders (`features/machines`, `features/waitlist`).
- **Decoupled Business Logic**: Extracted API calls to `services/api.ts` and complex logic to custom hooks (`useTimer`, `useWebSocket`, `useMachineActions`).
- **Configurable Environments**: Introduced `.env` support for `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`.
- **Improved DX**: Added a dedicated `README.md` for the frontend and standardized TypeScript types.


## [v1.4.1] - Stabilization & Sync Fixes
### Fixed
- **Backend Stability**: Resolved a `TypeError` in the `get_turns` endpoint caused by mixed naive/aware datetime comparisons.
- **Sync Accuracy**: Fixed the 'Active Turns' list in both panels by standardizing all calculations to UTC.
- **UI Consistency**: Ensured that the initial REST fetch and subsequent WebSocket updates parse dates identically to avoid "timer jumps".

## [v1.4.0] - Timer Perfection & Infrastructure
### Added
- **Timer Overdue Blink**: Machines now pulse red and count negative time when a cycle is overdue.
- **Improved Logging**: `start.sh` now separates Frontend and Backend logs with colored terminal prefixes.
- **Timezone Awareness**: Initial implementation of UTC across models to prevent timezone-related display bugs.

## [v1.3.0] - Split Waitlists
### Added
- **Washer/Dryer Queues**: Separate waitlists for washers and dryers with tabbed interface in Admin and stacked view in Public Panel.
- **Type Selection**: Users can select the machine type when joining the waitlist.
- **Intelligent Assignment**: Assign modal now filters the waitlist based on the selected machine type.

## [v1.2.0] - Resilience & Multi-Machine Support
### Added
- **Machine Failure Handling**: Ability to report failures, move machines to maintenance, and automatically re-queue affected users.
- **Cancel/Undo**: Admins can now undo an assignment, returning the user to the waitlist.
- **Configurable Machines**: Individual duration and order settings per machine.
- **Machine Editing**: Full CRUD for machines in the Admin panel.

## [v1.1.0] - Admin Refinement
### Added
- **Settings Dialog**: Centralized panel for managing machine configurations.
- **Manual Release**: Button to force-complete a cycle regardless of timer.
- **Validation**: Strict Pydantic schemas for machine responses.

## [v1.0.0] - MVP Complete
- **Features**:
    - Backend: Machines, Turns (Waitlist), WebSocket support.
    - Frontend: Public Dashboard (Read-only), Admin Dashboard (Interactive).
    - **Waitlist**: Full cycle of adding to queue, assigning to machine, and tracking active turns.
- **Improvements**:
    - **Internationalization**: Full Spanish translation (UI).
    - **DevOps**: `start.sh` unified startup script.
    - **Architecture**: Dynamic host detection for local network access.
