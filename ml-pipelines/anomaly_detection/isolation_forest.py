"""
Anomaly detection using Isolation Forest algorithm.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any
from datetime import datetime, timedelta

def detect_demand_anomalies(sales_data: List[Dict[str, Any]], contamination: float = 0.1) -> List[Dict[str, Any]]:
    """
    Detect anomalies in demand patterns using Isolation Forest.
    
    Args:
        sales_data: Historical sales data with date and quantity
        contamination: Expected proportion of anomalies (0.1 = 10%)
    
    Returns:
        List of detected anomalies with details
    """
    if len(sales_data) < 30:
        return []
    
    # Prepare data
    df = pd.DataFrame(sales_data)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    # Create features
    df['day_of_week'] = df['date'].dt.dayofweek
    df['day_of_month'] = df['date'].dt.day
    df['month'] = df['date'].dt.month
    
    # Rolling statistics
    df['rolling_mean_7'] = df['quantity'].rolling(window=7, min_periods=1).mean()
    df['rolling_std_7'] = df['quantity'].rolling(window=7, min_periods=1).std()
    
    # Prepare features for anomaly detection
    feature_cols = ['quantity', 'day_of_week', 'rolling_mean_7', 'rolling_std_7']
    df_features = df[feature_cols].fillna(0)
    
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df_features)
    
    # Train Isolation Forest
    iso_forest = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=100
    )
    
    predictions = iso_forest.fit_predict(X_scaled)
    anomaly_scores = iso_forest.score_samples(X_scaled)
    
    # Extract anomalies
    anomalies = []
    for idx, (pred, score) in enumerate(zip(predictions, anomaly_scores)):
        if pred == -1:  # Anomaly detected
            row = df.iloc[idx]
            
            # Determine severity based on score
            if score < -0.5:
                severity = "critical"
            elif score < -0.3:
                severity = "high"
            elif score < -0.1:
                severity = "medium"
            else:
                severity = "low"
            
            anomalies.append({
                "date": row['date'].isoformat(),
                "quantity": int(row['quantity']),
                "expected_range": f"{int(row['rolling_mean_7'] - 2*row['rolling_std_7'])} - {int(row['rolling_mean_7'] + 2*row['rolling_std_7'])}",
                "anomaly_score": float(score),
                "severity": severity,
                "type": "demand_spike" if row['quantity'] > row['rolling_mean_7'] else "demand_drop"
            })
    
    return anomalies

def detect_delivery_delays(routes_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detect anomalies in delivery times.
    
    Args:
        routes_data: Route completion data with estimated and actual durations
    
    Returns:
        List of delivery delay anomalies
    """
    anomalies = []
    
    for route in routes_data:
        estimated = route.get('estimated_duration', 0)
        actual = route.get('actual_duration', 0)
        
        if actual > estimated * 1.5:  # 50% longer than estimated
            delay_percentage = ((actual - estimated) / estimated) * 100
            
            if delay_percentage > 100:
                severity = "critical"
            elif delay_percentage > 50:
                severity = "high"
            else:
                severity = "medium"
            
            anomalies.append({
                "route_id": route.get('id'),
                "estimated_duration": estimated,
                "actual_duration": actual,
                "delay_percentage": round(delay_percentage, 2),
                "severity": severity,
                "type": "delivery_delay"
            })
    
    return anomalies

def detect_inventory_anomalies(inventory_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detect anomalies in inventory levels (stockouts, overstocking).
    
    Args:
        inventory_data: Current inventory levels
    
    Returns:
        List of inventory anomalies
    """
    anomalies = []
    
    for item in inventory_data:
        quantity = item.get('quantity', 0)
        reorder_point = item.get('reorder_point', 10)
        
        # Stockout detection
        if quantity == 0:
            anomalies.append({
                "sku": item.get('sku'),
                "product_name": item.get('product_name'),
                "warehouse_id": item.get('warehouse_id'),
                "quantity": quantity,
                "severity": "critical",
                "type": "stockout",
                "description": "Product is completely out of stock"
            })
        
        # Low stock warning
        elif quantity <= reorder_point:
            anomalies.append({
                "sku": item.get('sku'),
                "product_name": item.get('product_name'),
                "warehouse_id": item.get('warehouse_id'),
                "quantity": quantity,
                "reorder_point": reorder_point,
                "severity": "high",
                "type": "low_stock",
                "description": f"Stock level ({quantity}) below reorder point ({reorder_point})"
            })
    
    return anomalies
