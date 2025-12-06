"""
Smart Reorder Automation Router
Automatic purchase order generation based on reorder points and demand forecasting
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from pydantic import BaseModel
from datetime import datetime
from backend.auth_lite import get_current_active_user
from backend.models_lite import User
from backend.database_lite import get_db

router = APIRouter(prefix="/reorder", tags=["Smart Reorder"])

# AI Integration
try:
    import google.generativeai as genai
    import os
    import json
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
except ImportError:
    genai = None
    api_key = None

async def get_gemini_reorder_insight(prompt: str) -> Dict:
    """Helper to call Gemini API for reorder insights"""
    if not api_key:
        return {"error": "AI module not configured"}
        
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        full_prompt = f"""
        You are an AI Supply Chain Analyst for Warefy.
        
        Task: {prompt}
        
        Return ONLY valid JSON. No markdown formatting.
        """
        response = await model.generate_content_async(full_prompt)
        return json.loads(response.text.strip().replace('```json', '').replace('```', ''))
    except Exception as e:
        print(f"AI Error: {e}")
        return {"error": str(e)}

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
    ai_insight: Optional[str] = None  # New AI field

# ... (rest of the file)

@router.post("/ai-insight")
async def get_ai_reorder_insight(
    sku: str,
    current_stock: int,
    daily_demand: float,
    lead_time: int,
    current_user: User = Depends(get_current_active_user)
):
    """Get AI-powered insight for a specific reorder item"""
    if not api_key:
        return {"insight": "AI module not configured. Consider reordering based on standard lead times."}

    prompt = f"""
    Analyze reorder strategy for SKU: {sku}.
    Current Stock: {current_stock}
    Daily Demand: {daily_demand}
    Lead Time: {lead_time} days
    
    Provide a concise strategic insight (max 2 sentences) on whether to expedite, increase quantity, or hold off.
    Consider potential supply chain disruptions or demand spikes (simulate these factors).
    
    Return JSON: {{ "insight": "string" }}
    """
    
    result = await get_gemini_reorder_insight(prompt)
    return result

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
            
    return risk_analysis  # Fixed missing return statement
    
@router.get("/items")
def get_reorder_items():
    """Get reorder items (Mock for frontend compatibility)"""
    return [
        {
            "id": "1",
            "productId": "SKU-001",
            "quantity": 50,
            "status": "pending",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        },
        {
            "id": "2",
            "productId": "SKU-002",
            "quantity": 100,
            "status": "ordered",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
    ]

@router.get("/suggestions")
def get_reorder_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get reorder suggestions (Alias for recommendations)"""
    # Call existing logic or return mock
    return [
        {
            "productId": "SKU-003",
            "suggestedQuantity": 200,
            "confidence": 0.95
        },
        {
            "productId": "SKU-004",
            "suggestedQuantity": 75,
            "confidence": 0.88
        }
    ]
