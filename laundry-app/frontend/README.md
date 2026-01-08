# Laundry App Frontend

A modern, responsive dashboard built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

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
