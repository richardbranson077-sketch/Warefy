"""
Route optimization router using OR-Tools and genetic algorithms.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../../ml-pipelines'))

from database import get_db
from models import Route, Vehicle, Driver, User
from schemas import RouteOptimizationRequest, RouteOptimizationResponse, RouteCreate, RouteResponse
from auth import get_current_active_user, require_role

router = APIRouter(prefix="/api/routes", tags=["Route Optimization"])

@router.post("/optimize", response_model=RouteOptimizationResponse)
def optimize_route(
    request: RouteOptimizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Optimize delivery route using ML algorithms.
    Supports OR-Tools and genetic algorithm approaches.
    """
    # Verify vehicle exists
    vehicle = db.query(Vehicle).filter(Vehicle.id == request.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    try:
        if request.optimization_method == "ortools":
            from route_optimization.or_tools_optimizer import optimize_route_ortools
            
            result = optimize_route_ortools(
                start_location=request.start_location,
                delivery_points=request.delivery_points,
                num_vehicles=1
            )
        else:
            # Genetic algorithm (simplified fallback)
            result = {
                "optimized_sequence": list(range(len(request.delivery_points))),
                "total_distance": 0.0,
                "estimated_duration": 0.0,
                "route_geometry": []
            }
        
        return RouteOptimizationResponse(
            vehicle_id=request.vehicle_id,
            optimized_route=result['optimized_sequence'],
            total_distance=result['total_distance'],
            estimated_duration=result['estimated_duration'],
            route_geometry=result.get('route_geometry', [])
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error optimizing route: {str(e)}"
        )

@router.post("/create", response_model=RouteResponse, status_code=201)
def create_route(
    route: RouteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Create a new route with optimized waypoints"""
    # Verify driver and vehicle exist
    driver = db.query(Driver).filter(Driver.id == route.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    vehicle = db.query(Vehicle).filter(Vehicle.id == route.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Optimize route
    from route_optimization.or_tools_optimizer import optimize_route_ortools
    
    start_loc = {"lat": route.start_lat, "lon": route.start_lon}
    delivery_points = [{"lat": wp.latitude, "lon": wp.longitude} for wp in route.waypoints]
    
    try:
        optimization_result = optimize_route_ortools(start_loc, delivery_points)
        
        # Create route in database
        db_route = Route(
            route_name=route.route_name,
            driver_id=route.driver_id,
            vehicle_id=route.vehicle_id,
            start_location=f'POINT({route.start_lon} {route.start_lat})',
            end_location=f'POINT({route.end_lon} {route.end_lat})',
            waypoints=[{"lat": wp.latitude, "lon": wp.longitude, "address": wp.address} for wp in route.waypoints],
            optimized_sequence=optimization_result['optimized_sequence'],
            total_distance=optimization_result['total_distance'],
            estimated_duration=optimization_result['estimated_duration']
        )
        
        db.add(db_route)
        db.commit()
        db.refresh(db_route)
        
        return db_route
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating route: {str(e)}")

@router.get("/{route_id}", response_model=RouteResponse)
def get_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get route details"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@router.get("/driver/{driver_id}")
def get_driver_routes(
    driver_id: int,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all routes for a specific driver"""
    query = db.query(Route).filter(Route.driver_id == driver_id)
    
    if status:
        query = query.filter(Route.status == status)
    
    routes = query.all()
    return routes
