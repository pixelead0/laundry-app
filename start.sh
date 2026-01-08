#!/bin/bash

# Function to kill all child processes on exit
trap 'kill $(jobs -p)' EXIT

echo "Starting Laundry App..."

# Start Backend
echo "Starting Backend on port 8000..."
# Navigate to the folder containing 'backend' package
cd laundry-app

# Check for venv (it is inside backend/venv)
if [ -d "backend/venv" ]; then
    source backend/venv/bin/activate
fi

# Run as module to allow relative imports
python3 -m uvicorn backend.main:app --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend on port 3000..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

echo "Services started!"
echo "Backend: http://localhost:8000 (Logs: backend.log)"
echo "Frontend: http://localhost:3000 (Logs: frontend.log)"
echo "--------------------------------------------------"
echo "Displaying combined logs (Ctrl+C to stop services):"

# Use tail to show both logs with colors/prefixes
tail -f ../backend.log | sed "s/^/$(printf '\033[34m[BACKEND]\033[0m') /" &
tail -f ../frontend.log | sed "s/^/$(printf '\033[32m[FRONTEND]\033[0m') /" &

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
