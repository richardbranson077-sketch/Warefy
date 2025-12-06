"""
Inventory management router for CRUD operations on warehouse inventory.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.database_lite import get_db
from backend.models_lite import Inventory, Warehouse, User, InventoryLog
from backend.schemas import InventoryCreate, InventoryUpdate, InventoryResponse
from backend.auth_lite import get_current_active_user, require_role
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])

class StockAdjustment(BaseModel):
    change_amount: int
    reason: str

class InventoryLogResponse(BaseModel):
    id: int
    inventory_id: int
    change_amount: int
    reason: str
    user_id: int
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

@router.post("", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
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
    
    # Log creation
    log = InventoryLog(
        inventory_id=db_item.id,
        change_amount=db_item.quantity,
        reason="Initial stock",
        user_id=current_user.id
    )
    db.add(log)
    db.commit()
    
    return db_item

@router.get("", response_model=List[InventoryResponse])
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
    
    # Check if quantity changed to log it
    old_quantity = item.quantity
    
    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    
    if "quantity" in update_data and update_data["quantity"] != old_quantity:
        log = InventoryLog(
            inventory_id=item.id,
            change_amount=update_data["quantity"] - old_quantity,
            reason="Manual update",
            user_id=current_user.id
        )
        db.add(log)
        db.commit()
        
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
    
    # Delete logs first (cascade usually handles this but good to be safe)
    db.query(InventoryLog).filter(InventoryLog.inventory_id == item_id).delete()
    
    db.delete(item)
    db.commit()
    return None

@router.post("/{item_id}/adjust", response_model=InventoryResponse)
def adjust_stock(
    item_id: int,
    adjustment: StockAdjustment,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Adjust stock level for an item"""
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    item.quantity += adjustment.change_amount
    if item.quantity < 0:
        raise HTTPException(status_code=400, detail="Cannot reduce stock below zero")
        
    item.last_restocked = datetime.utcnow()
    
    log = InventoryLog(
        inventory_id=item.id,
        change_amount=adjustment.change_amount,
        reason=adjustment.reason,
        user_id=current_user.id
    )
    
    db.add(log)
    db.commit()
    db.refresh(item)
    
    return item

@router.get("/{item_id}/history", response_model=List[InventoryLogResponse])
def get_inventory_history(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get stock history for an item"""
    logs = db.query(InventoryLog).filter(InventoryLog.inventory_id == item_id).order_by(InventoryLog.created_at.desc()).all()
    
    # Enrich with user names
    result = []
    for log in logs:
        user = db.query(User).filter(User.id == log.user_id).first()
        result.append({
            "id": log.id,
            "inventory_id": log.inventory_id,
            "change_amount": log.change_amount,
            "reason": log.reason,
            "user_id": log.user_id,
            "created_at": log.created_at,
            "user_name": user.username if user else "Unknown"
        })
        
    return result

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
