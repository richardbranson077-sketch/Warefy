"""
Demand forecasting router using ML models (Prophet, LSTM, XGBoost).
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import sys
import os

# Add ML pipelines to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../ml-pipelines'))

from database import get_db
from models import SalesHistory, User
from schemas import DemandForecastRequest, DemandForecastResponse
from auth import get_current_active_user

router = APIRouter(prefix="/api/demand", tags=["Demand Forecasting"])

@router.post("/forecast", response_model=DemandForecastResponse)
def forecast_demand(
    request: DemandForecastRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate demand forecast for a specific SKU using ML models.
    Supports Prophet, LSTM, and XGBoost models.
    """
    # Get historical sales data
    query = db.query(SalesHistory).filter(SalesHistory.sku == request.sku)
    
    if request.warehouse_id:
        query = query.filter(SalesHistory.warehouse_id == request.warehouse_id)
    
    sales_data = query.order_by(SalesHistory.sale_date).all()
    
    if len(sales_data) < 30:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient historical data for SKU {request.sku}. Need at least 30 data points."
        )
    
    # Prepare data for ML model
    historical_data = [
        {"date": sale.sale_date, "quantity": sale.quantity_sold}
        for sale in sales_data
    ]
    
    # Import and use the appropriate model
    try:
        if request.model_type == "prophet":
            from demand_forecasting.prophet_model import forecast_with_prophet
            predictions = forecast_with_prophet(historical_data, request.forecast_days)
        elif request.model_type == "lstm":
            from demand_forecasting.lstm_model import forecast_with_lstm
            predictions = forecast_with_lstm(historical_data, request.forecast_days)
        elif request.model_type == "xgboost":
            from demand_forecasting.xgboost_model import forecast_with_xgboost
            predictions = forecast_with_xgboost(historical_data, request.forecast_days)
        else:
            raise HTTPException(status_code=400, detail="Invalid model type")
        
        return DemandForecastResponse(
            sku=request.sku,
            warehouse_id=request.warehouse_id,
            forecast_days=request.forecast_days,
            model_type=request.model_type,
            predictions=predictions,
            accuracy_metrics={"mae": 0.0, "rmse": 0.0}  # Placeholder
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating forecast: {str(e)}"
        )

@router.get("/historical/{sku}")
def get_historical_sales(
    sku: str,
    warehouse_id: int = None,
    days: int = 90,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get historical sales data for a SKU"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(SalesHistory).filter(
        SalesHistory.sku == sku,
        SalesHistory.sale_date >= cutoff_date
    )
    
    if warehouse_id:
        query = query.filter(SalesHistory.warehouse_id == warehouse_id)
    
    sales = query.order_by(SalesHistory.sale_date).all()
    
    return {
        "sku": sku,
        "warehouse_id": warehouse_id,
        "data_points": len(sales),
        "sales_history": [
            {
                "date": sale.sale_date.isoformat(),
                "quantity": sale.quantity_sold,
                "revenue": sale.revenue
            }
            for sale in sales
        ]
    }
