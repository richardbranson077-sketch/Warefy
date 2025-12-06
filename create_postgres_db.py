"""
Create PostgreSQL database for Warefy
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to default postgres database
try:
    conn = psycopg2.connect(
        dbname='postgres',
        user='hendrixjohn',  # Default Mac user
        host='localhost',
        port='5432'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute("SELECT 1 FROM pg_database WHERE datname='warefy_db'")
    exists = cursor.fetchone()
    
    if exists:
        print("✅ Database 'warefy_db' already exists")
    else:
        # Create database
        cursor.execute("CREATE DATABASE warefy_db")
        print("✅ Created database 'warefy_db'")
    
    # Create user if doesn't exist
    cursor.execute("SELECT 1 FROM pg_roles WHERE rolname='warefy_user'")
    user_exists = cursor.fetchone()
    
    if not user_exists:
        cursor.execute("CREATE USER warefy_user WITH PASSWORD 'warefy_password'")
        print("✅ Created user 'warefy_user'")
    else:
        print("✅ User 'warefy_user' already exists")
    
    # Grant privileges
    cursor.execute("GRANT ALL PRIVILEGES ON DATABASE warefy_db TO warefy_user")
    print("✅ Granted privileges to warefy_user")
    
    cursor.close()
    conn.close()
    print("\n🎉 PostgreSQL setup complete!")
    
except psycopg2.OperationalError as e:
    print(f"❌ Error: {e}")
    print("\nTrying alternative connection...")
    try:
        # Try without specifying user
        conn = psycopg2.connect(
            dbname='postgres',
            host='localhost',
            port='5432'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        cursor.execute("SELECT 1 FROM pg_database WHERE datname='warefy_db'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute("CREATE DATABASE warefy_db")
            print("✅ Created database 'warefy_db'")
        else:
            print("✅ Database 'warefy_db' already exists")
            
        cursor.close()
        conn.close()
        print("🎉 Database created!")
    except Exception as e2:
        print(f"❌ Failed: {e2}")
        print("\nPlease run manually:")
        print("  psql postgres")
        print("  CREATE DATABASE warefy_db;")
