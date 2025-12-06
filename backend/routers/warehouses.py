"""
Warehouses Router - Warehouse Management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from backend.database_lite import get_db
from backend.models_lite import User, Warehouse, Inventory
from backend.auth_lite import get_current_active_user, require_role

router = APIRouter(prefix="/api/v1/warehouses", tags=["Warehouses"])

# ========================================================================
# SCHEMAS
# ========================================================================

class WarehouseBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    capacity: int

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = None

class WarehouseResponse(WarehouseBase):
    id: int
    manager_id: Optional[int] = None
    created_at: datetime
    utilization: Optional[float] = 0.0

    class Config:
        from_attributes = True

# ========================================================================
# ENDPOINTS
# ========================================================================

@router.get("/", response_model=List[WarehouseResponse])
def get_warehouses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all warehouses"""
    warehouses = db.query(Warehouse).offset(skip).limit(limit).all()
    
    # Calculate utilization for each warehouse
    results = []
    for wh in warehouses:
        # Count total items in this warehouse
        total_items = db.query(Inventory).filter(Inventory.warehouse_id == wh.id).count()
        # Simple utilization metric (items / capacity) - in real world would be volume based
        utilization = (total_items / wh.capacity) * 100 if wh.capacity > 0 else 0
        
        wh_dict = {
            "id": wh.id,
            "name": wh.name,
            "address": wh.address,
            "latitude": wh.latitude,
            "longitude": wh.longitude,
            "capacity": wh.capacity,
            "manager_id": wh.manager_id,
            "created_at": wh.created_at,
            "utilization": min(utilization, 100) # Cap at 100%
        }
        results.append(wh_dict)
        
    return results

@router.post("/", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
def create_warehouse(
    warehouse: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user) # Allow any user for demo
):
    """Create a new warehouse"""
    db_warehouse = Warehouse(
        name=warehouse.name,
        address=warehouse.address,
        latitude=warehouse.latitude,
        longitude=warehouse.longitude,
        capacity=warehouse.capacity,
        manager_id=current_user.id
    )
    
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    
    return {
        "id": db_warehouse.id,
        "name": db_warehouse.name,
        "address": db_warehouse.address,
        "latitude": db_warehouse.latitude,
        "longitude": db_warehouse.longitude,
        "capacity": db_warehouse.capacity,
        "manager_id": db_warehouse.manager_id,
        "created_at": db_warehouse.created_at,
        "utilization": 0.0
    }

@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific warehouse"""
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    total_items = db.query(Inventory).filter(Inventory.warehouse_id == warehouse.id).count()
    utilization = (total_items / warehouse.capacity) * 100 if warehouse.capacity > 0 else 0
    
    return {
        "id": warehouse.id,
        "name": warehouse.name,
        "address": warehouse.address,
        "latitude": warehouse.latitude,
        "longitude": warehouse.longitude,
        "capacity": warehouse.capacity,
        "manager_id": warehouse.manager_id,
        "created_at": warehouse.created_at,
        "utilization": min(utilization, 100)
    }

@router.put("/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(
    warehouse_id: int,
    update: WarehouseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update warehouse details"""
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    if update.name:
        warehouse.name = update.name
    if update.address:
        warehouse.address = update.address
    if update.latitude:
        warehouse.latitude = update.latitude
    if update.longitude:
        warehouse.longitude = update.longitude
    if update.capacity:
        warehouse.capacity = update.capacity
        
    db.commit()
    db.refresh(warehouse)
    
    total_items = db.query(Inventory).filter(Inventory.warehouse_id == warehouse.id).count()
    utilization = (total_items / warehouse.capacity) * 100 if warehouse.capacity > 0 else 0
    
    return {
        "id": warehouse.id,
        "name": warehouse.name,
        "address": warehouse.address,
        "latitude": warehouse.latitude,
        "longitude": warehouse.longitude,
        "capacity": warehouse.capacity,
        "manager_id": warehouse.manager_id,
        "created_at": warehouse.created_at,
        "utilization": min(utilization, 100)
    }

@router.delete("/{warehouse_id}")
def delete_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a warehouse"""
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    # Check if warehouse has inventory
    inventory_count = db.query(Inventory).filter(Inventory.warehouse_id == warehouse_id).count()
    if inventory_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete warehouse with existing inventory")
    
    db.delete(warehouse)
    db.commit()
    
    return {"message": "Warehouse deleted successfully"}
