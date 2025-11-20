#!/bin/bash

echo "=================================================="
echo "  🚀 Warefy Lightweight Demo Launcher"
echo "=================================================="
echo ""

# Check if we're in the warefy directory
if [ ! -d "backend" ]; then
  echo "❌ Error: Please run this from the warefy directory"
  exit 1
fi

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "📦 Creating Python virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install minimal requirements
echo "📥 Installing minimal dependencies (this may take 1-2 minutes)..."
pip install -q --upgrade pip
pip install -q -r requirements_lite.txt

if [ $? -ne 0 ]; then
  echo "❌ Failed to install dependencies"
  exit 1
fi

# Seed database
echo ""
echo "🌱 Setting up database..."
python seed_lite.py

if [ $? -ne 0 ]; then  
  echo "❌ Failed to seed database"
  exit 1
fi

# Start backend server
echo ""
echo "=================================================="
echo "  ✅ Ready to launch Warefy Backend!"
echo "=================================================="
echo ""
echo "🌐 Starting FastAPI server on http://localhost:8000"
echo "📚 API documentation will be at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start uvicorn (will be modified to use lite version)
python -c "
from backend.main_lite import app
import uvicorn
uvicorn.run(app, host='0.0.0.0', port=8000, reload=False)
"
