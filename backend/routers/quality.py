"""
Quality Control & Inspection Module
Manage quality inspections, defect tracking, and supplier quality scores
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from backend.database_lite import get_db
from backend.auth import get_current_active_user, User

router = APIRouter(prefix="/api/quality", tags=["Quality Control"])

# ========================================================================
# PYDANTIC SCHEMAS
# ========================================================================

class InspectionChecklistItem(BaseModel):
    item_name: str
    passed: bool
    notes: Optional[str] = None

class QualityInspection(BaseModel):
    inspection_type: str  # receiving, picking, packing, shipping
    sku: str
    quantity_inspected: int
    checklist: List[InspectionChecklistItem]
    overall_result: str  # pass, fail, conditional
    inspector_id: int
    photos: Optional[List[str]] = None

class DefectReport(BaseModel):
    sku: str
    defect_type: str  # damaged, wrong_item, missing_parts, quality_issue
    severity: str  # minor, major, critical
    quantity_affected: int
    supplier: str
    description: str
    photos: Optional[List[str]] = None

# Mock database
inspections = []
defects = []
supplier_scores = {}

# ========================================================================
# API ENDPOINTS
# ========================================================================

@router.post("/inspection")
def create_inspection(
    inspection: QualityInspection,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create quality inspection record"""
    
    inspection_record = {
        "id": len(inspections) + 1,
        **inspection.dict(),
        "created_at": datetime.utcnow(),
        "created_by": current_user.id
    }
    
    inspections.append(inspection_record)
    
    # Update supplier quality score if receiving inspection
    if inspection.inspection_type == "receiving":
        update_supplier_score(inspection.sku, inspection.overall_result == "pass")
    
    return {
        "message": "Inspection created successfully",
        "inspection_id": inspection_record["id"],
        "result": inspection.overall_result
    }

@router.get("/inspections")
def list_inspections(
    inspection_type: Optional[str] = None,
    result: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List quality inspections"""
    
    filtered = inspections
    
    if inspection_type:
        filtered = [i for i in filtered if i["inspection_type"] == inspection_type]
    
    if result:
        filtered = [i for i in filtered if i["overall_result"] == result]
    
    return filtered[:limit]

@router.post("/defect")
def report_defect(
    defect: DefectReport,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Report a defect"""
    
    defect_record = {
        "id": len(defects) + 1,
        **defect.dict(),
        "reported_at": datetime.utcnow(),
        "reported_by": current_user.id,
        "status": "open"
    }
    
    defects.append(defect_record)
    
    # Update supplier quality score
    update_supplier_score(defect.supplier, False, defect.severity)
    
    return {
        "message": "Defect reported successfully",
        "defect_id": defect_record["id"]
    }

@router.get("/defects")
def list_defects(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    supplier: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List defects"""
    
    filtered = defects
    
    if status:
        filtered = [d for d in filtered if d["status"] == status]
    
    if severity:
        filtered = [d for d in filtered if d["severity"] == severity]
    
    if supplier:
        filtered = [d for d in filtered if d["supplier"] == supplier]
    
    return filtered

@router.get("/supplier-quality/{supplier}")
def get_supplier_quality_score(
    supplier: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get quality score for supplier"""
    
    score_data = supplier_scores.get(supplier, {
        "supplier": supplier,
        "quality_score": 100,
        "total_inspections": 0,
        "passed_inspections": 0,
        "failed_inspections": 0,
        "total_defects": 0,
        "critical_defects": 0,
        "rating": "excellent"
    })
    
    return score_data

@router.get("/analytics/defect-trends")
def get_defect_trends(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get defect trends and analytics"""
    
    # Group defects by type
    defect_types = {}
    for defect in defects:
        dtype = defect["defect_type"]
        defect_types[dtype] = defect_types.get(dtype, 0) + 1
    
    # Group by severity
    severity_counts = {"minor": 0, "major": 0, "critical": 0}
    for defect in defects:
        severity_counts[defect["severity"]] += 1
    
    return {
        "period_days": days,
        "total_defects": len(defects),
        "defect_by_type": defect_types,
        "defect_by_severity": severity_counts,
        "top_defect_type": max(defect_types.items(), key=lambda x: x[1])[0] if defect_types else None
    }

def update_supplier_score(supplier: str, passed: bool, severity: str = None):
    """Update supplier quality score"""
    
    if supplier not in supplier_scores:
        supplier_scores[supplier] = {
            "supplier": supplier,
            "quality_score": 100,
            "total_inspections": 0,
            "passed_inspections": 0,
            "failed_inspections": 0,
            "total_defects": 0,
            "critical_defects": 0,
            "rating": "excellent"
        }
    
    score = supplier_scores[supplier]
    
    if passed:
        score["passed_inspections"] += 1
    else:
        score["failed_inspections"] += 1
        score["total_defects"] += 1
        
        if severity == "critical":
            score["critical_defects"] += 1
            score["quality_score"] -= 10
        elif severity == "major":
            score["quality_score"] -= 5
        else:
            score["quality_score"] -= 2
    
    score["total_inspections"] += 1
    
    # Ensure score doesn't go below 0
    score["quality_score"] = max(0, score["quality_score"])
    
    # Update rating
    if score["quality_score"] >= 95:
        score["rating"] = "excellent"
    elif score["quality_score"] >= 85:
        score["rating"] = "good"
    elif score["quality_score"] >= 70:
        score["rating"] = "fair"
    else:
        score["rating"] = "poor"
