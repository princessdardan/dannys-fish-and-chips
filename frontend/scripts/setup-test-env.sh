#!/bin/bash

# Setup script for e2e test environment
# Ensures frontend dependencies are installed

echo "🔧 Setting up test environment..."

# Check if frontend dependencies are installed
if [ ! -d node_modules ]; then
  echo "📦 Frontend dependencies not found, installing..."
  npm install
  echo "✅ Frontend dependencies installed"
else
  echo "✅ Frontend dependencies already installed"
fi

echo "✨ Test environment ready!"
