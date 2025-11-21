"""
Pydantic schemas for request/response validation in Warefy API.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ============= User Schemas =============
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: str = "manager"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None
    is_2fa_enabled: Optional[bool] = None
    full_name: Optional[str] = None
    password: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# ============= Warehouse Schemas =============
class WarehouseBase(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    capacity: Optional[int] = None

class WarehouseCreate(WarehouseBase):
    latitude: float
    longitude: float
    manager_id: Optional[int] = None

class WarehouseResponse(WarehouseBase):
    id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============= Inventory Schemas =============
class InventoryBase(BaseModel):
    sku: str
    product_name: str
    category: Optional[str] = None
    quantity: int = 0
    reorder_point: int = 10
    unit_price: Optional[float] = None

class InventoryCreate(InventoryBase):
    warehouse_id: int

class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    reorder_point: Optional[int] = None
    unit_price: Optional[float] = None

class InventoryResponse(InventoryBase):
    id: int
    warehouse_id: int
    last_restocked: Optional[datetime] = None
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ============= Vehicle Schemas =============
class VehicleBase(BaseModel):
    vehicle_number: str
    vehicle_type: str
    capacity: float
    fuel_type: str

class VehicleCreate(VehicleBase):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    driver_id: Optional[int] = None

class VehicleResponse(VehicleBase):
    id: int
    status: str
    total_distance: float
    total_hours: float
    last_service_date: Optional[datetime] = None
    next_service_due: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============= Route Schemas =============
class Waypoint(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None
    delivery_id: Optional[str] = None

class RouteCreate(BaseModel):
    route_name: str
    driver_id: int
    vehicle_id: int
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    waypoints: List[Waypoint]

class RouteResponse(BaseModel):
    id: int
    route_name: str
    driver_id: int
    vehicle_id: int
    optimized_sequence: Optional[List[int]] = None
    total_distance: Optional[float] = None
    estimated_duration: Optional[float] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============= Demand Forecasting Schemas =============
class DemandForecastRequest(BaseModel):
    sku: str
    warehouse_id: Optional[int] = None
    forecast_days: int = Field(default=30, ge=1, le=365)
    model_type: str = Field(default="prophet", pattern="^(prophet|lstm|xgboost)$")

class DemandForecastResponse(BaseModel):
    sku: str
    warehouse_id: Optional[int] = None
    forecast_days: int
    model_type: str
    predictions: List[Dict[str, Any]]  # [{date, predicted_quantity, confidence_interval}]
    accuracy_metrics: Optional[Dict[str, float]] = None

# ============= Route Optimization Schemas =============
class RouteOptimizationRequest(BaseModel):
    vehicle_id: int
    start_location: Dict[str, float]  # {lat, lon}
    delivery_points: List[Dict[str, Any]]  # [{lat, lon, priority, time_window}]
    optimization_method: str = Field(default="ortools", pattern="^(ortools|genetic)$")

class RouteOptimizationResponse(BaseModel):
    vehicle_id: int
    optimized_route: List[int]  # Indices of delivery points in optimal order
    total_distance: float
    estimated_duration: float
    route_geometry: Optional[List[Dict[str, float]]] = None

# ============= Anomaly Schemas =============
class AnomalyResponse(BaseModel):
    id: int
    anomaly_type: str
    severity: str
    entity_type: str
    entity_id: int
    description: str
    detected_at: datetime
    resolved: bool
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# ============= Maintenance Schemas =============
class MaintenancePredictionRequest(BaseModel):
    vehicle_id: int

class MaintenancePredictionResponse(BaseModel):
    vehicle_id: int
    failure_risk_score: float
    recommended_maintenance_date: Optional[datetime] = None
    predicted_issues: List[str]
    confidence: float

# ============= AI Recommendation Schemas =============
class AIRecommendationRequest(BaseModel):
    context: str  # "restocking", "supplier_alternative", "contingency_planning"
    warehouse_id: Optional[int] = None
    sku: Optional[str] = None
    additional_context: Optional[Dict[str, Any]] = None

# ============= Order Schemas =============
class OrderItemBase(BaseModel):
    sku: str
    quantity: int
    unit_price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_name: str
    customer_email: Optional[str] = None
    shipping_address: Optional[str] = None
    status: str = "pending"

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    shipping_address: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    total_amount: float
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]
    
    class Config:
        from_attributes = True

# ============= Integration Schemas =============
class IntegrationBase(BaseModel):
    name: str
    api_key: str
    api_secret: Optional[str] = None
    webhook_url: Optional[str] = None
    status: str = "active"
    settings: Optional[str] = None

class IntegrationCreate(IntegrationBase):
    pass

class IntegrationResponse(IntegrationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ============= Warehouse Schemas =============
class WarehouseBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    capacity: int

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdateLayout(BaseModel):
    layout_config: str

class WarehouseResponse(WarehouseBase):
    id: int
    layout_config: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AIRecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    reasoning: str
    confidence_score: float
    generated_at: datetime

# ============= Simulation Schemas =============
class SimulationRequest(BaseModel):
    scenario_type: str  # "demand_spike", "warehouse_closure", "vehicle_breakdown"
    parameters: Dict[str, Any]
    duration_days: int = Field(default=7, ge=1, le=90)

class SimulationResponse(BaseModel):
    scenario_type: str
    impact_analysis: Dict[str, Any]
    recommendations: List[str]
    contingency_plan: Optional[Dict[str, Any]] = None
