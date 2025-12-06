"""
Database configuration that supports both SQLite (local) and PostgreSQL (production)
"""

# redeploy trigger - dummy change
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Check if we're on Railway (they set RAILWAY_ENVIRONMENT)
RAILWAY_ENV = os.getenv("RAILWAY_ENVIRONMENT")
DATABASE_URL = os.getenv("DATABASE_URL")

# DEBUG: Print to see if variable is detected
print(f"🔍 DATABASE_URL detected: {DATABASE_URL[:50] if DATABASE_URL else 'None'}")
print(f"🚂 RAILWAY_ENVIRONMENT: {RAILWAY_ENV}")

# Force PostgreSQL on Railway even if DATABASE_URL isn't detected
if RAILWAY_ENV and not DATABASE_URL:
    # Use Railway's internal PostgreSQL DNS
    PGHOST = os.getenv("PGHOST", "postgres.railway.internal")
    PGPORT = os.getenv("PGPORT", "5432")
    PGDATABASE = os.getenv("PGDATABASE", "railway")
    PGUSER = os.getenv("PGUSER", "postgres")
    PGPASSWORD = os.getenv("PGPASSWORD", "")
    
    if PGPASSWORD:
        DATABASE_URL = f"postgresql://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"
        print(f"✅ Constructed Railway DATABASE_URL from individual variables")

if DATABASE_URL:
    # Production: Use PostgreSQL
    # Render/Railway might provide postgres:// but SQLAlchemy needs postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    print(f"🐘 Using PostgreSQL: {DATABASE_URL[:50]}...")
    engine = create_engine(DATABASE_URL)
else:
    # Local development: Use SQLite
    # On Railway, use /data volume for persistence
    if RAILWAY_ENV:
        # Railway persistent volume
        DATABASE_PATH = "/data/warefy.db"
        print(f"🚂 Using Railway SQLite with persistent volume: {DATABASE_PATH}")
    else:
        # Local development
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        DATABASE_PATH = os.path.join(BASE_DIR, 'warefy.db')
        print(f"💻 Using local SQLite: {DATABASE_PATH}")
    
    DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    
    # Enable foreign keys for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for FastAPI routes"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables (drop existing tables to apply schema changes)"""
    # Drop all tables to ensure schema is up‑to‑date (safe for development / demo)
    # Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables (re)created successfully!")
