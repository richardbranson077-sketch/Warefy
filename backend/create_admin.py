"""
Quick script to create admin user
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database_lite import SessionLocal
from backend.models_lite import User

db = SessionLocal()

# Check if user exists
existing = db.query(User).filter(User.email == "admin@warefy.com").first()

if existing:
    print("✅ Admin user already exists")
else:
    # Create with a known bcrypt hash for "admin123"
    admin = User(
        username="admin",
        email="admin@warefy.com",
        hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS7eFfqNe",  # admin123
        role="admin"
    )
    db.add(admin)
    db.commit()
    print("✅ Created admin user: admin@warefy.com / admin123")

db.close()
