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
    layout_config = Column(Text, nullable=True)  # JSON string for grid layout
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

# ------------------------------------------------------------------
# AuditLog – records admin actions (role changes, 2FA toggles, etc.)
# ------------------------------------------------------------------
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # actor
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # who was affected
    action = Column(String, nullable=False)  # e.g., "role_change", "2fa_enabled"
    details = Column(Text, nullable=True)   # optional JSON string
    timestamp = Column(DateTime, default=datetime.utcnow)

    actor = relationship("User", foreign_keys=[user_id])
    target = relationship("User", foreign_keys=[target_user_id])

class Integration(Base):
    __tablename__ = "integrations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)  # shopify, woocommerce, slack, etc.
    api_key = Column(String)
    api_secret = Column(String, nullable=True)
    webhook_url = Column(String, nullable=True)
    status = Column(String, default="inactive")  # active, inactive, error
    settings = Column(Text, nullable=True)  # JSON string for extra config
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, index=True)
    customer_email = Column(String)
    status = Column(String, default="pending")  # pending, processing, shipped, delivered, cancelled
    total_amount = Column(Float)
    shipping_address = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    sku = Column(String, index=True)
    quantity = Column(Integer)
    unit_price = Column(Float)
    
    order = relationship("Order", back_populates="items")

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

# ========================================================================
# NEW MODELS FOR ENTERPRISE INTEGRATIONS
# ========================================================================

class Shipment(Base):
    """Multi-carrier shipment tracking"""
    __tablename__ = "shipments"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    carrier = Column(String)  # fedex, ups, usps, dhl
    service_type = Column(String)  # ground, express, overnight
    tracking_number = Column(String, unique=True, index=True)
    label_url = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, in_transit, delivered, exception
    cost = Column(Float)
    estimated_delivery = Column(DateTime, nullable=True)
    actual_delivery = Column(DateTime, nullable=True)
    from_address = Column(JSON)
    to_address = Column(JSON)
    package_details = Column(JSON)  # weight, dimensions, insurance
    tracking_events = Column(JSON, default=[])  # Array of tracking updates
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    order = relationship("Order", back_populates="shipments")

class CarrierAccount(Base):
    """Carrier API credentials"""
    __tablename__ = "carrier_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    carrier = Column(String, index=True)  # fedex, ups, usps, dhl
    account_number = Column(String)
    api_key = Column(String)
    api_secret = Column(String, nullable=True)
    meter_number = Column(String, nullable=True)  # FedEx specific
    user_id = Column(String, nullable=True)  # UPS specific
    is_active = Column(Boolean, default=True)
    is_test_mode = Column(Boolean, default=True)
    settings = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ERPConnection(Base):
    """ERP system connections"""
    __tablename__ = "erp_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    erp_type = Column(String, index=True)  # quickbooks, xero, sap, netsuite
    company_id = Column(String)
    access_token = Column(String)
    refresh_token = Column(String, nullable=True)
    realm_id = Column(String, nullable=True)  # QuickBooks specific
    tenant_id = Column(String, nullable=True)  # Xero specific
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime, nullable=True)
    sync_frequency = Column(String, default="hourly")  # hourly, daily, manual
    sync_settings = Column(JSON, default={})  # What to sync (invoices, POs, etc.)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ERPSyncLog(Base):
    """Track ERP sync operations"""
    __tablename__ = "erp_sync_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(Integer, ForeignKey("erp_connections.id"))
    sync_type = Column(String)  # invoice, purchase_order, inventory, customer
    direction = Column(String)  # to_erp, from_erp
    status = Column(String)  # success, failed, partial
    records_processed = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    error_details = Column(JSON, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class EcommerceConnection(Base):
    """E-commerce platform connections"""
    __tablename__ = "ecommerce_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, index=True)  # shopify, woocommerce, amazon, ebay
    store_name = Column(String)
    store_url = Column(String, nullable=True)
    api_key = Column(String)
    api_secret = Column(String, nullable=True)
    access_token = Column(String, nullable=True)
    marketplace_id = Column(String, nullable=True)  # Amazon specific
    is_active = Column(Boolean, default=True)
    auto_sync_orders = Column(Boolean, default=True)
    auto_sync_inventory = Column(Boolean, default=True)
    last_order_sync = Column(DateTime, nullable=True)
    last_inventory_sync = Column(DateTime, nullable=True)
    sync_settings = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EcommerceSyncLog(Base):
    """Track e-commerce sync operations"""
    __tablename__ = "ecommerce_sync_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(Integer, ForeignKey("ecommerce_connections.id"))
    sync_type = Column(String)  # orders, inventory, products
    direction = Column(String)  # import, export
    status = Column(String)  # success, failed, partial
    records_processed = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    error_details = Column(JSON, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
