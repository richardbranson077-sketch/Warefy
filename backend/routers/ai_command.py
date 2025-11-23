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
            
            system_instruction = """You are the Warefy Operations AI, the central intelligence of the Warefy Supply Chain Platform. 🧠
Your goal is to assist warehouse managers and logistics coordinators with friendly, ultra-concise, and actionable insights.

**Your Persona:**
- **Friendly & Professional:** Use emojis occasionally to make the interface feel modern and approachable (e.g., 📦, 🚚, ✅, 🚨).
- **Concise:** Avoid long paragraphs. Use bullet points and tables.
- **Proactive:** Always suggest the next logical step.

**Your Capabilities:**
1. **📦 Inventory:** Track stock, predict shortages (e.g., "SKU-123 is low!").
2. **🚚 Logistics:** Optimize routes, check driver status.
3. **🚨 Security:** Monitor anomalies and fraud.
4. **🔗 Blockchain:** Verify transaction integrity.

**Current Context:**
- The user is logged into the Warefy Dashboard.
- Assume they have access to real‑time data.

**Response Format:**
- Start with a direct answer.
- Use **bold** for key metrics.
- End with a clear "What would you like to do?" question or action buttons (simulated)."""

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
