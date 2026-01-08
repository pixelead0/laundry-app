# Laundry App Frontend

A modern, responsive dashboard built with **Next.js 15**, **TypeScript**, and **Tailwind CSS** with production-ready deployment infrastructure.

## 🏗️ Architecture

This project follows a **Feature-Based Architecture**, ensuring high modularity and clear separation of concerns:

- **`components/features/`**: Domain-driven components (Machines, Waitlist).
- **`components/layout/`**: Shared UI Shell and layouts.
- **`hooks/`**: Custom hooks for business logic decoupling (`useTimer`, `useWebSocket`).
- **`services/`**: Centralized API client (`api.ts`).
- **`stores/`**: Global state management using **Zustand**.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- NPM / Yarn / PNPM

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd laundry-app/frontend

# Install dependencies
npm install
```

### Configuration
Create a `.env.local` file in the root of the frontend folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Development
```bash
npm run dev
```

## 🐳 Docker Deployment

### Local Docker Build

```bash
cd laundry-app/frontend
docker build -t laundry-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  -e NEXT_PUBLIC_WS_URL="ws://localhost:8000/ws" \
  laundry-frontend
```

### Docker Compose (Recommended)

From the project root:

```bash
docker-compose up frontend
```

### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimized production images:

1. **Builder Stage**: Installs dependencies and builds Next.js
2. **Production Stage**: Copies only production files and node_modules
3. **Result**: Smaller image size and faster deployments

## 🌐 Environment Variables

### Development (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Production (`.env.production`)

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend-url.railway.app/ws
```

**Important**: Use `wss://` (not `ws://`) for WebSocket connections in production.

## 📦 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Testing

```bash
# Unit tests (Vitest)
npm run test

# Coverage report
npm run test:coverage

# E2E tests (Playwright)
npx playwright test
```

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4 + ShadcnUI
- **State**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner

## ✅ Best Practices Implemented
- **Type Safety**: 100% TypeScript coverage.
- **Performance**: Optimized state selectors to minimize re-renders.
- **Real-time**: WebSocket integration for live updates.
- **Responsive**: Fully optimized for mobile, tablet, and desktop views.
