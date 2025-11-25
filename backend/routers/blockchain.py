"""
Blockchain Router - Blockchain tracking and transparency
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

router = APIRouter(prefix="/blockchain", tags=["Blockchain"])


class BlockchainTransactionResponse(CamelCaseModel):
    id: int
    transaction_hash: str
    block_number: int
    from_address: str
    to_address: str
    value: float
    timestamp: datetime
    status: str = "coming_soon"


@router.get("/transactions", response_model=List[BlockchainTransactionResponse])
def get_blockchain_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get blockchain transactions (Mock Data - Coming Soon)
    """
    return [
        {
            "id": 1,
            "transaction_hash": "0x1234567890abcdef",
            "block_number": 12345,
            "from_address": "0xabc123",
            "to_address": "0xdef456",
            "value": 1000.00,
            "timestamp": datetime.now(),
            "status": "coming_soon"
        }
    ]


@router.post("/transactions", response_model=BlockchainTransactionResponse)
def create_blockchain_transaction(
    value: float,
    to_address: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create blockchain transaction (Mock Data - Coming Soon)
    """
    return {
        "id": 2,
        "transaction_hash": "0xnew_transaction",
        "block_number": 12346,
        "from_address": "0xabc123",
        "to_address": to_address,
        "value": value,
        "timestamp": datetime.now(),
        "status": "coming_soon"
    }


@router.delete("/transactions/{transaction_id}")
def delete_blockchain_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete blockchain transaction (Mock Data - Coming Soon)
    """
    return {"message": "Blockchain tracking coming soon", "status": "coming_soon"}
