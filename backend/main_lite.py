"""
Warefy API - Lightweight FastAPI Application
AI-Powered Supply Chain Optimizer with SQLite backend
"""

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import sys
import time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database_lite import get_db, init_db
from backend.models_lite import User, Warehouse, Inventory, SalesHistory, Anomaly
from backend.schemas import (
    InventoryResponse, WarehouseResponse, AnomalyResponse
)
from backend.auth_lite import (
    get_current_user, 
    require_role, 
    verify_password, 
    create_access_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_active_user
)
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from backend.schemas import Token, UserResponse

# Import new modules
from backend.logging_config import setup_logging, get_logger, log_request, set_correlation_id
from backend.versioning import version_middleware
from backend.monitoring import router as health_router, metrics

# Setup structured logging
setup_logging(
    level=os.getenv("LOG_LEVEL", "INFO"),
    log_file="backend.log",
    json_format=True
)

logger = get_logger(__name__)

# Initialize database on startup
logger.info("Initializing database...")
init_db()
logger.info("Database initialized successfully")

app = FastAPI(
    title="Warefy API",
    description="AI-Powered Supply Chain Optimizer",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json"
)

# Import routers
from backend.routers import (
    ai_command, 
    auth, 
    users, 
    notifications, 
    orders, 
    reports, 
    integrations, 
    warehouses_lite as warehouses,
    websocket  # WebSocket support for real-time features
)

# CORS Configuration - Use environment variable for allowed origins
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
logger.info(f"CORS allowed origins: {ALLOWED_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=3600,
)

# Add versioning middleware
app.middleware("http")(version_middleware)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Log all HTTP requests with timing and correlation ID
    """
    # Set correlation ID for request tracking
    correlation_id = set_correlation_id()
    
    # Start timer
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration_ms = (time.time() - start_time) * 1000
    
    # Log request
    log_request(
        method=request.method,
        endpoint=request.url.path,
        status_code=response.status_code,
        duration_ms=duration_ms
    )
    
    # Record metrics
    metrics.record_request(duration_ms, response.status_code)
    
    # Add correlation ID to response headers
    response.headers["X-Correlation-ID"] = correlation_id
    
    return response


# Include routers with /api/v1/ prefix
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(notifications.router, prefix="/api/v1", tags=["Notifications"])
app.include_router(orders.router, prefix="/api/v1", tags=["Orders"])
app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])
app.include_router(integrations.router, prefix="/api/v1", tags=["Integrations"])
app.include_router(warehouses.router, prefix="/api/v1", tags=["Warehouses"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(ai_command.router, prefix="/api/v1", tags=["AI"])
app.include_router(health_router, tags=["Health"])
app.include_router(websocket.router, tags=["WebSocket"])  # Real-time WebSocket endpoints

logger.info("All routers registered successfully")


@app.get("/")
def root():
    """
    Root endpoint with API information
    
    Returns:
        API metadata and links
    """
    return {
        "message": "Welcome to Warefy API",
        "version": "1.0.0",
        "api_version": "v1",
        "database": "SQLite",
        "docs": "/api/v1/docs",
        "health": "/health"
    }


@app.get("/api/v1/info")
def api_info():
    """
    Get API information and available features
    
    Returns:
        API capabilities and features
    """
    return {
        "application": "Warefy Supply Chain Optimizer",
        "mode": "Lightweight Demo",
        "database": "SQLite",
        "api_version": "v1",
        "features": [
            "Inventory Management",
            "Warehouse Management",
            "Order Processing",
            "Sales History",
            "Anomaly Detection",
            "AI Recommendations",
            "Reporting & Analytics"
        ],
        "note": "This is a lightweight demo. Install full requirements for advanced AI features."
    }


# Inventory endpoints
@app.get("/api/v1/inventory", response_model=List[InventoryResponse])
def get_inventory(
    warehouse_id: int = None,
    sku: str = None,
    db: Session = Depends(get_db)
):
    """
    Get all inventory items with optional filtering
    
    Args:
        warehouse_id: Filter by warehouse ID
        sku: Filter by SKU
        db: Database session
        
    Returns:
        List of inventory items
    """
    query = db.query(Inventory)
    
    if warehouse_id:
        query = query.filter(Inventory.warehouse_id == warehouse_id)
    if sku:
        query = query.filter(Inventory.sku == sku)
    
    return query.all()


@app.get("/api/v1/inventory/{item_id}", response_model=InventoryResponse)
def get_inventory_item(item_id: int, db: Session = Depends(get_db)):
    """
    Get a specific inventory item by ID
    
    Args:
        item_id: Inventory item ID
        db: Database session
        
    Returns:
        Inventory item details
        
    Raises:
        HTTPException: If item not found
    """
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        logger.warning(f"Inventory item not found: {item_id}")
        raise HTTPException(status_code=404, detail="Item not found")
    return item


# Warehouse endpoints
@app.get("/api/v1/warehouses", response_model=List[WarehouseResponse])
def get_warehouses(db: Session = Depends(get_db)):
    """
    Get all warehouses
    
    Args:
        db: Database session
        
    Returns:
        List of all warehouses
    """
    return db.query(Warehouse).all()


@app.get("/api/v1/warehouses/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    """
    Get a specific warehouse by ID
    
    Args:
        warehouse_id: Warehouse ID
        db: Database session
        
    Returns:
        Warehouse details
        
    Raises:
        HTTPException: If warehouse not found
    """
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        logger.warning(f"Warehouse not found: {warehouse_id}")
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse


# Anomalies endpoints
@app.get("/api/v1/anomalies/recent", response_model=List[AnomalyResponse])
def get_recent_anomalies(limit: int = 50, db: Session = Depends(get_db)):
    """
    Get recent anomalies detected in the system
    
    Args:
        limit: Maximum number of anomalies to return
        db: Database session
        
    Returns:
        List of recent anomalies
    """
    return db.query(Anomaly).order_by(Anomaly.detected_at.desc()).limit(limit).all()


# Sales history
@app.get("/api/v1/demand/historical/{sku}")
def get_historical_sales(sku: str, db: Session = Depends(get_db)):
    """
    Get historical sales data for a specific SKU
    
    Args:
        sku: Product SKU
        db: Database session
        
    Returns:
        Historical sales data with dates, quantities, and revenue
    """
    sales = db.query(SalesHistory).filter(SalesHistory.sku == sku).order_by(SalesHistory.date).all()
    
    logger.info(f"Retrieved {len(sales)} sales records for SKU: {sku}")
    
    return {
        "sku": sku,
        "total_records": len(sales),
        "sales_history": [
            {"date": s.date.isoformat(), "quantity": s.quantity, "revenue": s.revenue}
            for s in sales
        ]
    }


@app.on_event("startup")
async def startup_event():
    """
    Application startup event handler
    """
    logger.info("=" * 60)
    logger.info("Warefy API Starting Up")
    logger.info("=" * 60)
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"Database: SQLite")
    logger.info(f"API Version: v1")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event handler
    """
    logger.info("=" * 60)
    logger.info("Warefy API Shutting Down")
    logger.info("=" * 60)


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Uvicorn server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
