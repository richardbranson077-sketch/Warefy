"""
Financials Router - Financial reporting and transaction management
Status: Coming Soon (Mock Data)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from backend.database_lite import get_db
from backend.models_lite import User
from backend.auth_lite import get_current_active_user
from backend.base_schema import CamelCaseModel

router = APIRouter(prefix="/financials", tags=["Financials"])


class FinancialSummaryResponse(CamelCaseModel):
    total_revenue: float
    total_expenses: float
    net_profit: float
    profit_margin: float
    period: str
    status: str = "coming_soon"


class TransactionResponse(CamelCaseModel):
    id: int
    type: str
    amount: float
    category: str
    description: str
    date: datetime
    status: str = "coming_soon"


@router.get("/summary", response_model=FinancialSummaryResponse)
def get_financial_summary(
    period: str = "month",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get financial summary (Mock Data - Coming Soon)
    """
    return {
        "total_revenue": 125000.00,
        "total_expenses": 75000.00,
        "net_profit": 50000.00,
        "profit_margin": 40.0,
        "period": period,
        "status": "coming_soon"
    }


@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get financial transactions (Mock Data - Coming Soon)
    """
    return [
        {
            "id": 1,
            "type": "income",
            "amount": 5000.00,
            "category": "Sales",
            "description": "Product sales revenue",
            "date": datetime.now() - timedelta(days=1),
            "status": "coming_soon"
        },
        {
            "id": 2,
            "type": "expense",
            "amount": 2000.00,
            "category": "Operations",
            "description": "Warehouse maintenance",
            "date": datetime.now() - timedelta(days=2),
            "status": "coming_soon"
        }
    ]


@router.get("/profit-loss")
def get_profit_loss(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get profit and loss statement (Mock Data - Coming Soon)
    """
    return {
        "revenue": 125000.00,
        "cost_of_goods_sold": 50000.00,
        "gross_profit": 75000.00,
        "operating_expenses": 25000.00,
        "net_profit": 50000.00,
        "status": "coming_soon",
        "message": "Full financial reporting coming soon"
    }
