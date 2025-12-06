"""
Edge AI Router - Comprehensive edge computing and model deployment platform
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import json
import random
import os

from backend.database_lite import get_db
from backend.models_lite import User
from backend.auth_lite import get_current_active_user

try:
    import google.generativeai as genai
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
except ImportError:
    genai = None
    api_key = None

router = APIRouter(prefix="/api/v1/edge-ai", tags=["Edge AI"])

# ========================================================================
# SCHEMAS
# ========================================================================

class DeviceRegisterRequest(BaseModel):
    name: str
    device_type: str  # "camera", "sensor", "iot", "gateway"
    location: str
    hardware_specs: Dict[str, Any]

class DeviceResponse(BaseModel):
    id: str
    name: str
    device_type: str
    location: str
    status: str  # "online", "offline", "processing"
    cpu_usage: float
    memory_usage: float
    storage_usage: float
    last_seen: str
    deployed_models: List[str]

class ModelDeployRequest(BaseModel):
    model_name: str
    model_type: str  # "object_detection", "classification", "segmentation"
    device_ids: List[str]
    optimization_level: str  # "speed", "balanced", "accuracy"

class InferenceRequest(BaseModel):
    device_id: str
    model_name: str
    input_data: Optional[str] = None  # Base64 encoded image or JSON data

class InferenceResponse(BaseModel):
    device_id: str
    model_name: str
    results: Dict[str, Any]
    latency_ms: float
    timestamp: str

# In-memory storage (replace with DB in production)
edge_devices: List[Dict] = []
deployed_models: List[Dict] = []
inference_history: List[Dict] = []

# ========================================================================
# DEVICE MANAGEMENT ENDPOINTS
# ========================================================================

@router.post("/devices/register")
async def register_device(
    request: DeviceRegisterRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Register a new edge device"""
    
    device = {
        "id": f"device_{len(edge_devices) + 1}_{int(datetime.now().timestamp())}",
        "name": request.name,
        "device_type": request.device_type,
        "location": request.location,
        "hardware_specs": request.hardware_specs,
        "status": "online",
        "cpu_usage": random.uniform(10, 40),
        "memory_usage": random.uniform(20, 60),
        "storage_usage": random.uniform(30, 70),
        "last_seen": datetime.now().isoformat(),
        "deployed_models": [],
        "registered_at": datetime.now().isoformat(),
        "total_inferences": 0
    }
    
    edge_devices.append(device)
    
    return {
        "message": "Device registered successfully",
        "device": device
    }

@router.get("/devices")
async def get_devices(
    current_user: User = Depends(get_current_active_user)
):
    """Get all edge devices with current status"""
    
    # Update device stats with some randomness for demo
    for device in edge_devices:
        device["cpu_usage"] = min(100, max(0, device["cpu_usage"] + random.uniform(-5, 5)))
        device["memory_usage"] = min(100, max(0, device["memory_usage"] + random.uniform(-3, 3)))
        device["last_seen"] = datetime.now().isoformat()
        
        # Randomly set some devices offline
        if random.random() < 0.1:
            device["status"] = "offline"
        else:
            device["status"] = "online"
    
    return edge_devices

@router.get("/devices/{device_id}")
async def get_device(
    device_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get specific device details"""
    
    device = next((d for d in edge_devices if d["id"] == device_id), None)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    return device

@router.delete("/devices/{device_id}")
async def unregister_device(
    device_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Unregister an edge device"""
    
    global edge_devices
    edge_devices = [d for d in edge_devices if d["id"] != device_id]
    
    return {"message": "Device unregistered successfully"}

# ========================================================================
# MODEL DEPLOYMENT ENDPOINTS
# ========================================================================

@router.post("/models/deploy")
async def deploy_model(
    request: ModelDeployRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Deploy AI model to edge devices"""
    
    # Validate devices exist
    for device_id in request.device_ids:
        device = next((d for d in edge_devices if d["id"] == device_id), None)
        if not device:
            raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    
    model = {
        "id": f"model_{len(deployed_models) + 1}_{int(datetime.now().timestamp())}",
        "name": request.model_name,
        "type": request.model_type,
        "version": "1.0.0",
        "device_ids": request.device_ids,
        "optimization_level": request.optimization_level,
        "status": "deployed",
        "deployed_at": datetime.now().isoformat(),
        "total_inferences": 0,
        "avg_latency_ms": random.uniform(50, 200),
        "accuracy": random.uniform(85, 98)
    }
    
    deployed_models.append(model)
    
    # Update devices with deployed model
    for device_id in request.device_ids:
        device = next((d for d in edge_devices if d["id"] == device_id), None)
        if device and request.model_name not in device["deployed_models"]:
            device["deployed_models"].append(request.model_name)
    
    return {
        "message": "Model deployed successfully",
        "model": model
    }

@router.get("/models")
async def get_models(
    current_user: User = Depends(get_current_active_user)
):
    """Get all deployed models"""
    return deployed_models

@router.delete("/models/{model_id}")
async def undeploy_model(
    model_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Undeploy a model from all devices"""
    
    global deployed_models
    model = next((m for m in deployed_models if m["id"] == model_id), None)
    
    if model:
        # Remove from devices
        for device in edge_devices:
            if model["name"] in device["deployed_models"]:
                device["deployed_models"].remove(model["name"])
        
        deployed_models = [m for m in deployed_models if m["id"] != model_id]
    
    return {"message": "Model undeployed successfully"}

# ========================================================================
# INFERENCE ENDPOINTS
# ========================================================================

@router.post("/inference")
async def run_inference(
    request: InferenceRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Run inference on edge device"""
    
    device = next((d for d in edge_devices if d["id"] == request.device_id), None)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    if device["status"] == "offline":
        raise HTTPException(status_code=503, detail="Device is offline")
    
    model = next((m for m in deployed_models if m["name"] == request.model_name), None)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Simulate inference with mock results
    latency = random.uniform(50, 300)
    
    if model["type"] == "object_detection":
        results = {
            "objects": [
                {"class": "box", "confidence": 0.95, "bbox": [100, 100, 200, 200]},
                {"class": "pallet", "confidence": 0.89, "bbox": [300, 150, 450, 350]},
                {"class": "forklift", "confidence": 0.92, "bbox": [500, 200, 700, 400]}
            ],
            "count": 3
        }
    elif model["type"] == "classification":
        results = {
            "class": "damaged_package",
            "confidence": 0.87,
            "top_3": [
                {"class": "damaged_package", "confidence": 0.87},
                {"class": "normal_package", "confidence": 0.10},
                {"class": "wet_package", "confidence": 0.03}
            ]
        }
    else:
        results = {
            "prediction": "success",
            "confidence": 0.91
        }
    
    inference_result = {
        "id": f"inf_{len(inference_history) + 1}",
        "device_id": request.device_id,
        "model_name": request.model_name,
        "results": results,
        "latency_ms": latency,
        "timestamp": datetime.now().isoformat()
    }
    
    inference_history.append(inference_result)
    
    # Update stats
    device["total_inferences"] = device.get("total_inferences", 0) + 1
    model["total_inferences"] = model.get("total_inferences", 0) + 1
    
    return inference_result

@router.get("/inference/history")
async def get_inference_history(
    limit: int = 50,
    current_user: User = Depends(get_current_active_user)
):
    """Get inference history"""
    return inference_history[-limit:]

# ========================================================================
# PERFORMANCE & ANALYTICS ENDPOINTS
# ========================================================================

@router.get("/performance")
async def get_performance_metrics(
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive performance metrics"""
    
    # Calculate aggregate metrics
    total_devices = len(edge_devices)
    online_devices = len([d for d in edge_devices if d["status"] == "online"])
    total_models = len(deployed_models)
    total_inferences = sum(d.get("total_inferences", 0) for d in edge_devices)
    
    # Generate time-series data for charts
    now = datetime.now()
    latency_data = []
    throughput_data = []
    
    for i in range(24):
        time = (now - timedelta(hours=23-i)).strftime("%H:00")
        latency_data.append({
            "time": time,
            "avg_latency": random.uniform(80, 200),
            "p95_latency": random.uniform(200, 350)
        })
        throughput_data.append({
            "time": time,
            "inferences": random.randint(50, 200)
        })
    
    # Device resource utilization
    device_resources = [
        {
            "device_name": d["name"],
            "cpu": d["cpu_usage"],
            "memory": d["memory_usage"],
            "storage": d["storage_usage"]
        }
        for d in edge_devices[:10]  # Top 10 devices
    ]
    
    # Model performance comparison
    model_performance = [
        {
            "model_name": m["name"],
            "avg_latency": m.get("avg_latency_ms", 0),
            "accuracy": m.get("accuracy", 0),
            "total_inferences": m.get("total_inferences", 0)
        }
        for m in deployed_models
    ]
    
    return {
        "summary": {
            "total_devices": total_devices,
            "online_devices": online_devices,
            "total_models": total_models,
            "total_inferences": total_inferences,
            "avg_latency_ms": random.uniform(100, 180)
        },
        "latency_trend": latency_data,
        "throughput_trend": throughput_data,
        "device_resources": device_resources,
        "model_performance": model_performance
    }

@router.post("/optimize")
async def optimize_model(
    model_id: str,
    optimization_type: str,  # "quantize", "prune", "distill"
    current_user: User = Depends(get_current_active_user)
):
    """Optimize model for edge deployment"""
    
    model = next((m for m in deployed_models if m["id"] == model_id), None)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Simulate optimization
    optimization_results = {
        "original_size_mb": random.uniform(50, 200),
        "optimized_size_mb": random.uniform(10, 50),
        "size_reduction": random.uniform(60, 85),
        "latency_improvement": random.uniform(20, 50),
        "accuracy_change": random.uniform(-2, 0.5),
        "optimization_type": optimization_type
    }
    
    # Update model with optimized stats
    model["avg_latency_ms"] = model["avg_latency_ms"] * (1 - optimization_results["latency_improvement"] / 100)
    model["version"] = f"{model['version']}-optimized"
    
    return {
        "message": "Model optimized successfully",
        "results": optimization_results
    }

# ========================================================================
# INITIALIZATION - Create some demo devices and models
# ========================================================================

def initialize_demo_data():
    """Initialize with demo devices and models"""
    if len(edge_devices) == 0:
        demo_devices = [
            {
                "id": f"device_demo_{i}",
                "name": f"Edge Device {i+1}",
                "device_type": ["camera", "sensor", "iot", "gateway"][i % 4],
                "location": ["Warehouse A", "Warehouse B", "Loading Dock", "Storage Room"][i % 4],
                "hardware_specs": {"cpu": "ARM Cortex-A72", "memory": "4GB", "storage": "32GB"},
                "status": "online",
                "cpu_usage": random.uniform(10, 40),
                "memory_usage": random.uniform(20, 60),
                "storage_usage": random.uniform(30, 70),
                "last_seen": datetime.now().isoformat(),
                "deployed_models": [],
                "registered_at": datetime.now().isoformat(),
                "total_inferences": random.randint(100, 1000)
            }
            for i in range(5)
        ]
        edge_devices.extend(demo_devices)
        
        demo_models = [
            {
                "id": "model_demo_1",
                "name": "Object Detection v2",
                "type": "object_detection",
                "version": "2.1.0",
                "device_ids": [edge_devices[0]["id"], edge_devices[1]["id"]],
                "optimization_level": "balanced",
                "status": "deployed",
                "deployed_at": datetime.now().isoformat(),
                "total_inferences": random.randint(500, 2000),
                "avg_latency_ms": random.uniform(80, 150),
                "accuracy": 94.5
            },
            {
                "id": "model_demo_2",
                "name": "Package Classifier",
                "type": "classification",
                "version": "1.5.0",
                "device_ids": [edge_devices[2]["id"]],
                "optimization_level": "speed",
                "status": "deployed",
                "deployed_at": datetime.now().isoformat(),
                "total_inferences": random.randint(300, 1500),
                "avg_latency_ms": random.uniform(50, 100),
                "accuracy": 91.2
            }
        ]
        deployed_models.extend(demo_models)
        
        # Update devices with deployed models
        edge_devices[0]["deployed_models"].append("Object Detection v2")
        edge_devices[1]["deployed_models"].append("Object Detection v2")
        edge_devices[2]["deployed_models"].append("Package Classifier")

# Initialize demo data on module load
initialize_demo_data()
