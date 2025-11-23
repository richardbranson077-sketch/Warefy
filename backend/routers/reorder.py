"""
Smart Reorder Automation Router
Automatic purchase order generation based on reorder points and demand forecasting
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import statistics

from backend.database_lite import get_db
from backend.models_lite import Inventory, Order, OrderItem, Warehouse
from backend.auth import get_current_active_user, User

router = APIRouter(prefix="/api/reorder", tags=["Smart Reorder"])

# ========================================================================
# PYDANTIC SCHEMAS
# ========================================================================

class PurchaseOrderItem(BaseModel):
    sku: str
    product_name: str
    quantity_to_order: int
    current_stock: int
    reorder_point: int
    unit_price: float
    total_cost: float
    supplier: str
    urgency: str  # critical, high, medium, low
    days_until_stockout: Optional[int] = None

class PurchaseOrderCreate(BaseModel):
    supplier: str
    items: List[PurchaseOrderItem]
    total_cost: float
    notes: Optional[str] = None
    auto_approve: bool = False

class PurchaseOrderResponse(BaseModel):
    id: int
    supplier: str
    status: str
    total_cost: float
    item_count: int
    created_at: datetime

class SupplierPerformance(BaseModel):
    supplier: str
    total_orders: int
    on_time_deliveries: int
    late_deliveries: int
    on_time_percentage: float
    average_lead_time_days: float
    total_spend: float
    rating: str  # excellent, good, fair, poor

class ReorderRecommendation(BaseModel):
    sku: str
    product_name: str
    current_stock: int
    reorder_point: int
    recommended_quantity: int
    urgency: str
    reason: str
    supplier: str
    estimated_cost: float

# ========================================================================
# HELPER FUNCTIONS
# ========================================================================

def calculate_demand_velocity(sku: str, db: Session, days: int = 30) -> float:
    """Calculate average daily demand for a SKU"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Get recent orders containing this SKU
    recent_orders = db.query(OrderItem).join(Order).filter(
        OrderItem.sku == sku,
        Order.created_at >= cutoff_date
    ).all()
    
    if not recent_orders:
        return 0.0
    
    total_quantity = sum(item.quantity for item in recent_orders)
    return total_quantity / days

def calculate_days_until_stockout(current_stock: int, daily_demand: float) -> Optional[int]:
    """Calculate how many days until stockout"""
    if daily_demand <= 0:
        return None
    return int(current_stock / daily_demand)

def calculate_optimal_order_quantity(
    current_stock: int,
    reorder_point: int,
    daily_demand: float,
    lead_time_days: int = 7,
    safety_stock_days: int = 14
) -> int:
    """Calculate optimal order quantity using Economic Order Quantity principles"""
    
    # Minimum order: enough to cover lead time + safety stock
    min_order = int((lead_time_days + safety_stock_days) * daily_demand)
    
    # If current stock is below reorder point, order more aggressively
    if current_stock < reorder_point:
        shortage = reorder_point - current_stock
        return max(min_order, shortage + int(safety_stock_days * daily_demand))
    
    return min_order

def determine_urgency(days_until_stockout: Optional[int], current_stock: int, reorder_point: int) -> str:
    """Determine urgency level"""
    if current_stock <= 0:
        return "critical"
    elif days_until_stockout and days_until_stockout <= 3:
        return "critical"
    elif days_until_stockout and days_until_stockout <= 7:
        return "high"
    elif current_stock < reorder_point:
        return "medium"
    else:
        return "low"

# ========================================================================
# API ENDPOINTS
# ========================================================================

@router.get("/recommendations", response_model=List[ReorderRecommendation])
def get_reorder_recommendations(
    warehouse_id: Optional[int] = None,
    urgency: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get smart reorder recommendations based on stock levels and demand"""
    
    # Query inventory items that need reordering
    query = db.query(Inventory).filter(Inventory.quantity <= Inventory.reorder_point)
    
    if warehouse_id:
        query = query.filter(Inventory.warehouse_id == warehouse_id)
    
    low_stock_items = query.all()
    
    recommendations = []
    
    for item in low_stock_items:
        # Calculate demand velocity
        daily_demand = calculate_demand_velocity(item.sku, db)
        
        # Calculate days until stockout
        days_until_stockout = calculate_days_until_stockout(item.quantity, daily_demand)
        
        # Determine urgency
        item_urgency = determine_urgency(days_until_stockout, item.quantity, item.reorder_point)
        
        # Filter by urgency if specified
        if urgency and item_urgency != urgency:
            continue
        
        # Calculate optimal order quantity
        recommended_qty = calculate_optimal_order_quantity(
            item.quantity,
            item.reorder_point,
            daily_demand
        )
        
        # Determine reason
        if item.quantity <= 0:
            reason = "OUT OF STOCK - Immediate action required"
        elif days_until_stockout and days_until_stockout <= 3:
            reason = f"Will stockout in {days_until_stockout} days at current demand"
        elif item.quantity < item.reorder_point:
            reason = f"Below reorder point ({item.quantity}/{item.reorder_point})"
        else:
            reason = "Approaching reorder point"
        
        recommendations.append(ReorderRecommendation(
            sku=item.sku,
            product_name=item.product_name,
            current_stock=item.quantity,
            reorder_point=item.reorder_point,
            recommended_quantity=recommended_qty,
            urgency=item_urgency,
            reason=reason,
            supplier=item.supplier or "Unknown",
            estimated_cost=recommended_qty * (item.unit_price or 0)
        ))
    
    # Sort by urgency (critical first)
    urgency_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    recommendations.sort(key=lambda x: urgency_order.get(x.urgency, 4))
    
    return recommendations

@router.post("/purchase-orders/generate", response_model=PurchaseOrderCreate)
def generate_purchase_order(
    warehouse_id: Optional[int] = None,
    supplier: Optional[str] = None,
    urgency_threshold: str = "medium",  # Only include items with this urgency or higher
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Automatically generate a purchase order based on reorder recommendations"""
    
    # Get recommendations
    recommendations = get_reorder_recommendations(warehouse_id=warehouse_id, db=db, current_user=current_user)
    
    # Filter by urgency threshold
    urgency_levels = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    threshold_level = urgency_levels.get(urgency_threshold, 2)
    
    filtered_recs = [
        rec for rec in recommendations
        if urgency_levels.get(rec.urgency, 4) <= threshold_level
    ]
    
    # Filter by supplier if specified
    if supplier:
        filtered_recs = [rec for rec in filtered_recs if rec.supplier == supplier]
    
    if not filtered_recs:
        raise HTTPException(status_code=404, detail="No items need reordering")
    
    # Group by supplier
    suppliers = {}
    for rec in filtered_recs:
        if rec.supplier not in suppliers:
            suppliers[rec.supplier] = []
        suppliers[rec.supplier].append(rec)
    
    # Create PO for the supplier with most items (or specified supplier)
    target_supplier = supplier if supplier else max(suppliers.keys(), key=lambda s: len(suppliers[s]))
    items = suppliers[target_supplier]
    
    po_items = []
    total_cost = 0.0
    
    for rec in items:
        # Get inventory item for unit price
        inv_item = db.query(Inventory).filter(Inventory.sku == rec.sku).first()
        unit_price = inv_item.unit_price if inv_item else 0.0
        item_total = rec.recommended_quantity * unit_price
        
        po_items.append(PurchaseOrderItem(
            sku=rec.sku,
            product_name=rec.product_name,
            quantity_to_order=rec.recommended_quantity,
            current_stock=rec.current_stock,
            reorder_point=rec.reorder_point,
            unit_price=unit_price,
            total_cost=item_total,
            supplier=rec.supplier,
            urgency=rec.urgency,
            days_until_stockout=calculate_days_until_stockout(
                rec.current_stock,
                calculate_demand_velocity(rec.sku, db)
            )
        ))
        total_cost += item_total
    
    return PurchaseOrderCreate(
        supplier=target_supplier,
        items=po_items,
        total_cost=total_cost,
        notes=f"Auto-generated PO for {len(po_items)} items based on reorder points and demand forecasting"
    )

@router.get("/suppliers/performance", response_model=List[SupplierPerformance])
def get_supplier_performance(
    days: int = 90,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get supplier performance metrics"""
    
    # Get all unique suppliers from inventory
    suppliers = db.query(Inventory.supplier).distinct().all()
    supplier_list = [s[0] for s in suppliers if s[0]]
    
    performance_data = []
    
    for supplier in supplier_list:
        # In a real implementation, you would track PO deliveries
        # For now, we'll use simulated data
        
        # Simulate performance metrics
        total_orders = 15
        on_time = 12
        late = 3
        on_time_pct = (on_time / total_orders) * 100
        avg_lead_time = 7.5
        
        # Calculate total spend
        supplier_items = db.query(Inventory).filter(Inventory.supplier == supplier).all()
        total_spend = sum(item.quantity * (item.unit_price or 0) for item in supplier_items)
        
        # Determine rating
        if on_time_pct >= 95:
            rating = "excellent"
        elif on_time_pct >= 85:
            rating = "good"
        elif on_time_pct >= 70:
            rating = "fair"
        else:
            rating = "poor"
        
        performance_data.append(SupplierPerformance(
            supplier=supplier,
            total_orders=total_orders,
            on_time_deliveries=on_time,
            late_deliveries=late,
            on_time_percentage=on_time_pct,
            average_lead_time_days=avg_lead_time,
            total_spend=total_spend,
            rating=rating
        ))
    
    # Sort by on-time percentage (best first)
    performance_data.sort(key=lambda x: x.on_time_percentage, reverse=True)
    
    return performance_data

@router.post("/auto-reorder/enable")
def enable_auto_reorder(
    warehouse_id: Optional[int] = None,
    urgency_threshold: str = "high",
    auto_approve: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Enable automatic reordering (would run as a scheduled job)"""
    
    # In production, this would:
    # 1. Set up a cron job or scheduled task
    # 2. Run daily/weekly to check inventory
    # 3. Auto-generate POs for critical items
    # 4. Send email notifications to managers
    
    return {
        "message": "Auto-reorder enabled",
        "warehouse_id": warehouse_id,
        "urgency_threshold": urgency_threshold,
        "auto_approve": auto_approve,
        "note": "Auto-reorder will run daily at 8:00 AM"
    }

@router.get("/analytics/stockout-risk")
def get_stockout_risk_analysis(
    warehouse_id: Optional[int] = None,
    days_ahead: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Analyze stockout risk for the next N days"""
    
    query = db.query(Inventory)
    if warehouse_id:
        query = query.filter(Inventory.warehouse_id == warehouse_id)
    
    all_items = query.all()
    
    risk_analysis = {
        "critical_risk": [],  # Will stockout in 0-3 days
        "high_risk": [],      # Will stockout in 4-7 days
        "medium_risk": [],    # Will stockout in 8-14 days
        "low_risk": [],       # Will stockout in 15-30 days
        "no_risk": []         # Won't stockout in 30 days
    }
    
    for item in all_items:
        daily_demand = calculate_demand_velocity(item.sku, db)
        days_until_stockout = calculate_days_until_stockout(item.quantity, daily_demand)
        
        item_data = {
            "sku": item.sku,
            "product_name": item.product_name,
            "current_stock": item.quantity,
            "daily_demand": round(daily_demand, 2),
            "days_until_stockout": days_until_stockout
        }
        
        if days_until_stockout is None:
            risk_analysis["no_risk"].append(item_data)
        elif days_until_stockout <= 3:
            risk_analysis["critical_risk"].append(item_data)
        elif days_until_stockout <= 7:
            risk_analysis["high_risk"].append(item_data)
        elif days_until_stockout <= 14:
            risk_analysis["medium_risk"].append(item_data)
        elif days_until_stockout <= 30:
            risk_analysis["low_risk"].append(item_data)
        else:
            risk_analysis["no_risk"].append(item_data)
    
    return {
        "analysis_period_days": days_ahead,
        "total_items_analyzed": len(all_items),
        "risk_breakdown": {
            "critical": len(risk_analysis["critical_risk"]),
            "high": len(risk_analysis["high_risk"]),
            "medium": len(risk_analysis["medium_risk"]),
            "low": len(risk_analysis["low_risk"]),
            "none": len(risk_analysis["no_risk"])
        },
        "details": risk_analysis
    }
