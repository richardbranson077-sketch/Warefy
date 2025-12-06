"""
Warefy Database Seeding Script
Populates the database with realistic sample data for demo purposes
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database_lite import SessionLocal, init_db
from backend.models_lite import (
    Inventory, Route, Anomaly, Warehouse, 
    User, SalesHistory
)

def clear_existing_data(db):
    """Clear all existing data from tables"""
    print("🗑️  Clearing existing data...")
    db.query(SalesHistory).delete()
    db.query(Anomaly).delete()
    db.query(Route).delete()
    db.query(Inventory).delete()
    db.query(Warehouse).delete()
    # Don't delete users - keep authentication working
    db.commit()
    print("✅ Existing data cleared")

def seed_warehouses(db):
    """Create warehouse zones"""
    print("\n🏭 Seeding warehouses...")
    
    warehouses = [
        Warehouse(
            name="Zone A - General Storage",
            address="Building 1, Floor 1",
            capacity=10000,
            latitude=37.7749,
            longitude=-122.4194
        ),
        Warehouse(
            name="Zone B - Freezer",
            address="Building 1, Floor 2",
            capacity=5000,
            latitude=37.7750,
            longitude=-122.4195
        ),
        Warehouse(
            name="Zone C - Secure Storage",
            address="Building 2, Floor 1",
            capacity=3000,
            latitude=37.7751,
            longitude=-122.4196
        ),
        Warehouse(
            name="Zone D - Receiving",
            address="Building 1, Dock Area",
            capacity=8000,
            latitude=37.7752,
            longitude=-122.4197
        ),
    ]
    
    db.add_all(warehouses)
    db.commit()
    print(f"✅ Created {len(warehouses)} warehouse zones")
    return warehouses

def seed_inventory(db, warehouses):
    """Create realistic inventory items"""
    print("\n📦 Seeding inventory...")
    
    items = [
        # Critical Low Stock Items
        ("Wood Pallets", "WP-101", 50, 100, 25.00, warehouses[0].id),
        ("AA Batteries", "BT-202", 100, 250, 1.50, warehouses[0].id),
        ("Packing Tape", "PT-500", 150, 150, 3.25, warehouses[0].id),
        
        # Electronics
        ("Wireless Headphones", "EL-001", 450, 100, 89.99, warehouses[2].id),
        ("Mechanical Keyboards", "EL-002", 320, 80, 129.99, warehouses[2].id),
        ("4K Monitors", "EL-003", 180, 50, 399.99, warehouses[2].id),
        ("USB-C Cables", "EL-004", 890, 200, 12.99, warehouses[0].id),
        ("Laptop Stands", "EL-005", 210, 60, 45.00, warehouses[0].id),
        ("Webcams HD", "EL-006", 340, 100, 79.99, warehouses[2].id),
        ("Wireless Mice", "EL-007", 520, 150, 34.99, warehouses[0].id),
        
        # Office Supplies
        ("Office Chairs", "OF-001", 95, 30, 249.99, warehouses[0].id),
        ("Standing Desks", "OF-002", 42, 20, 599.99, warehouses[0].id),
        ("Desk Lamps", "OF-003", 180, 50, 45.00, warehouses[0].id),
        ("Whiteboards", "OF-004", 65, 25, 89.99, warehouses[0].id),
        ("Filing Cabinets", "OF-005", 38, 15, 199.99, warehouses[0].id),
        
        # Frozen Goods
        ("Frozen Seafood", "FZ-999", 500, 200, 15.99, warehouses[1].id),
        ("Ice Cream Boxes", "FZ-101", 800, 300, 8.99, warehouses[1].id),
        ("Frozen Vegetables", "FZ-102", 650, 250, 5.99, warehouses[1].id),
        ("Frozen Pizza", "FZ-103", 920, 400, 7.49, warehouses[1].id),
        
        # Industrial Supplies
        ("Safety Helmets", "IN-001", 280, 100, 29.99, warehouses[0].id),
        ("Work Gloves", "IN-002", 540, 200, 8.99, warehouses[0].id),
        ("Safety Vests", "IN-003", 310, 120, 15.99, warehouses[0].id),
        ("Tool Kits", "IN-004", 125, 40, 149.99, warehouses[2].id),
        ("Extension Cords", "IN-005", 420, 150, 24.99, warehouses[0].id),
        
        # Packaging Materials
        ("Cardboard Boxes S", "PK-001", 2400, 500, 0.75, warehouses[3].id),
        ("Cardboard Boxes M", "PK-002", 1800, 400, 1.25, warehouses[3].id),
        ("Cardboard Boxes L", "PK-003", 1200, 300, 2.00, warehouses[3].id),
        ("Bubble Wrap Rolls", "PK-004", 380, 100, 18.99, warehouses[3].id),
        ("Shipping Labels", "PK-005", 5000, 1000, 0.05, warehouses[3].id),
        ("Packing Peanuts", "PK-006", 95, 50, 12.99, warehouses[3].id),
        
        # Cleaning Supplies
        ("Industrial Cleaner", "CL-001", 240, 80, 14.99, warehouses[0].id),
        ("Mop Heads", "CL-002", 180, 60, 8.99, warehouses[0].id),
        ("Trash Bags", "CL-003", 620, 200, 12.99, warehouses[0].id),
        ("Paper Towels", "CL-004", 890, 300, 15.99, warehouses[0].id),
        
        # Tech Accessories
        ("Phone Cases", "AC-001", 740, 200, 19.99, warehouses[0].id),
        ("Screen Protectors", "AC-002", 980, 300, 9.99, warehouses[0].id),
        ("Charging Cables", "AC-003", 1240, 400, 14.99, warehouses[0].id),
        ("Power Banks", "AC-004", 420, 120, 39.99, warehouses[2].id),
        ("Bluetooth Speakers", "AC-005", 310, 100, 59.99, warehouses[2].id),
        
        # Furniture
        ("Bookshelf Units", "FU-001", 58, 20, 129.99, warehouses[0].id),
        ("Coffee Tables", "FU-002", 34, 15, 179.99, warehouses[0].id),
        ("Storage Bins", "FU-003", 420, 150, 24.99, warehouses[0].id),
        ("Coat Racks", "FU-004", 92, 30, 49.99, warehouses[0].id),
        
        # Automotive
        ("Motor Oil 5W-30", "AU-001", 340, 100, 29.99, warehouses[0].id),
        ("Air Filters", "AU-002", 280, 80, 19.99, warehouses[0].id),
        ("Windshield Wipers", "AU-003", 410, 120, 24.99, warehouses[0].id),
        ("Car Batteries", "AU-004", 65, 25, 149.99, warehouses[2].id),
        
        # Sports Equipment
        ("Yoga Mats", "SP-001", 280, 100, 34.99, warehouses[0].id),
        ("Dumbbells 10lb", "SP-002", 140, 50, 29.99, warehouses[0].id),
        ("Resistance Bands", "SP-003", 320, 100, 19.99, warehouses[0].id),
        ("Water Bottles", "SP-004", 540, 200, 14.99, warehouses[0].id),
    ]
    
    inventory_items = []
    for name, sku, qty, reorder, price, warehouse_id in items:
        item = Inventory(
            product_name=name,
            sku=sku,
            quantity=qty,
            reorder_point=reorder,
            unit_price=price,
            warehouse_id=warehouse_id,
            category="General",  # Default category
            supplier="Global Suppliers Inc.",  # Default supplier
            last_restocked=datetime.now() - timedelta(days=random.randint(1, 30))
        )
        inventory_items.append(item)
    
    db.add_all(inventory_items)
    db.commit()
    print(f"✅ Created {len(inventory_items)} inventory items")
    return inventory_items

def seed_routes(db):
    """Create active delivery routes"""
    print("\n🚚 Seeding routes...")
    
    routes_data = [
        ("On Time", 45.5, 120),
        ("On Time", 32.1, 90),
        ("Delayed", 28.7, 75),
        ("On Time", 51.2, 150),
        ("On Time", 38.9, 105),
        ("On Time", 42.3, 130),
        ("On Time", 29.5, 85),
        ("Delayed", 35.8, 95),
        ("On Time", 47.1, 140),
        ("On Time", 33.4, 100),
    ]
    
    routes = []
    for i, (status, distance, est_time) in enumerate(routes_data, 1):
        start = datetime.now() - timedelta(minutes=random.randint(10, 60))
        route = Route(
            status=status.lower(),
            total_distance=distance,
            estimated_time=est_time,
            start_time=start,
            waypoints=[
                {"lat": 37.7749 + random.uniform(-0.01, 0.01), 
                 "lng": -122.4194 + random.uniform(-0.01, 0.01),
                 "address": f"Stop {j}"} 
                for j in range(1, random.randint(3, 6))
            ]
        )
        routes.append(route)
    
    db.add_all(routes)
    db.commit()
    print(f"✅ Created {len(routes)} active routes")
    return routes

def seed_anomalies(db):
    """Create realistic anomalies"""
    print("\n🚨 Seeding anomalies...")
    
    anomalies_data = [
        ("Temperature Spike", "Zone B temperature at -2°C (threshold: -10°C)", "High"),
        ("Vibration Alert", "Conveyor Belt 3 showing abnormal vibration (8.5mm/s)", "Medium"),
        ("Humidity Warning", "Zone A humidity at 65% (threshold: 50%)", "Low"),
        ("Door Sensor", "Loading Dock 2 door open for 45+ minutes", "Medium"),
        ("Power Fluctuation", "Zone C experiencing voltage drops", "Low"),
        ("Motion Detected", "After-hours motion in Zone B (2:30 AM)", "High"),
        ("Network Latency", "Warehouse network response time >500ms", "Low"),
    ]
    
    anomalies = []
    for anomaly_type, description, severity in anomalies_data:
        detected_time = datetime.now() - timedelta(hours=random.randint(1, 12))
        anomaly = Anomaly(
            anomaly_type=anomaly_type,
            description=description,
            severity=severity,
            detected_at=detected_time,
            status="active"  # Use status instead of resolved
        )
        anomalies.append(anomaly)
    
    db.add_all(anomalies)
    db.commit()
    print(f"✅ Created {len(anomalies)} anomalies")
    return anomalies

def seed_sales_history(db, inventory_items):
    """Create sales history for revenue tracking"""
    print("\n💰 Seeding sales history...")
    
    sales = []
    # Generate sales for the last 30 days
    for day in range(30):
        sale_date = datetime.now() - timedelta(days=day)
        # 5-15 sales per day
        daily_sales = random.randint(5, 15)
        
        for _ in range(daily_sales):
            item = random.choice(inventory_items)
            quantity = random.randint(1, 5)
            sale = SalesHistory(
                sku=item.sku,
                warehouse_id=item.warehouse_id,
                date=sale_date,
                quantity=quantity,
                revenue=item.unit_price * quantity
            )
            sales.append(sale)
    
    db.add_all(sales)
    db.commit()
    print(f"✅ Created {len(sales)} sales records")
    return sales

def main():
    """Main seeding function"""
    print("=" * 60)
    print("🌱 WAREFY DATABASE SEEDING")
    print("=" * 60)
    
    # Initialize database
    init_db()
    db = SessionLocal()
    
    try:
        # Clear existing data
        clear_existing_data(db)
        
        # Seed data in order
        warehouses = seed_warehouses(db)
        inventory_items = seed_inventory(db, warehouses)
        routes = seed_routes(db)
        anomalies = seed_anomalies(db)
        sales = seed_sales_history(db, inventory_items)
        
        print("\n" + "=" * 60)
        print("✅ DATABASE SEEDING COMPLETE!")
        print("=" * 60)
        print(f"\n📊 Summary:")
        print(f"   • {len(warehouses)} Warehouse Zones")
        print(f"   • {len(inventory_items)} Inventory Items")
        print(f"   • {len(routes)} Active Routes")
        print(f"   • {len(anomalies)} Anomalies")
        print(f"   • {len(sales)} Sales Records")
        print(f"\n🚀 Your AI Command Center is now ready with realistic data!")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
