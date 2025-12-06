"""
Anomaly detection router for identifying supply chain issues.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(__file__), '../../ml-pipelines'))

from backend.database_lite import get_db
from backend.models_lite import Anomaly, SalesHistory, Inventory, Route, User
from backend.schemas import AnomalyResponse
from backend.auth_lite import get_current_active_user
from backend.routers.ai_chat import call_llm

# Ensure prefix matches main_lite.py expectations
router = APIRouter(prefix="/api/v1/anomalies", tags=["Anomaly Detection"])

@router.get("/detect/demand")
def detect_demand_anomalies_endpoint(
    sku: str = None,
    days: int = 90,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Detect anomalies in demand patterns"""
    # In a real scenario, we'd call the ML pipeline here.
    # For now, we'll simulate detection based on simple statistical rules or mock data if pipeline fails.
    
    # Prepare data first
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    query = db.query(SalesHistory).filter(SalesHistory.date >= cutoff_date)
    
    if sku:
        query = query.filter(SalesHistory.sku == sku)
    
    sales_data = query.all()
    
    if not sales_data:
        return {"anomalies": [], "message": "No sales data found"}
    
    data = [
        {"date": sale.date, "quantity": sale.quantity}
        for sale in sales_data
    ]

    try:
        from anomaly_detection.isolation_forest import detect_demand_anomalies
        anomalies = detect_demand_anomalies(data)
        
    except ImportError:
        # Fallback: Simple statistical detection (Z-score like)
        anomalies = []
        if len(data) > 5:
            quantities = [d['quantity'] for d in data]
            avg = sum(quantities) / len(quantities)
            # Calculate std dev manually
            variance = sum([((x - avg) ** 2) for x in quantities]) / len(quantities)
            std_dev = variance ** 0.5
            
            if std_dev > 0:
                for d in data:
                    z_score = (d['quantity'] - avg) / std_dev
                    if z_score > 3: # 3 sigma
                        anomalies.append({
                            "type": "demand_spike",
                            "severity": "high",
                            "quantity": d['quantity'],
                            "date": str(d['date']),
                            "description": f"Demand Spike: {d['quantity']} units (Normal: ~{int(avg)})"
                        })
                    elif z_score < -3:
                        anomalies.append({
                            "type": "demand_drop",
                            "severity": "medium",
                            "quantity": d['quantity'],
                            "date": str(d['date']),
                            "description": f"Demand Drop: {d['quantity']} units (Normal: ~{int(avg)})"
                        })
    
    # Store anomalies in database
    saved_anomalies = []
    for anomaly in anomalies:
        # Check if already exists to avoid duplicates
        existing = db.query(Anomaly).filter(
            Anomaly.entity_type == "sales",
            Anomaly.description == f"{anomaly['type']}: {anomaly['quantity']} units on {anomaly['date']}"
        ).first()
        
        if not existing:
            db_anomaly = Anomaly(
                anomaly_type="demand_anomaly",
                severity=anomaly['severity'],
                entity_type="sales",
                entity_id=0, # Could link to product ID
                description=f"{anomaly['type']}: {anomaly['quantity']} units on {anomaly['date']}",
                extra_data=json.dumps(anomaly)
            )
            db.add(db_anomaly)
            saved_anomalies.append(db_anomaly)
    
    db.commit()
    
    return {"anomalies": anomalies, "count": len(anomalies), "new": len(saved_anomalies)}

@router.get("/detect/inventory")
def detect_inventory_anomalies_endpoint(
    warehouse_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Detect inventory anomalies (stockouts, low stock)"""
    query = db.query(Inventory)
    
    if warehouse_id:
        query = query.filter(Inventory.warehouse_id == warehouse_id)
    
    inventory_items = query.all()
    
    anomalies = []
    
    for item in inventory_items:
        # Simple rule-based detection
        if item.quantity == 0:
            anomalies.append({
                "type": "stockout",
                "severity": "critical",
                "description": f"Stockout: {item.product_name} ({item.sku}) is out of stock",
                "warehouse_id": item.warehouse_id,
                "sku": item.sku
            })
        elif item.quantity <= item.reorder_point:
            anomalies.append({
                "type": "low_stock",
                "severity": "high",
                "description": f"Low Stock: {item.product_name} ({item.sku}) is below reorder point ({item.quantity} <= {item.reorder_point})",
                "warehouse_id": item.warehouse_id,
                "sku": item.sku
            })
            
    # Store in database
    saved_anomalies = []
    for anomaly in anomalies:
        # Check for existing unresolved anomaly for this item/type
        existing = db.query(Anomaly).filter(
            Anomaly.entity_type == "inventory",
            Anomaly.anomaly_type == anomaly['type'],
            Anomaly.description == anomaly['description'],
            Anomaly.resolved == False
        ).first()
        
        if not existing:
            db_anomaly = Anomaly(
                anomaly_type=anomaly['type'],
                severity=anomaly['severity'],
                entity_type="inventory",
                entity_id=anomaly.get('warehouse_id', 0),
                description=anomaly['description'],
                extra_data=json.dumps(anomaly)
            )
            db.add(db_anomaly)
            saved_anomalies.append(db_anomaly)
    
    db.commit()
    
    return {"anomalies": anomalies, "count": len(anomalies), "new": len(saved_anomalies)}

@router.get("", response_model=list[AnomalyResponse])
def get_anomalies(
    limit: int = 100,
    resolved: bool = False,
    severity: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get anomalies with filtering"""
    query = db.query(Anomaly).filter(Anomaly.resolved == resolved)
    
    if severity:
        query = query.filter(Anomaly.severity == severity)
        
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

@router.post("/{anomaly_id}/analyze")
async def analyze_anomaly(
    anomaly_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Analyze an anomaly using AI to determine root cause and solutions"""
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
        
    # Construct context for AI
    context = f"""
    Anomaly Type: {anomaly.anomaly_type}
    Severity: {anomaly.severity}
    Description: {anomaly.description}
    Detected At: {anomaly.detected_at}
    Entity Type: {anomaly.entity_type}
    Metadata: {anomaly.extra_data}
    """
    
    # Prompt for Gemini
    prompt = f"""
    Analyze this supply chain anomaly and provide a structured response with:
    1. Root Cause Analysis (Potential reasons why this happened)
    2. Impact Assessment (What happens if we ignore it)
    3. Recommended Actions (Step-by-step resolution plan)
    
    Anomaly Details:
    {context}
    
    Format the response as JSON with keys: 'root_cause', 'impact', 'recommendations' (list of strings).
    """
    
    try:
        ai_response = await call_llm(prompt, context)
        # Clean up response if it contains markdown code blocks
        if "```json" in ai_response:
            ai_response = ai_response.split("```json")[1].split("```")[0].strip()
        elif "```" in ai_response:
            ai_response = ai_response.split("```")[1].split("```")[0].strip()
            
        return json.loads(ai_response)
    except Exception as e:
        # Fallback if AI fails
        return {
            "root_cause": "Unable to generate AI analysis at this time.",
            "impact": "Unknown impact.",
            "recommendations": ["Investigate manually", "Check system logs"]
        }
