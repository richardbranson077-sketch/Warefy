# Warefy Quick Start Guide

Due to Docker build resource constraints, we'll use a hybrid approach:
- Run **PostgreSQL and Redis** in Docker
- Run **Backend and Frontend** locally

## Step 1: Start Database Services

```bash
cd warefy
docker compose -f docker-compose.simple.yml up -d
```

This starts:
- PostgreSQL with PostGIS on port 5432
- Redis on port 6379

## Step 2: Setup Backend

```bash
# Create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate  # On Mac/Linux

# Install dependencies (this may take 5-10 minutes due to ML libraries)
pip install -r requirements.txt

# Create .env file
cp ../.env.example ../.env

# Run database migrations and seed data
python seed_data.py

# Start FastAPI backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

## Step 3: Setup Frontend (in a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js dev server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

## Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Troubleshooting

- If PostgreSQL connection fails, ensure Docker is running: `docker ps`
- If ML imports fail, the venv may need TensorFlow/Prophet compiled for your system
- For frontend errors, ensure Node.js 18+ is installed: `node --version`
