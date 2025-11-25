"""
Edge AI Router - Edge computing and model deployment
Status: Coming Soon (Mock Data)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from backend.database_lite import get_db
from backend.models_lite import User
from backend.auth_lite import get_current_active_user
from backend.base_schema import CamelCaseModel

router = APIRouter(prefix="/edge-ai", tags=["Edge AI"])


class EdgeAIModelResponse(CamelCaseModel):
    id: int
    name: str
    version: str
    device_count: int
    status: str
    deployed_at: datetime


@router.get("/models", response_model=List[EdgeAIModelResponse])
def get_edge_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all edge AI models (Mock Data - Coming Soon)
    """
    return [
        {
            "id": 1,
            "name": "Object Detection Model",
            "version": "1.0.0",
            "device_count": 5,
            "status": "coming_soon",
            "deployed_at": datetime.now()
        },
        {
            "id": 2,
            "name": "Inventory Counter Model",
            "version": "1.2.0",
            "device_count": 3,
            "status": "coming_soon",
            "deployed_at": datetime.now()
        }
    ]


@router.post("/models", response_model=EdgeAIModelResponse)
def deploy_edge_model(
    name: str,
    version: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Deploy edge AI model (Mock Data - Coming Soon)
    """
    return {
        "id": 3,
        "name": name,
        "version": version,
        "device_count": 0,
        "status": "coming_soon",
        "deployed_at": datetime.now()
    }


@router.delete("/models/{model_id}")
def remove_edge_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Remove edge AI model (Mock Data - Coming Soon)
    """
    return {"message": "Edge AI deployment coming soon", "status": "coming_soon"}
