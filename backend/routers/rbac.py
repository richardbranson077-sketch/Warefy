"""
Role-Based Access Control (RBAC) 2.0
Granular permissions, custom roles, field-level access, approval workflows
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

from backend.database_lite import get_db
from backend.auth_lite import get_current_active_user
from backend.models_lite import User

router = APIRouter(prefix="/api/v1/rbac", tags=["RBAC"])

# ========================================================================
# ENUMS & SCHEMAS
# ========================================================================

class Permission(str, Enum):
    VIEW = "view"
    CREATE = "create"
    EDIT = "edit"
    DELETE = "delete"
    APPROVE = "approve"
    EXPORT = "export"

class Module(str, Enum):
    INVENTORY = "inventory"
    ORDERS = "orders"
    SHIPPING = "shipping"
    RETURNS = "returns"
    REPORTS = "reports"
    USERS = "users"
    SETTINGS = "settings"
    LABOR = "labor"
    QUALITY = "quality"

class RoleCreate(BaseModel):
    name: str
    description: str
    permissions: Dict[str, List[str]]  # {module: [permissions]}
    field_restrictions: Optional[Dict[str, List[str]]] = {}  # {module: [hidden_fields]}

class ApprovalWorkflow(BaseModel):
    workflow_type: str  # po_approval, inventory_adjustment, price_change
    threshold: Optional[float] = None
    approver_role: str
    auto_approve_below: Optional[float] = None

class AuditLog(BaseModel):
    user_id: int
    action: str
    module: str
    record_id: Optional[int] = None
    changes: Dict
    ip_address: Optional[str] = None

# Mock database
roles_db = {
    "admin": {
        "name": "Administrator",
        "description": "Full system access",
        "permissions": {module.value: [p.value for p in Permission] for module in Module},
        "field_restrictions": {}
    },
    "warehouse_manager": {
        "name": "Warehouse Manager",
        "description": "Manage warehouse operations",
        "permissions": {
            "inventory": ["view", "create", "edit"],
            "orders": ["view", "edit"],
            "shipping": ["view", "create"],
            "labor": ["view", "edit", "approve"],
            "quality": ["view", "edit"]
        },
        "field_restrictions": {
            "inventory": ["unit_price", "cost"]  # Hide pricing from warehouse staff
        }
    },
    "picker": {
        "name": "Warehouse Picker",
        "description": "Pick and pack orders",
        "permissions": {
            "inventory": ["view"],
            "orders": ["view", "edit"],
            "quality": ["view", "create"]
        },
        "field_restrictions": {
            "inventory": ["unit_price", "cost", "reorder_point"],
            "orders": ["customer_email", "payment_info"]
        }
    }
}

audit_logs = []

# ========================================================================
# USER MANAGEMENT SCHEMAS
# ========================================================================

class UserBase(BaseModel):
    email: str
    username: str
    full_name: Optional[str] = None
    role: str = "viewer"
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# ========================================================================
# USER ENDPOINTS
# ========================================================================

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all users (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db.query(User).all()

@router.post("/users", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new user (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if username exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    from backend.auth_lite import get_password_hash
    
    new_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password),
        role=user.role,
        is_active=user.is_active
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log action
    audit_logs.append({
        "user_id": current_user.id,
        "action": "create_user",
        "module": "users",
        "target_user": new_user.username,
        "timestamp": datetime.now().isoformat()
    })
    
    return new_user

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a user (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if user_update.email:
        db_user.email = user_update.email
    if user_update.full_name:
        db_user.full_name = user_update.full_name
    if user_update.role:
        db_user.role = user_update.role
    if user_update.is_active is not None:
        db_user.is_active = user_update.is_active
    if user_update.password:
        from backend.auth_lite import get_password_hash
        db_user.hashed_password = get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a user (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    
    return {"message": "User deleted successfully"}

# ========================================================================
# ROLE MANAGEMENT SCHEMAS
# ========================================================================

class RoleResponse(BaseModel):
    id: str
    name: str
    description: str
    permissions: Dict[str, List[str]]
    field_restrictions: Dict[str, List[str]]

# ========================================================================
# ROLE ENDPOINTS
# ========================================================================

@router.get("/roles", response_model=List[RoleResponse])
def get_all_roles(
    current_user: User = Depends(get_current_active_user)
):
    """Get all roles"""
    # Convert dict mock db to list for response
    roles_list = []
    for role_id, role_data in roles_db.items():
        roles_list.append({
            "id": role_id,
            **role_data
        })
    return roles_list

@router.post("/roles", response_model=RoleResponse)
def create_role(
    role: RoleCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create a new role (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    role_id = role.name.lower().replace(" ", "_")
    if role_id in roles_db:
        raise HTTPException(status_code=400, detail="Role already exists")
    
    roles_db[role_id] = role.dict()
    
    # Log action
    audit_logs.append({
        "user_id": current_user.id,
        "action": "create_role",
        "module": "rbac",
        "target_role": role_id,
        "timestamp": datetime.now().isoformat()
    })
    
    return {"id": role_id, **roles_db[role_id]}

@router.put("/roles/{role_id}", response_model=RoleResponse)
def update_role(
    role_id: str,
    role_update: RoleCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Update a role (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if role_id not in roles_db:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role_id == "admin":
        raise HTTPException(status_code=400, detail="Cannot modify Admin role")
    
    roles_db[role_id] = role_update.dict()
    
    return {"id": role_id, **roles_db[role_id]}

@router.delete("/roles/{role_id}")
def delete_role(
    role_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete a role (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if role_id not in roles_db:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role_id == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete Admin role")
    
    del roles_db[role_id]
    
    return {"message": "Role deleted successfully"}

@router.get("/permissions")
def get_available_permissions(
    current_user: User = Depends(get_current_active_user)
):
    """Get all available permissions and modules"""
    return {
        "modules": [m.value for m in Module],
        "permissions": [p.value for p in Permission]
    }

# ========================================================================
# API ENDPOINTS
# ========================================================================

@router.post("/roles")
def create_role(
    role: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create custom role"""
    
    # Check if user has permission to create roles
    if not has_permission(current_user, "users", "create"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    role_id = role.name.lower().replace(" ", "_")
    
    if role_id in roles_db:
        raise HTTPException(status_code=400, detail="Role already exists")
    
    roles_db[role_id] = {
        "name": role.name,
        "description": role.description,
        "permissions": role.permissions,
        "field_restrictions": role.field_restrictions or {},
        "created_at": datetime.utcnow(),
        "created_by": current_user.id
    }
    
    # Audit log
    log_audit(current_user.id, "create_role", "users", None, {"role": role.name})
    
    return {"message": "Role created successfully", "role_id": role_id}

@router.get("/roles")
def list_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all roles"""
    
    if not has_permission(current_user, "users", "view"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return roles_db

@router.get("/roles/{role_id}")
def get_role(
    role_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get role details"""
    
    if role_id not in roles_db:
        raise HTTPException(status_code=404, detail="Role not found")
    
    return roles_db[role_id]

@router.get("/check-permission")
def check_permission(
    module: str,
    permission: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Check if user has specific permission"""
    
    has_perm = has_permission(current_user, module, permission)
    
    return {
        "user_id": current_user.id,
        "module": module,
        "permission": permission,
        "granted": has_perm
    }

@router.post("/workflows")
def create_approval_workflow(
    workflow: ApprovalWorkflow,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create approval workflow"""
    
    if not has_permission(current_user, "settings", "edit"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    workflow_data = {
        "id": len(workflows_db) + 1,
        **workflow.dict(),
        "created_at": datetime.utcnow(),
        "created_by": current_user.id
    }
    
    workflows_db.append(workflow_data)
    
    return {"message": "Workflow created successfully", "workflow_id": workflow_data["id"]}

@router.get("/workflows")
def list_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List approval workflows"""
    return workflows_db

@router.post("/request-approval")
def request_approval(
    workflow_type: str,
    amount: float,
    details: Dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Request approval for action"""
    
    # Find matching workflow
    workflow = next(
        (w for w in workflows_db if w["workflow_type"] == workflow_type),
        None
    )
    
    if not workflow:
        return {"message": "No approval required", "auto_approved": True}
    
    # Check if auto-approve threshold met
    if workflow.get("auto_approve_below") and amount < workflow["auto_approve_below"]:
        return {"message": "Auto-approved", "auto_approved": True}
    
    # Check if approval required
    if workflow.get("threshold") and amount < workflow["threshold"]:
        return {"message": "No approval required", "auto_approved": True}
    
    # Create approval request
    approval_request = {
        "id": len(audit_logs) + 1,
        "workflow_type": workflow_type,
        "amount": amount,
        "details": details,
        "requested_by": current_user.id,
        "requested_at": datetime.utcnow(),
        "status": "pending",
        "approver_role": workflow["approver_role"]
    }
    
    audit_logs.append(approval_request)
    
    return {
        "message": "Approval requested",
        "approval_id": approval_request["id"],
        "approver_role": workflow["approver_role"]
    }

@router.get("/audit-logs")
def get_audit_logs(
    user_id: Optional[int] = None,
    module: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get audit trail"""
    
    if not has_permission(current_user, "settings", "view"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    filtered_logs = audit_logs
    
    if user_id:
        filtered_logs = [l for l in filtered_logs if l.get("user_id") == user_id or l.get("requested_by") == user_id]
    
    if module:
        filtered_logs = [l for l in filtered_logs if l.get("module") == module]
    
    return filtered_logs[:limit]

@router.get("/field-access/{module}")
def get_field_access(
    module: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get field-level access restrictions for module"""
    
    # Get user's role (simplified - in production, get from user record)
    user_role = getattr(current_user, "role", "picker")
    
    if user_role not in roles_db:
        return {"hidden_fields": []}
    
    role_data = roles_db[user_role]
    hidden_fields = role_data.get("field_restrictions", {}).get(module, [])
    
    return {
        "module": module,
        "role": user_role,
        "hidden_fields": hidden_fields
    }

# ========================================================================
# HELPER FUNCTIONS
# ========================================================================

def has_permission(user: User, module: str, permission: str) -> bool:
    """Check if user has permission for module action"""
    
    # Get user's role (simplified - in production, get from user record)
    user_role = getattr(user, "role", "admin")
    
    if user_role not in roles_db:
        return False
    
    role_permissions = roles_db[user_role].get("permissions", {})
    module_permissions = role_permissions.get(module, [])
    
    return permission in module_permissions

def log_audit(user_id: int, action: str, module: str, record_id: Optional[int], changes: Dict):
    """Log audit trail"""
    
    audit_logs.append({
        "user_id": user_id,
        "action": action,
        "module": module,
        "record_id": record_id,
        "changes": changes,
        "timestamp": datetime.utcnow()
    })
