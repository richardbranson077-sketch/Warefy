"""
Seed database with sample data for lightweight demo
"""

import sys
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.append('/Users/hendrixjohn/warefy')

from backend.database_lite import init_db, SessionLocal
from backend.models_lite import User, Warehouse, Inventory, Vehicle, Driver, SalesHistory, Anomaly
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_database():
    print("🌱 Seeding database with sample data...\n")
    
    # Initialize database tables
    init_db()
    
    db = SessionLocal()
    
    try:
        # Create admin user
        admin = User(
            email="admin@warefy.com",
            username="admin",
            hashed_password=pwd_context.hash("admin123"),
            full_name="Admin User",
            role="admin"
        )
        db.add(admin)
        
        # Create manager
        manager = User(
            email="manager@warefy.com",
            username="manager",
            hashed_password=pwd_context.hash("manager123"),
            full_name="Manager User",
            role="manager"
        )
        db.add(manager)
        
        print("✅ Created users (admin, manager)")
        
        # Create warehouses
        warehouses_data = [
            {"name": "New York Warehouse", "address": "123 5th Ave, NY", "lat": 40.7128, "lon": -74.0060, "capacity": 10000},
            {"name": "Los Angeles Warehouse", "address": "456 Sunset Blvd, LA", "lat": 34.0522, "lon": -118.2437, "capacity": 8000},
            {"name": "Chicago Warehouse", "address": "789 Michigan Ave, Chicago", "lat": 41.8781, "lon": -87.6298, "capacity": 7500},
        ]
        
        warehouses = []
        for wh in warehouses_data:
            warehouse = Warehouse(
                name=wh["name"],
                address=wh["address"],
                latitude=wh["lat"],
                longitude=wh["lon"],
                capacity=wh["capacity"],
                manager_id=manager.id
            )
            warehouses.append(warehouse)
            db.add(warehouse)
        
        db.flush()
        print(f"✅ Created {len(warehouses)} warehouses")
        
        # Create inventory items
        products = [
            ("SKU-001", "Laptop", "Electronics", 120, 50),
            ("SKU-002", "Office Chair", "Furniture", 85, 20),
            ("SKU-003", "Desk Lamp", "Lighting", 45, 30),
            ("SKU-004", "Wireless Mouse", "Electronics", 150, 50),
            ("SKU-005", "Monitor Stand", "Accessories", 65, 25),
        ]
        
        inventory_items = []
        for sku, name, category, qty, reorder in products:
            for warehouse in warehouses:
                item = Inventory(
                    warehouse_id=warehouse.id,
                    sku=sku,
                    product_name=name,
                    category=category,
                    quantity=qty + random.randint(-20, 20),
                    unit_price=random.uniform(50, 500),
                    reorder_point=reorder,
                    supplier=f"Supplier {random.randint(1, 3)}",
                    last_restocked=datetime.utcnow() - timedelta(days=random.randint(1, 30))
                )
                inventory_items.append(item)
                db.add(item)
        
        print(f"✅ Created {len(inventory_items)} inventory items")
        
        # Create sales history
        sales_count = 0
        for item in inventory_items[:5]:  # Just for first 5 items
            for days_ago in range(180, 0, -1):  # 6 months of data
                if random.random() > 0.3:  # 70% chance of sale each day
                    sale = SalesHistory(
                        sku=item.sku,
                        warehouse_id=item.warehouse_id,
                        date=datetime.utcnow() - timedelta(days=days_ago),
                        quantity=random.randint(1, 10),
                        revenue=random.uniform(100, 1000)
                    )
                    db.add(sale)
                    sales_count += 1
        
        print(f"✅ Created {sales_count} sales history records")
        
        # Create vehicles
        vehicles = []
        for i in range(1, 6):
            vehicle = Vehicle(
                vehicle_id=f"VH-00{i}",
                vehicle_type="Delivery Van",
                capacity=1500.0,
                fuel_type="Diesel",
                current_latitude=40.7128 + random.uniform(-0.5, 0.5),
                current_longitude=-74.0060 + random.uniform(-0.5, 0.5),
                status="available",
                mileage=random.randint(10000, 50000),
                last_maintenance=datetime.utcnow() - timedelta(days=random.randint(30, 90))
            )
            vehicles.append(vehicle)
            db.add(vehicle)
        
        print(f"✅ Created {len(vehicles)} vehicles")
        
        # Create anomalies
        anomalies_data = [
            ("Demand Spike", "critical", "Unusual demand spike for SKU-001. Sales 300% above average."),
            ("Stockout Risk", "high", "Inventory for SKU-003 approaching critical levels."),
            ("Delivery Delay", "medium", "Vehicle VH-002 delayed by 45 minutes due to traffic."),
        ]
        
        for atype, severity, desc in anomalies_data:
            anomaly = Anomaly(
                anomaly_type=atype,
                severity=severity,
                description=desc,
                detected_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24))
            )
            db.add(anomaly)
        
        print(f"✅ Created {len(anomalies_data)} anomalies")
        
        # Commit all changes
        db.commit()
        print("\n✅ Database seeded successfully!")
        print("\n📊 Summary:")
        print(f"  - Users: 2")
        print(f"  - Warehouses: {len(warehouses)}")
        print(f"  - Inventory items: {len(inventory_items)}")
        print(f"  - Sales records: {sales_count}")
        print(f"  - Vehicles: {len(vehicles)}")
        print(f"  - Anomalies: {len(anomalies_data)}")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
