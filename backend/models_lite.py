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
    is_2fa_enabled = Column(Boolean, default=False)
    avatar_url = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String, nullable=True)
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
    logs = relationship("InventoryLog", back_populates="inventory_item")

class InventoryLog(Base):
    __tablename__ = "inventory_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"))
    change_amount = Column(Integer)
    reason = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    inventory_item = relationship("Inventory", back_populates="logs")
    user = relationship("User")

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, unique=True, index=True) # This is vehicle_number (e.g. V001)
    vehicle_type = Column(String) # van, truck, car
    make = Column(String, nullable=True)
    model = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    license_plate = Column(String, nullable=True)
    capacity = Column(Float) # capacity_kg
    fuel_type = Column(String)
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    location_name = Column(String, nullable=True) # e.g. "Warehouse A"
    status = Column(String, default="available")
    mileage = Column(Integer, default=0) # current_mileage
    last_maintenance = Column(DateTime) # last_maintenance_date
    last_maintenance_mileage = Column(Integer, default=0)
    health_score = Column(Integer, default=100)
    fuel_efficiency = Column(Float, default=0.0) # fuel_efficiency_kmpl
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
    route_id = Column(String, unique=True, index=True) # Public ID (e.g. route_123)
    name = Column(String)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    status = Column(String, default="planned")
    origin = Column(JSON) # {address, lat, lng}
    destination = Column(JSON) # {address, lat, lng}
    waypoints = Column(JSON)  # [{address, lat, lng}, ...]
    optimization_mode = Column(String, default="balanced")
    vehicle_type = Column(String, default="van")
    total_distance = Column(Float) # km
    estimated_time = Column(Integer) # minutes
    estimated_cost = Column(Float) # USD
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    optimized = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    anomaly_type = Column(String)  # demand_spike, stockout, route_delay
    severity = Column(String)  # low, medium, high, critical
    description = Column(String)
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    entity_type = Column(String)  # product, warehouse, route
    entity_id = Column(Integer)
    extra_data = Column(String)  # JSON string with extra details

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)  # income, expense
    amount = Column(Float)
    category = Column(String)  # Sales, Rent, Payroll, Utilities, etc.
    description = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User")

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
    extra_data = Column(JSON, nullable=True) # Rich context for the action
    
    # Blockchain fields
    hash = Column(String, index=True)
    previous_hash = Column(String)
    signature = Column(String, nullable=True)
    
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
    shipments = relationship("Shipment", back_populates="order")

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

class Team(Base):
    """Team collaboration groups"""
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="team", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="team", cascade="all, delete-orphan")
    files = relationship("FileShare", back_populates="team", cascade="all, delete-orphan")

class TeamMember(Base):
    """Team membership"""
    __tablename__ = "team_members"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, default="member")  # admin, member
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    team = relationship("Team", back_populates="members")
    user = relationship("User")

class Message(Base):
    """Team messages"""
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    attachments = Column(JSON, nullable=True)  # List of file references
    sentiment = Column(String, nullable=True)  # positive, neutral, negative, urgent
    created_at = Column(DateTime, default=datetime.utcnow)
    edited_at = Column(DateTime, nullable=True)
    
    # Relationships
    team = relationship("Team", back_populates="messages")
    user = relationship("User")

class Notification(Base):
    """User notifications"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # message, mention, task_assigned, etc.
    content = Column(Text, nullable=False)
    related_id = Column(Integer, nullable=True)  # ID of related message/task
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")

class Task(Base):
    """Team tasks"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="todo")  # todo, in_progress, done
    priority = Column(String, default="medium")  # low, medium, high, urgent
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    team = relationship("Team", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assigned_to])
    creator = relationship("User", foreign_keys=[created_by])

class FileShare(Base):
    """Shared files"""
    __tablename__ = "file_shares"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    mime_type = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    team = relationship("Team", back_populates="files")
    user = relationship("User")

class KnowledgeBaseArticle(Base):
    """Knowledge Base Articles"""
    __tablename__ = "knowledge_base_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    category = Column(String, index=True)
    tags = Column(JSON, default=[])
    author_id = Column(Integer, ForeignKey("users.id"))
    views = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = relationship("User")

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    
    # Appearance
    theme = Column(String, default="light")  # light, dark, auto
    language = Column(String, default="en")  # en, es, fr, de, zh
    timezone = Column(String, default="UTC")
    date_format = Column(String, default="MM/DD/YYYY")
    time_format = Column(String, default="12h")  # 12h, 24h
    
    # Notifications
    notifications_email = Column(Boolean, default=True)
    notifications_push = Column(Boolean, default=True)
    notifications_sms = Column(Boolean, default=False)
    notification_frequency = Column(String, default="realtime")  # realtime, hourly, daily
    
    # Notification Types
    notify_low_stock = Column(Boolean, default=True)
    notify_anomalies = Column(Boolean, default=True)
    notify_route_delays = Column(Boolean, default=True)
    notify_system_updates = Column(Boolean, default=False)
    
    # Security
    two_factor_enabled = Column(Boolean, default=False)
    session_timeout = Column(Integer, default=30)  # minutes
    
    # System (Admin only)
    api_rate_limit = Column(Integer, default=1000)  # requests per hour
    data_retention_days = Column(Integer, default=90)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", backref="settings")

class LoginHistory(Base):
    __tablename__ = "login_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    ip_address = Column(String)
    user_agent = Column(String)
    location = Column(String, nullable=True)  # City, Country
    device = Column(String, nullable=True)  # Browser/OS info
    status = Column(String)  # success, failed, blocked
    login_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("User", backref="login_history")

class ActiveSession(Base):
    __tablename__ = "active_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    session_token = Column(String, unique=True, index=True)
    ip_address = Column(String)
    user_agent = Column(String)
    device = Column(String, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime)
    
    user = relationship("User", backref="active_sessions")

class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    name = Column(String)  # User-defined name for the key
    key_prefix = Column(String, index=True)  # First 8 chars for display
    key_hash = Column(String)  # Hashed full key
    permissions = Column(JSON, default=[])  # List of allowed permissions
    last_used = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    user = relationship("User", backref="api_keys")

class SecurityAuditLog(Base):
    __tablename__ = "security_audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    action = Column(String, index=True)  # password_changed, 2fa_enabled, api_key_created, etc.
    details = Column(JSON, nullable=True)  # Additional context
    ip_address = Column(String)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("User", backref="security_logs")
