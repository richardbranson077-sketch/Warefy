"""
XGBoost-based demand forecasting model.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
import xgboost as xgb
from sklearn.model_selection import train_test_split

def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create time-based features for XGBoost.
    
    Args:
        df: DataFrame with date and quantity columns
    
    Returns:
        DataFrame with engineered features
    """
    df = df.copy()
    df['date'] = pd.to_datetime(df['date'])
    
    # Time-based features
    df['day_of_week'] = df['date'].dt.dayofweek
    df['day_of_month'] = df['date'].dt.day
    df['month'] = df['date'].dt.month
    df['quarter'] = df['date'].dt.quarter
    df['year'] = df['date'].dt.year
    df['week_of_year'] = df['date'].dt.isocalendar().week
    
    # Lag features
    for lag in [1, 7, 14, 30]:
        df[f'lag_{lag}'] = df['quantity'].shift(lag)
    
    # Rolling statistics
    for window in [7, 14, 30]:
        df[f'rolling_mean_{window}'] = df['quantity'].rolling(window=window).mean()
        df[f'rolling_std_{window}'] = df['quantity'].rolling(window=window).std()
    
    return df

def forecast_with_xgboost(historical_data: List[Dict[str, Any]], forecast_days: int) -> List[Dict[str, Any]]:
    """
    Generate demand forecast using XGBoost regression.
    
    Args:
        historical_data: List of dicts with 'date' and 'quantity' keys
        forecast_days: Number of days to forecast
    
    Returns:
        List of predictions with date and predicted_quantity
    """
    # Prepare data
    df = pd.DataFrame(historical_data)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    # Create features
    df_features = create_features(df)
    
    # Drop rows with NaN (from lag/rolling features)
    df_features = df_features.dropna()
    
    if len(df_features) < 30:
        # Fallback to simple average
        avg_quantity = df['quantity'].mean()
        last_date = df['date'].max()
        
        predictions = []
        for i in range(forecast_days):
            next_date = last_date + timedelta(days=i+1)
            predictions.append({
                "date": next_date.isoformat(),
                "predicted_quantity": max(0, round(avg_quantity)),
                "confidence": 0.70
            })
        return predictions
    
    # Prepare features and target
    feature_cols = [col for col in df_features.columns if col not in ['date', 'quantity']]
    X = df_features[feature_cols]
    y = df_features['quantity']
    
    # Train XGBoost model
    model = xgb.XGBRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    
    model.fit(X, y)
    
    # Generate future predictions
    predictions = []
    last_date = df['date'].max()
    
    # For simplicity, use recent average for future predictions
    # In production, you'd create proper future features
    recent_avg = df['quantity'].tail(30).mean()
    recent_std = df['quantity'].tail(30).std()
    
    for i in range(forecast_days):
        next_date = last_date + timedelta(days=i+1)
        
        # Create future features (simplified)
        future_features = {
            'day_of_week': next_date.dayofweek,
            'day_of_month': next_date.day,
            'month': next_date.month,
            'quarter': (next_date.month - 1) // 3 + 1,
            'year': next_date.year,
            'week_of_year': next_date.isocalendar()[1]
        }
        
        # Add lag features (use recent average)
        for lag in [1, 7, 14, 30]:
            future_features[f'lag_{lag}'] = recent_avg
        
        # Add rolling features
        for window in [7, 14, 30]:
            future_features[f'rolling_mean_{window}'] = recent_avg
            future_features[f'rolling_std_{window}'] = recent_std
        
        # Create DataFrame for prediction
        future_df = pd.DataFrame([future_features])
        
        # Ensure columns match training data
        for col in feature_cols:
            if col not in future_df.columns:
                future_df[col] = 0
        
        future_df = future_df[feature_cols]
        
        # Predict
        pred = model.predict(future_df)[0]
        
        predictions.append({
            "date": next_date.isoformat(),
            "predicted_quantity": max(0, round(pred)),
            "confidence": 0.80
        })
    
    return predictions
