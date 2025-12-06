"""
Fix admin password by using the correct hashing scheme from auth_lite
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database_lite import SessionLocal
from backend.models_lite import User
from backend.auth_lite import get_password_hash

db = SessionLocal()

# Get admin user
admin = db.query(User).filter(User.username == "admin").first()

if admin:
    print(f"👤 Found admin user. Current hash start: {admin.hashed_password[:10]}...")
    
    # Generate new hash using the correct context (pbkdf2_sha256)
    new_hash = get_password_hash("admin123")
    print(f"🔑 New hash start: {new_hash[:10]}...")
    
    admin.hashed_password = new_hash
    db.commit()
    print("✅ Updated admin password to 'admin123' with correct hash.")
else:
    print("❌ Admin user not found! Creating it now...")
    new_hash = get_password_hash("admin123")
    admin = User(
        username="admin",
        email="admin@warefy.com",
        hashed_password=new_hash,
        role="admin",
        is_active=True
    )
    db.add(admin)
    db.commit()
    print("✅ Created admin user: admin / admin123")

db.close()
