# Laundry Management App 🧺✨

A premium, "super-aesthetic" laundry management system designed for ease of use and visual impact. Built with a modern tech stack to handle machine tracking and customer waitlists in real-time.

## 🚀 Key Features

- **Premium UI/UX**: Ultra-modern glassmorphism design with vibrant gradients and glowing indicators.
- **Real-time Synchronization**: Powered by WebSockets for live status updates across all connected devices.
- **Intelligent Waitlists**: Split queues for Washers and Dryers with automatic wait time estimation.
- **Robust Admin Panel**: Full machine CRUD, failure reporting (`WRENCH`), and manual assignment/reassignment.
- **Staff-Friendly Alerts**: Negative countdown timers and pulsing red alerts for overdue cycles.
- **Production-Ready Core**: Feature-based architecture, global error boundaries, and environment-based configuration.

## 🏗️ Architecture

The project is split into two main components:

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS 4, Framer Motion, Zustand.
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL/SQLite (Async), WebSockets.

For detailed technical specs, see [PROJECT_CONTEXT.md](.agent/rules/PROJECT_CONTEXT.md).

## 🛠️ Quick Start

### Option 1: Local Development (Recommended for Development)

Ensure you have Node.js 20+ and Python 3.11+ installed.

```bash
# Start both Backend and Frontend concurrently
./start.sh
```

- **Dashboard (Public)**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Option 2: Docker (Production-like Environment)

Ensure you have Docker and Docker Compose installed.

```bash
# Build and run all services (Backend, Frontend, PostgreSQL)
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

For comprehensive deployment instructions (Railway, VPS, CI/CD), see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🧪 Testing

The project maintains **94% test coverage** through comprehensive testing strategies:

### Backend Tests
```bash
cd laundry-app/backend
source venv/bin/activate
pytest tests/ --cov=app --cov-report=term-missing
```

**Coverage Highlights**:
- `MachineService`: 100% coverage (115 statements)
- `WaitlistService`: 98% coverage
- API Endpoints: 95%+ coverage
- **32 passing tests** covering services, API endpoints, and infrastructure

### Frontend Tests
```bash
cd laundry-app/frontend
npm run test              # Unit tests (Vitest)
npm run test:coverage     # With coverage report
npx playwright test       # E2E tests
```

**Test Suite**:
- Component tests (`MachineCard`, etc.)
- Custom hook tests (`useTimer`)
- End-to-end smoke tests (Playwright)

### Architecture
The project uses the **Service Layer Pattern** for maximum testability:
- Business logic isolated in `app/services/`
- Thin API endpoints delegate to services
- Professional mocking with `AsyncMock`
- 100% coverage on critical business logic

## 📖 Component Documentation

- [**Frontend README**](laundry-app/frontend/README.md): Detailed frontend setup, architecture, and technology stack.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for details on our code of conduct, and the process for submitting pull requests to us.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📜 Version History

See [CHANGELOG.md](CHANGELOG.md) for the full release history from MVP to v1.8.0.
