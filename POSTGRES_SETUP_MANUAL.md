# Quick PostgreSQL Setup Guide

## Step 1: Create Database (Manual)

Open a new terminal and run:

```bash
# Add PostgreSQL to your PATH
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Create the database (you may be prompted for your Mac password)
/opt/homebrew/opt/postgresql@15/bin/createdb warefy_db

# Verify it was created
/opt/homebrew/opt/postgresql@15/bin/psql -l | grep warefy
```

If `createdb` asks for a password and you don't have one set, run:
```bash
/opt/homebrew/opt/postgresql@15/bin/psql postgres
```
Then in the PostgreSQL prompt:
```sql
CREATE DATABASE warefy_db;
\q
```

## Step 2: Create Migration

```bash
cd /Users/hendrixjohn/warefy/backend
alembic revision --autogenerate -m "Initial schema with user profile fields"
```

## Step 3: Apply Migration

```bash
alembic upgrade head
```

## Step 4: Seed Database

```bash
cd /Users/hendrixjohn/warefy
python3 seed_postgres.py
```

## Step 5: Update Backend to Use PostgreSQL

The backend is already configured! Just restart it:

1. **Stop current backend** (in the terminal where it's running, press Ctrl+C)

2. **Start with PostgreSQL:**
```bash
cd /Users/hendrixjohn/warefy
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## Step 6: Test

Visit http://localhost:3000 and login with:
- Username: `admin`
- Password: `admin123`

---

## Troubleshooting

### "database does not exist"
Run Step 1 again.

### "relation does not exist"
Run Steps 2-3 again (migration).

### "No module named 'backend.database'"
The seed script needs `backend/database.py` to exist. If using `database_lite.py`, update the import in `seed_postgres.py`.
