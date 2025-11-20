"""
LSTM-based demand forecasting model using TensorFlow.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

def prepare_lstm_data(data: List[Dict[str, Any]], lookback: int = 30):
    """
    Prepare time series data for LSTM model.
    
    Args:
        data: Historical sales data
        lookback: Number of past days to use for prediction
    
    Returns:
        X, y arrays for training
    """
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    # Extract quantities
    quantities = df['quantity'].values.reshape(-1, 1)
    
    # Normalize data
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(quantities)
    
    # Create sequences
    X, y = [], []
    for i in range(lookback, len(scaled_data)):
        X.append(scaled_data[i-lookback:i, 0])
        y.append(scaled_data[i, 0])
    
    return np.array(X), np.array(y), scaler

def build_lstm_model(lookback: int = 30):
    """
    Build LSTM neural network for time series forecasting.
    
    Args:
        lookback: Number of time steps to look back
    
    Returns:
        Compiled Keras model
    """
    model = keras.Sequential([
        layers.LSTM(50, return_sequences=True, input_shape=(lookback, 1)),
        layers.Dropout(0.2),
        layers.LSTM(50, return_sequences=False),
        layers.Dropout(0.2),
        layers.Dense(25),
        layers.Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])
    return model

def forecast_with_lstm(historical_data: List[Dict[str, Any]], forecast_days: int) -> List[Dict[str, Any]]:
    """
    Generate demand forecast using LSTM neural network.
    
    Args:
        historical_data: List of dicts with 'date' and 'quantity' keys
        forecast_days: Number of days to forecast
    
    Returns:
        List of predictions with date and predicted_quantity
    """
    lookback = 30
    
    # Prepare data
    X, y, scaler = prepare_lstm_data(historical_data, lookback)
    
    if len(X) < 10:
        # Fallback to simple moving average if insufficient data
        return simple_moving_average_forecast(historical_data, forecast_days)
    
    # Reshape for LSTM [samples, time steps, features]
    X = X.reshape((X.shape[0], X.shape[1], 1))
    
    # Build and train model
    model = build_lstm_model(lookback)
    model.fit(X, y, epochs=50, batch_size=32, verbose=0)
    
    # Generate predictions
    predictions = []
    last_sequence = X[-1]
    
    df = pd.DataFrame(historical_data)
    last_date = pd.to_datetime(df['date'].max())
    
    for i in range(forecast_days):
        # Predict next value
        pred = model.predict(last_sequence.reshape(1, lookback, 1), verbose=0)
        pred_value = scaler.inverse_transform(pred)[0][0]
        
        # Store prediction
        next_date = last_date + timedelta(days=i+1)
        predictions.append({
            "date": next_date.isoformat(),
            "predicted_quantity": max(0, round(pred_value)),
            "confidence": 0.85
        })
        
        # Update sequence for next prediction
        last_sequence = np.append(last_sequence[1:], pred)
    
    return predictions

def simple_moving_average_forecast(historical_data: List[Dict[str, Any]], forecast_days: int) -> List[Dict[str, Any]]:
    """Fallback method using simple moving average"""
    df = pd.DataFrame(historical_data)
    avg_quantity = df['quantity'].tail(30).mean()
    
    last_date = pd.to_datetime(df['date'].max())
    predictions = []
    
    for i in range(forecast_days):
        next_date = last_date + timedelta(days=i+1)
        predictions.append({
            "date": next_date.isoformat(),
            "predicted_quantity": max(0, round(avg_quantity)),
            "confidence": 0.70
        })
    
    return predictions
