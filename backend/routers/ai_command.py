import os
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database_lite import get_db

from backend.models_lite import Inventory, Route, Anomaly, Warehouse

def get_real_time_context(db: Session) -> str:
    """Fetch real-time metrics from the database to ground the AI."""
    try:
        # Inventory Stats
        total_items = db.query(Inventory).count()
        low_stock_items = db.query(Inventory).filter(Inventory.quantity <= Inventory.reorder_point).all()
        low_stock_count = len(low_stock_items)
        
        low_stock_details = ""
        if low_stock_items:
            details = [f"- {item.sku}: {item.quantity} units (Reorder: {item.reorder_point})" for item in low_stock_items[:5]]
            low_stock_details = "\n".join(details)
            if len(low_stock_items) > 5:
                low_stock_details += f"\n...and {len(low_stock_items) - 5} more."

        # Route Stats
        total_routes = db.query(Route).count()
        
        # Anomaly Stats
        unresolved_anomalies = db.query(Anomaly).filter(Anomaly.resolved == False).order_by(Anomaly.detected_at.desc()).limit(3).all()
        anomaly_count = db.query(Anomaly).filter(Anomaly.resolved == False).count()
        
        anomaly_details = ""
        if unresolved_anomalies:
            details = [f"- {a.anomaly_type}: {a.description} (Severity: {a.severity})" for a in unresolved_anomalies]
            anomaly_details = "\n".join(details)

        context = f"""
**REAL-TIME DATA SNAPSHOT (Do not hallucinate, use this data):**
1. **Inventory:** {total_items} total items. {low_stock_count} LOW STOCK items.
   *Critical Low Stock:*
{low_stock_details}

2. **Routes:** {total_routes} active routes scheduled.

3. **Anomalies:** {anomaly_count} unresolved anomalies.
   *Recent Alerts:*
{anomaly_details}
"""
        return context
    except Exception as e:
        print(f"Error fetching context: {e}")
        return ""

# ---------------------------------------------------------------------------
# Helper: call Gemini LLM
# ---------------------------------------------------------------------------
# Real LLM call using Google Gemini
def call_llm(prompt: str, history: list[dict] = [], context: str = "") -> str:
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
            
            system_instruction = f"""You are the Warefy Operations AI, the central intelligence of the Warefy Supply Chain Platform. 🧠
Your goal is to assist warehouse managers and logistics coordinators with **comprehensive, detailed, and actionable insights**.

**Your Persona:**
- **Professional & Thorough:** Provide complete, detailed reports with specific metrics and data.
- **Data-Rich:** Use tables, bullet points, and structured formatting extensively.
- **Proactive:** Always include context, trends, and recommendations.
- **Visual:** Use emojis strategically (📦, 🚚, ✅, 🚨, 📊, 💰, ⚡️).

**Your Capabilities:**
1. **📦 Inventory:** Detailed stock analysis, reorder recommendations, cost calculations.
2. **🚚 Logistics:** Route optimization, driver performance metrics, delivery ETAs.
3. **🚨 Security:** Anomaly detection, access logs, temperature monitoring.
4. **📊 Analytics:** Trend analysis, forecasting, executive summaries.

**Current Real-Time Context (TRUE DATA):**
{context}

**Response Guidelines:**
1. **Be Comprehensive:** Provide detailed reports, not brief summaries.
2. **Use Tables:** Present data in well-formatted markdown tables whenever possible.
3. **Include Metrics:** Show specific numbers, percentages, trends, and comparisons.
4. **Add Context:** Explain why something matters and what the implications are.
5. **Suggest Actions:** Always end with 2-3 specific, actionable next steps.
6. **Format Well:** Use headings (###), bold (**text**), lists, and tables for clarity.

**Example Response Structure:**
### 📊 [Topic] Overview
[Brief intro with key metrics]

**Key Metrics:**
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| ... | ... | ... | ✅/🚨 |

**Detailed Analysis:**
- Point 1 with specific data
- Point 2 with trends
- Point 3 with implications

**Recommendations:**
1. Action 1 (with expected impact)
2. Action 2 (with timeline)
3. Action 3 (with priority level)

What would you like to do next?"""

            # Start chat with history
            chat = model.start_chat(history=history)
            
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
        Database session used to fetch real-time context.
    """
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    # Fetch real-time context from DB
    context = get_real_time_context(db)
    
    # Call LLM with context
    ai_reply = call_llm(request.prompt, request.history, context)
    return AICommandResponse(response=ai_reply)
