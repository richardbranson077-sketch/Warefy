"""
API endpoint to seed the database with sample data
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database_lite import get_db
from backend.models_lite import Order, Warehouse, Inventory, User
from backend.auth_lite import get_password_hash
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/seed", tags=["Database Seeding"])

@router.get("/all")
async def seed_database(db: Session = Depends(get_db)):
    """Seed the database with enterprise-scale sample data"""
    
    # Check if already seeded
    existing_orders = db.query(Order).count()
    if existing_orders > 0:
        return {"message": f"Database already has {existing_orders} orders. Skipping seed."}
    
    # Seed Users
    admin = db.query(User).filter(User.username == "admin").first()
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
        db.commit()
    
    # Seed 10 Warehouses (Enterprise scale)
    warehouse_data = [
        ("Main Distribution Center", "New York, NY", 50000),
        ("West Coast Hub", "Los Angeles, CA", 45000),
        ("Midwest Fulfillment", "Chicago, IL", 40000),
        ("Southeast Distribution", "Atlanta, GA", 35000),
        ("Texas Regional Center", "Dallas, TX", 38000),
        ("Pacific Northwest Hub", "Seattle, WA", 32000),
        ("Northeast Fulfillment", "Boston, MA", 28000),
        ("Mountain West Center", "Denver, CO", 30000),
        ("Florida Distribution", "Miami, FL", 33000),
        ("Central Plains Hub", "Kansas City, MO", 25000),
    ]
    
    warehouses = []
    for name, location, capacity in warehouse_data:
        warehouse = Warehouse(name=name, location=location, capacity=capacity)
        db.add(warehouse)
        warehouses.append(warehouse)
    db.commit()
    
    # Seed 100+ Products (Enterprise catalog)
    product_categories = {
        "Electronics": [
            ("Laptop Pro 15\"", 899.99), ("Desktop Workstation", 1299.99), ("Tablet 10\"", 399.99),
            ("Smartphone X", 699.99), ("Wireless Earbuds", 149.99), ("Smart Watch", 349.99),
            ("4K Monitor 32\"", 549.99), ("Mechanical Keyboard", 129.99), ("Gaming Mouse", 79.99),
            ("USB-C Hub", 49.99), ("External SSD 1TB", 149.99), ("Webcam HD", 89.99),
            ("Wireless Charger", 39.99), ("HDMI Cable 6ft", 15.99), ("Laptop Stand", 45.99)
        ],
        "Office Supplies": [
            ("Office Chair Ergonomic", 299.99), ("Standing Desk", 599.99), ("File Cabinet", 179.99),
            ("Desk Organizer", 24.99), ("Whiteboard 4x6", 89.99), ("Paper Shredder", 119.99),
            ("Label Printer", 199.99), ("Paper Ream 500ct", 12.99), ("Pens Blue 50pk", 8.99),
            ("Notebooks 5pk", 14.99), ("Stapler Heavy Duty", 29.99), ("Tape Dispenser", 9.99)
        ],
        "Furniture": [
            ("Conference Table 8ft", 899.99), ("Executive Desk", 749.99), ("Bookshelf 6ft", 249.99),
            ("Filing Cabinet 4-Drawer", 329.99), ("Reception Desk", 1199.99), ("Lounge Chair", 449.99),
            ("Coffee Table", 199.99), ("Storage Cabinet", 279.99), ("Meeting Chair Set-4", 599.99)
        ],
        "Warehouse Equipment": [
            ("Forklift Electric", 24999.99), ("Pallet Jack", 499.99), ("Hand Truck", 89.99),
            ("Shelving Unit 8ft", 349.99), ("Safety Barrier", 129.99), ("Wire Basket Cart", 179.99),
            ("Platform Ladder", 249.99), ("Loading Ramp", 899.99), ("Dock Plate", 699.99)
        ],
        "Safety Equipment": [
            ("Hard Hat Yellow", 19.99), ("Safety Vest Hi-Vis", 12.99), ("Safety Glasses", 8.99),
            ("Work Gloves 12pk", 24.99), ("First Aid Kit", 49.99), ("Fire Extinguisher", 79.99),
            ("Emergency Exit Sign", 34.99), ("Spill Kit", 149.99), ("Ear Protection", 15.99)
        ]
    }
    
    inventory_items = []
    sku_counter = 1000
    for category, products in product_categories.items():
        for product_name, price in products:
            sku = f"{category[:3].upper()}-{sku_counter}"
            sku_counter += 1
            
            # Distribute inventory across multiple warehouses
            for warehouse in random.sample(warehouses, random.randint(3, 7)):
                quantity = random.randint(50, 500) if price < 500 else random.randint(10, 100)
                inventory = Inventory(
                    name=product_name,
                    sku=sku,
                    quantity=quantity,
                    warehouse_id=warehouse.id,
                    unit_price=price,
                    reorder_point=random.randint(20, 50)
                )
                db.add(inventory)
                inventory_items.append(inventory)
    
    db.commit()
    
    # Seed 1200 Orders (Enterprise volume - 100/month for a year)
    statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    status_weights = [0.15, 0.25, 0.20, 0.35, 0.05]  # More delivered orders
    
    companies = [
        "Acme Corp", "TechFlow Inc", "Global Dynamics", "Summit Enterprises",
        "Pinnacle Solutions", "Nexus Industries", "Vertex Systems", "Apex Trading",
        "Horizon Group", "Catalyst Partners", "Synergy LLC", "Prime Logistics",
        "Fusion Co", "Quantum Industries", "Stellar Corp", "Vanguard Inc"
    ]
    
    first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
                   "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
                  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas"]
    
    cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
              "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
              "Fort Worth", "Columbus", "San Francisco", "Charlotte", "Seattle", "Denver"]
    
    for i in range(1200):
        # Mix of B2B and B2C orders
        if random.random() < 0.6:  # 60% B2B
            customer_name = f"{random.choice(companies)} - {random.choice(first_names)} {random.choice(last_names)}"
            amount = random.uniform(500, 25000)  # Larger B2B orders
        else:  # 40% B2C
            customer_name = f"{random.choice(first_names)} {random.choice(last_names)}"
            amount = random.uniform(50, 2000)  # Smaller B2C orders
        
        status = random.choices(statuses, weights=status_weights)[0]
        
        order = Order(
            customer_name=customer_name,
            customer_email=f"order{i}@{'company' if 'Corp' in customer_name or 'Inc' in customer_name else 'customer'}.com",
            status=status,
            total_amount=round(amount, 2),
            shipping_address=f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Maple', 'Park', 'Washington'])} St, {random.choice(cities)}, {random.choice(['CA', 'NY', 'TX', 'FL', 'IL'])} {random.randint(10000, 99999)}",
            tracking_number=f"WFY{random.randint(100000000, 999999999)}" if status in ["shipped", "delivered"] else None,
            created_at=datetime.now() - timedelta(days=random.randint(0, 365), hours=random.randint(0, 23))
        )
        db.add(order)
    
    db.commit()
    
    # Seed Sales History (for demand forecasting)
    from backend.models_lite import SalesHistory
    
    # Generate 90 days of sales history
    for days_ago in range(90):
        date = datetime.now() - timedelta(days=days_ago)
        
        # 5-15 sales records per day
        for _ in range(random.randint(5, 15)):
            product = random.choice(inventory_items)
            quantity = random.randint(1, 20)
            
            sale = SalesHistory(
                product_name=product.name,
                sku=product.sku,
                quantity_sold=quantity,
                sale_date=date,
                unit_price=product.unit_price,
                warehouse_id=product.warehouse_id
            )
            db.add(sale)
    
    db.commit()
    
    # Seed Anomalies (quality/security issues)
    from backend.models_lite import Anomaly
    
    anomaly_types = [
        ("Temperature Spike", "critical", "Warehouse temperature exceeded 85°F"),
        ("Inventory Discrepancy", "high", "Physical count mismatch detected"),
        ("Unauthorized Access", "critical", "Access attempt outside business hours"),
        ("Equipment Malfunction", "medium", "Forklift safety sensor triggered"),
        ("Low Stock Alert", "low", "Inventory below reorder point"),
        ("Shipping Delay", "medium", "Carrier delay reported"),
        ("Quality Issue", "high", "Damaged goods reported in receiving"),
        ("Power Fluctuation", "low", "Brief power interruption detected")
    ]
    
    for i in range(50):
        anom_type, severity, description_template = random.choice(anomaly_types)
        warehouse = random.choice(warehouses)
        
        anomaly = Anomaly(
            type=anom_type,
            severity=severity,
            description=f"{description_template} at {warehouse.name}",
            warehouse_id=warehouse.id,
            detected_at=datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23)),
            resolved=random.random() < 0.7  # 70% resolved
        )
        db.add(anomaly)
    
    db.commit()
    
    orders_count = db.query(Order).count()
    inventory_count = db.query(Inventory).count()
    warehouses_count = db.query(Warehouse).count()
    sales_count = db.query(SalesHistory).count()
    anomalies_count = db.query(Anomaly).count()
    
    return {
        "message": "Enterprise database seeded successfully!",
        "data": {
            "orders": orders_count,
            "inventory_items": inventory_count,
            "warehouses": warehouses_count,
            "sales_history_records": sales_count,
            "anomalies": anomalies_count
        }
    }
