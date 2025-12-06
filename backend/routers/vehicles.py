"""
Vehicles Router - AI-Powered Fleet Management Platform
Predictive maintenance, fuel optimization, and comprehensive vehicle analytics
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
from backend.models_lite import User, Vehicle, Driver
from backend.auth_lite import get_current_active_user

try:
    import google.generativeai as genai
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
except ImportError:
    genai = None
    api_key = None

router = APIRouter(prefix="/api/v1/vehicles", tags=["Fleet Management"])

# ========================================================================
# SCHEMAS
# ========================================================================

class VehicleCreate(BaseModel):
    vehicle_number: str
    vehicle_type: str  # "van", "truck", "car"
    make: str
    model: str
    year: int
    capacity_kg: float
    fuel_type: str  # "diesel", "gasoline", "electric", "hybrid"
    license_plate: str

class VehicleUpdate(BaseModel):
    status: Optional[str] = None
    current_mileage: Optional[float] = None
    location: Optional[str] = None

class DriverAssignment(BaseModel):
    driver_id: str
    driver_name: str

# Helper to map DB model to Frontend response format
def map_vehicle_to_response(v: Vehicle) -> Dict:
    return {
        "id": v.vehicle_id,
        "vehicle_number": v.vehicle_id,
        "vehicle_type": v.vehicle_type,
        "make": v.make or "Unknown",
        "model": v.model or "Unknown",
        "year": v.year or 2020,
        "capacity_kg": v.capacity,
        "fuel_type": v.fuel_type,
        "license_plate": v.license_plate or "N/A",
        "status": v.status,
        "current_mileage": v.mileage,
        "last_maintenance_date": v.last_maintenance.isoformat() if v.last_maintenance else None,
        "last_maintenance_mileage": v.last_maintenance_mileage,
        "assigned_driver": None, # TODO: Implement driver relationship if needed
        "health_score": v.health_score,
        "fuel_efficiency_kmpl": v.fuel_efficiency,
        "location": v.location_name or "Unknown",
        "created_at": v.created_at.isoformat()
    }

# ========================================================================
# VEHICLE ENDPOINTS
# ========================================================================

@router.post("/")
async def create_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new vehicle"""
    
    # Check if vehicle_number already exists
    existing = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle.vehicle_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle number already exists")

    new_vehicle = Vehicle(
        vehicle_id=vehicle.vehicle_number,
        vehicle_type=vehicle.vehicle_type,
        make=vehicle.make,
        model=vehicle.model,
        year=vehicle.year,
        capacity=vehicle.capacity_kg,
        fuel_type=vehicle.fuel_type,
        license_plate=vehicle.license_plate,
        status="available",
        mileage=0,
        last_maintenance=datetime.utcnow(),
        last_maintenance_mileage=0,
        health_score=100,
        fuel_efficiency=random.uniform(8, 15),
        location_name="Warehouse",
        created_at=datetime.utcnow()
    )
    
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    
    return {
        "message": "Vehicle created successfully",
        "vehicle": map_vehicle_to_response(new_vehicle)
    }

@router.get("/")
async def get_vehicles(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all vehicles with optional status filter"""
    
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    
    vehicles = query.all()
    return [map_vehicle_to_response(v) for v in vehicles]

@router.get("/{vehicle_id}")
async def get_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get specific vehicle details"""
    
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return map_vehicle_to_response(vehicle)

@router.put("/{vehicle_id}")
async def update_vehicle(
    vehicle_id: str,
    update: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update vehicle information"""
    
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    if update.status:
        vehicle.status = update.status
    if update.current_mileage is not None:
        vehicle.mileage = int(update.current_mileage)
    if update.location:
        vehicle.location_name = update.location
    
    db.commit()
    db.refresh(vehicle)
    return map_vehicle_to_response(vehicle)

@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a vehicle"""
    
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db.delete(vehicle)
    db.commit()
    
    return {"message": "Vehicle deleted successfully"}

@router.put("/{vehicle_id}/assign")
async def assign_driver(
    vehicle_id: str,
    assignment: DriverAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Assign driver to vehicle"""
    
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # In a real app, we would update a relationship. 
    # For now, we'll just update status as we don't have a full driver relationship in the simple model
    vehicle.status = "in_use"
    db.commit()
    db.refresh(vehicle)
    
    response = map_vehicle_to_response(vehicle)
    response["assigned_driver"] = {
        "id": assignment.driver_id,
        "name": assignment.driver_name,
        "assigned_at": datetime.now().isoformat()
    }
    
    return {
        "message": "Driver assigned successfully",
        "vehicle": response
    }

# ========================================================================
# AI PREDICTIVE MAINTENANCE
# ========================================================================

@router.get("/{vehicle_id}/maintenance/predict")
async def predict_maintenance(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """AI-powered predictive maintenance analysis"""
    
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    mileage_since_maintenance = vehicle.mileage - vehicle.last_maintenance_mileage
    days_since_maintenance = (datetime.now() - vehicle.last_maintenance).days if vehicle.last_maintenance else 0
    
    vehicle_dict = map_vehicle_to_response(vehicle)
    
    if not api_key or not genai:
        return generate_mock_maintenance_prediction(vehicle_dict, mileage_since_maintenance, days_since_maintenance)
    
    try:
        model = genai.GenerativeModel("models/gemini-flash-latest")
        
        prompt = f"""
        You are a fleet maintenance AI expert. Analyze this vehicle and predict maintenance needs:
        
        VEHICLE DETAILS:
        - Type: {vehicle.vehicle_type}
        - Make/Model: {vehicle.make} {vehicle.model} ({vehicle.year})
        - Current Mileage: {vehicle.mileage} km
        - Mileage Since Last Maintenance: {mileage_since_maintenance} km
        - Days Since Last Maintenance: {days_since_maintenance} days
        - Health Score: {vehicle.health_score}/100
        - Fuel Type: {vehicle.fuel_type}
        
        Provide a JSON response with:
        1. "next_maintenance_date": Predicted date (YYYY-MM-DD)
        2. "next_maintenance_type": Type of maintenance needed
        3. "estimated_cost_usd": Estimated cost
        4. "urgency": "low", "medium", "high", or "critical"
        5. "confidence_score": 0-100
        6. "critical_issues": Array of critical issues (if any)
        7. "recommendations": Array of 3-4 maintenance recommendations
        8. "parts_to_replace": Array of parts that may need replacement
        
        Return ONLY valid JSON.
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        prediction_data = json.loads(text.strip())
        
        return {
            "vehicle_id": vehicle_id,
            "model": "gemini-ai",
            "predicted_at": datetime.now().isoformat(),
            **prediction_data
        }
        
    except Exception as e:
        print(f"Gemini prediction error: {e}")
        return generate_mock_maintenance_prediction(vehicle_dict, mileage_since_maintenance, days_since_maintenance)

# ========================================================================
# FUEL OPTIMIZATION
# ========================================================================

@router.get("/{vehicle_id}/fuel/optimize")
async def optimize_fuel(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """AI-powered fuel optimization analysis"""
    
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle_dict = map_vehicle_to_response(vehicle)
    
    if not api_key or not genai:
        return generate_mock_fuel_optimization(vehicle_dict)
    
    try:
        model = genai.GenerativeModel("models/gemini-flash-latest")
        
        prompt = f"""
        You are a fuel efficiency AI expert. Analyze this vehicle and provide optimization recommendations:
        
        VEHICLE DETAILS:
        - Type: {vehicle.vehicle_type}
        - Make/Model: {vehicle.make} {vehicle.model}
        - Fuel Type: {vehicle.fuel_type}
        - Current Fuel Efficiency: {vehicle.fuel_efficiency} km/L
        - Current Mileage: {vehicle.mileage} km
        
        Provide a JSON response with:
        1. "current_efficiency_rating": "excellent", "good", "average", "poor"
        2. "potential_savings_percent": Percentage improvement possible
        3. "estimated_monthly_savings_usd": Estimated monthly savings
        4. "optimization_recommendations": Array of 4-5 specific recommendations
        5. "driving_tips": Array of 3-4 driving tips
        6. "maintenance_impact": How maintenance affects fuel efficiency
        
        Return ONLY valid JSON.
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        optimization_data = json.loads(text.strip())
        
        return {
            "vehicle_id": vehicle_id,
            "model": "gemini-ai",
            "analyzed_at": datetime.now().isoformat(),
            **optimization_data
        }
        
    except Exception as e:
        print(f"Gemini fuel optimization error: {e}")
        return generate_mock_fuel_optimization(vehicle_dict)

# ========================================================================
# ANALYTICS ENDPOINTS
# ========================================================================

@router.get("/analytics/fleet")
async def get_fleet_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive fleet analytics"""
    
    vehicles = db.query(Vehicle).all()
    total_vehicles = len(vehicles)
    
    if total_vehicles == 0:
        return {
            "summary": {
                "total_vehicles": 0,
                "available": 0,
                "in_use": 0,
                "maintenance": 0,
                "avg_health_score": 0,
                "avg_mileage": 0
            },
            "utilization_trend": [],
            "maintenance_cost_trend": [],
            "fuel_efficiency_trend": [],
            "type_distribution": {},
            "health_distribution": {"excellent": 0, "good": 0, "fair": 0, "poor": 0}
        }

    available = len([v for v in vehicles if v.status == "available"])
    in_use = len([v for v in vehicles if v.status == "in_use"])
    maintenance = len([v for v in vehicles if v.status == "maintenance"])
    
    # Generate time-series data (mocked for now as we don't have historical logs in this table)
    now = datetime.now()
    utilization_trend = []
    maintenance_cost_trend = []
    fuel_efficiency_trend = []
    
    for i in range(7):
        date = (now - timedelta(days=6-i)).strftime("%Y-%m-%d")
        utilization_trend.append({
            "date": date,
            "utilization_percent": random.uniform(65, 95),
            "active_vehicles": random.randint(int(total_vehicles * 0.6), total_vehicles)
        })
        maintenance_cost_trend.append({
            "date": date,
            "total_cost": random.uniform(500, 2000),
            "preventive": random.uniform(200, 800),
            "corrective": random.uniform(300, 1200)
        })
        fuel_efficiency_trend.append({
            "date": date,
            "avg_efficiency": random.uniform(10, 14),
            "total_fuel_cost": random.uniform(800, 1500)
        })
    
    # Vehicle type distribution
    type_distribution = {}
    for vehicle in vehicles:
        vtype = vehicle.vehicle_type
        if vtype not in type_distribution:
            type_distribution[vtype] = 0
        type_distribution[vtype] += 1
    
    # Health score distribution
    health_distribution = {
        "excellent": len([v for v in vehicles if v.health_score >= 90]),
        "good": len([v for v in vehicles if 75 <= v.health_score < 90]),
        "fair": len([v for v in vehicles if 60 <= v.health_score < 75]),
        "poor": len([v for v in vehicles if v.health_score < 60])
    }
    
    return {
        "summary": {
            "total_vehicles": total_vehicles,
            "available": available,
            "in_use": in_use,
            "maintenance": maintenance,
            "avg_health_score": sum(v.health_score for v in vehicles) / total_vehicles,
            "avg_mileage": sum(v.mileage for v in vehicles) / total_vehicles
        },
        "utilization_trend": utilization_trend,
        "maintenance_cost_trend": maintenance_cost_trend,
        "fuel_efficiency_trend": fuel_efficiency_trend,
        "type_distribution": type_distribution,
        "health_distribution": health_distribution
    }

# ========================================================================
# HEALTH MONITORING
# ========================================================================

@router.get("/{vehicle_id}/health")
async def get_vehicle_health(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get real-time vehicle health status"""
    
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Simulate health metrics
    health_data = {
        "vehicle_id": vehicle_id,
        "overall_health_score": vehicle.health_score,
        "last_updated": datetime.now().isoformat(),
        "diagnostics": {
            "engine": {
                "status": "good" if vehicle.health_score > 80 else "fair",
                "temperature": random.uniform(85, 95),
                "oil_pressure": random.uniform(30, 50),
                "score": random.randint(85, 100)
            },
            "transmission": {
                "status": "good",
                "fluid_level": random.uniform(80, 100),
                "score": random.randint(80, 95)
            },
            "brakes": {
                "status": "good" if vehicle.health_score > 75 else "fair",
                "pad_thickness_percent": random.uniform(60, 100),
                "score": random.randint(75, 95)
            },
            "tires": {
                "status": "good",
                "front_left_pressure": random.uniform(30, 35),
                "front_right_pressure": random.uniform(30, 35),
                "rear_left_pressure": random.uniform(30, 35),
                "rear_right_pressure": random.uniform(30, 35),
                "score": random.randint(80, 100)
            },
            "battery": {
                "status": "good",
                "voltage": random.uniform(12.4, 13.2),
                "charge_percent": random.uniform(80, 100),
                "score": random.randint(85, 100)
            }
        },
        "alerts": []
    }
    
    # Add alerts for low health scores
    if vehicle.health_score < 70:
        health_data["alerts"].append({
            "severity": "warning",
            "message": "Overall health score below 70%. Schedule maintenance soon.",
            "timestamp": datetime.now().isoformat()
        })
    
    return health_data

# ========================================================================
# HELPER FUNCTIONS
# ========================================================================

def generate_mock_maintenance_prediction(vehicle: Dict, mileage_since: float, days_since: int) -> Dict:
    """Generate mock maintenance prediction when AI is unavailable"""
    
    urgency = "low"
    if mileage_since > 8000 or days_since > 180:
        urgency = "critical"
    elif mileage_since > 6000 or days_since > 120:
        urgency = "high"
    elif mileage_since > 4000 or days_since > 90:
        urgency = "medium"
    
    days_until = max(0, 90 - days_since)
    next_date = (datetime.now() + timedelta(days=days_until)).strftime("%Y-%m-%d")
    
    return {
        "vehicle_id": vehicle["id"],
        "model": "pattern-matching",
        "predicted_at": datetime.now().isoformat(),
        "next_maintenance_date": next_date,
        "next_maintenance_type": "Regular Service" if mileage_since < 8000 else "Major Service",
        "estimated_cost_usd": random.uniform(150, 500),
        "urgency": urgency,
        "confidence_score": 75,
        "critical_issues": ["Brake pads wearing thin"] if urgency == "critical" else [],
        "recommendations": [
            "Check engine oil and filter",
            "Inspect brake system",
            "Rotate tires",
            "Check fluid levels"
        ],
        "parts_to_replace": ["Oil filter", "Air filter"] if mileage_since > 5000 else []
    }

def generate_mock_fuel_optimization(vehicle: Dict) -> Dict:
    """Generate mock fuel optimization when AI is unavailable"""
    
    current_eff = vehicle["fuel_efficiency_kmpl"]
    rating = "excellent" if current_eff > 12 else "good" if current_eff > 10 else "average"
    
    return {
        "vehicle_id": vehicle["id"],
        "model": "pattern-matching",
        "analyzed_at": datetime.now().isoformat(),
        "current_efficiency_rating": rating,
        "potential_savings_percent": random.uniform(10, 25),
        "estimated_monthly_savings_usd": random.uniform(50, 150),
        "optimization_recommendations": [
            "Maintain proper tire pressure (saves 3-5% fuel)",
            "Remove unnecessary weight from vehicle",
            "Use cruise control on highways",
            "Avoid aggressive acceleration and braking",
            "Regular engine tune-ups improve efficiency"
        ],
        "driving_tips": [
            "Accelerate smoothly and gradually",
            "Anticipate traffic flow to reduce braking",
            "Turn off engine during long idle periods",
            "Use air conditioning sparingly"
        ],
        "maintenance_impact": "Regular maintenance can improve fuel efficiency by up to 15%"
    }
