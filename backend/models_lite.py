"""
Simplified database models without PostGIS for SQLite
"""

from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database_lite import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="manager")  # admin, manager, driver
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Warehouse(Base):
    __tablename__ = "warehouses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    capacity = Column(Integer)
    manager_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    inventory_items = relationship("Inventory", back_populates="warehouse")

class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    sku = Column(String, index=True)
    product_name = Column(String)
    category = Column(String)
    quantity = Column(Integer)
    unit_price = Column(Float)
    reorder_point = Column(Integer)
    supplier = Column(String)
    last_restocked = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    warehouse = relationship("Warehouse", back_populates="inventory_items")

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, unique=True, index=True)
    vehicle_type = Column(String)
    capacity = Column(Float)
    fuel_type = Column(String)
    current_latitude = Column(Float)
    current_longitude = Column(Float)
    status = Column(String, default="available")
    mileage = Column(Integer, default=0)
    last_maintenance = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class Driver(Base):
    __tablename__ = "drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    license_number = Column(String, unique=True)
    phone = Column(String)
    current_vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    status = Column(String, default="available")
    created_at = Column(DateTime, default=datetime.utcnow)

class SalesHistory(Base):
    __tablename__ = "sales_history"
    
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    date = Column(DateTime, index=True)
    quantity = Column(Integer)
    revenue = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class Route(Base):
    __tablename__ = "routes"
    
    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    status = Column(String, default="planned")
    waypoints = Column(JSON)  # Store as JSON array
    total_distance = Column(Float)
    estimated_time = Column(Integer)
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(Integer, primary_key=True, index=True)
    anomaly_type = Column(String)
    severity = Column(String)
    description = Column(Text)
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    status = Column(String, default="active")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    maintenance_type = Column(String)
    description = Column(Text)
    cost = Column(Float)
    performed_at = Column(DateTime)
    next_maintenance = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
