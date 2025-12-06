#!/bin/bash

# Warefy PostgreSQL Setup Script

echo "🚀 Setting up PostgreSQL for Warefy..."
echo ""

# Add PostgreSQL to PATH
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Step 1: Create database
echo "📦 Creating database..."
psql postgres -c "CREATE DATABASE warefy_db;" 2>&1 | grep -v "already exists" || echo "✅ Database ready"

# Step 2: Create initial migration
echo ""
echo "📝 Creating initial migration..."
cd backend
alembic revision --autogenerate -m "Initial schema with user profile fields"

# Step 3: Apply migration
echo ""
echo "⚡ Applying migration..."
alembic upgrade head

# Step 4: Seed database
echo ""
echo "🌱 Seeding database with sample data..."
cd ..
python3 seed_postgres.py

echo ""
echo "✅ PostgreSQL setup complete!"
echo ""
echo "Next steps:"
echo "1. Stop the current backend (Ctrl+C in the terminal running it)"
echo "2. Start with: python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"
