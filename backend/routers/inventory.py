"""
Inventory management router for CRUD operations on warehouse inventory.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import Inventory, Warehouse, User
from schemas import InventoryCreate, InventoryUpdate, InventoryResponse
from auth import get_current_active_user, require_role

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

@router.post("/", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_item(
    item: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Create a new inventory item"""
    # Verify warehouse exists
    warehouse = db.query(Warehouse).filter(Warehouse.id == item.warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    # Check if SKU already exists in this warehouse
    existing = db.query(Inventory).filter(
        Inventory.sku == item.sku,
        Inventory.warehouse_id == item.warehouse_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"SKU {item.sku} already exists in warehouse {warehouse.name}"
        )
    
    db_item = Inventory(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item

@router.get("/", response_model=List[InventoryResponse])
def get_inventory(
    warehouse_id: Optional[int] = Query(None),
    sku: Optional[str] = Query(None),
    low_stock: bool = Query(False, description="Filter items below reorder point"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get inventory items with optional filters"""
    query = db.query(Inventory)
    
    if warehouse_id:
        query = query.filter(Inventory.warehouse_id == warehouse_id)
    
    if sku:
        query = query.filter(Inventory.sku.ilike(f"%{sku}%"))
    
    if low_stock:
        query = query.filter(Inventory.quantity <= Inventory.reorder_point)
    
    items = query.offset(skip).limit(limit).all()
    return items

@router.get("/{item_id}", response_model=InventoryResponse)
def get_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific inventory item"""
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@router.put("/{item_id}", response_model=InventoryResponse)
def update_inventory_item(
    item_id: int,
    item_update: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Update an inventory item"""
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Delete an inventory item"""
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    db.delete(item)
    db.commit()
    return None

@router.get("/warehouse/{warehouse_id}/summary")
def get_warehouse_inventory_summary(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get inventory summary for a warehouse"""
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    items = db.query(Inventory).filter(Inventory.warehouse_id == warehouse_id).all()
    
    total_items = len(items)
    total_quantity = sum(item.quantity for item in items)
    low_stock_items = sum(1 for item in items if item.quantity <= item.reorder_point)
    total_value = sum(item.quantity * (item.unit_price or 0) for item in items)
    
    return {
        "warehouse_id": warehouse_id,
        "warehouse_name": warehouse.name,
        "total_items": total_items,
        "total_quantity": total_quantity,
        "low_stock_items": low_stock_items,
        "total_value": total_value
    }
