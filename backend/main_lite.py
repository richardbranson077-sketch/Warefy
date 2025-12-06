"""
Warefy API - Lightweight FastAPI Application
AI-Powered Supply Chain Optimizer with SQLite backend
"""

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()
import sys
import time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database_lite import get_db, init_db, SessionLocal
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

# Seed database if empty
from backend.models_lite import User
from backend.auth_lite import get_password_hash
db = SessionLocal()
try:
    user_count = db.query(User).count()
    if user_count == 0:
        logger.info("Database is empty, seeding with default admin user...")
        admin = User(
            email="admin@warefy.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        logger.info("✅ Admin user created: admin/admin123")
    else:
        logger.info(f"Database already has {user_count} users")
finally:
    db.close()

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
    routes,
    vehicles,
    websocket,  # WebSocket support for real-time features
    advanced_reporting
)

# CORS Configuration - Use environment variable for allowed origins
ALLOWED_ORIGINS_STR = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://warefy.vercel.app,https://warefy-git-main-fastrocketdelivery.vercel.app")
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",")]
logger.info(f"CORS allowed origins: {ALLOWED_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
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
    
    # Log Origin header for CORS debugging
    origin = request.headers.get("origin")
    logger.info(f"DEBUG: Request Origin: {origin}")
    
    # Process request
    response = await call_next(request)
    
    # Log CORS headers in response
    acao = response.headers.get("access-control-allow-origin")
    logger.info(f"DEBUG: Response ACAO: {acao}")
    
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
app.include_router(auth.router)  # Prefix defined in router: /api/v1/auth
app.include_router(notifications.router) # Prefix defined in router: /api/v1/notifications
app.include_router(orders.router, tags=["Orders"])  # Already has /api/v1/orders prefix
app.include_router(reports.router) # Prefix defined in router: /api/v1/reports
app.include_router(integrations.router) # Prefix defined in router: /api/v1/integrations
app.include_router(warehouses.router, tags=["Warehouses"])  # Prefix defined in router
app.include_router(users.router) # Prefix defined in router: /api/v1/users
app.include_router(ai_command.router) # Prefix defined in router: /api/v1/ai-command
app.include_router(routes.router, tags=["Routes"])  # Already has /api/v1/routes prefix
app.include_router(vehicles.router, tags=["Vehicles"])  # Already has /api/v1/vehicles prefix
app.include_router(advanced_reporting.router)

# Import mock routers for endpoints that would require full database
# Import mock routers for endpoints that would require full database
from backend.routers.mock_routers import (
    returns_router, labor_router, quality_router,
    inventory_router, anomalies_router, forecasting_router,
    orders_stats_router, ai_reports_router, edge_ai_router,
    ai_recommendations_router, ai_commands_router, financials_router,
    knowledge_base_router,
    settings_router, computer_vision_router, ai_chat_router
)

# Import real shipping router
from backend.routers.shipping import router as shipping_router

# Register mock routers
app.include_router(shipping_router)
app.include_router(returns_router)
app.include_router(labor_router)
app.include_router(quality_router)
# app.include_router(demand_router)  # Replaced by real router
# app.include_router(inventory_router) # Replaced by real router
# app.include_router(anomalies_router) # Replaced by real router
app.include_router(forecasting_router)
# app.include_router(orders_stats_router) # Replaced by real router
# app.include_router(ai_reports_router)  # Replaced by real router
app.include_router(edge_ai_router)
# app.include_router(ai_recommendations_router)  # Replaced by real router
app.include_router(ai_commands_router)
app.include_router(financials_router)
# app.include_router(blockchain_router)  # Replaced by real router
# app.include_router(collaboration_router)  # Replaced by real router
# app.include_router(knowledge_base_router)
# app.include_router(settings_router)  # Replaced by real router
# app.include_router(computer_vision_router)  # Replaced by real router
app.include_router(ai_chat_router)

# Import and register lite-compatible routers
from backend.routers import (
    reorder, rbac, benchmarking, ecommerce_sync, erp_sync
)

# Operations routers
app.include_router(reorder.router, prefix="/api/v1", tags=["Reorder"])

# AI Routers (Real)
from backend.routers import ai_recommendations, computer_vision, demand, ai_reports
app.include_router(ai_recommendations.router) # Prefix defined in router: /api/v1/recommendations
app.include_router(computer_vision.router, prefix="/api/v1/vision", tags=["Computer Vision"])
app.include_router(demand.router) # Prefix defined in router: /api/v1/demand
app.include_router(ai_reports.router, tags=["AI Reports"])

# Admin & Security routers
app.include_router(rbac.router) # Prefix defined in router: /api/v1/rbac

# AI & Analytics routers
app.include_router(benchmarking.router) # Prefix defined in router: /api/v1/benchmarking

# Integration routers
app.include_router(ecommerce_sync.router) # Prefix defined in router: /api/v1/ecommerce
app.include_router(erp_sync.router) # Prefix defined in router: /api/v1/erp

# Real Inventory Router
from backend.routers import inventory
app.include_router(inventory.router)

# Real Anomalies Router
from backend.routers import anomalies
app.include_router(anomalies.router)

# Real Blockchain Router
from backend.routers import blockchain
app.include_router(blockchain.router, prefix="/api/v1", tags=["Blockchain"])

# Real Collaboration Router
from backend.routers import collaboration
app.include_router(collaboration.router, prefix="/api/v1", tags=["Collaboration"])

# Real Knowledge Base Router
from backend.routers import knowledge_base
app.include_router(knowledge_base.router, prefix="/api/v1/knowledge-base", tags=["Knowledge Base"])

# Real Settings Router
from backend.routers import settings
app.include_router(settings.router, tags=["Settings"])

# Health and WebSocket routers
app.include_router(health_router, tags=["Health"])
app.include_router(websocket.router, tags=["WebSocket"])  # Real-time WebSocket endpoints

logger.info("All routers registered successfully (including mock routers for compatibility)")


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


# Inventory endpoints are now handled by the dedicated router
# See backend/routers/inventory.py


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
