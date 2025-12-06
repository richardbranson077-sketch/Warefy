"""
Quick script to seed the database with sample inventory for testing ML forecasting
"""
import sys
sys.path.insert(0, '/Users/hendrixjohn/warefy')

from backend.database_lite import SessionLocal
from backend.models_lite import Inventory, Warehouse
from backend.auth_lite import get_password_hash

def seed_inventory():
    db = SessionLocal()
    
    try:
        # Check if warehouse exists, create if not
        warehouse = db.query(Warehouse).first()
        if not warehouse:
            warehouse = Warehouse(
                name="Main Warehouse",
                address="123 Main St, New York, NY 10001",
                capacity=10000
            )
            db.add(warehouse)
            db.commit()
            db.refresh(warehouse)
            print(f"✅ Created warehouse: {warehouse.name}")
        
        # Sample products
        products = [
            {
                "sku": "LAPTOP-001",
                "product_name": "Dell XPS 15 Laptop",
                "category": "Electronics",
                "quantity": 45,
                "unit_price": 1299.99,
                "reorder_point": 10,
                "warehouse_id": warehouse.id
            },
            {
                "sku": "PHONE-002",
                "product_name": "iPhone 15 Pro",
                "category": "Electronics",
                "quantity": 120,
                "unit_price": 999.99,
                "reorder_point": 20,
                "warehouse_id": warehouse.id
            },
            {
                "sku": "DESK-003",
                "product_name": "Standing Desk Pro",
                "category": "Furniture",
                "quantity": 30,
                "unit_price": 599.99,
                "reorder_point": 5,
                "warehouse_id": warehouse.id
            },
            {
                "sku": "CHAIR-004",
                "product_name": "Ergonomic Office Chair",
                "category": "Furniture",
                "quantity": 65,
                "unit_price": 399.99,
                "reorder_point": 15,
                "warehouse_id": warehouse.id
            },
            {
                "sku": "MONITOR-005",
                "product_name": "4K Monitor 32 inch",
                "category": "Electronics",
                "quantity": 80,
                "unit_price": 549.99,
                "reorder_point": 12,
                "warehouse_id": warehouse.id
            }
        ]
        
        for product_data in products:
            # Check if product already exists
            existing = db.query(Inventory).filter(Inventory.sku == product_data["sku"]).first()
            if not existing:
                product = Inventory(**product_data)
                db.add(product)
                print(f"✅ Added product: {product_data['product_name']} ({product_data['sku']})")
            else:
                print(f"⏭️  Product already exists: {product_data['sku']}")
        
        db.commit()
        print(f"\n✅ Database seeded successfully with {len(products)} products!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_inventory()
