"""
Lightweight FastAPI application using SQLite
Simplified version without ML endpoints for demo purposes
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import sys

sys.path.append('/Users/hendrixjohn/warefy')

from backend.database_lite import get_db, init_db
from backend.models_lite import User, Warehouse, Inventory, SalesHistory, Anomaly
from backend.schemas import (
    InventoryResponse, WarehouseResponse, AnomalyResponse
)
from backend.auth import get_current_user, require_role

# Initialize database on startup
init_db()

app = FastAPI(
    title="Warefy API - Lightweight Demo",
    description="AI-Powered Supply Chain Optimizer (SQLite Demo)",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Welcome to Warefy API - Lightweight Demo",
        "version": "1.0.0",
        "database": "SQLite",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "SQLite"}

@app.get("/api/info")
def api_info():
    return {
        "application": "Warefy Supply Chain Optimizer",
        "mode": "Lightweight Demo",
        "database": "SQLite",
        "features": [
            "Inventory Management",
            "Warehouse Management",
            "Sales History",
            "Anomaly Detection (basic)"
        ],
        "note": "This is a lightweight demo without ML endpoints. Install full requirements for AI features."
    }

# Inventory endpoints
@app.get("/api/inventory", response_model=List[InventoryResponse])
def get_inventory(
    warehouse_id: int = None,
    sku: str = None,
    db: Session = Depends(get_db)
):
    """Get all inventory items with optional filtering"""
    query = db.query(Inventory)
    
    if warehouse_id:
        query = query.filter(Inventory.warehouse_id == warehouse_id)
    if sku:
        query = query.filter(Inventory.sku == sku)
    
    return query.all()

@app.get("/api/inventory/{item_id}", response_model=InventoryResponse)
def get_inventory_item(item_id: int, db: Session = Depends(get_db)):
    """Get a specific inventory item"""
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# Warehouse endpoints
@app.get("/api/warehouses", response_model=List[WarehouseResponse])
def get_warehouses(db: Session = Depends(get_db)):
    """Get all warehouses"""
    return db.query(Warehouse).all()

@app.get("/api/warehouses/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    """Get a specific warehouse"""
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse

# Anomalies endpoints
@app.get("/api/anomalies/recent", response_model=List[AnomalyResponse])
def get_recent_anomalies(limit: int = 50, db: Session = Depends(get_db)):
    """Get recent anomalies"""
    return db.query(Anomaly).order_by(Anomaly.detected_at.desc()).limit(limit).all()

# Sales history
@app.get("/api/demand/historical/{sku}")
def get_historical_sales(sku: str, db: Session = Depends(get_db)):
    """Get historical sales data for a SKU"""
    sales = db.query(SalesHistory).filter(SalesHistory.sku == sku).order_by(SalesHistory.date).all()
    
    return {
        "sku": sku,
        "total_records": len(sales),
        "sales_history": [
            {"date": s.date.isoformat(), "quantity": s.quantity, "revenue": s.revenue}
            for s in sales
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
