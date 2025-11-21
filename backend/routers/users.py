'''User management router – admin only'''

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..auth_lite import get_current_active_user, require_role, get_password_hash
from ..database_lite import get_db
from ..models_lite import User
from ..schemas import UserResponse, UserUpdate

router = APIRouter(prefix="/api/users", tags=["User Management"])

# List all users – admin only
@router.get("/", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    return db.query(User).all()

# Get a single user – admin only (or self)
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Update user – admin only (or self for limited fields)
@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Admin can change role, active status, 2FA flag
    if current_user.role == "admin":
        if payload.role is not None:
            user.role = payload.role
        if payload.is_active is not None:
            user.is_active = payload.is_active
        if payload.is_2fa_enabled is not None:
            user.is_2fa_enabled = payload.is_2fa_enabled
    
    # Self (or admin) can change full_name and password
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.password is not None:
        user.hashed_password = get_password_hash(payload.password)
        
    db.commit()
    db.refresh(user)
    return user

# Get user usage stats – admin only
@router.get("/{user_id}/usage")
def get_user_usage(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    from ..models_lite import AICommandLog
    from datetime import datetime, timedelta
    
    # Count total requests
    total_requests = db.query(AICommandLog).filter(AICommandLog.user_id == user_id).count()
    
    # Count requests in last 24 hours
    last_24h = datetime.utcnow() - timedelta(hours=24)
    requests_24h = db.query(AICommandLog).filter(
        AICommandLog.user_id == user_id,
        AICommandLog.created_at >= last_24h
    ).count()
    
    return {
        "user_id": user_id,
        "total_requests": total_requests,
        "requests_24h": requests_24h
    }

# Get audit logs – admin only
@router.get("/audit/logs")
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    from ..models_lite import AuditLog
    
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs

