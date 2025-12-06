
from sqlalchemy.orm import Session
from backend.database_lite import SessionLocal, engine
from backend.models_lite import SalesHistory, Inventory, Anomaly
from datetime import datetime, timedelta
import random

def seed_anomalies():
    db = SessionLocal()
    try:
        print("Seeding data for anomaly detection...")
        
        # 1. Trigger Inventory Anomalies
        # Get existing inventory or create if none
        inventory_items = db.query(Inventory).all()
        if not inventory_items:
            print("No inventory found. Creating mock inventory...")
            # Create some mock items
            items = [
                Inventory(sku="SKU001", product_name="Laptop X1", quantity=50, reorder_point=10, warehouse_id=1, unit_price=1200.0),
                Inventory(sku="SKU002", product_name="Mouse Wireless", quantity=100, reorder_point=20, warehouse_id=1, unit_price=25.0),
                Inventory(sku="SKU003", product_name="Keyboard Mech", quantity=30, reorder_point=5, warehouse_id=1, unit_price=80.0),
            ]
            db.add_all(items)
            db.commit()
            inventory_items = db.query(Inventory).all()
            
        # Update specific items to trigger anomalies
        # Stockout
        if len(inventory_items) > 0:
            item = inventory_items[0]
            item.quantity = 0
            print(f"Updated {item.sku} to quantity 0 (Stockout)")
            
        # Low Stock
        if len(inventory_items) > 1:
            item = inventory_items[1]
            item.quantity = 5  # Below reorder point of 20
            print(f"Updated {item.sku} to quantity 5 (Low Stock)")
            
        # 2. Trigger Demand Anomalies (Sales History)
        # Clear existing sales history for clean slate
        db.query(SalesHistory).delete()
        
        # Create a "normal" pattern
        sales = []
        base_date = datetime.utcnow() - timedelta(days=60)
        sku = "SKU003" # The keyboard
        
        for i in range(60):
            date = base_date + timedelta(days=i)
            # Normal daily sales: 10-20 units
            qty = random.randint(10, 20)
            
            # Spike (Anomaly) yesterday
            if i == 59:
                qty = 150 # Huge spike
                print(f"Created sales spike for {sku} on {date}: {qty} units")
                
            sales.append(SalesHistory(
                sku=sku,
                date=date,
                quantity=qty,
                revenue=qty * 80.0,
                warehouse_id=1
            ))
            
        db.add_all(sales)
        db.commit()
        print("Seeding complete!")
        
    except Exception as e:
        print(f"Error seeding anomalies: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_anomalies()
