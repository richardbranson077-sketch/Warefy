"""
Warehouse Performance Benchmarking
Compare performance against industry standards and peers
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from pydantic import BaseModel
from datetime import datetime, timedelta

from backend.database_lite import get_db
from backend.models_lite import Order, Inventory
from backend.auth import get_current_active_user, User

router = APIRouter(prefix="/api/benchmarking", tags=["Performance Benchmarking"])

# ========================================================================
# PYDANTIC SCHEMAS
# ========================================================================

class BenchmarkMetrics(BaseModel):
    metric_name: str
    your_value: float
    industry_average: float
    top_quartile: float
    percentile: int
    status: str  # excellent, good, needs_improvement

class PerformanceScore(BaseModel):
    overall_score: int  # 1-100
    category_scores: Dict[str, int]
    strengths: List[str]
    improvement_areas: List[str]
    recommendations: List[str]

# Industry benchmark data (in production, this would come from a database)
INDUSTRY_BENCHMARKS = {
    "ecommerce": {
        "order_accuracy": {"average": 98.5, "top_quartile": 99.5},
        "pick_rate_per_hour": {"average": 120, "top_quartile": 180},
        "cost_per_order": {"average": 3.50, "top_quartile": 2.20},
        "on_time_shipment": {"average": 95.0, "top_quartile": 98.5},
        "inventory_turnover": {"average": 8.0, "top_quartile": 12.0},
        "space_utilization": {"average": 75.0, "top_quartile": 88.0},
        "return_rate": {"average": 20.0, "top_quartile": 12.0}
    },
    "3pl": {
        "order_accuracy": {"average": 99.0, "top_quartile": 99.7},
        "pick_rate_per_hour": {"average": 100, "top_quartile": 150},
        "cost_per_order": {"average": 4.00, "top_quartile": 2.80},
        "on_time_shipment": {"average": 96.0, "top_quartile": 99.0},
        "inventory_turnover": {"average": 6.0, "top_quartile": 10.0},
        "space_utilization": {"average": 80.0, "top_quartile": 90.0},
        "return_rate": {"average": 15.0, "top_quartile": 8.0}
    },
    "retail": {
        "order_accuracy": {"average": 97.5, "top_quartile": 99.0},
        "pick_rate_per_hour": {"average": 90, "top_quartile": 130},
        "cost_per_order": {"average": 4.50, "top_quartile": 3.00},
        "on_time_shipment": {"average": 93.0, "top_quartile": 97.0},
        "inventory_turnover": {"average": 10.0, "top_quartile": 15.0},
        "space_utilization": {"average": 70.0, "top_quartile": 85.0},
        "return_rate": {"average": 25.0, "top_quartile": 15.0}
    }
}

# ========================================================================
# API ENDPOINTS
# ========================================================================

@router.get("/metrics")
def get_benchmark_metrics(
    industry: str = "ecommerce",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get benchmarked performance metrics"""
    
    if industry not in INDUSTRY_BENCHMARKS:
        raise HTTPException(status_code=400, detail="Invalid industry")
    
    benchmarks = INDUSTRY_BENCHMARKS[industry]
    
    # Calculate actual metrics
    actual_metrics = calculate_warehouse_metrics(db)
    
    # Compare against benchmarks
    results = []
    
    for metric_name, benchmark_data in benchmarks.items():
        actual_value = actual_metrics.get(metric_name, 0)
        industry_avg = benchmark_data["average"]
        top_quartile = benchmark_data["top_quartile"]
        
        # Calculate percentile
        if metric_name == "return_rate" or metric_name == "cost_per_order":
            # Lower is better
            if actual_value <= top_quartile:
                percentile = 90
                status = "excellent"
            elif actual_value <= industry_avg:
                percentile = 60
                status = "good"
            else:
                percentile = 30
                status = "needs_improvement"
        else:
            # Higher is better
            if actual_value >= top_quartile:
                percentile = 90
                status = "excellent"
            elif actual_value >= industry_avg:
                percentile = 60
                status = "good"
            else:
                percentile = 30
                status = "needs_improvement"
        
        results.append(BenchmarkMetrics(
            metric_name=metric_name.replace("_", " ").title(),
            your_value=round(actual_value, 2),
            industry_average=industry_avg,
            top_quartile=top_quartile,
            percentile=percentile,
            status=status
        ))
    
    return {
        "industry": industry,
        "metrics": results,
        "last_updated": datetime.utcnow()
    }

@router.get("/performance-score")
def get_performance_score(
    industry: str = "ecommerce",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get overall performance score (1-100)"""
    
    if industry not in INDUSTRY_BENCHMARKS:
        raise HTTPException(status_code=400, detail="Invalid industry")
    
    benchmarks = INDUSTRY_BENCHMARKS[industry]
    actual_metrics = calculate_warehouse_metrics(db)
    
    # Calculate category scores
    category_scores = {
        "accuracy": calculate_category_score(actual_metrics, benchmarks, ["order_accuracy"]),
        "efficiency": calculate_category_score(actual_metrics, benchmarks, ["pick_rate_per_hour", "space_utilization"]),
        "cost": calculate_category_score(actual_metrics, benchmarks, ["cost_per_order"]),
        "reliability": calculate_category_score(actual_metrics, benchmarks, ["on_time_shipment"]),
        "inventory": calculate_category_score(actual_metrics, benchmarks, ["inventory_turnover"]),
        "quality": calculate_category_score(actual_metrics, benchmarks, ["return_rate"])
    }
    
    # Overall score (weighted average)
    overall_score = int(sum(category_scores.values()) / len(category_scores))
    
    # Identify strengths and weaknesses
    strengths = [k for k, v in category_scores.items() if v >= 80]
    improvement_areas = [k for k, v in category_scores.items() if v < 60]
    
    # Generate recommendations
    recommendations = generate_recommendations(improvement_areas, actual_metrics, benchmarks)
    
    return PerformanceScore(
        overall_score=overall_score,
        category_scores=category_scores,
        strengths=[s.replace("_", " ").title() for s in strengths],
        improvement_areas=[a.replace("_", " ").title() for a in improvement_areas],
        recommendations=recommendations
    )

@router.get("/peer-comparison")
def get_peer_comparison(
    industry: str = "ecommerce",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Compare against anonymized peer data"""
    
    # Simulated peer data (in production, aggregate from other warehouses)
    peer_data = [
        {"warehouse_id": "peer_1", "overall_score": 85, "size": "medium"},
        {"warehouse_id": "peer_2", "overall_score": 72, "size": "medium"},
        {"warehouse_id": "peer_3", "overall_score": 91, "size": "large"},
        {"warehouse_id": "peer_4", "overall_score": 68, "size": "small"},
        {"warehouse_id": "peer_5", "overall_score": 79, "size": "medium"}
    ]
    
    # Calculate your score
    actual_metrics = calculate_warehouse_metrics(db)
    benchmarks = INDUSTRY_BENCHMARKS[industry]
    
    category_scores = {
        "accuracy": calculate_category_score(actual_metrics, benchmarks, ["order_accuracy"]),
        "efficiency": calculate_category_score(actual_metrics, benchmarks, ["pick_rate_per_hour"]),
        "cost": calculate_category_score(actual_metrics, benchmarks, ["cost_per_order"])
    }
    
    your_score = int(sum(category_scores.values()) / len(category_scores))
    
    # Calculate ranking
    all_scores = [p["overall_score"] for p in peer_data] + [your_score]
    all_scores.sort(reverse=True)
    your_rank = all_scores.index(your_score) + 1
    
    return {
        "your_score": your_score,
        "your_rank": your_rank,
        "total_peers": len(peer_data),
        "percentile": int((1 - (your_rank / (len(peer_data) + 1))) * 100),
        "peer_average": round(sum(p["overall_score"] for p in peer_data) / len(peer_data), 1),
        "peer_distribution": peer_data
    }

@router.get("/best-practices")
def get_best_practices(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get best practice recommendations"""
    
    best_practices = {
        "accuracy": [
            "Implement barcode scanning for all picks",
            "Use pick-to-light or voice picking systems",
            "Conduct daily cycle counts",
            "Implement quality control checkpoints"
        ],
        "efficiency": [
            "Optimize warehouse layout (ABC analysis)",
            "Use slotting optimization",
            "Implement wave picking",
            "Cross-train employees"
        ],
        "cost": [
            "Negotiate better carrier rates",
            "Optimize packaging sizes",
            "Reduce labor overtime",
            "Implement automation where ROI positive"
        ],
        "reliability": [
            "Set up real-time inventory tracking",
            "Implement automated reorder points",
            "Use predictive analytics",
            "Establish SLAs with carriers"
        ]
    }
    
    if category:
        if category not in best_practices:
            raise HTTPException(status_code=400, detail="Invalid category")
        return {category: best_practices[category]}
    
    return best_practices

# ========================================================================
# HELPER FUNCTIONS
# ========================================================================

def calculate_warehouse_metrics(db: Session) -> Dict[str, float]:
    """Calculate actual warehouse performance metrics"""
    
    # Get orders from last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_orders = db.query(Order).filter(Order.created_at >= thirty_days_ago).all()
    
    # Calculate metrics
    total_orders = len(recent_orders)
    
    # Simulated metrics (in production, calculate from real data)
    metrics = {
        "order_accuracy": 98.2,
        "pick_rate_per_hour": 135,
        "cost_per_order": 2.85,
        "on_time_shipment": 96.5,
        "inventory_turnover": 9.5,
        "space_utilization": 78.0,
        "return_rate": 18.5
    }
    
    return metrics

def calculate_category_score(actual: Dict, benchmarks: Dict, metrics: List[str]) -> int:
    """Calculate score for a category (1-100)"""
    
    scores = []
    
    for metric in metrics:
        if metric not in actual or metric not in benchmarks:
            continue
        
        actual_value = actual[metric]
        industry_avg = benchmarks[metric]["average"]
        top_quartile = benchmarks[metric]["top_quartile"]
        
        # Calculate score (0-100)
        if metric in ["return_rate", "cost_per_order"]:
            # Lower is better
            if actual_value <= top_quartile:
                score = 100
            elif actual_value <= industry_avg:
                score = 70
            else:
                # Proportional penalty
                penalty = ((actual_value - industry_avg) / industry_avg) * 50
                score = max(30, 70 - penalty)
        else:
            # Higher is better
            if actual_value >= top_quartile:
                score = 100
            elif actual_value >= industry_avg:
                score = 70
            else:
                # Proportional penalty
                penalty = ((industry_avg - actual_value) / industry_avg) * 50
                score = max(30, 70 - penalty)
        
        scores.append(score)
    
    return int(sum(scores) / len(scores)) if scores else 50

def generate_recommendations(improvement_areas: List[str], actual: Dict, benchmarks: Dict) -> List[str]:
    """Generate actionable recommendations"""
    
    recommendations = []
    
    for area in improvement_areas:
        if area == "accuracy":
            recommendations.append("Implement barcode scanning to improve order accuracy to 99%+")
        elif area == "efficiency":
            recommendations.append("Optimize warehouse layout using ABC analysis to increase pick rate by 20%")
        elif area == "cost":
            recommendations.append("Negotiate multi-carrier rates to reduce cost per order by $0.50")
        elif area == "reliability":
            recommendations.append("Implement automated shipping label generation to improve on-time shipment rate")
        elif area == "inventory":
            recommendations.append("Use demand forecasting to optimize inventory turnover")
        elif area == "quality":
            recommendations.append("Analyze return reasons and implement quality control measures")
    
    return recommendations[:5]  # Top 5 recommendations
