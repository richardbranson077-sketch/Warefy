"""
Settings Router - User preferences and system configuration
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

from backend.database_lite import get_db
from backend.models_lite import User, UserSettings
from backend.auth_lite import get_current_active_user, get_password_hash, verify_password

router = APIRouter(prefix="/api/v1/settings", tags=["Settings"])

# Pydantic Schemas
class UserSettingsResponse(BaseModel):
    # Appearance
    theme: str
    language: str
    timezone: str
    date_format: str
    time_format: str
    
    # Notifications
    notifications_email: bool
    notifications_push: bool
    notifications_sms: bool
    notification_frequency: str
    notify_low_stock: bool
    notify_anomalies: bool
    notify_route_delays: bool
    notify_system_updates: bool
    
    # Security
    two_factor_enabled: bool
    session_timeout: int
    
    # System (Admin only)
    api_rate_limit: Optional[int] = None
    data_retention_days: Optional[int] = None
    
    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    date_format: Optional[str] = None
    time_format: Optional[str] = None
    notifications_email: Optional[bool] = None
    notifications_push: Optional[bool] = None
    notifications_sms: Optional[bool] = None
    notification_frequency: Optional[str] = None
    notify_low_stock: Optional[bool] = None
    notify_anomalies: Optional[bool] = None
    notify_route_delays: Optional[bool] = None
    notify_system_updates: Optional[bool] = None
    session_timeout: Optional[int] = None
    api_rate_limit: Optional[int] = None
    data_retention_days: Optional[int] = None

class UserProfileResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool
    is_2fa_enabled: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class TwoFactorRequest(BaseModel):
    code: Optional[str] = None

# Helper function to get or create settings
def get_or_create_settings(db: Session, user_id: int) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

# Settings Endpoints
@router.get("", response_model=UserSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's settings"""
    settings = get_or_create_settings(db, current_user.id)
    
    # Hide admin fields for non-admin users
    response = UserSettingsResponse.from_orm(settings)
    if current_user.role != "admin":
        response.api_rate_limit = None
        response.data_retention_days = None
    
    return response

@router.put("", response_model=UserSettingsResponse)
def update_settings(
    update_data: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update user settings"""
    settings = get_or_create_settings(db, current_user.id)
    
    # Update only provided fields
    update_dict = update_data.dict(exclude_unset=True)
    
    # Restrict admin-only fields
    if current_user.role != "admin":
        update_dict.pop("api_rate_limit", None)
        update_dict.pop("data_retention_days", None)
    
    for key, value in update_dict.items():
        setattr(settings, key, value)
    
    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)
    
    response = UserSettingsResponse.from_orm(settings)
    if current_user.role != "admin":
        response.api_rate_limit = None
        response.data_retention_days = None
    
    return response

# Profile Endpoints
@router.get("/profile", response_model=UserProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's profile"""
    return current_user

@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update user profile"""
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    
    if profile_data.email is not None:
        # Check if email is already taken
        existing = db.query(User).filter(
            User.email == profile_data.email,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = profile_data.email
    
    db.commit()
    db.refresh(current_user)
    return current_user

# Security Endpoints
@router.post("/password")
def change_password(
    password_data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Change user password"""
    # Verify old password
    if not verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

@router.post("/2fa/enable")
def enable_2fa(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Enable two-factor authentication"""
    current_user.is_2fa_enabled = True
    
    # Also update settings
    settings = get_or_create_settings(db, current_user.id)
    settings.two_factor_enabled = True
    
    db.commit()
    
    return {
        "message": "Two-factor authentication enabled",
        "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "secret": "JBSWY3DPEHPK3PXP"
    }

@router.post("/2fa/disable")
def disable_2fa(
    request: TwoFactorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Disable two-factor authentication"""
    # In production, verify the 2FA code here
    current_user.is_2fa_enabled = False
    
    # Also update settings
    settings = get_or_create_settings(db, current_user.id)
    settings.two_factor_enabled = False
    
    db.commit()
    
    return {"message": "Two-factor authentication disabled"}

@router.get("/sessions")
def get_active_sessions(
    current_user: User = Depends(get_current_active_user)
):
    """Get active sessions (mock data for now)"""
    return [
        {
            "id": 1,
            "device": "Chrome on MacOS",
            "ip_address": "192.168.1.1",
            "location": "San Francisco, CA",
            "last_active": datetime.utcnow().isoformat(),
            "is_current": True
        }
    ]

# Enhanced Security Endpoints
from backend.models_lite import LoginHistory, ActiveSession, APIKey, SecurityAuditLog
import secrets
import hashlib

class LoginHistoryResponse(BaseModel):
    id: int
    ip_address: str
    user_agent: str
    location: Optional[str]
    device: Optional[str]
    status: str
    login_at: datetime
    
    class Config:
        from_attributes = True

class ActiveSessionResponse(BaseModel):
    id: int
    ip_address: str
    user_agent: str
    device: Optional[str]
    location: Optional[str]
    created_at: datetime
    last_active: datetime
    expires_at: datetime
    is_current: bool = False
    
    class Config:
        from_attributes = True

class APIKeyResponse(BaseModel):
    id: int
    name: str
    key_prefix: str
    permissions: list
    last_used: Optional[datetime]
    created_at: datetime
    expires_at: Optional[datetime]
    is_active: bool
    
    class Config:
        from_attributes = True

class APIKeyCreate(BaseModel):
    name: str
    permissions: list = []
    expires_in_days: Optional[int] = None

class SecurityAuditLogResponse(BaseModel):
    id: int
    action: str
    details: Optional[dict]
    ip_address: str
    user_agent: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Helper function to log security events
def log_security_event(
    db: Session,
    user_id: int,
    action: str,
    details: dict = None,
    ip_address: str = "0.0.0.0",
    user_agent: str = None
):
    log = SecurityAuditLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(log)
    db.commit()

@router.get("/security/login-history", response_model=list[LoginHistoryResponse])
def get_login_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's login history"""
    history = db.query(LoginHistory).filter(
        LoginHistory.user_id == current_user.id
    ).order_by(LoginHistory.login_at.desc()).limit(limit).all()
    
    return history

@router.get("/security/sessions", response_model=list[ActiveSessionResponse])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all active sessions for the user"""
    sessions = db.query(ActiveSession).filter(
        ActiveSession.user_id == current_user.id,
        ActiveSession.expires_at > datetime.utcnow()
    ).order_by(ActiveSession.last_active.desc()).all()
    
    # Mark current session (simplified - in production, check JWT token)
    if sessions:
        sessions[0].is_current = True
    
    return sessions

@router.delete("/security/sessions/{session_id}")
def revoke_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Revoke a specific session"""
    session = db.query(ActiveSession).filter(
        ActiveSession.id == session_id,
        ActiveSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.delete(session)
    db.commit()
    
    log_security_event(
        db, current_user.id, "session_revoked",
        {"session_id": session_id}
    )
    
    return {"message": "Session revoked successfully"}

@router.delete("/security/sessions")
def revoke_all_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Revoke all sessions except current"""
    db.query(ActiveSession).filter(
        ActiveSession.user_id == current_user.id
    ).delete()
    db.commit()
    
    log_security_event(
        db, current_user.id, "all_sessions_revoked"
    )
    
    return {"message": "All sessions revoked successfully"}

@router.get("/security/api-keys", response_model=list[APIKeyResponse])
def get_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all API keys for the user"""
    keys = db.query(APIKey).filter(
        APIKey.user_id == current_user.id
    ).order_by(APIKey.created_at.desc()).all()
    
    return keys

@router.post("/security/api-keys")
def create_api_key(
    key_data: APIKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new API key"""
    # Generate secure random key
    full_key = f"wfy_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(full_key.encode()).hexdigest()
    key_prefix = full_key[:12]
    
    # Calculate expiration
    expires_at = None
    if key_data.expires_in_days:
        from datetime import timedelta
        expires_at = datetime.utcnow() + timedelta(days=key_data.expires_in_days)
    
    api_key = APIKey(
        user_id=current_user.id,
        name=key_data.name,
        key_prefix=key_prefix,
        key_hash=key_hash,
        permissions=key_data.permissions,
        expires_at=expires_at
    )
    
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    
    log_security_event(
        db, current_user.id, "api_key_created",
        {"key_name": key_data.name, "key_id": api_key.id}
    )
    
    # Return the full key only once
    return {
        "id": api_key.id,
        "name": api_key.name,
        "key": full_key,  # Only shown once!
        "key_prefix": key_prefix,
        "permissions": api_key.permissions,
        "created_at": api_key.created_at,
        "expires_at": api_key.expires_at,
        "message": "Save this key securely. It won't be shown again!"
    }

@router.delete("/security/api-keys/{key_id}")
def revoke_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Revoke an API key"""
    api_key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_user.id
    ).first()
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    db.delete(api_key)
    db.commit()
    
    log_security_event(
        db, current_user.id, "api_key_revoked",
        {"key_name": api_key.name, "key_id": key_id}
    )
    
    return {"message": "API key revoked successfully"}

@router.get("/security/audit-logs", response_model=list[SecurityAuditLogResponse])
def get_audit_logs(
    limit: int = 100,
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get security audit logs"""
    query = db.query(SecurityAuditLog).filter(
        SecurityAuditLog.user_id == current_user.id
    )
    
    if action:
        query = query.filter(SecurityAuditLog.action == action)
    
    logs = query.order_by(SecurityAuditLog.created_at.desc()).limit(limit).all()
    
    return logs

@router.get("/security/trusted-devices")
def get_trusted_devices(
    current_user: User = Depends(get_current_active_user)
):
    """Get list of trusted devices (mock for now)"""
    return [
        {
            "id": 1,
            "name": "MacBook Pro",
            "device_type": "desktop",
            "last_used": datetime.utcnow().isoformat(),
            "added_at": "2024-01-15T10:00:00Z",
            "is_current": True
        }
    ]

@router.post("/security/trusted-devices/{device_id}/remove")
def remove_trusted_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove a trusted device"""
    log_security_event(
        db, current_user.id, "trusted_device_removed",
        {"device_id": device_id}
    )
    
    return {"message": "Trusted device removed successfully"}

