#!/bin/sh
# Entrypoint script for Railway deployment
# Reads PORT environment variable and starts uvicorn

# Use Railway's PORT or default to 8000
PORT=${PORT:-8000}

# Start uvicorn with the dynamic port
exec python -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --workers 4
