"""
Lightweight FastAPI application using SQLite
Simplified version without ML endpoints for demo purposes
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database_lite import get_db, init_db
from backend.models_lite import User, Warehouse, Inventory, SalesHistory, Anomaly
from backend.schemas import (
    InventoryResponse, WarehouseResponse, AnomalyResponse
)
from backend.auth_lite import (
    get_current_user, 
    require_role, 
    verify_password, 
    create_access_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_active_user
)
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from backend.schemas import Token, UserResponse

# Initialize database on startup
init_db()

app = FastAPI(
    title="Warefy API - Lightweight Demo",
    description="AI-Powered Supply Chain Optimizer (SQLite Demo)",
    version="1.0.0"
)

from backend.routers import ai_command, users, notifications, orders, reports, integrations, warehouses_lite as warehouses
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(notifications.router)
app.include_router(orders.router)
app.include_router(reports.router)
app.include_router(integrations.router)
app.include_router(warehouses.router)
app.include_router(users.router)

# Health check endpoint for Render
@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "service": "warefy-backend"}


@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token"""
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

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
