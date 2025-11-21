from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database_lite import get_db
from ..models_lite import Integration, User
from ..auth_lite import get_current_active_user, require_role
from ..schemas import IntegrationCreate, IntegrationResponse

router = APIRouter(prefix="/api/integrations", tags=["Integrations"])

@router.get("/", response_model=List[IntegrationResponse])
def list_integrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    return db.query(Integration).all()

@router.post("/", response_model=IntegrationResponse)
def create_integration(
    payload: IntegrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    # Check if exists
    existing = db.query(Integration).filter(Integration.name == payload.name).first()
    if existing:
        # Update existing
        existing.api_key = payload.api_key
        existing.api_secret = payload.api_secret
        existing.webhook_url = payload.webhook_url
        existing.status = payload.status
        existing.settings = payload.settings
        db.commit()
        db.refresh(existing)
        return existing
    
    new_integration = Integration(
        name=payload.name,
        api_key=payload.api_key,
        api_secret=payload.api_secret,
        webhook_url=payload.webhook_url,
        status=payload.status,
        settings=payload.settings
    )
    db.add(new_integration)
    db.commit()
    db.refresh(new_integration)
    return new_integration

@router.delete("/{integration_id}")
def delete_integration(
    integration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    db.delete(integration)
    db.commit()
    return {"message": "Integration deleted"}
