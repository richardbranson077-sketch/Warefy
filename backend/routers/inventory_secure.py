"""
Inventory management router with comprehensive security and error handling
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from typing import List, Optional
import logging

from backend.database_lite import get_db
from backend.models_lite import Inventory, Warehouse, User
from backend.schemas import InventoryCreate, InventoryUpdate, InventoryResponse
from backend.auth_lite import get_current_active_user, require_role
from backend.security import (
    validate_pagination,
    validate_id,
    sanitize_output,
    handle_database_error,
    log_api_error,
    rate_limiter
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    item: InventoryCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """
    Create a new inventory item
    
    Requires: admin or manager role
    """
    try:
        # Rate limiting
        client_ip = request.client.host
        if not rate_limiter.is_allowed(f"create_inventory_{client_ip}"):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later."
            )
        
        # Validate warehouse exists
        warehouse = db.query(Warehouse).filter(Warehouse.id == item.warehouse_id).first()
        if not warehouse:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Warehouse with ID {item.warehouse_id} not found"
            )
        
        # Check if SKU already exists in this warehouse
        existing = db.query(Inventory).filter(
            Inventory.sku == item.sku,
            Inventory.warehouse_id == item.warehouse_id
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"SKU '{item.sku}' already exists in warehouse '{warehouse.name}'"
            )
        
        # Create inventory item
        db_item = Inventory(**item.dict())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        logger.info(f"Created inventory item: {db_item.sku} by user {current_user.id}")
        return sanitize_output(db_item)
        
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error creating inventory: {str(e)}")
        raise handle_database_error(e)
    except SQLAlchemyError as e:
        db.rollback()
        log_api_error(e, "/api/inventory", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        db.rollback()
        log_api_error(e, "/api/inventory", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.get("/", response_model=List[InventoryResponse])
async def get_inventory(
    warehouse_id: Optional[int] = Query(None, ge=1),
    sku: Optional[str] = Query(None, max_length=100),
    low_stock: bool = Query(False, description="Filter items below reorder point"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get inventory items with optional filters
    
    Query Parameters:
    - warehouse_id: Filter by warehouse
    - sku: Search by SKU (partial match)
    - low_stock: Show only items below reorder point
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return (1-1000)
    """
    try:
        # Validate pagination
        skip, limit = validate_pagination(skip, limit)
        
        # Build query
        query = db.query(Inventory)
        
        if warehouse_id:
            validate_id(warehouse_id, "Warehouse")
            query = query.filter(Inventory.warehouse_id == warehouse_id)
        
        if sku:
            # Sanitize SKU input to prevent SQL injection
            safe_sku = sku.replace("%", "\\%").replace("_", "\\_")
            query = query.filter(Inventory.sku.ilike(f"%{safe_sku}%"))
        
        if low_stock:
            query = query.filter(Inventory.quantity <= Inventory.reorder_point)
        
        # Execute query with pagination
        items = query.offset(skip).limit(limit).all()
        
        return [sanitize_output(item) for item in items]
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        log_api_error(e, "/api/inventory", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        log_api_error(e, "/api/inventory", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.get("/{item_id}", response_model=InventoryResponse)
async def get_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific inventory item by ID"""
    try:
        # Validate ID
        validate_id(item_id, "Inventory item")
        
        # Query database
        item = db.query(Inventory).filter(Inventory.id == item_id).first()
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inventory item with ID {item_id} not found"
            )
        
        return sanitize_output(item)
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        log_api_error(e, f"/api/inventory/{item_id}", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        log_api_error(e, f"/api/inventory/{item_id}", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.put("/{item_id}", response_model=InventoryResponse)
async def update_inventory_item(
    item_id: int,
    item_update: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """
    Update an inventory item
    
    Requires: admin or manager role
    """
    try:
        # Validate ID
        validate_id(item_id, "Inventory item")
        
        # Get existing item
        item = db.query(Inventory).filter(Inventory.id == item_id).first()
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inventory item with ID {item_id} not found"
            )
        
        # Update fields
        update_data = item_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)
        
        db.commit()
        db.refresh(item)
        
        logger.info(f"Updated inventory item {item_id} by user {current_user.id}")
        return sanitize_output(item)
        
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error updating inventory: {str(e)}")
        raise handle_database_error(e)
    except SQLAlchemyError as e:
        db.rollback()
        log_api_error(e, f"/api/inventory/{item_id}", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        db.rollback()
        log_api_error(e, f"/api/inventory/{item_id}", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """
    Delete an inventory item
    
    Requires: admin role
    """
    try:
        # Validate ID
        validate_id(item_id, "Inventory item")
        
        # Get item
        item = db.query(Inventory).filter(Inventory.id == item_id).first()
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inventory item with ID {item_id} not found"
            )
        
        # Delete item
        db.delete(item)
        db.commit()
        
        logger.info(f"Deleted inventory item {item_id} by user {current_user.id}")
        return None
        
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error deleting inventory: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete item. It may be referenced by other records."
        )
    except SQLAlchemyError as e:
        db.rollback()
        log_api_error(e, f"/api/inventory/{item_id}", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        db.rollback()
        log_api_error(e, f"/api/inventory/{item_id}", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.get("/warehouse/{warehouse_id}/summary")
async def get_warehouse_inventory_summary(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get inventory summary for a warehouse
    
    Returns:
    - Total number of items
    - Total quantity across all items
    - Number of low stock items
    - Total inventory value
    """
    try:
        # Validate ID
        validate_id(warehouse_id, "Warehouse")
        
        # Verify warehouse exists
        warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
        if not warehouse:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Warehouse with ID {warehouse_id} not found"
            )
        
        # Get all items for warehouse
        items = db.query(Inventory).filter(Inventory.warehouse_id == warehouse_id).all()
        
        # Calculate summary
        total_items = len(items)
        total_quantity = sum(item.quantity for item in items)
        low_stock_items = sum(1 for item in items if item.quantity <= item.reorder_point)
        total_value = sum(item.quantity * (item.unit_price or 0) for item in items)
        
        summary = {
            "warehouse_id": warehouse_id,
            "warehouse_name": warehouse.name,
            "total_items": total_items,
            "total_quantity": total_quantity,
            "low_stock_items": low_stock_items,
            "total_value": round(total_value, 2)
        }
        
        return sanitize_output(summary)
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        log_api_error(e, f"/api/inventory/warehouse/{warehouse_id}/summary", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except Exception as e:
        log_api_error(e, f"/api/inventory/warehouse/{warehouse_id}/summary", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )
