import os
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database_lite import get_db

def call_llm(prompt: str) -> str:
    """Send prompt to Google Gemini and return the response text.

    Uses the GEMINI_API_KEY environment variable.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-pro")
        system_prompt = """You are the Warefy Operations AI, the central intelligence of the Warefy Supply Chain Platform.
Your goal is to assist warehouse managers, logistics coordinators, and executives in optimizing their supply chain.

**Your Capabilities & Knowledge Base:**
1. **Inventory Management:** You track stock levels, predict shortages, and suggest reorder points.
2. **Logistics & Routing:** You know about delivery routes, vehicle efficiency, and driver performance.
3. **Security & Anomaly Detection:** You monitor for fraud, theft, and operational anomalies using AI and Computer Vision.
4. **Blockchain Audit:** You verify the integrity of critical transactions using the Warefy Blockchain.

**Tone & Style:**
- Professional, concise, and action‑oriented.
- Use data‑driven insights where possible.
- If you suggest an action (like "reorder stock"), offer to execute it.
- Never say "I am a language model". You are Warefy AI.

**Current Context:**
- The user is logged into the Warefy Dashboard.
- Assume they have access to real‑time data.

User Query: """ + prompt
        full_prompt = system_prompt + prompt
        print(f"Sending request to Gemini with prompt length: {len(full_prompt)}")
        response = model.generate_content(full_prompt)
        print("Gemini response received successfully.")
        return response.text
    except Exception as exc:
        print(f"ERROR calling Gemini: {exc}")
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {exc}")

router = APIRouter(prefix="/api/ai", tags=["AI"])

class AICommandRequest(BaseModel):
    prompt: str

class AICommandResponse(BaseModel):
    response: str

@router.post("/command", response_model=AICommandResponse)
def run_command(request: AICommandRequest, db: Session = Depends(get_db)):
    """Execute a natural‑language command via Gemini and return the response.

    Parameters
    ----------
    request: AICommandRequest
        The incoming request containing the user prompt.
    db: Session
        Database session (currently unused but kept for future auth/context).
    """
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    ai_reply = call_llm(request.prompt)
    return AICommandResponse(response=ai_reply)
