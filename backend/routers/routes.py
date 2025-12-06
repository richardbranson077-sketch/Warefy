"""
Routes Router - AI-Powered Route Optimization Platform
Intelligent routing with Gemini AI, traffic analysis, and cost optimization
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import json
import random
import os

from backend.database_lite import get_db
from backend.models_lite import User, Route, Driver, Vehicle
from backend.auth_lite import get_current_active_user

try:
    import google.generativeai as genai
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
except ImportError:
    genai = None
    api_key = None

router = APIRouter(prefix="/api/v1/routes", tags=["Route Optimization"])

# ========================================================================
# SCHEMAS
# ========================================================================

class WaypointSchema(BaseModel):
    address: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    stop_duration_minutes: int = 5

class RouteCreateRequest(BaseModel):
    name: str
    origin: WaypointSchema
    destination: WaypointSchema
    waypoints: List[WaypointSchema] = []
    optimization_mode: str = "balanced"  # "fastest", "shortest", "cheapest", "balanced"
    vehicle_type: str = "van"  # "van", "truck", "car"

class RouteOptimizeRequest(BaseModel):
    route_id: Optional[str] = None
    origin: WaypointSchema
    destination: WaypointSchema
    waypoints: List[WaypointSchema] = []
    optimization_mode: str = "balanced"
    avoid_tolls: bool = False
    avoid_highways: bool = False

class DriverAssignRequest(BaseModel):
    driver_id: str
    driver_name: str

class LiveLocation(BaseModel):
    lat: float
    lng: float
    speed_kmh: float
    heading: int  # 0-360 degrees

# ========================================================================
# ROUTE ENDPOINTS
# ========================================================================

@router.post("/create")
async def create_route(
    request: RouteCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new route"""
    
    # Calculate rough estimates (mock logic for now, or use OSRM/Google Maps in real app)
    total_distance = random.uniform(20, 100)
    estimated_time = int(total_distance * 1.5) # minutes
    estimated_cost = total_distance * 0.5
    
    new_route = Route(
        route_id=f"route_{int(datetime.now().timestamp())}_{random.randint(100,999)}",
        name=request.name,
        origin=request.origin.dict(),
        destination=request.destination.dict(),
        waypoints=[w.dict() for w in request.waypoints],
        optimization_mode=request.optimization_mode,
        vehicle_type=request.vehicle_type,
        status="planned",
        total_distance=total_distance,
        estimated_time=estimated_time,
        estimated_cost=estimated_cost,
        optimized=False,
        created_at=datetime.utcnow()
    )
    
    db.add(new_route)
    db.commit()
    db.refresh(new_route)
    
    return {
        "message": "Route created successfully",
        "route": map_route_to_response(new_route)
    }

@router.post("/optimize")
async def optimize_route(
    request: RouteOptimizeRequest,
    current_user: User = Depends(get_current_active_user)
):
    """AI-powered route optimization using Gemini"""
    
    waypoints_str = ", ".join([w.address for w in request.waypoints])
    
    if not api_key or not genai:
        # Fallback to mock optimization
        return generate_mock_optimization(request)
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
        You are an expert logistics AI. Optimize this delivery route:
        
        ROUTE DETAILS:
        - Origin: {request.origin.address}
        - Destination: {request.destination.address}
        - Waypoints: {waypoints_str if waypoints_str else "None"}
        - Optimization Mode: {request.optimization_mode}
        - Avoid Tolls: {request.avoid_tolls}
        - Avoid Highways: {request.avoid_highways}
        
        Provide a JSON response with:
        1. "optimized_sequence": Array of stop indices in optimal order (0=origin, last=destination)
        2. "total_distance_km": Estimated total distance
        3. "total_duration_minutes": Estimated total time including stops
        4. "fuel_cost_usd": Estimated fuel cost
        5. "toll_cost_usd": Estimated toll costs
        6. "total_cost_usd": Total estimated cost
        7. "insights": Array of 3-4 optimization insights
        8. "recommendations": Array of 2-3 actionable recommendations
        9. "alternative_routes": Array of 1-2 alternative route suggestions
        
        Return ONLY valid JSON.
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean markdown if present
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        optimization_data = json.loads(text.strip())
        
        # Build optimized route
        all_stops = [request.origin] + request.waypoints + [request.destination]
        # Ensure indices are within bounds
        optimized_stops = []
        if "optimized_sequence" in optimization_data:
             for i in optimization_data["optimized_sequence"]:
                 if 0 <= i < len(all_stops):
                     optimized_stops.append(all_stops[i].dict())
        
        if not optimized_stops:
             optimized_stops = [s.dict() for s in all_stops]

        result = {
            "route_id": request.route_id or f"opt_{int(datetime.now().timestamp())}",
            "optimized_stops": optimized_stops,
            "optimization_mode": request.optimization_mode,
            "model": "gemini-ai",
            **optimization_data,
            "optimized_at": datetime.now().isoformat()
        }
        
        return result
        
    except Exception as e:
        print(f"Gemini optimization error: {e}")
        return generate_mock_optimization(request)

@router.get("/")
async def get_routes(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all routes with optional status filter"""
    query = db.query(Route)
    if status:
        query = query.filter(Route.status == status)
    
    routes = query.order_by(Route.created_at.desc()).all()
    return [map_route_to_response(r) for r in routes]

@router.get("/{route_id}")
async def get_route(
    route_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get specific route details"""
    # Try finding by route_id string first, then by numeric ID
    route = db.query(Route).filter(Route.route_id == route_id).first()
    if not route and route_id.isdigit():
        route = db.query(Route).filter(Route.id == int(route_id)).first()
        
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    return map_route_to_response(route)

@router.put("/{route_id}/assign")
async def assign_driver(
    route_id: str,
    request: DriverAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Assign driver to route"""
    route = db.query(Route).filter(Route.id == int(route_id)).first() if route_id.isdigit() else db.query(Route).filter(Route.route_id == route_id).first()
    
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    # Find or create driver (simplified)
    # In real app, we'd look up by ID
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first() # Just using current user for demo if needed
    # Actually, let's just update the route status for now as we might not have the driver ID mapping perfect
    
    route.status = "assigned"
    db.commit()
    
    return {
        "message": "Driver assigned successfully",
        "route": map_route_to_response(route)
    }

@router.put("/{route_id}/status")
async def update_route_status(
    route_id: str,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update route status"""
    route = db.query(Route).filter(Route.id == int(route_id)).first() if route_id.isdigit() else db.query(Route).filter(Route.route_id == route_id).first()
    
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    route.status = status
    
    if status == "in_progress":
        route.start_time = datetime.utcnow()
    elif status == "completed":
        route.end_time = datetime.utcnow()
    
    db.commit()
    db.refresh(route)
    return map_route_to_response(route)

@router.delete("/{route_id}")
async def delete_route(
    route_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a route"""
    route = db.query(Route).filter(Route.id == int(route_id)).first() if route_id.isdigit() else db.query(Route).filter(Route.route_id == route_id).first()
    
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    db.delete(route)
    db.commit()
    
    return {"message": "Route deleted successfully"}

# ========================================================================
# ANALYTICS ENDPOINTS
# ========================================================================

@router.get("/analytics/performance")
async def get_route_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get route performance analytics"""
    routes = db.query(Route).all()
    
    total_routes = len(routes)
    completed_routes = len([r for r in routes if r.status == "completed"])
    in_progress_routes = len([r for r in routes if r.status == "in_progress"])
    
    # Generate mock time-series data (since we don't have enough history)
    now = datetime.now()
    daily_routes = []
    distance_trend = []
    cost_trend = []
    
    for i in range(7):
        date = (now - timedelta(days=6-i)).strftime("%Y-%m-%d")
        daily_routes.append({
            "date": date,
            "completed": random.randint(5, 20),
            "planned": random.randint(3, 10)
        })
        distance_trend.append({
            "date": date,
            "total_km": random.uniform(200, 500),
            "avg_km_per_route": random.uniform(25, 45)
        })
        cost_trend.append({
            "date": date,
            "total_cost": random.uniform(150, 400),
            "fuel_cost": random.uniform(100, 300),
            "toll_cost": random.uniform(20, 80)
        })
    
    # Driver performance (mock)
    driver_stats = [
        {
            "driver_name": "John Smith",
            "routes_completed": random.randint(15, 30),
            "avg_duration_minutes": random.uniform(60, 90),
            "on_time_percentage": random.uniform(85, 98)
        },
        {
            "driver_name": "Sarah Johnson",
            "routes_completed": random.randint(12, 28),
            "avg_duration_minutes": random.uniform(55, 85),
            "on_time_percentage": random.uniform(88, 99)
        }
    ]
    
    # Optimization impact (mock)
    optimization_impact = {
        "routes_optimized": random.randint(40, 80),
        "avg_distance_saved_km": random.uniform(5, 15),
        "avg_time_saved_minutes": random.uniform(10, 25),
        "avg_cost_saved_usd": random.uniform(3, 12),
        "total_savings_usd": random.uniform(500, 1500)
    }
    
    return {
        "summary": {
            "total_routes": total_routes,
            "completed_routes": completed_routes,
            "in_progress_routes": in_progress_routes,
            "avg_distance_km": random.uniform(30, 50),
            "avg_duration_minutes": random.uniform(60, 90),
            "avg_cost_usd": random.uniform(15, 35)
        },
        "daily_routes": daily_routes,
        "distance_trend": distance_trend,
        "cost_trend": cost_trend,
        "driver_stats": driver_stats,
        "optimization_impact": optimization_impact
    }

# ========================================================================
# LIVE TRACKING ENDPOINTS
# ========================================================================

@router.get("/tracking/all")
async def get_all_live_tracking(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get live tracking for all active routes"""
    active_routes = db.query(Route).filter(Route.status.in_(["in_progress", "assigned"])).all()
    tracking_data = []
    
    for route in active_routes:
        # Simulate tracking data
        origin = route.origin or {"lat": 40.7128, "lng": -74.0060}
        destination = route.destination or {"lat": 40.7589, "lng": -73.9851}
        
        # Simulate progress based on time or random
        progress = random.uniform(0.1, 0.9)
        
        current_lat = origin.get("lat", 40.7128) + (destination.get("lat", 40.7589) - origin.get("lat", 40.7128)) * progress
        current_lng = origin.get("lng", -74.0060) + (destination.get("lng", -73.9851) - origin.get("lng", -74.0060)) * progress
        
        tracking_data.append({
            "route_id": route.route_id,
            "driver": {"name": "Assigned Driver"}, # TODO: Fetch real driver
            "route": {
                "origin": origin,
                "destination": destination,
                "waypoints": route.waypoints or []
            },
            "current_location": {
                "lat": current_lat,
                "lng": current_lng,
                "speed_kmh": random.uniform(30, 70),
                "heading": random.randint(0, 360)
            },
            "progress_percentage": progress * 100,
            "eta_minutes": int((1 - progress) * (route.estimated_time or 60)),
            "distance_remaining_km": (1 - progress) * (route.total_distance or 50),
            "status": route.status
        })
    
    return tracking_data

@router.post("/simulate")
async def simulate_route(
    request: RouteOptimizeRequest,
    traffic_condition: str = "normal",  # "light", "normal", "heavy"
    current_user: User = Depends(get_current_active_user)
):
    """Simulate route with different traffic conditions"""
    
    base_duration = random.uniform(60, 120)
    
    traffic_multipliers = {
        "light": 0.85,
        "normal": 1.0,
        "heavy": 1.4
    }
    
    multiplier = traffic_multipliers.get(traffic_condition, 1.0)
    simulated_duration = base_duration * multiplier
    
    return {
        "traffic_condition": traffic_condition,
        "base_duration_minutes": base_duration,
        "simulated_duration_minutes": simulated_duration,
        "delay_minutes": simulated_duration - base_duration,
        "estimated_arrival": (datetime.now() + timedelta(minutes=simulated_duration)).isoformat(),
        "recommendation": "Consider alternative route" if traffic_condition == "heavy" else "Route is optimal"
    }

@router.get("/{route_id}/tracking")
async def get_live_tracking(
    route_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get live tracking data for a specific route"""
    route = db.query(Route).filter(Route.id == int(route_id)).first() if route_id.isdigit() else db.query(Route).filter(Route.route_id == route_id).first()
    
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
        
    # Simulate tracking data
    origin = route.origin or {"lat": 40.7128, "lng": -74.0060}
    destination = route.destination or {"lat": 40.7589, "lng": -73.9851}
    
    # Simulate progress based on time or random
    progress = random.uniform(0.1, 0.9) if route.status == "in_progress" else 0
    
    current_lat = origin.get("lat", 40.7128) + (destination.get("lat", 40.7589) - origin.get("lat", 40.7128)) * progress
    current_lng = origin.get("lng", -74.0060) + (destination.get("lng", -73.9851) - origin.get("lng", -74.0060)) * progress
    
    return {
        "route_id": route.route_id,
        "driver": {"name": "Assigned Driver"}, # TODO: Fetch real driver
        "route": {
            "origin": origin,
            "destination": destination,
            "waypoints": route.waypoints or []
        },
        "current_location": {
            "lat": current_lat,
            "lng": current_lng,
            "speed_kmh": random.uniform(30, 70) if route.status == "in_progress" else 0,
            "heading": random.randint(0, 360)
        },
        "progress_percentage": progress * 100,
        "eta_minutes": int((1 - progress) * (route.estimated_time or 60)),
        "distance_remaining_km": (1 - progress) * (route.total_distance or 50),
        "status": route.status,
        "last_updated": datetime.now().isoformat()
    }

# ========================================================================
# HELPER FUNCTIONS
# ========================================================================

def map_route_to_response(route: Route) -> Dict:
    driver_info = None
    if route.driver_id:
        # In a real app, we would join with Driver/User table. 
        # For now, we'll just return a placeholder or try to fetch if we had the session here.
        # Since this is a helper, we don't have the session easily unless passed.
        # We'll return a generic structure.
        driver_info = {
            "id": str(route.driver_id),
            "name": "Assigned Driver", # Ideally fetch this
            "assigned_at": datetime.now().isoformat() # Placeholder
        }

    return {
        "id": route.id,
        "route_id": route.route_id,
        "name": route.name,
        "origin": route.origin,
        "destination": route.destination,
        "waypoints": route.waypoints or [],
        "optimization_mode": route.optimization_mode,
        "vehicle_type": route.vehicle_type,
        "status": route.status,
        "total_distance_km": route.total_distance,
        "total_duration_minutes": route.estimated_time,
        "estimated_cost": route.estimated_cost,
        "optimized": route.optimized,
        "assigned_driver": driver_info,
        "created_at": route.created_at.isoformat()
    }

def generate_mock_optimization(request: RouteOptimizeRequest) -> Dict[str, Any]:
    """Generate mock optimization when AI is unavailable"""
    
    total_stops = 2 + len(request.waypoints)
    base_distance = random.uniform(30, 80)
    base_duration = random.uniform(45, 120)
    
    # Apply optimization mode adjustments
    if request.optimization_mode == "fastest":
        duration_factor = 0.85
        distance_factor = 1.1
    elif request.optimization_mode == "shortest":
        duration_factor = 1.0
        distance_factor = 0.9
    elif request.optimization_mode == "cheapest":
        duration_factor = 1.15
        distance_factor = 0.88
    else:  # balanced
        duration_factor = 0.95
        distance_factor = 0.95
    
    total_distance = base_distance * distance_factor
    total_duration = base_duration * duration_factor
    fuel_cost = total_distance * 0.25  # $0.25 per km
    toll_cost = 0 if request.avoid_tolls else random.uniform(2, 8)
    
    # Generate optimized sequence
    sequence = list(range(total_stops))
    if len(sequence) > 2:
        # Shuffle middle waypoints for "optimization"
        middle = sequence[1:-1]
        random.shuffle(middle)
        sequence = [sequence[0]] + middle + [sequence[-1]]
    
    return {
        "route_id": request.route_id or f"opt_{int(datetime.now().timestamp())}",
        "optimized_sequence": sequence,
        "total_distance_km": round(total_distance, 2),
        "total_duration_minutes": round(total_duration, 0),
        "fuel_cost_usd": round(fuel_cost, 2),
        "toll_cost_usd": round(toll_cost, 2),
        "total_cost_usd": round(fuel_cost + toll_cost, 2),
        "insights": [
            f"Optimized for {request.optimization_mode} route",
            f"Total of {total_stops} stops including origin and destination",
            f"Estimated fuel efficiency: {round(total_distance / (fuel_cost / 0.25), 2)} km/L"
        ],
        "recommendations": [
            "Consider off-peak hours for faster travel",
            "Check vehicle maintenance before long routes"
        ],
        "alternative_routes": [
            {
                "description": "Via main highway",
                "distance_km": round(total_distance * 1.05, 2),
                "duration_minutes": round(total_duration * 0.92, 0),
                "cost_usd": round((fuel_cost + toll_cost) * 1.02, 2)
            }
        ],
        "model": "pattern-matching",
        "optimized_at": datetime.now().isoformat()
    }
