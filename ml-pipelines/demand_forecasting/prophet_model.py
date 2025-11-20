"""
Prophet-based demand forecasting model.
Uses Facebook Prophet for time series forecasting.
"""

import pandas as pd
from prophet import Prophet
from datetime import datetime, timedelta
from typing import List, Dict, Any

def forecast_with_prophet(historical_data: List[Dict[str, Any]], forecast_days: int) -> List[Dict[str, Any]]:
    """
    Generate demand forecast using Facebook Prophet.
    
    Args:
        historical_data: List of dicts with 'date' and 'quantity' keys
        forecast_days: Number of days to forecast
    
    Returns:
        List of predictions with date, predicted_quantity, and confidence intervals
    """
    # Prepare data for Prophet (requires 'ds' and 'y' columns)
    df = pd.DataFrame(historical_data)
    df['ds'] = pd.to_datetime(df['date'])
    df['y'] = df['quantity']
    df = df[['ds', 'y']]
    
    # Initialize and fit Prophet model
    model = Prophet(
        daily_seasonality=True,
        weekly_seasonality=True,
        yearly_seasonality=True,
        changepoint_prior_scale=0.05
    )
    
    model.fit(df)
    
    # Create future dataframe
    future = model.make_future_dataframe(periods=forecast_days)
    
    # Generate forecast
    forecast = model.predict(future)
    
    # Extract predictions for future dates only
    predictions = []
    last_historical_date = df['ds'].max()
    
    future_forecast = forecast[forecast['ds'] > last_historical_date]
    
    for _, row in future_forecast.iterrows():
        predictions.append({
            "date": row['ds'].isoformat(),
            "predicted_quantity": max(0, round(row['yhat'])),  # Ensure non-negative
            "lower_bound": max(0, round(row['yhat_lower'])),
            "upper_bound": max(0, round(row['yhat_upper'])),
            "confidence": 0.95
        })
    
    return predictions

def train_prophet_model(sku: str, historical_data: List[Dict[str, Any]]) -> Prophet:
    """
    Train and save a Prophet model for a specific SKU.
    
    Args:
        sku: Product SKU identifier
        historical_data: Historical sales data
    
    Returns:
        Trained Prophet model
    """
    df = pd.DataFrame(historical_data)
    df['ds'] = pd.to_datetime(df['date'])
    df['y'] = df['quantity']
    df = df[['ds', 'y']]
    
    model = Prophet(
        daily_seasonality=True,
        weekly_seasonality=True,
        yearly_seasonality=True
    )
    
    model.fit(df)
    
    # Optionally save model
    # import pickle
    # with open(f'models/prophet_{sku}.pkl', 'wb') as f:
    #     pickle.dump(model, f)
    
    return model
