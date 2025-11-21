from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database_lite import get_db
from ..models_lite import Warehouse, User
from ..auth_lite import get_current_active_user, require_role
from ..schemas import WarehouseCreate, WarehouseResponse, WarehouseUpdateLayout

router = APIRouter(prefix="/api/warehouses", tags=["Warehouses"])

@router.get("/", response_model=List[WarehouseResponse])
def list_warehouses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(Warehouse).all()

@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse

@router.post("/", response_model=WarehouseResponse)
def create_warehouse(
    payload: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    new_warehouse = Warehouse(
        name=payload.name,
        address=payload.address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        capacity=payload.capacity
    )
    db.add(new_warehouse)
    db.commit()
    db.refresh(new_warehouse)
    return new_warehouse

@router.patch("/{warehouse_id}/layout", response_model=WarehouseResponse)
def update_warehouse_layout(
    warehouse_id: int,
    payload: WarehouseUpdateLayout,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    warehouse.layout_config = payload.layout_config
    db.commit()
    db.refresh(warehouse)
    return warehouse
