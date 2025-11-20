"""
Warehouse management router for CRUD operations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from geoalchemy2.shape import to_shape
from shapely.geometry import Point

from database import get_db
from models import Warehouse, User
from schemas import WarehouseCreate, WarehouseResponse
from auth import get_current_active_user, require_role

router = APIRouter(prefix="/api/warehouses", tags=["Warehouses"])

@router.post("/", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
def create_warehouse(
    warehouse: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Create a new warehouse"""
    # Check if code already exists
    existing = db.query(Warehouse).filter(Warehouse.code == warehouse.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Warehouse code {warehouse.code} already exists")
    
    # Create warehouse with PostGIS point
    warehouse_data = warehouse.dict(exclude={"latitude", "longitude"})
    db_warehouse = Warehouse(
        **warehouse_data,
        location=f'POINT({warehouse.longitude} {warehouse.latitude})'
    )
    
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    
    # Convert response
    response = WarehouseResponse.from_orm(db_warehouse)
    if db_warehouse.location:
        point = to_shape(db_warehouse.location)
        response.latitude = point.y
        response.longitude = point.x
    
    return response

@router.get("/", response_model=List[WarehouseResponse])
def get_warehouses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all warehouses"""
    warehouses = db.query(Warehouse).filter(Warehouse.is_active == True).offset(skip).limit(limit).all()
    
    result = []
    for wh in warehouses:
        response = WarehouseResponse.from_orm(wh)
        if wh.location:
            point = to_shape(wh.location)
            response.latitude = point.y
            response.longitude = point.x
        result.append(response)
    
    return result

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
    
    response = WarehouseResponse.from_orm(warehouse)
    if warehouse.location:
        point = to_shape(warehouse.location)
        response.latitude = point.y
        response.longitude = point.x
    
    return response
