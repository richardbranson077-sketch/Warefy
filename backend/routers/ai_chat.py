"""
AI Chat Router - Conversational AI assistant
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

router = APIRouter(prefix="/ai/chat", tags=["AI Chat"])


class ChatSessionResponse(CamelCaseModel):
    id: int
    title: str
    created_at: datetime
    message_count: int
    status: str = "coming_soon"


class ChatMessageResponse(CamelCaseModel):
    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime
    status: str = "coming_soon"


@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all chat sessions (Mock Data - Coming Soon)
    """
    return [
        {
            "id": 1,
            "title": "Inventory Optimization Query",
            "created_at": datetime.now(),
            "message_count": 5,
            "status": "coming_soon"
        },
        {
            "id": 2,
            "title": "Route Planning Assistance",
            "created_at": datetime.now(),
            "message_count": 3,
            "status": "coming_soon"
        }
    ]


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
def get_chat_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get messages for a chat session (Mock Data - Coming Soon)
    """
    return [
        {
            "id": 1,
            "session_id": session_id,
            "role": "user",
            "content": "How can I optimize my inventory levels?",
            "created_at": datetime.now(),
            "status": "coming_soon"
        },
        {
            "id": 2,
            "session_id": session_id,
            "role": "assistant",
            "content": "AI-powered inventory optimization coming soon! This feature will analyze your historical data and provide intelligent recommendations.",
            "created_at": datetime.now(),
            "status": "coming_soon"
        }
    ]


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
def send_chat_message(
    session_id: int,
    content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send a message in a chat session (Mock Data - Coming Soon)
    """
    return {
        "id": 3,
        "session_id": session_id,
        "role": "assistant",
        "content": "AI Chat feature coming soon! Advanced conversational AI will be available in the next release.",
        "created_at": datetime.now(),
        "status": "coming_soon"
    }


@router.post("/sessions", response_model=ChatSessionResponse)
def create_chat_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new chat session (Mock Data - Coming Soon)
    """
    return {
        "id": 3,
        "title": "New Chat Session",
        "created_at": datetime.now(),
        "message_count": 0,
        "status": "coming_soon"
    }


@router.delete("/sessions/{session_id}")
def delete_chat_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a chat session (Mock Data - Coming Soon)
    """
    return {"message": "Chat session deletion coming soon", "status": "coming_soon"}
