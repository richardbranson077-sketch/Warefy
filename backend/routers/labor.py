"""
Labor Management System (LMS)
Track employee time, productivity, and labor costs
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from backend.database_lite import get_db
from backend.auth import get_current_active_user, User

router = APIRouter(prefix="/api/labor", tags=["Labor Management"])

# ========================================================================
# PYDANTIC SCHEMAS
# ========================================================================

class TimeClockEntry(BaseModel):
    user_id: int
    clock_in: datetime
    clock_out: Optional[datetime] = None
    break_minutes: int = 0

class ProductivityMetric(BaseModel):
    user_id: int
    date: datetime
    picks_per_hour: float
    accuracy_percentage: float
    orders_processed: int

class ShiftSchedule(BaseModel):
    user_id: int
    shift_date: datetime
    start_time: str  # "08:00"
    end_time: str    # "16:00"
    role: str        # picker, packer, driver

# Mock database
time_entries = []
productivity_data = []
schedules = []

# ========================================================================
# API ENDPOINTS
# ========================================================================

@router.post("/clock-in")
def clock_in(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Clock in for shift"""
    
    # Check if already clocked in
    active_entry = next(
        (e for e in time_entries if e["user_id"] == current_user.id and e["clock_out"] is None),
        None
    )
    
    if active_entry:
        raise HTTPException(status_code=400, detail="Already clocked in")
    
    entry = {
        "id": len(time_entries) + 1,
        "user_id": current_user.id,
        "clock_in": datetime.utcnow(),
        "clock_out": None,
        "break_minutes": 0
    }
    
    time_entries.append(entry)
    
    return {
        "message": "Clocked in successfully",
        "clock_in_time": entry["clock_in"],
        "entry_id": entry["id"]
    }

@router.post("/clock-out")
def clock_out(
    break_minutes: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Clock out from shift"""
    
    active_entry = next(
        (e for e in time_entries if e["user_id"] == current_user.id and e["clock_out"] is None),
        None
    )
    
    if not active_entry:
        raise HTTPException(status_code=400, detail="Not clocked in")
    
    active_entry["clock_out"] = datetime.utcnow()
    active_entry["break_minutes"] = break_minutes
    
    # Calculate hours worked
    total_time = active_entry["clock_out"] - active_entry["clock_in"]
    hours_worked = (total_time.total_seconds() / 3600) - (break_minutes / 60)
    
    return {
        "message": "Clocked out successfully",
        "clock_out_time": active_entry["clock_out"],
        "hours_worked": round(hours_worked, 2)
    }

@router.get("/timesheet")
def get_timesheet(
    user_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get timesheet for user"""
    
    target_user_id = user_id or current_user.id
    
    # Filter entries
    filtered_entries = [
        e for e in time_entries 
        if e["user_id"] == target_user_id and e["clock_out"] is not None
    ]
    
    if start_date:
        filtered_entries = [e for e in filtered_entries if e["clock_in"] >= start_date]
    if end_date:
        filtered_entries = [e for e in filtered_entries if e["clock_in"] <= end_date]
    
    # Calculate totals
    total_hours = 0
    for entry in filtered_entries:
        time_diff = entry["clock_out"] - entry["clock_in"]
        hours = (time_diff.total_seconds() / 3600) - (entry["break_minutes"] / 60)
        total_hours += hours
    
    return {
        "user_id": target_user_id,
        "entries": filtered_entries,
        "total_hours": round(total_hours, 2),
        "total_entries": len(filtered_entries)
    }

@router.post("/productivity")
def log_productivity(
    metric: ProductivityMetric,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Log productivity metrics"""
    
    productivity_data.append(metric.dict())
    
    return {"message": "Productivity logged successfully"}

@router.get("/productivity/user/{user_id}")
def get_user_productivity(
    user_id: int,
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get productivity metrics for user"""
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    user_metrics = [
        m for m in productivity_data 
        if m["user_id"] == user_id and m["date"] >= cutoff_date
    ]
    
    if not user_metrics:
        return {"message": "No productivity data found"}
    
    # Calculate averages
    avg_picks = sum(m["picks_per_hour"] for m in user_metrics) / len(user_metrics)
    avg_accuracy = sum(m["accuracy_percentage"] for m in user_metrics) / len(user_metrics)
    total_orders = sum(m["orders_processed"] for m in user_metrics)
    
    return {
        "user_id": user_id,
        "period_days": days,
        "average_picks_per_hour": round(avg_picks, 2),
        "average_accuracy": round(avg_accuracy, 2),
        "total_orders_processed": total_orders,
        "metrics": user_metrics
    }

@router.get("/analytics/labor-cost")
def calculate_labor_cost(
    start_date: datetime,
    end_date: datetime,
    hourly_rate: float = 18.50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Calculate labor costs for period"""
    
    # Get all completed time entries in period
    period_entries = [
        e for e in time_entries
        if e["clock_out"] is not None
        and e["clock_in"] >= start_date
        and e["clock_in"] <= end_date
    ]
    
    total_hours = 0
    for entry in period_entries:
        time_diff = entry["clock_out"] - entry["clock_in"]
        hours = (time_diff.total_seconds() / 3600) - (entry["break_minutes"] / 60)
        total_hours += hours
    
    total_cost = total_hours * hourly_rate
    
    # Get total orders processed in period
    total_orders = sum(
        m["orders_processed"] for m in productivity_data
        if m["date"] >= start_date and m["date"] <= end_date
    )
    
    cost_per_order = total_cost / total_orders if total_orders > 0 else 0
    
    return {
        "period": {
            "start": start_date,
            "end": end_date
        },
        "total_hours": round(total_hours, 2),
        "hourly_rate": hourly_rate,
        "total_labor_cost": round(total_cost, 2),
        "total_orders": total_orders,
        "cost_per_order": round(cost_per_order, 2)
    }

@router.post("/schedule")
def create_shift_schedule(
    schedule: ShiftSchedule,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create shift schedule"""
    
    schedules.append(schedule.dict())
    
    return {"message": "Shift scheduled successfully"}

@router.get("/schedule")
def get_schedules(
    user_id: Optional[int] = None,
    date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get shift schedules"""
    
    filtered_schedules = schedules
    
    if user_id:
        filtered_schedules = [s for s in filtered_schedules if s["user_id"] == user_id]
    
    if date:
        filtered_schedules = [
            s for s in filtered_schedules 
            if s["shift_date"].date() == date.date()
        ]
    
    return filtered_schedules
