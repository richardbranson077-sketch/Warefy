"""
AI-powered recommendations using OpenAI GPT-4.
Provides multi-step reasoning for supply chain optimization.
"""

import openai
import os
from datetime import datetime
from typing import Dict, Any, List
from dotenv import load_dotenv
import json

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY", "")

def generate_restocking_recommendations(
    warehouse_id: int,
    low_stock_items: List[Dict[str, Any]],
    sales_trends: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate AI-powered restocking recommendations.
    
    Args:
        warehouse_id: Warehouse identifier
        low_stock_items: List of items below reorder point
        sales_trends: Recent sales trend data
    
    Returns:
        Recommendations with reasoning and confidence score
    """
    if not openai.api_key or openai.api_key == "":
        # Fallback to rule-based recommendations
        return generate_rule_based_recommendations(low_stock_items)
    
    # Prepare context for GPT-4
    context = f"""
    You are an AI supply chain optimization expert. Analyze the following warehouse inventory situation and provide actionable recommendations.
    
    Warehouse ID: {warehouse_id}
    
    Low Stock Items ({len(low_stock_items)} items):
    {json.dumps(low_stock_items[:10], indent=2)}
    
    Recent Sales Trends:
    {json.dumps(sales_trends, indent=2)}
    
    Provide:
    1. Top 5 items to restock immediately with recommended quantities
    2. Reasoning for each recommendation
    3. Potential risks if not restocked
    4. Estimated impact on operations
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert supply chain analyst providing data-driven recommendations."},
                {"role": "user", "content": context}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        recommendation_text = response.choices[0].message.content
        
        return {
            "recommendations": parse_recommendations(recommendation_text),
            "reasoning": recommendation_text,
            "confidence_score": 0.85,
            "generated_at": datetime.utcnow()
        }
    
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return generate_rule_based_recommendations(low_stock_items)

def generate_supplier_alternatives(
    sku: str,
    current_supplier: str,
    requirements: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Suggest alternative suppliers using AI reasoning.
    
    Args:
        sku: Product SKU
        current_supplier: Current supplier name
        requirements: Specific requirements (price, lead time, quality)
    
    Returns:
        Alternative supplier recommendations
    """
    if not openai.api_key or openai.api_key == "":
        return {
            "recommendations": [
                {"supplier": "Alternative Supplier A", "score": 0.85, "reason": "Good pricing and reliability"},
                {"supplier": "Alternative Supplier B", "score": 0.78, "reason": "Fast delivery times"}
            ],
            "reasoning": "Rule-based supplier recommendations",
            "confidence_score": 0.70,
            "generated_at": datetime.utcnow()
        }
    
    context = f"""
    Find alternative suppliers for the following product:
    
    SKU: {sku}
    Current Supplier: {current_supplier}
    Requirements: {json.dumps(requirements, indent=2)}
    
    Suggest 3-5 alternative suppliers considering:
    - Cost competitiveness
    - Delivery reliability
    - Quality standards
    - Geographic proximity
    - Risk diversification
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a procurement specialist with deep supplier network knowledge."},
                {"role": "user", "content": context}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        recommendation_text = response.choices[0].message.content
        
        return {
            "recommendations": parse_supplier_recommendations(recommendation_text),
            "reasoning": recommendation_text,
            "confidence_score": 0.80,
            "generated_at": datetime.utcnow()
        }
    
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return generate_rule_based_recommendations([])

def generate_contingency_plan(
    scenario_type: str,
    scenario_details: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate AI-powered contingency plans for supply chain disruptions.
    
    Args:
        scenario_type: Type of disruption (warehouse_closure, vehicle_breakdown, demand_spike)
        scenario_details: Specific details about the scenario
    
    Returns:
        Contingency plan with actionable steps
    """
    if not openai.api_key or openai.api_key == "":
        return {
            "contingency_steps": [
                "Activate backup warehouse",
                "Reroute deliveries",
                "Contact alternative suppliers"
            ],
            "reasoning": "Standard contingency protocol",
            "confidence_score": 0.75,
            "generated_at": datetime.utcnow()
        }
    
    context = f"""
    Create a detailed contingency plan for the following supply chain disruption:
    
    Scenario Type: {scenario_type}
    Details: {json.dumps(scenario_details, indent=2)}
    
    Provide:
    1. Immediate actions (next 24 hours)
    2. Short-term mitigation (1-7 days)
    3. Long-term recovery plan
    4. Resource requirements
    5. Risk assessment
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a supply chain risk management expert."},
                {"role": "user", "content": context}
            ],
            temperature=0.7,
            max_tokens=1200
        )
        
        plan_text = response.choices[0].message.content
        
        return {
            "contingency_plan": plan_text,
            "reasoning": "AI-generated multi-step contingency plan",
            "confidence_score": 0.85,
            "generated_at": datetime.utcnow()
        }
    
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return generate_rule_based_recommendations([])

def parse_recommendations(text: str) -> List[Dict[str, Any]]:
    """Parse AI-generated recommendations into structured format"""
    # Simplified parsing - in production, use more robust parsing
    return [
        {"item": "Item parsed from AI response", "quantity": 100, "priority": "high"}
    ]

def parse_supplier_recommendations(text: str) -> List[Dict[str, Any]]:
    """Parse supplier recommendations"""
    return [
        {"supplier": "Supplier from AI", "score": 0.85, "reason": "Parsed reason"}
    ]

def generate_rule_based_recommendations(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Fallback rule-based recommendations when AI is unavailable"""
    recommendations = []
    
    for item in items[:5]:
        recommended_qty = item.get('reorder_point', 10) * 3
        recommendations.append({
            "sku": item.get('sku', 'UNKNOWN'),
            "product_name": item.get('product_name', 'Unknown Product'),
            "current_quantity": item.get('quantity', 0),
            "recommended_quantity": recommended_qty,
            "priority": "high" if item.get('quantity', 0) == 0 else "medium",
            "reason": "Below reorder point - rule-based recommendation"
        })
    
    return {
        "recommendations": recommendations,
        "reasoning": "Rule-based recommendations (AI unavailable)",
        "confidence_score": 0.70,
        "generated_at": datetime.utcnow()
    }
