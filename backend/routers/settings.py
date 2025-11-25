"""
Settings Router - Application settings and configuration
Status: Coming Soon (Mock Data)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.database_lite import get_db
from backend.models_lite import User
from backend.auth_lite import get_current_active_user
from backend.base_schema import CamelCaseModel

router = APIRouter(prefix="/settings", tags=["Settings"])


class SettingsResponse(CamelCaseModel):
    general: Dict[str, Any]
    notifications: Dict[str, Any]
    security: Dict[str, Any]
    status: str = "coming_soon"


@router.get("", response_model=SettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get application settings (Mock Data - Coming Soon)
    """
    return {
        "general": {
            "company_name": "Warefy",
            "timezone": "UTC",
            "language": "en",
            "currency": "USD"
        },
        "notifications": {
            "email_enabled": True,
            "sms_enabled": False,
            "push_enabled": True
        },
        "security": {
            "two_factor_enabled": False,
            "session_timeout": 30,
            "password_expiry_days": 90
        },
        "status": "coming_soon"
    }


@router.put("", response_model=SettingsResponse)
def update_settings(
    settings: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update application settings (Mock Data - Coming Soon)
    """
    return {
        "general": settings.get("general", {}),
        "notifications": settings.get("notifications", {}),
        "security": settings.get("security", {}),
        "status": "coming_soon"
    }
