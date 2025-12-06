"""
Comprehensive database seeding script for Warefy
Creates realistic demo data for all tables
"""

import sys
import os
from datetime import datetime, timedelta
import random

sys.path.append(os.path.dirname(__file__))

from backend.database_lite import SessionLocal, init_db
from backend.models_lite import (
    User, Warehouse, Inventory, Vehicle, SalesHistory, Anomaly, 
    Order, OrderItem, Notification, InventoryLog, Driver, Route
)
from backend.auth_lite import get_password_hash

# Sample data
FIRST_NAMES = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna']
LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego']

PRODUCTS = [
    ('Wireless Headphones', 'Electronics', 89.99),
    ('Smart Watch', 'Electronics', 299.99),
    ('Laptop Stand', 'Accessories', 49.99),
    ('Mechanical Keyboard', 'Accessories', 129.99),
    ('USB-C Hub', 'Accessories', 39.99),
    ('Webcam HD', 'Electronics', 79.99),
    ('Mouse Pad', 'Accessories', 19.99),
    ('Phone Case', 'Accessories', 24.99),
    ('Bluetooth Speaker', 'Electronics', 59.99),
    ('Portable Charger', 'Electronics', 34.99),
    ('HDMI Cable', 'Accessories', 14.99),
    ('Monitor 27"', 'Electronics', 349.99),
    ('Desk Lamp', 'Furniture', 44.99),
    ('Office Chair', 'Furniture', 199.99),
    ('Standing Desk', 'Furniture', 399.99),
]

def seed_database():
    print("🌱 Starting comprehensive database seeding...\\n")
    
    init_db()
    db = SessionLocal()
    
    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("🗑️  Clearing existing data...")
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(InventoryLog).delete()
        db.query(Inventory).delete()
        db.query(Route).delete()
        db.query(Driver).delete()
        db.query(Vehicle).delete()
        db.query(Anomaly).delete()
        db.query(Notification).delete()
        db.query(SalesHistory).delete()
        db.query(Warehouse).delete()
        # Keep existing users
        db.commit()
        
        # 1. CREATE USERS
        print("👥 Creating users...")
        users = []
        
        # Ensure admin exists
        admin = db.query(User).filter(User.username == 'admin').first()
        if not admin:
            admin = User(
                email="admin@warefy.com",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin User",
                role="admin",
                is_active=True
            )
            db.add(admin)
        users.append(admin)
        
        # Ensure manager exists
        manager = db.query(User).filter(User.username == 'manager').first()
        if not manager:
            manager = User(
                email="manager@warefy.com",
                username="manager",
                hashed_password=get_password_hash("manager123"),
                full_name="Manager User",
                role="manager",
                is_active=True
            )
            db.add(manager)
        users.append(manager)
        
        # Add more users
        for i in range(8):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            username = f"{first.lower()}{last.lower()}{i}"  # Add index to avoid duplicates
            role = random.choice(['manager', 'driver', 'viewer'])
            
            # Check if user already exists
            existing = db.query(User).filter(User.username == username).first()
            if existing:
                users.append(existing)
                continue
            
            user = User(
                email=f"{first.lower()}.{last.lower()}{i}@warefy.com",
                username=username,
                hashed_password=get_password_hash("password123"),
                full_name=f"{first} {last}",
                role=role,
                is_active=random.choice([True, True, True, False])  # 75% active
            )
            users.append(user)
            db.add(user)
        
        db.commit()
        print(f"   ✅ Created {len(users)} users")
        
        # 2. CREATE WAREHOUSES
        print("🏭 Creating warehouses...")
        warehouses_data = [
            {"name": "New York Distribution Center", "address": "123 5th Ave, New York, NY", "lat": 40.7128, "lon": -74.0060, "capacity": 10000},
            {"name": "Los Angeles Warehouse", "address": "456 Sunset Blvd, Los Angeles, CA", "lat": 34.0522, "lon": -118.2437, "capacity": 8000},
            {"name": "Chicago Hub", "address": "789 Michigan Ave, Chicago, IL", "lat": 41.8781, "lon": -87.6298, "capacity": 7500},
            {"name": "Houston Depot", "address": "321 Main St, Houston, TX", "lat": 29.7604, "lon": -95.3698, "capacity": 6000},
        ]
        
        warehouses = []
        for wh in warehouses_data:
            warehouse = Warehouse(
                name=wh["name"],
                address=wh["address"],
                latitude=wh["lat"],
                longitude=wh["lon"],
                capacity=wh["capacity"],
                manager_id=users[1].id  # Assign to manager
            )
            warehouses.append(warehouse)
            db.add(warehouse)
        
        db.commit()
        print(f"   ✅ Created {len(warehouses)} warehouses")
        
        # 3. CREATE INVENTORY
        print("📦 Creating inventory items...")
        inventory_items = []
        for warehouse in warehouses:
            for product_name, category, price in PRODUCTS:
                sku = f"SKU-{random.randint(1000, 9999)}"
                quantity = random.randint(50, 500)
                reorder_point = random.randint(20, 100)
                
                item = Inventory(
                    warehouse_id=warehouse.id,
                    sku=sku,
                    product_name=product_name,
                    category=category,
                    quantity=quantity,
                    unit_price=price,
                    reorder_point=reorder_point,
                    supplier=f"Supplier {random.randint(1, 5)}",
                    last_restocked=datetime.utcnow() - timedelta(days=random.randint(1, 60))
                )
                inventory_items.append(item)
                db.add(item)
        
        db.commit()
        print(f"   ✅ Created {len(inventory_items)} inventory items")
        
        # 4. CREATE VEHICLES
        print("🚚 Creating vehicles...")
        vehicles = []
        vehicle_types = ['Delivery Van', 'Box Truck', 'Cargo Van', 'Semi Truck']
        for i in range(1, 16):
            vehicle = Vehicle(
                vehicle_id=f"VH-{i:03d}",
                vehicle_type=random.choice(vehicle_types),
                make=random.choice(['Ford', 'Mercedes', 'Toyota', 'Volvo', 'Isuzu']),
                model=random.choice(['Transit', 'Sprinter', 'ProAce', 'FH16', 'N-Series']),
                year=random.randint(2018, 2024),
                license_plate=f"{random.choice(['ABC', 'XYZ', 'DEF', 'GHI'])}-{random.randint(1000, 9999)}",
                capacity=random.choice([1000, 1500, 2000, 3000]),
                fuel_type=random.choice(['Diesel', 'Electric', 'Hybrid']),
                current_latitude=40.7128 + random.uniform(-2, 2),
                current_longitude=-74.0060 + random.uniform(-2, 2),
                location_name=random.choice(['Warehouse A', 'Warehouse B', 'En Route', 'Service Center']),
                status=random.choice(['available', 'in_use', 'maintenance']),
                mileage=random.randint(5000, 100000),
                last_maintenance=datetime.utcnow() - timedelta(days=random.randint(1, 90)),
                last_maintenance_mileage=random.randint(1000, 5000),
                health_score=random.randint(60, 100),
                fuel_efficiency=random.uniform(8.0, 15.0)
            )
            vehicles.append(vehicle)
            db.add(vehicle)
        
        db.commit()
        print(f"   ✅ Created {len(vehicles)} vehicles")

        # 4.5 CREATE DRIVERS
        print("🚚 Creating drivers...")
        drivers = []
        for i in range(5):
            # Create a user for the driver
            # Check if driver user already exists
            existing_driver_user = db.query(User).filter(User.email == f"driver{i+1}@example.com").first()
            if existing_driver_user:
                driver_user = existing_driver_user
            else:
                driver_user = User(
                    email=f"driver{i+1}@example.com",
                    username=f"driver{i+1}",
                    hashed_password=get_password_hash("driver123"),
                    full_name=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                    role="driver"
                )
                db.add(driver_user)
                db.flush()
            
            driver = Driver(
                user_id=driver_user.id,
                license_number=f"DL-{random.randint(100000, 999999)}",
                phone=f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                status="available",
                created_at=datetime.utcnow()
            )
            db.add(driver)
            drivers.append(driver)
        
        db.commit()
        print(f"   ✅ Created {len(drivers)} drivers")

        # 4.6 CREATE ROUTES
        print("🗺️  Creating routes...")
        routes = []
        
        # Define some realistic routes
        route_templates = [
            {
                "name": "Downtown Delivery Loop",
                "origin": {"address": "Warehouse A, Main St", "lat": 40.7128, "lng": -74.0060},
                "destination": {"address": "Warehouse A, Main St", "lat": 40.7128, "lng": -74.0060},
                "waypoints": [
                    {"address": "Stop 1, 5th Ave", "lat": 40.7484, "lng": -73.9857},
                    {"address": "Stop 2, Broadway", "lat": 40.7580, "lng": -73.9855},
                    {"address": "Stop 3, Park Ave", "lat": 40.7680, "lng": -73.9755}
                ]
            },
            {
                "name": "Suburban Express",
                "origin": {"address": "Distribution Center, Route 1", "lat": 40.6782, "lng": -73.9442},
                "destination": {"address": "Retail Store, Main Plaza", "lat": 40.7306, "lng": -73.9352},
                "waypoints": []
            },
            {
                "name": "Airport Logistics",
                "origin": {"address": "Warehouse B, Industrial Blvd", "lat": 40.6892, "lng": -74.0445},
                "destination": {"address": "JFK Cargo Terminal", "lat": 40.6413, "lng": -73.7781},
                "waypoints": [
                    {"address": "Supplier X, Queens Blvd", "lat": 40.7282, "lng": -73.7949}
                ]
            }
        ]

        for i, template in enumerate(route_templates):
            # Assign random driver and vehicle
            driver = drivers[i % len(drivers)]
            vehicle = vehicles[i % len(vehicles)]
            
            status = random.choice(['planned', 'assigned', 'in_progress', 'completed'])
            
            route = Route(
                route_id=f"route_{i+1}_{int(datetime.now().timestamp())}",
                name=template["name"],
                driver_id=driver.id if status != 'planned' else None,
                vehicle_id=vehicle.id if status != 'planned' else None,
                status=status,
                origin=template["origin"],
                destination=template["destination"],
                waypoints=template["waypoints"],
                optimization_mode=random.choice(['balanced', 'fastest', 'shortest']),
                vehicle_type=vehicle.vehicle_type,
                total_distance=random.uniform(20.0, 80.0),
                estimated_time=random.randint(45, 180),
                estimated_cost=random.uniform(15.0, 50.0),
                optimized=True,
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48))
            )
            
            if status == 'in_progress':
                route.start_time = datetime.utcnow() - timedelta(minutes=random.randint(10, 60))
            elif status == 'completed':
                route.start_time = datetime.utcnow() - timedelta(hours=random.randint(2, 5))
                route.end_time = datetime.utcnow() - timedelta(hours=random.randint(0, 1))
                
            db.add(route)
            routes.append(route)
            
        db.commit()
        print(f"   ✅ Created {len(routes)} routes")
        print("🛒 Creating orders...")
        orders = []
        order_items_list = []
        
        for days_ago in range(90, 0, -1):  # Last 90 days
            # Create 2-5 orders per day
            for _ in range(random.randint(2, 5)):
                customer_first = random.choice(FIRST_NAMES)
                customer_last = random.choice(LAST_NAMES)
                
                order = Order(
                    customer_name=f"{customer_first} {customer_last}",
                    customer_email=f"{customer_first.lower()}.{customer_last.lower()}@example.com",
                    status=random.choice(['pending', 'processing', 'shipped', 'delivered', 'delivered', 'delivered']),
                    total_amount=0,  # Will calculate
                    shipping_address=f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Maple', 'Pine'])} St, {random.choice(CITIES)}, {random.choice(['NY', 'CA', 'TX', 'FL'])} {random.randint(10000, 99999)}",
                    created_at=datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
                )
                db.add(order)
                db.flush()
                
                # Add 1-4 items to order
                order_total = 0
                num_items = random.randint(1, 4)
                selected_items = random.sample(inventory_items, min(num_items, len(inventory_items)))
                
                for inv_item in selected_items:
                    quantity = random.randint(1, 3)
                    
                    order_item = OrderItem(
                        order_id=order.id,
                        sku=inv_item.sku,
                        quantity=quantity,
                        unit_price=inv_item.unit_price
                    )
                    db.add(order_item)
                    order_total += quantity * inv_item.unit_price
                    order_items_list.append(order_item)
                
                order.total_amount = round(order_total, 2)
                orders.append(order)
        
        db.commit()
        print(f"   ✅ Created {len(orders)} orders with {len(order_items_list)} items")
        
        # 6. CREATE ANOMALIES
        print("⚠️  Creating anomalies...")
        anomalies_data = [
            ("demand_spike", "critical", "product", 1, "Unusual demand spike detected. Sales 300% above average."),
            ("stockout", "high", "product", 3, "Low inventory alert. Stock approaching critical levels."),
            ("route_delay", "medium", "route", 1, "Delivery delay detected. Vehicle stuck in traffic."),
            ("price_anomaly", "low", "product", 5, "Price fluctuation detected for supplier."),
            ("demand_drop", "medium", "product", 7, "Sudden demand decrease. Investigate market conditions."),
        ]
        
        for atype, severity, entity_type, entity_id, desc in anomalies_data:
            anomaly = Anomaly(
                anomaly_type=atype,
                severity=severity,
                entity_type=entity_type,
                entity_id=entity_id,
                description=desc,
                detected_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
                resolved=random.choice([True, False])
            )
            db.add(anomaly)
        
        db.commit()
        print(f"   ✅ Created {len(anomalies_data)} anomalies")
        
        # 7. CREATE NOTIFICATIONS
        print("🔔 Creating notifications...")
        notifications = []
        notification_types = [
            ("Low stock alert", "warning", "Inventory for {} is running low"),
            ("Order shipped", "info", "Order #{} has been shipped"),
            ("New order", "success", "New order #{} received"),
            ("Delivery completed", "success", "Order #{} delivered successfully"),
            ("Maintenance due", "warning", "Vehicle {} requires maintenance"),
        ]
        
        for i in range(20):
            ntype, severity, template = random.choice(notification_types)
            notification = Notification(
                user_id=random.choice(users).id,
                type=severity,
                content=f"{ntype}: {template.format(random.randint(1000, 9999))}",
                is_read=random.choice([True, False, False]),  # 33% read
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 72))
            )
            notifications.append(notification)
            db.add(notification)
        
        db.commit()
        print(f"   ✅ Created {len(notifications)} notifications")
        
        # 8. CREATE INVENTORY LOGS
        print("📝 Creating inventory logs...")
        logs = []
        for item in random.sample(inventory_items, min(30, len(inventory_items))):
            for _ in range(random.randint(1, 3)):
                log = InventoryLog(
                    inventory_id=item.id,
                    change_amount=random.randint(-50, 100),
                    reason=random.choice(['Restock', 'Sale', 'Adjustment', 'Return', 'Damage']),
                    user_id=random.choice(users).id,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
                )
                logs.append(log)
                db.add(log)
        
        db.commit()
        print(f"   ✅ Created {len(logs)} inventory logs")
        
        # SUMMARY
        print("\\n" + "="*60)
        print("✅ DATABASE SEEDED SUCCESSFULLY!")
        print("="*60)
        print(f"\\n📊 Summary:")
        print(f"   👥 Users: {len(users)}")
        print(f"   🏭 Warehouses: {len(warehouses)}")
        print(f"   📦 Inventory Items: {len(inventory_items)}")
        print(f"   🚚 Vehicles: {len(vehicles)}")
        print(f"   🛒 Orders: {len(orders)}")
        print(f"   📋 Order Items: {len(order_items_list)}")
        print(f"   ⚠️  Anomalies: {len(anomalies_data)}")
        print(f"   🔔 Notifications: {len(notifications)}")
        print(f"   📝 Inventory Logs: {len(logs)}")
        print(f"\\n🎉 Your platform is now ready for demo!")
        print(f"\\n🔐 Login credentials:")
        print(f"   Admin: admin / admin123")
        print(f"   Manager: manager / manager123")
        print("\\n")
        
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
