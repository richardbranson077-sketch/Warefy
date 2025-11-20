"""
Database models for Warefy Supply Chain Optimizer.
Includes models for users, warehouses, inventory, vehicles, routes, and more.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime
from database import Base

class User(Base):
    """User model for authentication and authorization"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="manager")  # admin, manager, driver
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Warehouse(Base):
    """Warehouse model with geospatial location"""
    __tablename__ = "warehouses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    address = Column(String)
    city = Column(String)
    country = Column(String)
    # PostGIS geometry for location (longitude, latitude)
    location = Column(Geometry('POINT', srid=4326))
    capacity = Column(Integer)  # Total capacity in units
    manager_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    inventory = relationship("Inventory", back_populates="warehouse")
    manager = relationship("User")

class Inventory(Base):
    """Inventory tracking for products across warehouses"""
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    sku = Column(String, index=True, nullable=False)
    product_name = Column(String, nullable=False)
    category = Column(String)
    quantity = Column(Integer, default=0)
    reorder_point = Column(Integer, default=10)
    unit_price = Column(Float)
    last_restocked = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    warehouse = relationship("Warehouse", back_populates="inventory")

class Vehicle(Base):
    """Vehicle fleet management"""
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String, unique=True, index=True, nullable=False)
    vehicle_type = Column(String)  # truck, van, drone
    capacity = Column(Float)  # in kg or cubic meters
    fuel_type = Column(String)  # diesel, electric, hybrid
    current_location = Column(Geometry('POINT', srid=4326))
    status = Column(String, default="available")  # available, in_transit, maintenance
    total_distance = Column(Float, default=0.0)  # Total km traveled
    total_hours = Column(Float, default=0.0)  # Total operating hours
    last_service_date = Column(DateTime)
    next_service_due = Column(DateTime)
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    driver = relationship("Driver", back_populates="vehicles")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle")

class Driver(Base):
    """Driver information for mobile app"""
    __tablename__ = "drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    license_number = Column(String, unique=True, nullable=False)
    phone = Column(String)
    current_location = Column(Geometry('POINT', srid=4326))
    is_available = Column(Boolean, default=True)
    rating = Column(Float, default=5.0)
    total_deliveries = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    vehicles = relationship("Vehicle", back_populates="driver")
    routes = relationship("Route", back_populates="driver")

class Route(Base):
    """Optimized delivery routes"""
    __tablename__ = "routes"
    
    id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String)
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    start_location = Column(Geometry('POINT', srid=4326))
    end_location = Column(Geometry('POINT', srid=4326))
    waypoints = Column(JSON)  # List of delivery points with coordinates
    optimized_sequence = Column(JSON)  # Optimized order of waypoints
    total_distance = Column(Float)  # in km
    estimated_duration = Column(Float)  # in minutes
    status = Column(String, default="planned")  # planned, in_progress, completed
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    driver = relationship("Driver", back_populates="routes")
    vehicle = relationship("Vehicle")

class SalesHistory(Base):
    """Historical sales data for demand forecasting"""
    __tablename__ = "sales_history"
    
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, index=True, nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    quantity_sold = Column(Integer, nullable=False)
    sale_date = Column(DateTime, index=True, nullable=False)
    revenue = Column(Float)
    customer_segment = Column(String)
    promotion_applied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    warehouse = relationship("Warehouse")

class Anomaly(Base):
    """Detected anomalies in supply chain operations"""
    __tablename__ = "anomalies"
    
    id = Column(Integer, primary_key=True, index=True)
    anomaly_type = Column(String, nullable=False)  # demand_spike, stockout, delay
    severity = Column(String, default="medium")  # low, medium, high, critical
    entity_type = Column(String)  # warehouse, vehicle, route, inventory
    entity_id = Column(Integer)
    description = Column(Text)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime)
    metadata = Column(JSON)  # Additional context data

class MaintenanceLog(Base):
    """Vehicle maintenance history and predictions"""
    __tablename__ = "maintenance_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    maintenance_type = Column(String)  # routine, repair, emergency
    description = Column(Text)
    cost = Column(Float)
    performed_at = Column(DateTime, default=datetime.utcnow)
    next_due_date = Column(DateTime)
    predicted_failure_risk = Column(Float)  # ML prediction score
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_logs")
