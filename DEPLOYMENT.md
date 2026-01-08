# Production Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ and Python 3.11+ (for local development)
- PostgreSQL database (for production)

### Local Testing with Docker

```bash
# Build and run all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Production Deployment

### Option 1: Railway.app (Recommended)

**Important**: Deploy backend and frontend as **separate Railway services**.

#### Backend Service

1. **Create Railway Account**: https://railway.app
2. **Create New Project** → "Empty Project"
3. **Add PostgreSQL Database**:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway auto-generates `DATABASE_URL`

4. **Add Backend Service**:
   - Click "New" → "GitHub Repo" → `pixelead0/laundry-app`
   - **Settings → General**:
     - Root Directory: `/laundry-app/backend`
     - Watch Paths: `/laundry-app/backend/**`
   - **Settings → Deploy**:
     - Build Command: (empty - uses Dockerfile)
     - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4`
   - **Variables**:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     BACKEND_CORS_ORIGINS=["https://your-frontend-url.railway.app"]
     SECRET_KEY=generate-random-32-char-string
     ```

#### Frontend Service

5. **Add Frontend Service** (same project):
   - Click "New" → "GitHub Repo" → `pixelead0/laundry-app` (again)
   - **Settings → General**:
     - Root Directory: `/laundry-app/frontend`
     - Watch Paths: `/laundry-app/frontend/**`
   - **Settings → Deploy**:
     - Build Command: (empty - uses Dockerfile)
     - Start Command: `node server.js`
   - **Variables**:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
     NEXT_PUBLIC_WS_URL=wss://your-backend-url.railway.app/ws
     ```

6. **Deploy**: Railway auto-deploys on push to `main`

**Note**: Railway detects Dockerfiles automatically. Each service needs its own root directory.

### Option 2: Docker Hub + Any Cloud Provider

1. **Build and Push Images**:
```bash
# Backend
cd laundry-app/backend
docker build -t pixelead0/laundry-backend:latest .
docker push pixelead0/laundry-backend:latest

# Frontend
cd laundry-app/frontend
docker build -t pixelead0/laundry-frontend:latest .
docker push pixelead0/laundry-frontend:latest
```

2. **Deploy to Cloud Provider** (AWS ECS, Google Cloud Run, etc.)

### Option 3: Manual VPS Deployment

1. **Install Docker on VPS**
2. **Clone Repository**
3. **Create Production Environment Files**:
```bash
cp laundry-app/backend/.env.production.example laundry-app/backend/.env.production
cp laundry-app/frontend/.env.production.example laundry-app/frontend/.env.production
# Edit files with your production values
```

4. **Run with Docker Compose**:
```bash
docker-compose up -d
```

5. **Set up Nginx Reverse Proxy** (optional but recommended)

## CI/CD Setup

### GitHub Actions

The project includes a complete CI/CD pipeline (`.github/workflows/deploy.yml`):

**Required Secrets** (Settings → Secrets and variables → Actions):
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password/token
- `RAILWAY_WEBHOOK_URL`: Railway deployment webhook (optional)

**Workflow Triggers**:
- Push to `main` or `dev`: Runs tests
- Push tags `v*`: Runs tests, builds images, deploys to production

### Manual Deployment

```bash
# Tag a new release
git tag -a v1.8.0 -m "Release v1.8.0"
git push origin v1.8.0

# GitHub Actions will automatically:
# 1. Run all tests
# 2. Build Docker images
# 3. Push to Docker Hub
# 4. Deploy to production (if configured)
```

## Database Migration

### Initial Setup

```bash
cd laundry-app/backend

# Install Alembic
pip install alembic psycopg2-binary

# Initialize (already done)
# alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

### Production Migration

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql+asyncpg://user:pass@host:5432/db"

# Run migrations
alembic upgrade head
```

## Monitoring

### Health Checks

**Backend**: `GET /health`
```json
{
  "status": "healthy",
  "version": "1.7.0",
  "service": "laundry-backend"
}
```

### Logs

**Docker Compose**:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Railway**: View logs in Railway dashboard

### Error Tracking (Optional)

1. **Create Sentry Account**: https://sentry.io
2. **Get DSN**
3. **Add to Environment Variables**:
```
SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
```

## Troubleshooting

### Backend Won't Start
- Check `DATABASE_URL` is correct
- Verify PostgreSQL is running
- Check logs: `docker-compose logs backend`

### Frontend Can't Connect to Backend
- Verify `NEXT_PUBLIC_API_URL` matches backend URL
- Check CORS settings in backend `.env`
- Ensure backend is accessible

### WebSocket Connection Fails
- Verify `NEXT_PUBLIC_WS_URL` uses `wss://` (not `ws://`) in production
- Check load balancer supports WebSocket connections
- Ensure backend `/ws` endpoint is accessible

### Database Connection Issues
- Verify `DATABASE_URL` format: `postgresql+asyncpg://user:pass@host:5432/db`
- Check database credentials
- Ensure database accepts connections from your server IP

## Performance Tuning

### Backend
- Adjust `WORKERS` in environment (default: 4)
- Configure `MAX_CONNECTIONS` for database pool
- Enable Redis caching (future enhancement)

### Frontend
- Next.js automatically optimizes builds
- Use CDN for static assets (Vercel, Cloudflare)
- Enable image optimization

## Security Checklist

- [ ] Change `SECRET_KEY` to random 32+ character string
- [ ] Use HTTPS in production (automatic with Railway/Vercel)
- [ ] Set strong database passwords
- [ ] Configure CORS to only allow your frontend domain
- [ ] Enable rate limiting (future enhancement)
- [ ] Regular security updates: `npm audit`, `pip check`

## Backup Strategy

### Database Backups

**Automated** (Railway):
- Railway provides automatic daily backups

**Manual**:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

**Restore**:
```bash
psql $DATABASE_URL < backup_20260108.sql
```

## Scaling

### Horizontal Scaling
- Railway: Increase replicas in dashboard
- Docker: Use Docker Swarm or Kubernetes

### Vertical Scaling
- Railway: Upgrade plan for more resources
- VPS: Resize instance

## Cost Optimization

- **Railway Hobby**: $5/month (perfect for MVP)
- **Railway Pro**: $20/month (production-ready)
- **Self-hosted VPS**: $5-20/month (requires more setup)

## Support

For deployment issues:
1. Check logs first
2. Review this guide
3. Check GitHub Issues
4. Create new issue with logs and configuration (redact secrets!)
