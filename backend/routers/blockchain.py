"""
Blockchain Router - Audit Trail with Cryptographic Verification
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import hashlib
import json
import asyncio

from backend.database_lite import get_db
from backend.models_lite import User, AuditLog
from backend.auth_lite import get_current_active_user
from backend.base_schema import CamelCaseModel
from backend.routers.ai_chat import call_llm

router = APIRouter(prefix="/api/v1/blockchain", tags=["Blockchain"])

class AuditLogResponse(CamelCaseModel):
    id: int
    user_id: int
    target_user_id: Optional[int] = None
    action: str
    details: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None
    hash: Optional[str] = None
    previous_hash: Optional[str] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ChainStatus(CamelCaseModel):
    is_valid: bool
    total_blocks: int
    compromised_block_id: Optional[int] = None
    message: str

def calculate_hash(index: int, previous_hash: str, timestamp: str, data: str) -> str:
    """
    Calculate SHA-256 hash for a block.
    """
    value = f"{index}{previous_hash}{timestamp}{data}"
    return hashlib.sha256(value.encode()).hexdigest()

def create_genesis_block(db: Session):
    """
    Create the first block if the chain is empty.
    """
    if db.query(AuditLog).count() == 0:
        genesis_block = AuditLog(
            user_id=1,  # System/Admin
            action="GENESIS_BLOCK",
            details="Initial block of the audit chain",
            previous_hash="0" * 64,
            timestamp=datetime.utcnow()
        )
        # Calculate hash
        data_str = json.dumps({"action": genesis_block.action, "details": genesis_block.details}, sort_keys=True)
        genesis_block.hash = calculate_hash(0, genesis_block.previous_hash, str(genesis_block.timestamp), data_str)
        
        db.add(genesis_block)
        db.commit()
        db.refresh(genesis_block)

@router.get("/blocks", response_model=List[AuditLogResponse])
def get_blockchain(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the audit trail (blockchain).
    """
    # Ensure genesis block exists
    create_genesis_block(db)
    
    blocks = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit).all()
    return blocks

@router.post("/verify", response_model=ChainStatus)
def verify_chain(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Verify the integrity of the blockchain.
    """
    blocks = db.query(AuditLog).order_by(AuditLog.id).all()
    
    if not blocks:
        return ChainStatus(is_valid=True, total_blocks=0, message="Chain is empty")
        
    for i, block in enumerate(blocks):
        # Skip genesis block check for previous hash (it's 000...000)
        if i == 0:
            continue
            
        previous_block = blocks[i-1]
        
        # Check 1: Previous hash match
        if block.previous_hash != previous_block.hash:
            return ChainStatus(
                is_valid=False, 
                total_blocks=len(blocks), 
                compromised_block_id=block.id,
                message=f"Broken chain at block {block.id}: Previous hash mismatch"
            )
            
        # Check 2: Hash integrity (recalculate)
        data_str = json.dumps({"action": block.action, "details": block.details}, sort_keys=True)
        recalculated_hash = calculate_hash(block.id, block.previous_hash, str(block.timestamp), data_str)
        
        # Note: In a real system, we'd be strict. Here, we might need to handle legacy data if any.
        # For now, we assume all data is new or migrated.
        if block.hash != recalculated_hash:
             return ChainStatus(
                is_valid=False, 
                total_blocks=len(blocks), 
                compromised_block_id=block.id,
                message=f"Data tampering detected at block {block.id}"
            )
            
    return ChainStatus(is_valid=True, total_blocks=len(blocks), message="Blockchain integrity verified. All records are secure.")

@router.post("/analyze")
async def analyze_chain(
    query: str = "Analyze the recent audit logs for any suspicious activity.",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Analyze the audit trail using AI.
    """
    # Fetch recent logs
    logs = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(20).all()
    
    context = "Recent Audit Logs:\n"
    for log in logs:
        context += f"- ID: {log.id}, User: {log.user_id}, Action: {log.action}, Time: {log.timestamp}\n"
        
    prompt = f"""
    You are an expert security auditor. Analyze the following audit logs.
    Query: {query}
    
    If you see anything suspicious (like repeated failed logins, unauthorized role changes, or unusual timestamps), point it out.
    If everything looks normal, say so.
    """
    
    response = await call_llm(prompt, context)
    return {"analysis": response}

# Utility to add a block (can be imported by other routers)
def add_audit_log(db: Session, user_id: int, action: str, details: str = None, extra_data: Dict = None):
    # Get last block
    last_block = db.query(AuditLog).order_by(desc(AuditLog.id)).first()
    
    previous_hash = last_block.hash if last_block else "0" * 64
    new_index = (last_block.id + 1) if last_block else 1
    timestamp = datetime.utcnow()
    
    new_block = AuditLog(
        user_id=user_id,
        action=action,
        details=details,
        extra_data=extra_data,
        previous_hash=previous_hash,
        timestamp=timestamp
    )
    
    # Calculate hash
    data_str = json.dumps({"action": action, "details": details}, sort_keys=True)
    new_block.hash = calculate_hash(new_index, previous_hash, str(timestamp), data_str)
    
    db.add(new_block)
    db.commit()
    db.refresh(new_block)
    return new_block
