"""
Application Performance Monitoring and Health Checks
Integrates with Sentry and provides health check endpoints
"""

import os
import time
from typing import Dict, Any, Optional
from datetime import datetime
import psutil
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.database_lite import get_db

# Initialize Sentry (optional)
SENTRY_DSN = os.getenv("SENTRY_DSN")

if SENTRY_DSN:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
        
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
            ],
            traces_sample_rate=0.1,  # 10% of transactions
            profiles_sample_rate=0.1,  # 10% of transactions
            environment=os.getenv("ENVIRONMENT", "development"),
        )
        print("✅ Sentry initialized successfully")
    except ImportError:
        print("⚠️  Sentry SDK not installed. Run: pip install sentry-sdk")
except Exception as e:
    print(f"⚠️  Sentry initialization failed: {e}")


router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/")
async def health_check() -> Dict[str, Any]:
    """
    Basic health check endpoint
    
    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "warefy-api"
    }


@router.get("/detailed")
async def detailed_health_check(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Detailed health check with database and system metrics
    
    Returns:
        Detailed health information
    """
    health_data = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "warefy-api",
        "checks": {}
    }
    
    # Database check
    try:
        start_time = time.time()
        db.execute(text("SELECT 1"))
        db_latency = (time.time() - start_time) * 1000  # ms
        
        health_data["checks"]["database"] = {
            "status": "healthy",
            "latency_ms": round(db_latency, 2)
        }
    except Exception as e:
        health_data["status"] = "unhealthy"
        health_data["checks"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    # System metrics
    try:
        health_data["checks"]["system"] = {
            "status": "healthy",
            "cpu_percent": psutil.cpu_percent(interval=0.1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent
        }
    except Exception as e:
        health_data["checks"]["system"] = {
            "status": "degraded",
            "error": str(e)
        }
    
    return health_data


@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Readiness check for Kubernetes/Docker
    
    Returns:
        Ready status
    """
    try:
        # Check database connection
        db.execute(text("SELECT 1"))
        
        return {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "not_ready",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/live")
async def liveness_check() -> Dict[str, Any]:
    """
    Liveness check for Kubernetes/Docker
    
    Returns:
        Live status
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }


# Performance metrics collection
class PerformanceMetrics:
    """Collect and track performance metrics"""
    
    def __init__(self):
        self.request_count = 0
        self.error_count = 0
        self.total_duration = 0.0
        self.slow_requests = 0
        self.start_time = time.time()
    
    def record_request(self, duration_ms: float, status_code: int):
        """Record request metrics"""
        self.request_count += 1
        self.total_duration += duration_ms
        
        if status_code >= 400:
            self.error_count += 1
        
        if duration_ms > 1000:  # >1s is slow
            self.slow_requests += 1
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics"""
        uptime = time.time() - self.start_time
        avg_duration = self.total_duration / self.request_count if self.request_count > 0 else 0
        
        return {
            "uptime_seconds": round(uptime, 2),
            "total_requests": self.request_count,
            "error_count": self.error_count,
            "error_rate": round(self.error_count / self.request_count * 100, 2) if self.request_count > 0 else 0,
            "average_duration_ms": round(avg_duration, 2),
            "slow_requests": self.slow_requests,
            "requests_per_second": round(self.request_count / uptime, 2) if uptime > 0 else 0
        }


# Global metrics instance
metrics = PerformanceMetrics()


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    """
    Get application metrics
    
    Returns:
        Performance metrics
    """
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "metrics": metrics.get_metrics()
    }
