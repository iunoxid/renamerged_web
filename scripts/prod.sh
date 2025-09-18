#!/bin/bash

# Production startup script
echo "🚀 Starting Renamerged in Production Mode"

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

# Check required ports
if ! check_port 5001; then
    echo "❌ Backend port 5001 is busy. Please free up the port first."
    exit 1
fi

if ! check_port 3000; then
    echo "❌ Frontend port 3000 is busy. Please free up the port first."
    exit 1
fi

# Create production environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please configure backend/.env for production!"
fi

# Install production dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm ci --only=production && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm ci && cd ..

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting backend in production mode..."
cd backend && npm run start:prod &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend in background
echo "🎨 Starting frontend in production mode..."
cd frontend && npm run start:prod &
FRONTEND_PID=$!

echo "✅ Production servers started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔗 Backend:  http://localhost:5001"
echo "🩺 Health:   http://localhost:5001/health"
echo "📝 Press Ctrl+C to stop both servers"

# Wait for processes to finish
wait