#!/bin/bash

# Setup script for e2e test environment
# Ensures backend has required .env configuration

echo "🔧 Setting up test environment..."

# Check if backend .env exists
if [ ! -f ../backend/.env ]; then
  echo "📝 Backend .env not found, creating from example..."

  if [ -f ../backend/.env.example ]; then
    cp ../backend/.env.example ../backend/.env
    echo "✅ Created backend .env from .env.example"
  else
    echo "⚠️  Warning: ../backend/.env.example not found"
    echo "   Please ensure backend has .env configuration before running tests"
    exit 1
  fi
else
  echo "✅ Backend .env already exists"
fi

# Check if backend dependencies are installed
if [ ! -d ../backend/node_modules ]; then
  echo "📦 Backend dependencies not found, installing..."
  cd ../backend && npm install
  cd ../frontend
  echo "✅ Backend dependencies installed"
else
  echo "✅ Backend dependencies already installed"
fi

echo "✨ Test environment ready!"
