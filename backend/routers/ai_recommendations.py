"""
AI Recommendations router for intelligent supply chain insights.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../../ai-module'))

from database import get_db
from models import Inventory, User
from schemas import AIRecommendationRequest, AIRecommendationResponse
from auth import get_current_active_user

router = APIRouter(prefix="/api/ai", tags=["AI Recommendations"])

@router.post("/recommendations", response_model=AIRecommendationResponse)
def get_ai_recommendations(
    request: AIRecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get AI-powered recommendations for supply chain optimization.
    Supports restocking, supplier alternatives, and contingency planning.
    """
    from recommendations import (
        generate_restocking_recommendations,
        generate_supplier_alternatives,
        generate_contingency_plan
    )
    
    try:
        if request.context == "restocking":
            # Get low stock items
            query = db.query(Inventory).filter(Inventory.quantity <= Inventory.reorder_point)
            
            if request.warehouse_id:
                query = query.filter(Inventory.warehouse_id == request.warehouse_id)
            
            low_stock_items = query.all()
            
            items_data = [
                {
                    "sku": item.sku,
                    "product_name": item.product_name,
                    "quantity": item.quantity,
                    "reorder_point": item.reorder_point,
                    "warehouse_id": item.warehouse_id
                }
                for item in low_stock_items
            ]
            
            result = generate_restocking_recommendations(
                warehouse_id=request.warehouse_id or 0,
                low_stock_items=items_data,
                sales_trends=request.additional_context or {}
            )
        
        elif request.context == "supplier_alternative":
            if not request.sku:
                raise HTTPException(status_code=400, detail="SKU required for supplier alternatives")
            
            result = generate_supplier_alternatives(
                sku=request.sku,
                current_supplier=request.additional_context.get("current_supplier", "Unknown"),
                requirements=request.additional_context or {}
            )
        
        elif request.context == "contingency_planning":
            result = generate_contingency_plan(
                scenario_type=request.additional_context.get("scenario_type", "general"),
                scenario_details=request.additional_context or {}
            )
        
        else:
            raise HTTPException(status_code=400, detail="Invalid context type")
        
        return AIRecommendationResponse(
            recommendations=result.get("recommendations", []),
            reasoning=result.get("reasoning", ""),
            confidence_score=result.get("confidence_score", 0.75),
            generated_at=result.get("generated_at")
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating AI recommendations: {str(e)}"
        )
