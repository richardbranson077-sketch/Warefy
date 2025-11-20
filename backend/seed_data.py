"""
Database seeding script to populate sample data for Warefy.
Creates warehouses, inventory, vehicles, drivers, sales history, and routes.
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, init_db
from models import (
    User, Warehouse, Inventory, Vehicle, Driver,
    SalesHistory, Route, Anomaly
)
from auth import get_password_hash

def seed_database():
    """Seed the database with sample data"""
    print("🌱 Seeding database with sample data...")
    
    # Initialize database
    init_db()
    
    db = SessionLocal()
    
    try:
        # Create users
        print("Creating users...")
        users = [
            User(
                email="admin@warefy.com",
                username="admin",
                full_name="Admin User",
                role="admin",
                hashed_password=get_password_hash("admin123")
            ),
            User(
                email="manager@warefy.com",
                username="manager",
                full_name="John Manager",
                role="manager",
                hashed_password=get_password_hash("manager123")
            ),
            User(
                email="driver1@warefy.com",
                username="driver1",
                full_name="Mike Driver",
                role="driver",
                hashed_password=get_password_hash("driver123")
            ),
            User(
                email="driver2@warefy.com",
                username="driver2",
                full_name="Sarah Driver",
                role="driver",
                hashed_password=get_password_hash("driver123")
            )
        ]
        
        for user in users:
            db.add(user)
        db.commit()
        
        # Create warehouses
        print("Creating warehouses...")
        warehouses = [
            Warehouse(
                name="Central Warehouse",
                code="WH-001",
                address="123 Main St",
                city="New York",
                country="USA",
                location="POINT(-74.0060 40.7128)",
                capacity=10000,
                manager_id=2
            ),
            Warehouse(
                name="West Coast Distribution",
                code="WH-002",
                address="456 Ocean Ave",
                city="Los Angeles",
                country="USA",
                location="POINT(-118.2437 34.0522)",
                capacity=8000,
                manager_id=2
            ),
            Warehouse(
                name="Midwest Hub",
                code="WH-003",
                address="789 Lake Shore Dr",
                city="Chicago",
                country="USA",
                location="POINT(-87.6298 41.8781)",
                capacity=12000,
                manager_id=2
            )
        ]
        
        for warehouse in warehouses:
            db.add(warehouse)
        db.commit()
        
        # Create inventory
        print("Creating inventory items...")
        products = [
            ("SKU-001", "Laptop Computer", "Electronics", 45.99),
            ("SKU-002", "Office Chair", "Furniture", 89.99),
            ("SKU-003", "Desk Lamp", "Lighting", 24.99),
            ("SKU-004", "Notebook Pack", "Stationery", 12.99),
            ("SKU-005", "Wireless Mouse", "Electronics", 29.99),
            ("SKU-006", "Monitor Stand", "Furniture", 39.99),
            ("SKU-007", "USB Cable", "Electronics", 9.99),
            ("SKU-008", "Pen Set", "Stationery", 15.99),
            ("SKU-009", "Keyboard", "Electronics", 59.99),
            ("SKU-010", "Desk Organizer", "Furniture", 19.99)
        ]
        
        for warehouse in warehouses:
            for sku, name, category, price in products:
                inventory = Inventory(
                    warehouse_id=warehouse.id,
                    sku=sku,
                    product_name=name,
                    category=category,
                    quantity=random.randint(10, 200),
                    reorder_point=random.randint(20, 50),
                    unit_price=price,
                    last_restocked=datetime.utcnow() - timedelta(days=random.randint(1, 30))
                )
                db.add(inventory)
        
        db.commit()
        
        # Create vehicles
        print("Creating vehicles...")
        vehicles = [
            Vehicle(
                vehicle_number="VH-001",
                vehicle_type="truck",
                capacity=5000,
                fuel_type="diesel",
                current_location="POINT(-74.0060 40.7128)",
                status="available",
                total_distance=15000,
                total_hours=500,
                last_service_date=datetime.utcnow() - timedelta(days=30)
            ),
            Vehicle(
                vehicle_number="VH-002",
                vehicle_type="van",
                capacity=2000,
                fuel_type="electric",
                current_location="POINT(-118.2437 34.0522)",
                status="available",
                total_distance=8000,
                total_hours=300
            ),
            Vehicle(
                vehicle_number="VH-003",
                vehicle_type="truck",
                capacity=6000,
                fuel_type="hybrid",
                current_location="POINT(-87.6298 41.8781)",
                status="available",
                total_distance=20000,
                total_hours=700,
                last_service_date=datetime.utcnow() - timedelta(days=15)
            )
        ]
        
        for vehicle in vehicles:
            db.add(vehicle)
        db.commit()
        
        # Create drivers
        print("Creating drivers...")
        drivers = [
            Driver(
                user_id=3,
                license_number="DL-12345",
                phone="+1-555-0101",
                current_location="POINT(-74.0060 40.7128)",
                is_available=True,
                rating=4.8,
                total_deliveries=150
            ),
            Driver(
                user_id=4,
                license_number="DL-67890",
                phone="+1-555-0102",
                current_location="POINT(-118.2437 34.0522)",
                is_available=True,
                rating=4.9,
                total_deliveries=200
            )
        ]
        
        for driver in drivers:
            db.add(driver)
        db.commit()
        
        # Update vehicles with drivers
        vehicles[0].driver_id = 1
        vehicles[1].driver_id = 2
        db.commit()
        
        # Create sales history
        print("Creating sales history...")
        start_date = datetime.utcnow() - timedelta(days=180)
        
        for warehouse in warehouses:
            for sku, name, _, _ in products:
                for day in range(180):
                    sale_date = start_date + timedelta(days=day)
                    
                    # Add some seasonality and randomness
                    base_quantity = random.randint(5, 20)
                    seasonal_factor = 1 + 0.3 * (day % 30) / 30  # Monthly pattern
                    weekend_factor = 0.7 if sale_date.weekday() >= 5 else 1.0
                    
                    quantity = int(base_quantity * seasonal_factor * weekend_factor)
                    
                    # Occasionally create anomalies (spikes)
                    if random.random() < 0.05:
                        quantity *= random.randint(3, 5)
                    
                    sale = SalesHistory(
                        sku=sku,
                        warehouse_id=warehouse.id,
                        quantity_sold=quantity,
                        sale_date=sale_date,
                        revenue=quantity * random.uniform(10, 100),
                        customer_segment=random.choice(["retail", "wholesale", "online"]),
                        promotion_applied=random.random() < 0.2
                    )
                    db.add(sale)
        
        db.commit()
        
        print("✅ Database seeded successfully!")
        print("\n📊 Sample Data Summary:")
        print(f"   - Users: {len(users)}")
        print(f"   - Warehouses: {len(warehouses)}")
        print(f"   - Inventory Items: {len(warehouses) * len(products)}")
        print(f"   - Vehicles: {len(vehicles)}")
        print(f"   - Drivers: {len(drivers)}")
        print(f"   - Sales Records: {len(warehouses) * len(products) * 180}")
        
        print("\n🔐 Login Credentials:")
        print("   Admin: admin / admin123")
        print("   Manager: manager / manager123")
        print("   Driver: driver1 / driver123")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
