#!/bin/bash

# Development startup script
echo "🚀 Starting Renamerged in Development Mode"

# Load environment variables
load_env() {
    if [ -f "$1" ]; then
        export $(grep -v '^#' "$1" | xargs)
    fi
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port is already in use"
        return 1
    else
        return 0
    fi
}

# Load backend environment
load_env backend/.env
BACKEND_PORT=${PORT:-5002}

# Load frontend environment
load_env frontend/.env
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Check required ports
if ! check_port $BACKEND_PORT; then
    echo "❌ Backend port $BACKEND_PORT is busy. Please free up the port first."
    exit 1
fi

if ! check_port $FRONTEND_PORT; then
    echo "⚠️  Frontend port $FRONTEND_PORT is busy. Using alternative port $((FRONTEND_PORT + 1))"
    FRONTEND_PORT=$((FRONTEND_PORT + 1))
fi

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting backend on port $BACKEND_PORT..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend in background with environment port
echo "🎨 Starting frontend on port $FRONTEND_PORT..."
cd frontend && FRONTEND_PORT=$FRONTEND_PORT npm run dev:auto &
FRONTEND_PID=$!

echo "✅ Development servers started!"
echo "📱 Frontend: http://localhost:$FRONTEND_PORT"
echo "🔗 Backend:  http://localhost:$BACKEND_PORT"
echo "🩺 Health:   http://localhost:$BACKEND_PORT/health"
echo "🔧 Environment: backend/.env, frontend/.env"
echo "📝 Press Ctrl+C to stop both servers"

# Wait for processes to finish
wait