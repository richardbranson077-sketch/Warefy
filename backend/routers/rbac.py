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
from backend.auth import get_current_active_user, User

router = APIRouter(prefix="/api/rbac", tags=["RBAC"])

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

workflows_db = []
audit_logs = []

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
