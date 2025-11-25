"""
Collaboration Router - Team collaboration and messaging
Status: Coming Soon (Mock Data)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from backend.database_lite import get_db
from backend.models_lite import User
from backend.auth_lite import get_current_active_user
from backend.base_schema import CamelCaseModel

router = APIRouter(prefix="/collaboration", tags=["Collaboration"])


class TeamResponse(CamelCaseModel):
    id: int
    name: str
    member_count: int
    created_at: datetime
    status: str = "coming_soon"


class MessageResponse(CamelCaseModel):
    id: int
    team_id: int
    user_id: int
    content: str
    created_at: datetime
    status: str = "coming_soon"


@router.get("/teams", response_model=List[TeamResponse])
def get_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all teams (Mock Data - Coming Soon)
    """
    return [
        {
            "id": 1,
            "name": "Warehouse Operations",
            "member_count": 12,
            "created_at": datetime.now(),
            "status": "coming_soon"
        },
        {
            "id": 2,
            "name": "Logistics Team",
            "member_count": 8,
            "created_at": datetime.now(),
            "status": "coming_soon"
        }
    ]


@router.post("/teams", response_model=TeamResponse)
def create_team(
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new team (Mock Data - Coming Soon)
    """
    return {
        "id": 3,
        "name": name,
        "member_count": 1,
        "created_at": datetime.now(),
        "status": "coming_soon"
    }


@router.get("/messages", response_model=List[MessageResponse])
def get_messages(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get team messages (Mock Data - Coming Soon)
    """
    return [
        {
            "id": 1,
            "team_id": team_id,
            "user_id": current_user.id,
            "content": "Team collaboration features coming soon!",
            "created_at": datetime.now(),
            "status": "coming_soon"
        }
    ]
