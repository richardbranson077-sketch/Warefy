"""
Financials Router - Financial reporting and transaction management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
import json

from backend.database_lite import get_db
from backend.models_lite import User, SalesHistory, Transaction
from backend.auth_lite import get_current_active_user
from backend.base_schema import CamelCaseModel
from backend.routers.ai_chat import call_llm

router = APIRouter(prefix="/api/v1/financials", tags=["Financials"])


class FinancialSummaryResponse(CamelCaseModel):
    total_revenue: float
    total_expenses: float
    net_profit: float
    profit_margin: float
    period: str
    status: str = "active"


class TransactionResponse(CamelCaseModel):
    id: int
    type: str
    amount: float
    category: str
    description: str
    date: datetime
    user_id: int


class TransactionCreate(CamelCaseModel):
    type: str  # income, expense
    amount: float
    category: str
    description: str
    date: Optional[datetime] = None


@router.get("/summary", response_model=FinancialSummaryResponse)
def get_financial_summary(
    period: str = "month",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get financial summary based on real data
    """
    # Determine date range
    now = datetime.utcnow()
    if period == "month":
        start_date = now - timedelta(days=30)
    elif period == "quarter":
        start_date = now - timedelta(days=90)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)

    # Calculate Revenue from SalesHistory
    revenue = db.query(func.sum(SalesHistory.revenue)).filter(
        SalesHistory.sale_date >= start_date
    ).scalar() or 0.0

    # Calculate Expenses from Transactions
    expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.type == "expense",
        Transaction.date >= start_date
    ).scalar() or 0.0
    
    # Add manual income from Transactions to revenue
    manual_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.type == "income",
        Transaction.date >= start_date
    ).scalar() or 0.0
    
    total_revenue = revenue + manual_income
    net_profit = total_revenue - expenses
    profit_margin = (net_profit / total_revenue * 100) if total_revenue > 0 else 0.0

    return {
        "total_revenue": total_revenue,
        "total_expenses": expenses,
        "net_profit": net_profit,
        "profit_margin": profit_margin,
        "period": period,
        "status": "active"
    }


@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    limit: int = 50,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get financial transactions
    """
    query = db.query(Transaction)
    
    if type:
        query = query.filter(Transaction.type == type)
        
    return query.order_by(Transaction.date.desc()).limit(limit).all()


@router.post("/transactions", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new financial transaction
    """
    db_transaction = Transaction(
        type=transaction.type,
        amount=transaction.amount,
        category=transaction.category,
        description=transaction.description,
        date=transaction.date or datetime.utcnow(),
        user_id=current_user.id
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@router.post("/analyze")
async def analyze_financials(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Analyze financial health using AI
    """
    # Gather data for context
    now = datetime.utcnow()
    month_start = now - timedelta(days=30)
    
    revenue = db.query(func.sum(SalesHistory.revenue)).filter(SalesHistory.sale_date >= month_start).scalar() or 0
    expenses = db.query(func.sum(Transaction.amount)).filter(Transaction.type == "expense", Transaction.date >= month_start).scalar() or 0
    
    top_expenses = db.query(Transaction.category, func.sum(Transaction.amount)).filter(
        Transaction.type == "expense", 
        Transaction.date >= month_start
    ).group_by(Transaction.category).all()
    
    context = f"""
    Financial Period: Last 30 Days
    Total Revenue: ${revenue:.2f}
    Total Expenses: ${expenses:.2f}
    Net Profit: ${revenue - expenses:.2f}
    Profit Margin: {((revenue - expenses) / revenue * 100) if revenue > 0 else 0:.1f}%
    
    Expense Breakdown:
    {', '.join([f"{cat}: ${amt:.2f}" for cat, amt in top_expenses])}
    """
    
    prompt = f"""
    Act as a CFO. Analyze this financial data and provide:
    1. Financial Health Assessment (Brief summary)
    2. Key Observations (Trends, concerns)
    3. Recommendations (Cost cutting, revenue opportunities)
    
    Data:
    {context}
    
    Format response as JSON with keys: 'assessment', 'observations' (list), 'recommendations' (list).
    """
    
    try:
        ai_response = await call_llm(prompt, context)
        # Clean up response
        if "```json" in ai_response:
            ai_response = ai_response.split("```json")[1].split("```")[0].strip()
        elif "```" in ai_response:
            ai_response = ai_response.split("```")[1].split("```")[0].strip()
            
        return json.loads(ai_response)
    except Exception:
        return {
            "assessment": "Unable to generate analysis.",
            "observations": ["Data available but AI analysis failed."],
            "recommendations": ["Review financial reports manually."]
        }
