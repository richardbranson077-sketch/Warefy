"""
Multi-Carrier Shipping Integration Router with AI Enhancements
Supports: FedEx, UPS, USPS, DHL
Features: AI Predictive ETA, Smart Packaging, Risk Assessment, Cost Optimization
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import random
import json

from backend.database_lite import get_db
from backend.models_lite import Shipment, CarrierAccount, Order, User
from backend.auth_lite import get_current_active_user

# AI Integration
try:
    import google.generativeai as genai
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
except ImportError:
    genai = None
    api_key = None

router = APIRouter(prefix="/api/v1/shipping", tags=["Shipping"])

# ========================================================================
# PYDANTIC SCHEMAS
# ========================================================================

class Address(BaseModel):
    name: str
    company: Optional[str] = None
    street1: str
    street2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str = "US"
    phone: Optional[str] = None
    email: Optional[str] = None

class PackageDetails(BaseModel):
    weight: float  # in pounds
    length: float  # in inches
    width: float
    height: float
    insurance_value: Optional[float] = None
    contents_description: Optional[str] = None

class RateRequest(BaseModel):
    from_address: Address
    to_address: Address
    package: PackageDetails
    carriers: Optional[List[str]] = None  # If None, get rates from all carriers

class RateResponse(BaseModel):
    carrier: str
    service_type: str
    cost: float
    estimated_days: int
    estimated_delivery: Optional[str] = None
    reliability_score: float = 0.95  # AI-predicted reliability

class ShipmentRequest(BaseModel):
    order_id: int
    carrier: str
    service_type: str
    from_address: Address
    to_address: Address
    package: PackageDetails

class ShipmentResponse(BaseModel):
    id: int
    tracking_number: str
    label_url: str
    cost: float
    estimated_delivery: Optional[datetime]
    carrier: str
    service_type: str
    status: str
    origin: Optional[str] = None
    destination: Optional[str] = None
    origin_coords: Optional[Dict[str, float]] = None
    destination_coords: Optional[Dict[str, float]] = None
    current_location: Optional[Dict[str, float]] = None

class CarrierAccountCreate(BaseModel):
    carrier: str
    account_number: str
    api_key: str
    api_secret: Optional[str] = None
    meter_number: Optional[str] = None
    user_id: Optional[str] = None
    is_test_mode: bool = True

# AI Schemas
class ETAPredictionRequest(BaseModel):
    origin_zip: str
    destination_zip: str
    carrier: str
    service_level: str

class SmartPackagingRequest(BaseModel):
    items: List[Dict[str, Any]]  # List of items with dimensions and weight

class RiskAssessmentRequest(BaseModel):
    origin_zip: str
    destination_zip: str
    route_waypoints: Optional[List[str]] = None

# ========================================================================
# CARRIER API INTEGRATIONS (Simulated)
# ========================================================================

class CarrierAPI:
    @staticmethod
    def get_rates(carrier: str, from_addr: Address, to_addr: Address, package: PackageDetails):
        """Get simulated shipping rates"""
        base_rate = 10.0 + (package.weight * 0.5)
        
        if carrier == "fedex":
            return [
                {"service_type": "FEDEX_GROUND", "cost": base_rate * 1.0, "estimated_days": 5},
                {"service_type": "FEDEX_2_DAY", "cost": base_rate * 2.2, "estimated_days": 2},
                {"service_type": "FEDEX_OVERNIGHT", "cost": base_rate * 3.5, "estimated_days": 1},
            ]
        elif carrier == "ups":
            return [
                {"service_type": "UPS_GROUND", "cost": base_rate * 0.95, "estimated_days": 5},
                {"service_type": "UPS_3_DAY", "cost": base_rate * 2.0, "estimated_days": 3},
                {"service_type": "UPS_NEXT_DAY", "cost": base_rate * 3.4, "estimated_days": 1},
            ]
        elif carrier == "usps":
            return [
                {"service_type": "USPS_PRIORITY", "cost": base_rate * 0.8, "estimated_days": 3},
                {"service_type": "USPS_EXPRESS", "cost": base_rate * 2.5, "estimated_days": 1},
            ]
        elif carrier == "dhl":
            return [
                {"service_type": "DHL_EXPRESS", "cost": base_rate * 2.8, "estimated_days": 2},
            ]
        return []

    @staticmethod
    def create_shipment(carrier: str, from_addr: Address, to_addr: Address, package: PackageDetails, service_type: str):
        """Simulate shipment creation"""
        tracking_prefix = {
            "fedex": "FEDEX",
            "ups": "1Z",
            "usps": "USPS",
            "dhl": "DHL"
        }
        prefix = tracking_prefix.get(carrier, "TRK")
        tracking_number = f"{prefix}{datetime.now().strftime('%Y%m%d%H%M%S')}{random.randint(100, 999)}"
        
        # Calculate cost based on service type (simplified)
        cost = 15.00
        if "OVERNIGHT" in service_type or "NEXT_DAY" in service_type or "EXPRESS" in service_type:
            cost = 45.00
            
        return {
            "tracking_number": tracking_number,
            "label_url": f"https://example.com/labels/{tracking_number}.pdf",
            "cost": cost,
            "estimated_delivery": datetime.now() + timedelta(days=3)
        }

# ========================================================================
# AI HELPERS
# ========================================================================

async def get_gemini_prediction(prompt: str, context: Dict = None) -> Dict:
    """Helper to call Gemini API"""
    if not api_key:
        return {"error": "AI module not configured"}
        
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        full_prompt = f"""
        You are an AI Logistics Expert for Warefy.
        Context: {json.dumps(context) if context else 'None'}
        
        Task: {prompt}
        
        Return ONLY valid JSON. No markdown formatting.
        """
        response = model.generate_content(full_prompt)
        return json.loads(response.text.strip().replace('```json', '').replace('```', ''))
    except Exception as e:
        print(f"AI Error: {e}")
        return {"error": str(e)}

# In-memory storage
shipments_db: List[Dict] = [
    {
        "id": 1,
        "tracking_number": "TRK123456789",
        "carrier": "fedex",
        "service_type": "FEDEX_GROUND",
        "status": "in_transit",
        "origin": "New York, NY",
        "destination": "Los Angeles, CA",
        "origin_coords": {"lat": 40.7128, "lng": -74.0060},
        "destination_coords": {"lat": 34.0522, "lng": -118.2437},
        "current_location": {"lat": 39.0, "lng": -95.0, "speed_kmh": 65}, # Somewhere in Kansas
        "cost": 15.50,
        "created_at": (datetime.now() - timedelta(days=2)).isoformat()
    },
    {
        "id": 2,
        "tracking_number": "TRK987654321",
        "carrier": "ups",
        "service_type": "UPS_GROUND",
        "status": "delivered",
        "origin": "Chicago, IL",
        "destination": "Miami, FL",
        "origin_coords": {"lat": 41.8781, "lng": -87.6298},
        "destination_coords": {"lat": 25.7617, "lng": -80.1918},
        "current_location": {"lat": 25.7617, "lng": -80.1918, "speed_kmh": 0},
        "cost": 12.75,
        "created_at": (datetime.now() - timedelta(days=5)).isoformat()
    },
    {
        "id": 3,
        "tracking_number": "TRK456123789",
        "carrier": "usps",
        "service_type": "USPS_PRIORITY",
        "status": "pending",
        "origin": "Seattle, WA",
        "destination": "Austin, TX",
        "origin_coords": {"lat": 47.6062, "lng": -122.3321},
        "destination_coords": {"lat": 30.2672, "lng": -97.7431},
        "current_location": {"lat": 47.6062, "lng": -122.3321, "speed_kmh": 0},
        "cost": 9.20,
        "created_at": datetime.now().isoformat()
    }
]

@router.post("/shipments", response_model=ShipmentResponse)
def create_shipment(
    request: ShipmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a shipment and generate label"""
    try:
        result = CarrierAPI.create_shipment(
            request.carrier, 
            request.from_address, 
            request.to_address, 
            request.package, 
            request.service_type
        )
        
        # Mock coordinates for new shipments (default to NY -> LA for demo)
        origin_coords = {"lat": 40.7128, "lng": -74.0060}
        dest_coords = {"lat": 34.0522, "lng": -118.2437}
        
        # Save to DB (mock)
        shipment = {
            "id": random.randint(1000, 9999),
            "order_id": request.order_id,
            "carrier": request.carrier,
            "service_type": request.service_type,
            "tracking_number": result["tracking_number"],
            "label_url": result["label_url"],
            "cost": result["cost"],
            "estimated_delivery": result["estimated_delivery"],
            "status": "pending",
            "origin": f"{request.from_address.city}, {request.from_address.state}",
            "destination": f"{request.to_address.city}, {request.to_address.state}",
            "origin_coords": origin_coords,
            "destination_coords": dest_coords,
            "current_location": {**origin_coords, "speed_kmh": 0},
            "created_at": datetime.now().isoformat()
        }
        
        shipments_db.append(shipment)
        
        return ShipmentResponse(**shipment)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shipments")
def get_all_shipments(
    status: Optional[str] = None,
    carrier: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get all shipments with optional filters"""
    filtered = shipments_db
    if status and status != "all":
        filtered = [s for s in filtered if s["status"] == status]
    if carrier and carrier != "all":
        filtered = [s for s in filtered if s["carrier"] == carrier]
        
    return filtered

# ========================================================================
# AI ENDPOINTS
# ========================================================================

@router.post("/predict-eta")
async def predict_eta(
    request: ETAPredictionRequest,
    current_user: User = Depends(get_current_active_user)
):
    """AI-powered ETA prediction considering weather and traffic"""
    if not api_key:
        # Fallback mock response
        return {
            "predicted_days": 3,
            "confidence_score": 0.85,
            "factors": ["Normal traffic", "Clear weather"],
            "risk_level": "low"
        }
        
    prompt = f"""
    Predict shipping ETA from {request.origin_zip} to {request.destination_zip} 
    via {request.carrier} {request.service_level}.
    Consider typical weather patterns for {datetime.now().strftime('%B')} and current logistics trends.
    
    Return JSON:
    {{
        "predicted_days": int,
        "confidence_score": float (0-1),
        "factors": [list of strings influencing prediction],
        "risk_level": "low" | "medium" | "high",
        "weather_impact": "string description"
    }}
    """
    
    return await get_gemini_prediction(prompt)

@router.post("/smart-packaging")
async def smart_packaging(
    request: SmartPackagingRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Recommend optimal packaging to minimize DIM weight"""
    if not api_key:
        return {
            "recommended_box": "Box M (12x12x12)",
            "fill_material": "Bubble wrap",
            "estimated_dim_weight": 5.5,
            "savings_potential": "15%"
        }
        
    prompt = f"""
    Recommend optimal packaging for these items: {json.dumps(request.items)}.
    Goal: Minimize dimensional weight and ensure safety.
    
    Return JSON:
    {{
        "recommended_box": "string (dimensions)",
        "fill_material": "string",
        "arrangement_strategy": "string description",
        "estimated_dim_weight": float,
        "savings_potential": "string percentage"
    }}
    """
    
    return await get_gemini_prediction(prompt)

@router.post("/risk-assessment")
async def risk_assessment(
    request: RiskAssessmentRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Analyze shipment route for potential risks"""
    if not api_key:
        return {
            "risk_score": 0.15,
            "alerts": [],
            "recommendation": "Proceed with standard shipping"
        }
        
    prompt = f"""
    Analyze shipping risks from {request.origin_zip} to {request.destination_zip}.
    Consider weather, labor strikes, and holiday congestion.
    
    Return JSON:
    {{
        "risk_score": float (0-1),
        "alerts": [
            {{ "type": "weather"|"traffic"|"other", "severity": "low"|"medium"|"high", "message": "string" }}
        ],
        "recommendation": "string"
    }}
    """
    
    return await get_gemini_prediction(prompt)

@router.get("/analytics/fleet")
def get_shipping_analytics(
    current_user: User = Depends(get_current_active_user)
):
    """Get shipping performance analytics"""
    return {
        "cost_trend": [
            {"date": "2023-01", "cost": 1200},
            {"date": "2023-02", "cost": 1350},
            {"date": "2023-03", "cost": 1100},
            {"date": "2023-04", "cost": 1400},
            {"date": "2023-05", "cost": 1250},
        ],
        "carrier_distribution": [
            {"name": "FedEx", "value": 45},
            {"name": "UPS", "value": 30},
            {"name": "USPS", "value": 15},
            {"name": "DHL", "value": 10},
        ],
        "on_time_performance": 94.5,
        "avg_cost_per_shipment": 14.20
    }
