'''AI command router for Warefy'''

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..auth_lite import get_current_active_user
from ..database_lite import get_db
import os
import openai

# Real LLM call using OpenAI
def call_llm(prompt: str) -> str:
    """Send prompt to OpenAI and return the response text.
    Uses the OPENAI_API_KEY environment variable.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    openai.api_key = api_key
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=500,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {exc}")


router = APIRouter(prefix="/api/ai", tags=["AI"])

class AICommandRequest(BaseModel):
    prompt: str

class AICommandResponse(BaseModel):
    response: str

@router.post("/command", response_model=AICommandResponse)
def run_command(request: AICommandRequest, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    """Execute a natural‑language command and return AI response"""
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    # In production, call the LLM with proper authentication & context
    ai_reply = call_llm(request.prompt)
    return AICommandResponse(response=ai_reply)
