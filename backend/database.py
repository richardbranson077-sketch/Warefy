"""
Database configuration and session management for Warefy.
Handles PostgreSQL connection with PostGIS extension for spatial queries.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from geoalchemy2 import Geometry
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://warefy_user:warefy_password@localhost:5432/warefy_db")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """
    Dependency function to get database session.
    Yields a database session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Initialize database tables and PostGIS extension.
    Creates all tables defined in models.
    """
    from sqlalchemy import text
    
    # Enable PostGIS extension
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        conn.commit()
    
    # Import all models to register them
    from models import (
        user, warehouse, inventory, vehicle, 
        sales_history, route, driver, anomaly, maintenance_log
    )
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully")
