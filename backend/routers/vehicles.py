from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Vehicle, Driver
from schemas import VehicleCreate, VehicleResponse
from auth import get_current_active_user, require_role

router = APIRouter(prefix="/api/vehicles", tags=["Fleet Management"])

@router.get("/", response_model=List[VehicleResponse])
def get_all_vehicles(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get all vehicles"""
    vehicles = db.query(Vehicle).offset(skip).limit(limit).all()
    return vehicles

@router.post("/", response_model=VehicleResponse, status_code=201)
def create_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["admin", "manager"]))
):
    """Create a new vehicle"""
    db_vehicle = db.query(Vehicle).filter(Vehicle.vehicle_number == vehicle.vehicle_number).first()
    if db_vehicle:
        raise HTTPException(status_code=400, detail="Vehicle number already registered")
    
    # Create vehicle
    new_vehicle = Vehicle(
        vehicle_number=vehicle.vehicle_number,
        vehicle_type=vehicle.vehicle_type,
        capacity=vehicle.capacity,
        fuel_type=vehicle.fuel_type,
        driver_id=vehicle.driver_id
    )
    
    if vehicle.latitude and vehicle.longitude:
        new_vehicle.current_location = f'POINT({vehicle.longitude} {vehicle.latitude})'
    
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get vehicle details"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle
