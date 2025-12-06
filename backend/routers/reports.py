from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, timedelta

from ..database_lite import get_db
from ..models_lite import Order, OrderItem, Inventory, User
from ..auth_lite import get_current_active_user

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

from ..cache import cache

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check cache first
    cache_key = "dashboard_stats"
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

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
    
    status_map = {s.status: s.count for s in status_dist}
    
    # 7. Recent Orders
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    formatted_recent_orders = [
        {
            "id": o.id,
            "orderNumber": f"ORD-{o.id:05d}",
            "customer": o.customer_name,
            "date": o.created_at.isoformat(),
            "status": o.status,
            "total": o.total_amount
        } for o in recent_orders
    ]

    # 8. Inventory Alerts (Low Stock)
    alerts = db.query(Inventory).filter(Inventory.quantity <= Inventory.reorder_point).limit(5).all()
    formatted_alerts = [
        {
            "id": i.id,
            "name": i.product_name,
            "currentStock": i.quantity,
            "reorderPoint": i.reorder_point
        } for i in alerts
    ]

    result = {
        "totalRevenue": total_revenue,
        "totalOrders": total_orders,
        "pendingOrders": status_map.get("pending", 0),
        "completedOrders": status_map.get("delivered", 0),
        "lowStockItems": low_stock_count,
        "totalInventoryValue": 0, # Requires summing quantity * unit_price
        "activeShipments": status_map.get("shipped", 0) + status_map.get("in_transit", 0),
        "warehouseUtilization": 78, # Mock for now, requires capacity calc
        "recentOrders": formatted_recent_orders,
        "inventoryAlerts": formatted_alerts,
        "revenueData": formatted_trend,
        "ordersByStatus": {
            "pending": status_map.get("pending", 0),
            "processing": status_map.get("processing", 0),
            "shipped": status_map.get("shipped", 0),
            "delivered": status_map.get("delivered", 0),
            "cancelled": status_map.get("cancelled", 0)
        }
    }
    
    # Cache the result for 60 seconds
    cache.set(cache_key, result, ttl=60)
    
    return result

@router.get("/live-feed")
def get_live_feed(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a combined live feed of recent system activities
    (Inventory changes, New Orders, Order Status changes)
    """
    from ..models_lite import InventoryLog
    
    activities = []
    
    # 1. Recent Inventory Logs
    logs = db.query(InventoryLog).order_by(InventoryLog.created_at.desc()).limit(limit).all()
    for log in logs:
        # Fetch related user and item if lazy loading doesn't handle it well in this context
        # Assuming relationships are set up
        user_name = log.user.username if log.user else "System"
        item_name = log.inventory_item.product_name if log.inventory_item else "Unknown Item"
        
        activities.append({
            "id": f"inv-{log.id}",
            "action": "Stock Update",
            "item": f"{item_name} ({log.change_amount:+d})",
            "user": user_name,
            "time": log.created_at, # datetime object
            "zone": "Storage", # Default for now
            "timestamp": log.created_at.timestamp()
        })
        
    # 2. Recent Orders
    orders = db.query(Order).order_by(Order.created_at.desc()).limit(limit).all()
    for order in orders:
        activities.append({
            "id": f"ord-{order.id}",
            "action": "New Order",
            "item": f"Order #{order.id}",
            "user": order.customer_name, # Or "System"
            "time": order.created_at,
            "zone": "Receiving", # Default
            "timestamp": order.created_at.timestamp()
        })
        
    # Sort by timestamp descending
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # Take top N
    return activities[:limit]

@router.get("/top-products")
def get_top_products(
    limit: int = 5,
    period_days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get top selling products with sales metrics and growth
    """
    # Calculate date ranges
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=period_days)
    previous_start = start_date - timedelta(days=period_days)
    
    # Get top products by quantity sold in current period
    current_period_sales = db.query(
        OrderItem.sku,
        func.sum(OrderItem.quantity).label('total_quantity'),
        func.sum(OrderItem.quantity * OrderItem.unit_price).label('total_revenue'),
        func.count(OrderItem.id).label('order_count')
    ).join(Order).filter(
        Order.created_at >= start_date,
        Order.created_at <= end_date
    ).group_by(OrderItem.sku)\
     .order_by(func.sum(OrderItem.quantity).desc())\
     .limit(limit)\
     .all()
    
    # Get previous period sales for growth calculation
    previous_period_sales = db.query(
        OrderItem.sku,
        func.sum(OrderItem.quantity).label('total_quantity')
    ).join(Order).filter(
        Order.created_at >= previous_start,
        Order.created_at < start_date
    ).group_by(OrderItem.sku).all()
    
    # Create a map for previous sales
    previous_sales_map = {item.sku: item.total_quantity for item in previous_period_sales}
    
    # Format results with growth calculation
    top_products = []
    for item in current_period_sales:
        # Get product name from inventory
        inventory_item = db.query(Inventory).filter(Inventory.sku == item.sku).first()
        product_name = inventory_item.product_name if inventory_item else item.sku
        
        # Calculate growth
        previous_qty = previous_sales_map.get(item.sku, 0)
        if previous_qty > 0:
            growth = ((item.total_quantity - previous_qty) / previous_qty) * 100
        else:
            growth = 100 if item.total_quantity > 0 else 0
            
        top_products.append({
            "sku": item.sku,
            "name": product_name,
            "sales": int(item.total_quantity),
            "revenue": float(item.total_revenue),
            "orders": int(item.order_count),
            "growth": f"{growth:+.0f}%"
        })
    
    return {
        "products": top_products,
        "period_days": period_days
    }
