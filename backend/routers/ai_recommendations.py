"""
AI Recommendations Router
Generates intelligent supply chain recommendations using Gemini AI
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import os
import google.generativeai as genai
from datetime import datetime
import json

from backend.database_lite import get_db
from backend.models_lite import User, Inventory, Route, Anomaly, Warehouse
from backend.auth_lite import get_current_active_user

router = APIRouter(prefix="/api/v1/recommendations", tags=["AI Recommendations"])

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Mock recommendations for fallback
MOCK_RECOMMENDATIONS = [
    {
        "id": "rec_001",
        "title": "Optimize Inventory Levels",
        "description": "High stock levels detected for 'Wireless Headphones'. Consider running a promotion to reduce holding costs.",
        "type": "inventory",
        "severity": "medium",
        "impact": "Save $1,200/month in storage",
        "status": "active",
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "rec_002",
        "title": "Route Efficiency Upgrade",
        "description": "Route RT-1004 has consistent delays. Suggest changing departure time to 06:00 AM to avoid traffic.",
        "type": "logistics",
        "severity": "high",
        "impact": "Reduce delivery time by 15%",
        "status": "active",
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "rec_003",
        "title": "Preventative Maintenance",
        "description": "Conveyor Belt 3 showing vibration anomalies. Schedule maintenance before failure.",
        "type": "maintenance",
        "severity": "critical",
        "impact": "Prevent potential 4hr downtime",
        "status": "active",
        "created_at": datetime.now().isoformat()
    }
]

def get_real_time_context(db: Session) -> str:
    """Fetch real-time data for AI context"""
    # Inventory stats
    total_items = db.query(Inventory).count()
    low_stock = db.query(Inventory).filter(Inventory.quantity <= Inventory.reorder_point).count()
    
    # Route stats
    active_routes = db.query(Route).filter(Route.status != "completed").count()
    delayed_routes = db.query(Route).filter(Route.status == "delayed").count()
    
    # Anomalies
    active_anomalies = db.query(Anomaly).filter(Anomaly.resolved == False).all()
    anomaly_text = "\n".join([f"- {a.severity} {a.anomaly_type}: {a.description}" for a in active_anomalies])
    
    return f"""
    Current Operational Status:
    - Total Inventory Items: {total_items}
    - Low Stock Alerts: {low_stock}
    - Active Routes: {active_routes}
    - Delayed Routes: {delayed_routes}
    
    Active Anomalies:
    {anomaly_text}
    """

@router.get("/", response_model=List[Dict[str, Any]])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current recommendations (mock for now, will be DB backed later)"""
    return MOCK_RECOMMENDATIONS

@router.post("/generate", response_model=List[Dict[str, Any]])
def generate_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate new recommendations using Gemini"""
    if not api_key:
        return MOCK_RECOMMENDATIONS

    try:
        context = get_real_time_context(db)
        
        model = genai.GenerativeModel("models/gemini-flash-latest")
        
        prompt = f"""
        Analyze the following warehouse supply chain data and generate 3-5 critical recommendations.
        
        DATA:
        {context}
        
        Return the response as a valid JSON array of objects with these fields:
        - id: string (unique id)
        - title: string (short title)
        - description: string (1-2 sentences)
        - type: string (inventory, logistics, maintenance, safety, cost)
        - severity: string (low, medium, high, critical)
        - impact: string (quantifiable impact e.g. "Save $500")
        - status: string (active)
        - created_at: string (ISO date)
        
        Do not include markdown formatting like ```json. Just return the raw JSON string.
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up markdown if present
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        recommendations = json.loads(text)
        return recommendations
        
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        # Fallback to mock if AI fails
        return MOCK_RECOMMENDATIONS

@router.post("/{rec_id}/action")
def execute_action(
    rec_id: str,
    action: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Execute an action on a recommendation"""
    
    # Handle specific mock scenarios
    if rec_id == "rec_001":  # Inventory Optimization
        # Simulate running a promotion -> maybe reduce price slightly?
        # For demo, we'll just log it and return success
        pass
        
    elif rec_id == "rec_002":  # Route Efficiency
        # Find the delayed route and update it
        delayed_route = db.query(Route).filter(Route.status == "delayed").first()
        if delayed_route:
            delayed_route.status = "optimized"
            db.commit()
            return {"status": "success", "message": f"Route {delayed_route.id} optimized and rescheduled."}
            
    elif rec_id == "rec_003":  # Preventative Maintenance
        # Find active anomaly and resolve it
        anomaly = db.query(Anomaly).filter(Anomaly.description.like("%Vibration%")).first()
        if anomaly:
            anomaly.status = "resolved"
            db.commit()
            return {"status": "success", "message": "Maintenance scheduled. Anomaly marked as resolved."}

    # Default success for AI generated ones (since we can't easily map them back yet)
    return {"status": "success", "message": f"Action '{action}' executed successfully."}
