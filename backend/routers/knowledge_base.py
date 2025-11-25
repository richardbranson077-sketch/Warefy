"""
Knowledge Base Router - Documentation and knowledge management
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

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])


class ArticleResponse(CamelCaseModel):
    id: int
    title: str
    content: str
    category: str
    author_id: int
    views: int
    created_at: datetime
    updated_at: datetime
    status: str = "coming_soon"


@router.get("/articles", response_model=List[ArticleResponse])
def get_articles(
    category: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all knowledge base articles (Mock Data - Coming Soon)
    """
    return [
        {
            "id": 1,
            "title": "Getting Started with Warefy",
            "content": "Knowledge base feature coming soon! Comprehensive documentation will be available.",
            "category": "Getting Started",
            "author_id": current_user.id,
            "views": 150,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "status": "coming_soon"
        },
        {
            "id": 2,
            "title": "Inventory Management Best Practices",
            "content": "Learn best practices for managing your warehouse inventory efficiently.",
            "category": "Inventory",
            "author_id": current_user.id,
            "views": 89,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "status": "coming_soon"
        }
    ]


@router.get("/articles/{article_id}", response_model=ArticleResponse)
def get_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific article (Mock Data - Coming Soon)
    """
    return {
        "id": article_id,
        "title": "Sample Article",
        "content": "Knowledge base content coming soon!",
        "category": "General",
        "author_id": current_user.id,
        "views": 50,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "status": "coming_soon"
    }


@router.post("/articles", response_model=ArticleResponse)
def create_article(
    title: str,
    content: str,
    category: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new article (Mock Data - Coming Soon)
    """
    return {
        "id": 3,
        "title": title,
        "content": content,
        "category": category,
        "author_id": current_user.id,
        "views": 0,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "status": "coming_soon"
    }
