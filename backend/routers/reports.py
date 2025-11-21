from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, timedelta

from ..database_lite import get_db
from ..models_lite import Order, OrderItem, Inventory, User
from ..auth_lite import get_current_active_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 1. Total Revenue
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    
    # 2. Total Orders
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    
    # 3. Low Stock Items
    low_stock_count = db.query(func.count(Inventory.id)).filter(Inventory.quantity < Inventory.reorder_point).scalar() or 0
    
    # 4. Sales Trend (Last 7 Days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    sales_trend = db.query(
        func.date(Order.created_at).label('date'),
        func.sum(Order.total_amount).label('amount')
    ).filter(Order.created_at >= seven_days_ago)\
     .group_by(func.date(Order.created_at))\
     .all()
     
    formatted_trend = [{"date": str(day.date), "amount": day.amount} for day in sales_trend]
    
    # 5. Top Selling Items
    top_items = db.query(
        OrderItem.sku,
        func.sum(OrderItem.quantity).label('total_sold')
    ).group_by(OrderItem.sku)\
     .order_by(func.sum(OrderItem.quantity).desc())\
     .limit(5)\
     .all()
     
    formatted_top_items = [{"name": item.sku, "value": item.total_sold} for item in top_items]
    
    # 6. Order Status Distribution
    status_dist = db.query(
        Order.status,
        func.count(Order.id).label('count')
    ).group_by(Order.status).all()
    
    formatted_status_dist = [{"name": s.status, "value": s.count} for s in status_dist]

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "low_stock_count": low_stock_count,
        "sales_trend": formatted_trend,
        "top_items": formatted_top_items,
        "order_status_distribution": formatted_status_dist
    }
