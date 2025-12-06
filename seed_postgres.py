"""
Seed PostgreSQL database with sample data for Warefy
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.append(os.path.dirname(__file__))

from backend.database import SessionLocal, init_db
from backend.models_lite import User, Warehouse, Inventory, Vehicle, SalesHistory, Anomaly, Order, OrderItem
from backend.auth_lite import get_password_hash

def seed_database():
    print("🌱 Seeding PostgreSQL database with sample data...\\n")
    
    # Initialize database tables
    init_db()
    
    db = SessionLocal()
    
    try:
        # Create admin user
        admin = User(
            email="admin@warefy.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            role="admin",
            phone="+1 (555) 100-0001",
            location="New York, USA",
            bio="System Administrator"
        )
        db.add(admin)
        
        # Create manager
        manager = User(
            email="manager@warefy.com",
            username="manager",
            hashed_password=get_password_hash("manager123"),
            full_name="Manager User",
            role="manager",
            phone="+1 (555) 100-0002",
            location="Los Angeles, USA",
            bio="Warehouse Operations Manager"
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
                manager_id=1  # Will be updated after flush
            )
            warehouses.append(warehouse)
            db.add(warehouse)
        
        db.flush()
        print(f"✅ Created {len(warehouses)} warehouses")
        
        # Create inventory items
        products = [
            ("SKU-001", "Wireless Headphones", "Electronics", 120, 50, 89.99),
            ("SKU-002", "Smart Watch", "Electronics", 85, 20, 299.99),
            ("SKU-003", "Ergonomic Mouse", "Accessories", 150, 30, 49.99),
            ("SKU-004", "Mechanical Keyboard", "Accessories", 95, 25, 129.99),
            ("SKU-005", "USB-C Hub", "Accessories", 200, 40, 39.99),
        ]
        
        inventory_items = []
        for sku, name, category, qty, reorder, price in products:
            for warehouse in warehouses:
                item = Inventory(
                    warehouse_id=warehouse.id,
                    sku=sku,
                    product_name=name,
                    category=category,
                    quantity=qty + random.randint(-20, 20),
                    unit_price=price,
                    reorder_point=reorder,
                    supplier=f"Supplier {random.randint(1, 3)}",
                    last_restocked=datetime.utcnow() - timedelta(days=random.randint(1, 30))
                )
                inventory_items.append(item)
                db.add(item)
        
        db.flush()
        print(f"✅ Created {len(inventory_items)} inventory items")
        
        # Create orders and order items
        orders_count = 0
        order_items_count = 0
        
        for days_ago in range(60, 0, -1):  # Last 60 days
            if random.random() > 0.3:  # 70% chance of order each day
                order = Order(
                    customer_name=f"Customer {random.randint(1, 100)}",
                    customer_email=f"customer{random.randint(1, 100)}@example.com",
                    status=random.choice(["pending", "processing", "shipped", "delivered"]),
                    total_amount=0,  # Will calculate
                    shipping_address=f"{random.randint(100, 999)} Main St, City, State",
                    created_at=datetime.utcnow() - timedelta(days=days_ago)
                )
                db.add(order)
                db.flush()
                
                # Add 1-3 items to order
                order_total = 0
                for _ in range(random.randint(1, 3)):
                    product = random.choice(products)
                    quantity = random.randint(1, 5)
                    unit_price = product[5]
                    
                    order_item = OrderItem(
                        order_id=order.id,
                        sku=product[0],
                        quantity=quantity,
                        unit_price=unit_price
                    )
                    db.add(order_item)
                    order_total += quantity * unit_price
                    order_items_count += 1
                
                order.total_amount = order_total
                orders_count += 1
        
        print(f"✅ Created {orders_count} orders with {order_items_count} items")
        
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
            ("demand_spike", "critical", "product", 1, "Unusual demand spike for Wireless Headphones. Sales 300% above average."),
            ("stockout", "high", "product", 3, "Inventory for Ergonomic Mouse approaching critical levels."),
            ("route_delay", "medium", "route", 1, "Vehicle VH-002 delayed by 45 minutes due to traffic."),
        ]
        
        for atype, severity, entity_type, entity_id, desc in anomalies_data:
            anomaly = Anomaly(
                anomaly_type=atype,
                severity=severity,
                entity_type=entity_type,
                entity_id=entity_id,
                description=desc,
                detected_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24)),
                resolved=False
            )
            db.add(anomaly)
        
        print(f"✅ Created {len(anomalies_data)} anomalies")
        
        # Commit all changes
        db.commit()
        print("\\n✅ PostgreSQL database seeded successfully!")
        print("\\n📊 Summary:")
        print(f"  - Users: 2")
        print(f"  - Warehouses: {len(warehouses)}")
        print(f"  - Inventory items: {len(inventory_items)}")
        print(f"  - Orders: {orders_count}")
        print(f"  - Order items: {order_items_count}")
        print(f"  - Vehicles: {len(vehicles)}")
        print(f"  - Anomalies: {len(anomalies_data)}")
        
    except Exception as e:
        print(f"\\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
