"""
AI-Powered Reports Router
Generates intelligent reports using Gemini AI from natural language queries
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import json
import os

from backend.database_lite import get_db
from backend.models_lite import User, Inventory, Order, OrderItem, SalesHistory
from backend.auth_lite import get_current_active_user

try:
    import google.generativeai as genai
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
except ImportError:
    genai = None
    api_key = None

router = APIRouter(prefix="/api/v1/ai-reports", tags=["AI Reports"])

# ========================================================================
# SCHEMAS
# ========================================================================

class ReportGenerateRequest(BaseModel):
    query: str  # Natural language query
    date_range: Optional[Dict[str, str]] = None  # {"start": "2024-01-01", "end": "2024-12-31"}

class ReportResponse(BaseModel):
    id: str
    title: str
    query: str
    summary: str
    insights: List[str]
    recommendations: List[str]
    data: Dict[str, Any]
    chart_type: str  # "line", "bar", "pie", "table"
    generated_at: str
    model: str

# In-memory storage (replace with DB in production)
generated_reports: List[Dict] = []

# ========================================================================
# ENDPOINTS
# ========================================================================

@router.post("/generate")
async def generate_ai_report(
    request: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate AI report from natural language query"""
    
    query = request.query.lower()
    date_range = request.date_range
    
    # Get context data from database
    context = get_database_context(db, date_range)
    
    if not api_key or not genai:
        # Fallback to pattern matching
        return generate_mock_report(query, context, date_range)
    
    try:
        model = genai.GenerativeModel("models/gemini-flash-latest")
        
        prompt = f"""
        You are an AI business analyst. Generate a comprehensive report based on this query:
        
        QUERY: "{request.query}"
        
        DATABASE CONTEXT:
        - Total Products: {context['total_products']}
        - Total Orders: {context['total_orders']}
        - Total Revenue: ${context['total_revenue']:,.2f}
        - Low Stock Items: {context['low_stock_count']}
        - Average Order Value: ${context['avg_order_value']:,.2f}
        
        SAMPLE DATA:
        Top Products: {json.dumps(context['top_products'][:5], indent=2)}
        Recent Orders: {json.dumps(context['recent_orders'][:5], indent=2)}
        
        Generate a JSON report with:
        1. "title": Short descriptive title
        2. "summary": 2-3 sentence executive summary
        3. "insights": Array of 3-5 key insights discovered
        4. "recommendations": Array of 2-4 actionable recommendations
        5. "data": Object with relevant data for visualization
        6. "chart_type": Best chart type ("line", "bar", "pie", or "table")
        
        Return ONLY valid JSON in this format:
        {{
          "title": "string",
          "summary": "string",
          "insights": ["insight1", "insight2"],
          "recommendations": ["rec1", "rec2"],
          "data": {{
            "labels": ["label1", "label2"],
            "values": [100, 200],
            "details": []
          }},
          "chart_type": "bar"
        }}
        
        Do not include markdown formatting.
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean markdown if present
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        report_data = json.loads(text.strip())
        
        # Create report object
        report = {
            "id": f"report_{len(generated_reports) + 1}_{int(datetime.now().timestamp())}",
            "query": request.query,
            "model": "gemini-ai",
            "generated_at": datetime.now().isoformat(),
            **report_data
        }
        
        generated_reports.append(report)
        
        return report
        
    except Exception as e:
        print(f"Gemini report generation error: {e}")
        return generate_mock_report(query, context, date_range)

@router.get("/")
async def list_reports(
    current_user: User = Depends(get_current_active_user)
):
    """List all generated reports"""
    return generated_reports

@router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get specific report by ID"""
    report = next((r for r in generated_reports if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.delete("/{report_id}")
async def delete_report(
    report_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete a report"""
    global generated_reports
    generated_reports = [r for r in generated_reports if r["id"] != report_id]
    return {"message": "Report deleted successfully"}

@router.post("/{report_id}/regenerate")
async def regenerate_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Regenerate report with fresh data"""
    report = next((r for r in generated_reports if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Regenerate using original query
    request = ReportGenerateRequest(query=report["query"])
    new_report = await generate_ai_report(request, db, current_user)
    
    # Update existing report
    for i, r in enumerate(generated_reports):
        if r["id"] == report_id:
            generated_reports[i] = {**new_report, "id": report_id}
            break
    
    return generated_reports[i]

# ========================================================================
# HELPER FUNCTIONS
# ========================================================================

def get_database_context(db: Session, date_range: Optional[Dict] = None) -> Dict[str, Any]:
    """Get relevant database statistics for context"""
    
    # Products
    total_products = db.query(func.count(Inventory.id)).scalar() or 0
    low_stock_count = db.query(func.count(Inventory.id)).filter(
        Inventory.quantity <= Inventory.reorder_point
    ).scalar() or 0
    
    # Orders
    order_query = db.query(Order)
    if date_range:
        if date_range.get("start"):
            order_query = order_query.filter(Order.created_at >= date_range["start"])
        if date_range.get("end"):
            order_query = order_query.filter(Order.created_at <= date_range["end"])
    
    orders = order_query.all()
    total_orders = len(orders)
    total_revenue = sum(o.total_amount for o in orders)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # Top products (from inventory)
    top_products = db.query(Inventory).order_by(Inventory.quantity.desc()).limit(10).all()
    top_products_data = [
        {"sku": p.sku, "name": p.product_name, "stock": p.quantity, "value": p.quantity * (p.unit_price or 0)}
        for p in top_products
    ]
    
    # Recent orders
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()
    recent_orders_data = [
        {"id": o.id, "amount": o.total_amount, "status": o.status, "date": o.created_at.isoformat()}
        for o in recent_orders
    ]
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "avg_order_value": avg_order_value,
        "low_stock_count": low_stock_count,
        "top_products": top_products_data,
        "recent_orders": recent_orders_data
    }

def generate_mock_report(query: str, context: Dict, date_range: Optional[Dict]) -> Dict:
    """Generate mock report when AI is unavailable"""
    
    query_lower = query.lower()
    
    # Pattern matching for common queries
    if any(word in query_lower for word in ["top", "best", "selling", "product"]):
        return {
            "id": f"report_{len(generated_reports) + 1}_{int(datetime.now().timestamp())}",
            "title": "Top Selling Products Analysis",
            "query": query,
            "summary": f"Analysis of top-performing products based on current inventory levels. Total of {context['total_products']} products analyzed.",
            "insights": [
                f"Top 5 products account for significant inventory value",
                f"Current inventory worth ${context['total_revenue']:,.2f}",
                f"{context['low_stock_count']} products need restocking"
            ],
            "recommendations": [
                "Focus marketing efforts on top performers",
                "Reorder low-stock items immediately",
                "Consider bundling strategies for slower-moving items"
            ],
            "data": {
                "labels": [p["name"][:20] for p in context["top_products"][:5]],
                "values": [p["stock"] for p in context["top_products"][:5]],
                "details": context["top_products"][:10]
            },
            "chart_type": "bar",
            "model": "pattern-matching",
            "generated_at": datetime.now().isoformat()
        }
    
    elif any(word in query_lower for word in ["revenue", "sales", "income", "financial"]):
        return {
            "id": f"report_{len(generated_reports) + 1}_{int(datetime.now().timestamp())}",
            "title": "Revenue & Sales Analysis",
            "query": query,
            "summary": f"Financial performance overview showing ${context['total_revenue']:,.2f} in total revenue from {context['total_orders']} orders.",
            "insights": [
                f"Total revenue: ${context['total_revenue']:,.2f}",
                f"Average order value: ${context['avg_order_value']:,.2f}",
                f"{context['total_orders']} orders processed"
            ],
            "recommendations": [
                "Implement upselling strategies to increase AOV",
                "Focus on customer retention programs",
                "Optimize pricing for high-margin products"
            ],
            "data": {
                "labels": [o["date"][:10] for o in context["recent_orders"][:7]],
                "values": [o["amount"] for o in context["recent_orders"][:7]],
                "details": context["recent_orders"][:10]
            },
            "chart_type": "line",
            "model": "pattern-matching",
            "generated_at": datetime.now().isoformat()
        }
    
    elif any(word in query_lower for word in ["stock", "inventory", "warehouse"]):
        return {
            "id": f"report_{len(generated_reports) + 1}_{int(datetime.now().timestamp())}",
            "title": "Inventory Health Report",
            "query": query,
            "summary": f"Comprehensive inventory analysis covering {context['total_products']} products with {context['low_stock_count']} items requiring attention.",
            "insights": [
                f"{context['total_products']} total products in inventory",
                f"{context['low_stock_count']} items below reorder point",
                "Stock distribution shows healthy variety"
            ],
            "recommendations": [
                "Implement automated reordering for critical items",
                "Review slow-moving inventory for clearance",
                "Optimize warehouse space allocation"
            ],
            "data": {
                "labels": ["In Stock", "Low Stock", "Out of Stock"],
                "values": [context['total_products'] - context['low_stock_count'], context['low_stock_count'], 0],
                "details": context["top_products"][:10]
            },
            "chart_type": "pie",
            "model": "pattern-matching",
            "generated_at": datetime.now().isoformat()
        }
    
    else:
        # Generic report
        return {
            "id": f"report_{len(generated_reports) + 1}_{int(datetime.now().timestamp())}",
            "title": "Business Overview Report",
            "query": query,
            "summary": f"General business metrics showing {context['total_orders']} orders and {context['total_products']} products.",
            "insights": [
                f"Total products: {context['total_products']}",
                f"Total orders: {context['total_orders']}",
                f"Revenue: ${context['total_revenue']:,.2f}"
            ],
            "recommendations": [
                "Review detailed reports for specific insights",
                "Monitor key performance indicators regularly",
                "Set up automated alerts for critical metrics"
            ],
            "data": {
                "labels": ["Products", "Orders", "Low Stock"],
                "values": [context['total_products'], context['total_orders'], context['low_stock_count']],
                "details": []
            },
            "chart_type": "bar",
            "model": "pattern-matching",
            "generated_at": datetime.now().isoformat()
        }
