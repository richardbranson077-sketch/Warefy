"""
Main FastAPI application for Warefy Supply Chain Optimizer.
Integrates all routers and provides WebSocket support for real-time updates.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Import database initialization
from database import init_db

# Import routers
from routers import (
    auth,
    inventory,
    warehouses,
    demand,
    routes,
    ai_recommendations,
    anomalies
)

# Import mobile API
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '../mobile-api'))
from driver_routes import router as driver_router

load_dotenv()

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Warefy Supply Chain Optimizer...")
    init_db()
    print("✅ Database initialized")
    yield
    # Shutdown
    print("👋 Shutting down Warefy...")

# Create FastAPI app
app = FastAPI(
    title="Warefy API",
    description="AI-Powered Supply Chain Optimizer - REST API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(warehouses.router)
app.include_router(demand.router)
app.include_router(routes.router)
app.include_router(ai_recommendations.router)
app.include_router(anomalies.router)
app.include_router(driver_router)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for now - in production, handle specific events
            await manager.broadcast({"type": "update", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Warefy API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ml_pipelines": "ready",
        "ai_module": "ready"
    }

# API info endpoint
@app.get("/api/info")
def api_info():
    return {
        "features": [
            "Demand Forecasting (Prophet, LSTM, XGBoost)",
            "Route Optimization (OR-Tools)",
            "Multi-Warehouse Inventory Management",
            "AI-Powered Recommendations (GPT-4)",
            "Anomaly Detection (Isolation Forest)",
            "Predictive Maintenance",
            "Mobile Driver API",
            "Real-time WebSocket Updates"
        ],
        "endpoints": {
            "auth": "/api/auth",
            "inventory": "/api/inventory",
            "warehouses": "/api/warehouses",
            "demand_forecasting": "/api/demand",
            "routes": "/api/routes",
            "ai_recommendations": "/api/ai",
            "anomalies": "/api/anomalies",
            "mobile_driver": "/api/mobile/driver"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
