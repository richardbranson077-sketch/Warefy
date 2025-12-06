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

@router.post("/all")
async def seed_database(db: Session = Depends(get_db)):
    """Seed the database with sample data"""
    
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
    
    # Seed Warehouses
    warehouses = [
        Warehouse(name="Main Warehouse", location="New York", capacity=10000),
        Warehouse(name="West Coast Hub", location="Los Angeles", capacity=8000),
        Warehouse(name="Midwest Center", location="Chicago", capacity=6000),
    ]
    db.add_all(warehouses)
    db.commit()
    
    # Seed Inventory
    products = [
        ("Laptop", "TECH-001", 50, 999.99),
        ("Wireless Mouse", "TECH-002", 200, 29.99),
        ("USB-C Cable", "TECH-003", 500, 12.99),
        ("Monitor 27\"", "TECH-004", 75, 349.99),
        ("Keyboard Mechanical", "TECH-005", 120, 89.99),
    ]
    
    for name, sku, qty, price in products:
        for warehouse in warehouses:
            inventory = Inventory(
                name=name,
                sku=sku,
                quantity=random.randint(10, qty),
                warehouse_id=warehouse.id,
                unit_price=price,
                reorder_point=random.randint(5, 20)
            )
            db.add(inventory)
    
    db.commit()
    
    # Seed Orders
    statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    customers = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Brown", "Charlie Wilson"]
    
    for i in range(50):
        order = Order(
            customer_name=random.choice(customers),
            customer_email=f"customer{i}@example.com",
            status=random.choice(statuses),
            total_amount=random.uniform(50, 5000),
            shipping_address=f"{random.randint(100, 9999)} Main St, City, ST {random.randint(10000, 99999)}",
            tracking_number=f"TRK{random.randint(100000, 999999)}",
            created_at=datetime.now() - timedelta(days=random.randint(0, 30))
        )
        db.add(order)
    
    db.commit()
    
    orders_count = db.query(Order).count()
    inventory_count = db.query(Inventory).count()
    warehouses_count = db.query(Warehouse).count()
    
    return {
        "message": "Database seeded successfully!",
        "data": {
            "orders": orders_count,
            "inventory_items": inventory_count,
            "warehouses": warehouses_count
        }
    }
