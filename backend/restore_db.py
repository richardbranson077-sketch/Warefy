"""
Restore database to working state
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database_lite import engine, SessionLocal
from backend.models_lite import Base, User

print("🔧 Restoring database...")

# Drop and recreate all tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("✅ Database tables created")

# Create admin user
db = SessionLocal()
try:
    admin = User(
        username="admin",
        email="admin@warefy.com",
        hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS7eFfqNe",  # admin123
        role="admin"
    )
    db.add(admin)
    db.commit()
    print("✅ Created admin user: admin / admin123")
    print("\n🎉 Database restored! You can now login.")
finally:
    db.close()
