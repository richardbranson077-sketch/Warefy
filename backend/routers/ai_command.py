import os
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database_lite import get_db

# ---------------------------------------------------------------------------
# Helper: call Gemini LLM
# ---------------------------------------------------------------------------
# Real LLM call using Google Gemini
def call_llm(prompt: str, history: list[dict] = []) -> str:
    """Send prompt to Google Gemini and return the response text.
    Uses the GEMINI_API_KEY environment variable.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not found in environment variables")
        raise HTTPException(status_code=500, detail="Gemini API key not configured in server environment")
    # Retry logic for robustness
    max_retries = 3
    for attempt in range(max_retries):
        try:
            genai.configure(api_key=api_key)
            # Use model alias explicitly listed in available models
            model = genai.GenerativeModel("gemini-flash-latest")
            
            system_instruction = """You are the Warefy Operations AI, the central intelligence of the Warefy Supply Chain Platform.
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
- Assume they have access to real‑time data."""

            # Start chat with history
            chat = model.start_chat(history=history)
            
            # Send the new message with system instruction prepended contextually if needed, 
            # but for chat mode, system instruction is best set at model init or just assumed via the persona.
            # Note: gemini-flash-latest might not support system_instruction arg in GenerativeModel constructor yet in all versions,
            # so we prepend it to the first message or rely on the model's capability.
            # For simplicity and robustness, we'll just send the prompt. The history maintains context.
            # If history is empty, we can prepend the system prompt to the first user message.
            
            final_prompt = prompt
            if not history:
                final_prompt = system_instruction + "\n\nUser Query: " + prompt
            
            print(f"Sending request to Gemini (Attempt {attempt+1}/{max_retries})")
            
            response = chat.send_message(final_prompt)
            print("Gemini response received successfully.")
            return response.text
            
        except Exception as exc:
            print(f"ERROR calling Gemini (Attempt {attempt+1}): {exc}")
            if attempt == max_retries - 1:
                # On last attempt, raise the error with detail
                raise HTTPException(status_code=502, detail=f"Gemini request failed after {max_retries} attempts: {str(exc)}")
            # Wait briefly before retrying (optional, but good practice)
            import time
            time.sleep(1)

# ---------------------------------------------------------------------------
# FastAPI router
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/api/ai", tags=["AI"])

class AICommandRequest(BaseModel):
    prompt: str
    history: list[dict] = []  # List of {"role": "user"|"model", "parts": ["message"]}

class AICommandResponse(BaseModel):
    response: str

@router.post("/command", response_model=AICommandResponse)
def run_command(request: AICommandRequest, db: Session = Depends(get_db)):
    """Execute a natural‑language command via Gemini and return the response.
    Parameters
    ----------
    request: AICommandRequest
        The incoming request containing the user prompt and conversation history.
    db: Session
        Database session (currently unused but kept for future auth/context).
    """
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    # In production, call the LLM with proper authentication & context
    ai_reply = call_llm(request.prompt, request.history)
    return AICommandResponse(response=ai_reply)
