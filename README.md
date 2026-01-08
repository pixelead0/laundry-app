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
- **Backend**: FastAPI, SQLAlchemy, SQLite (Async), WebSockets.

For detailed technical specs, see [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

## 🛠️ Quick Start

Ensure you have Node.js 20+ and Python 3.11+ installed.

```bash
# Start both Backend and Frontend concurrently
./start.sh
```

- **Dashboard (Public)**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 📖 Component Documentation

- [**Frontend README**](laundry-app/frontend/README.md): Detailed frontend setup, architecture, and technology stack.

## 📜 Version History

See [CHANGELOG.md](CHANGELOG.md) for the full release history from MVP to v1.6.0.
