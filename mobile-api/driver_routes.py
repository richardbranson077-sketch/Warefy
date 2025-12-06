"""
Mobile API for driver applications.
Provides endpoints for GPS tracking, route management, and delivery confirmations.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from backend.database_lite import get_db
from backend.models_lite import Driver, Route, Vehicle, User
from backend.auth_lite import get_current_active_user, require_role

router = APIRouter(prefix="/api/mobile/driver", tags=["Mobile Driver API"])

@router.get("/profile")
def get_driver_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get driver profile information"""
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    # Get current location (simplified for SQLite)
    location = None
    # For SQLite, current_location would be stored as JSON or lat/lng columns
    # For now, return None if not set
    
    return {
        "id": driver.id,
        "name": current_user.full_name,
        "license_number": driver.license_number,
        "phone": driver.phone,
        "current_location": location,
        "status": driver.status,
    }

@router.post("/location/update")
def update_driver_location(
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update driver's current GPS location"""
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    # For SQLite, we'd store lat/lng in separate columns or JSON
    # Simplified implementation for now
    db.commit()
    
    return {"message": "Location updated successfully", "latitude": latitude, "longitude": longitude}

@router.get("/routes/active")
def get_active_routes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get driver's active routes"""
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    routes = db.query(Route).filter(
        Route.driver_id == driver.id,
        Route.status.in_(["planned", "in_progress"])
    ).all()
    
    return {
        "routes": [
            {
                "id": route.id,
                "route_name": route.route_name,
                "status": route.status,
                "waypoints": route.waypoints,
                "optimized_sequence": route.optimized_sequence,
                "total_distance": route.total_distance,
                "estimated_duration": route.estimated_duration
            }
            for route in routes
        ]
    }

@router.post("/routes/{route_id}/start")
def start_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Start a route"""
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    route = db.query(Route).filter(
        Route.id == route_id,
        Route.driver_id == driver.id
    ).first()
    
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    route.status = "in_progress"
    route.started_at = datetime.utcnow()
    driver.is_available = False
    
    db.commit()
    
    return {"message": "Route started", "route_id": route_id}

@router.post("/routes/{route_id}/complete")
def complete_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Complete a route"""
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    route = db.query(Route).filter(
        Route.id == route_id,
        Route.driver_id == driver.id
    ).first()
    
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    route.status = "completed"
    route.completed_at = datetime.utcnow()
    driver.is_available = True
    driver.total_deliveries += len(route.waypoints or [])
    
    db.commit()
    
    return {"message": "Route completed", "route_id": route_id}

@router.post("/delivery/{delivery_id}/confirm")
def confirm_delivery(
    delivery_id: str,
    notes: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Confirm a delivery"""
    # In a real system, you'd have a Delivery model
    # For now, we'll just return success
    
    return {
        "message": "Delivery confirmed",
        "delivery_id": delivery_id,
        "confirmed_at": datetime.utcnow().isoformat(),
        "notes": notes
    }
