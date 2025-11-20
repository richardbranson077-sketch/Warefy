"""
Anomaly detection router for identifying supply chain issues.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../../ml-pipelines'))

from database import get_db
from models import Anomaly, SalesHistory, Inventory, Route, User
from schemas import AnomalyResponse
from auth import get_current_active_user

router = APIRouter(prefix="/api/anomalies", tags=["Anomaly Detection"])

@router.get("/detect/demand")
def detect_demand_anomalies_endpoint(
    sku: str = None,
    days: int = 90,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Detect anomalies in demand patterns"""
    from anomaly_detection.isolation_forest import detect_demand_anomalies
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    query = db.query(SalesHistory).filter(SalesHistory.sale_date >= cutoff_date)
    
    if sku:
        query = query.filter(SalesHistory.sku == sku)
    
    sales_data = query.all()
    
    if not sales_data:
        return {"anomalies": [], "message": "No sales data found"}
    
    # Prepare data
    data = [
        {"date": sale.sale_date, "quantity": sale.quantity_sold}
        for sale in sales_data
    ]
    
    anomalies = detect_demand_anomalies(data)
    
    # Store anomalies in database
    for anomaly in anomalies:
        db_anomaly = Anomaly(
            anomaly_type="demand_anomaly",
            severity=anomaly['severity'],
            entity_type="sales",
            entity_id=0,
            description=f"{anomaly['type']}: {anomaly['quantity']} units on {anomaly['date']}",
            metadata=anomaly
        )
        db.add(db_anomaly)
    
    db.commit()
    
    return {"anomalies": anomalies, "count": len(anomalies)}

@router.get("/detect/inventory")
def detect_inventory_anomalies_endpoint(
    warehouse_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Detect inventory anomalies (stockouts, low stock)"""
    from anomaly_detection.isolation_forest import detect_inventory_anomalies
    
    query = db.query(Inventory)
    
    if warehouse_id:
        query = query.filter(Inventory.warehouse_id == warehouse_id)
    
    inventory_items = query.all()
    
    data = [
        {
            "sku": item.sku,
            "product_name": item.product_name,
            "warehouse_id": item.warehouse_id,
            "quantity": item.quantity,
            "reorder_point": item.reorder_point
        }
        for item in inventory_items
    ]
    
    anomalies = detect_inventory_anomalies(data)
    
    # Store in database
    for anomaly in anomalies:
        db_anomaly = Anomaly(
            anomaly_type=anomaly['type'],
            severity=anomaly['severity'],
            entity_type="inventory",
            entity_id=anomaly.get('warehouse_id', 0),
            description=anomaly['description'],
            metadata=anomaly
        )
        db.add(db_anomaly)
    
    db.commit()
    
    return {"anomalies": anomalies, "count": len(anomalies)}

@router.get("/recent", response_model=list[AnomalyResponse])
def get_recent_anomalies(
    limit: int = 50,
    resolved: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get recent anomalies"""
    query = db.query(Anomaly).filter(Anomaly.resolved == resolved)
    anomalies = query.order_by(Anomaly.detected_at.desc()).limit(limit).all()
    return anomalies

@router.put("/{anomaly_id}/resolve")
def resolve_anomaly(
    anomaly_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark an anomaly as resolved"""
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    
    anomaly.resolved = True
    anomaly.resolved_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Anomaly marked as resolved"}
