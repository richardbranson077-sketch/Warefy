# PostgreSQL Migration Guide

## Current Status
✅ Alembic initialized
✅ Alembic configured to use Warefy models
⏳ Waiting for PostgreSQL to be available

## Next Steps

### Option 1: Install PostgreSQL Locally (Recommended)

```bash
# Install PostgreSQL via Homebrew
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database and user
psql postgres
```

Then in the PostgreSQL prompt:
```sql
CREATE DATABASE warefy_db;
CREATE USER warefy_user WITH PASSWORD 'warefy_password';
GRANT ALL PRIVILEGES ON DATABASE warefy_db TO warefy_user;
\q
```

### Option 2: Use Docker (if Docker Desktop is running)

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Wait for it to be healthy
docker-compose ps
```

### Option 3: Use Cloud PostgreSQL

Sign up for a free tier at:
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app
- **Neon**: https://neon.tech

Get the connection string (format: `postgresql://user:pass@host:port/dbname`)

---

## After PostgreSQL is Running

### 1. Update Backend Configuration

Edit `backend/.env` (or create it):
```env
DATABASE_URL=postgresql://warefy_user:warefy_password@localhost:5432/warefy_db
```

### 2. Update alembic.ini

Edit `backend/alembic.ini` line 63:
```ini
sqlalchemy.url = postgresql://warefy_user:warefy_password@localhost:5432/warefy_db
```

### 3. Create Initial Migration

```bash
cd backend
alembic revision --autogenerate -m "Initial schema with user profile fields"
```

### 4. Run Migration

```bash
alembic upgrade head
```

### 5. Seed the Database

```bash
# Create a PostgreSQL version of seed script
python3 seed_postgres.py
```

### 6. Update Backend Startup

Stop the current backend and start with PostgreSQL:
```bash
# Kill current backend
lsof -ti:8000 | xargs kill -9

# Start with main.py (PostgreSQL version)
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Migration Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `warefy_db` created
- [ ] User `warefy_user` created with password
- [ ] `backend/.env` updated with DATABASE_URL
- [ ] `backend/alembic.ini` updated with sqlalchemy.url
- [ ] Initial migration created
- [ ] Migration applied (`alembic upgrade head`)
- [ ] Database seeded with sample data
- [ ] Backend restarted with `main.py`
- [ ] Frontend tested (login, dashboard, profile)

---

## Troubleshooting

### "psycopg2 not found"
```bash
pip3 install psycopg2-binary
```

### "Connection refused"
Check if PostgreSQL is running:
```bash
# For Homebrew
brew services list

# For Docker
docker-compose ps
```

### "Database does not exist"
```bash
createdb warefy_db
# or
psql postgres -c "CREATE DATABASE warefy_db;"
```
