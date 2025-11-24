"""
Returns Management System (RMS)
High-priority feature for e-commerce and 3PL warehouses
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from backend.database_lite import get_db
from backend.models_lite import Order, Inventory
from backend.auth import get_current_active_user, User

router = APIRouter(prefix="/api/returns", tags=["Returns Management"])

# ========================================================================
# PYDANTIC SCHEMAS
# ========================================================================

class RMACreate(BaseModel):
    order_id: int
    customer_name: str
    customer_email: str
    return_reason: str
    return_type: str  # customer, supplier
    items: List[dict]  # [{sku, quantity, reason}]
    notes: Optional[str] = None

class RMAResponse(BaseModel):
    id: int
    rma_number: str
    order_id: int
    customer_name: str
    status: str
    return_reason: str
    total_items: int
    created_at: datetime

class InspectionResult(BaseModel):
    rma_id: int
    sku: str
    quantity_received: int
    condition: str  # good, damaged, defective
    disposition: str  # restock, scrap, refurbish, return_to_supplier
    notes: Optional[str] = None
    photos: Optional[List[str]] = None

# Mock database (in production, use actual models)
rmas_db = []
rma_counter = 1000

# ========================================================================
# API ENDPOINTS
# ========================================================================

@router.post("/rma", response_model=RMAResponse)
def create_rma(
    rma: RMACreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new Return Merchandise Authorization"""
    global rma_counter
    
    # Verify order exists
    order = db.query(Order).filter(Order.id == rma.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    rma_counter += 1
    rma_number = f"RMA-{rma_counter}"
    
    new_rma = {
        "id": rma_counter,
        "rma_number": rma_number,
        "order_id": rma.order_id,
        "customer_name": rma.customer_name,
        "customer_email": rma.customer_email,
        "return_reason": rma.return_reason,
        "return_type": rma.return_type,
        "items": rma.items,
        "status": "pending_approval",
        "total_items": sum(item.get("quantity", 0) for item in rma.items),
        "created_at": datetime.utcnow(),
        "notes": rma.notes
    }
    
    rmas_db.append(new_rma)
    
    return RMAResponse(
        id=new_rma["id"],
        rma_number=new_rma["rma_number"],
        order_id=new_rma["order_id"],
        customer_name=new_rma["customer_name"],
        status=new_rma["status"],
        return_reason=new_rma["return_reason"],
        total_items=new_rma["total_items"],
        created_at=new_rma["created_at"]
    )

@router.get("/rma")
def list_rmas(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all RMAs"""
    filtered_rmas = rmas_db
    
    if status:
        filtered_rmas = [r for r in filtered_rmas if r["status"] == status]
    
    return filtered_rmas[:limit]

@router.get("/rma/{rma_id}")
def get_rma(
    rma_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get RMA details"""
    rma = next((r for r in rmas_db if r["id"] == rma_id), None)
    if not rma:
        raise HTTPException(status_code=404, detail="RMA not found")
    return rma

@router.put("/rma/{rma_id}/approve")
def approve_rma(
    rma_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Approve RMA"""
    rma = next((r for r in rmas_db if r["id"] == rma_id), None)
    if not rma:
        raise HTTPException(status_code=404, detail="RMA not found")
    
    rma["status"] = "approved"
    rma["approved_at"] = datetime.utcnow()
    rma["approved_by"] = current_user.id
    
    return {"message": "RMA approved", "rma_number": rma["rma_number"]}

@router.post("/rma/{rma_id}/inspect")
def inspect_return(
    rma_id: int,
    inspection: InspectionResult,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Inspect returned items and determine disposition"""
    rma = next((r for r in rmas_db if r["id"] == rma_id), None)
    if not rma:
        raise HTTPException(status_code=404, detail="RMA not found")
    
    # Process disposition
    if inspection.disposition == "restock":
        # Add back to inventory
        inventory_item = db.query(Inventory).filter(Inventory.sku == inspection.sku).first()
        if inventory_item:
            inventory_item.quantity += inspection.quantity_received
            db.commit()
    
    # Update RMA status
    rma["status"] = "inspected"
    rma["inspection_results"] = inspection.dict()
    
    return {
        "message": "Inspection completed",
        "disposition": inspection.disposition,
        "restocked": inspection.quantity_received if inspection.disposition == "restock" else 0
    }

@router.get("/analytics/return-reasons")
def get_return_analytics(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get return analytics - top return reasons"""
    
    # Analyze return reasons
    reason_counts = {}
    for rma in rmas_db:
        reason = rma.get("return_reason", "Unknown")
        reason_counts[reason] = reason_counts.get(reason, 0) + 1
    
    # Sort by frequency
    top_reasons = sorted(reason_counts.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "period_days": days,
        "total_returns": len(rmas_db),
        "top_reasons": [
            {"reason": reason, "count": count, "percentage": (count / len(rmas_db)) * 100}
            for reason, count in top_reasons[:10]
        ]
    }

@router.get("/analytics/return-rate")
def get_return_rate(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Calculate return rate"""
    
    total_orders = db.query(Order).count()
    total_returns = len(rmas_db)
    
    return_rate = (total_returns / total_orders * 100) if total_orders > 0 else 0
    
    return {
        "total_orders": total_orders,
        "total_returns": total_returns,
        "return_rate_percentage": round(return_rate, 2),
        "industry_average": 20.0,  # E-commerce average
        "status": "good" if return_rate < 15 else "needs_improvement"
    }
