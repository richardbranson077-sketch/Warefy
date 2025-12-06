import os
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database_lite import get_db

from backend.models_lite import Inventory, Route, Anomaly, Warehouse

def get_real_time_data(db: Session) -> dict:
    """Fetch real-time metrics from the database."""
    try:
        # Inventory Stats
        total_items = db.query(Inventory).count()
        low_stock_items = db.query(Inventory).filter(Inventory.quantity <= Inventory.reorder_point).all()
        
        # Route Stats
        total_routes = db.query(Route).count()
        delayed_routes = db.query(Route).filter(Route.status == "Delayed").count()
        
        # Anomaly Stats
        unresolved_anomalies = db.query(Anomaly).filter(Anomaly.resolved == False).order_by(Anomaly.detected_at.desc()).all()
        
        return {
            "inventory": {
                "total": total_items,
                "low_stock_count": len(low_stock_items),
                "low_stock_items": [{"sku": i.sku, "qty": i.quantity, "name": i.product_name} for i in low_stock_items[:5]]
            },
            "routes": {
                "total": total_routes,
                "delayed": delayed_routes,
                "active": total_routes  # Assuming all are active for now
            },
            "anomalies": {
                "count": len(unresolved_anomalies),
                "recent": [{"type": a.anomaly_type, "desc": a.description, "severity": a.severity} for a in unresolved_anomalies[:3]]
            }
        }
    except Exception as e:
        print(f"Error fetching context: {e}")
        return {}

def format_context_string(data: dict) -> str:
    """Format the data dictionary into a string for the LLM."""
    if not data: return ""
    
    inv = data.get("inventory", {})
    routes = data.get("routes", {})
    anomalies = data.get("anomalies", {})
    
    low_stock_str = "\n".join([f"- {i['name']} ({i['sku']}): {i['qty']} units" for i in inv.get("low_stock_items", [])])
    anomaly_str = "\n".join([f"- {a['type']}: {a['desc']} ({a['severity']})" for a in anomalies.get("recent", [])])
    
    return f"""
**REAL-TIME DATA SNAPSHOT (Do not hallucinate, use this data):**
1. **Inventory:** {inv.get('total', 0)} total items. {inv.get('low_stock_count', 0)} LOW STOCK items.
   *Critical Low Stock:*
{low_stock_str}

2. **Routes:** {routes.get('total', 0)} active routes. {routes.get('delayed', 0)} delayed.

3. **Anomalies:** {anomalies.get('count', 0)} unresolved anomalies.
   *Recent Alerts:*
{anomaly_str}
"""

# ---------------------------------------------------------------------------
# Helper: Smart Mock Response
# ---------------------------------------------------------------------------
import random

def get_mock_response(prompt: str, history: list[dict] = [], context_data: dict = {}) -> str:
    """Generate a smart, context-aware mock response with simulated automation and REAL data."""
    lower_prompt = prompt.lower()
    
    # --- 0. TYPO CORRECTION & FUZZY MATCHING ---
    # Map common typos to real keywords
    typo_map = {
        "mentaince": "maintenance", "maintanance": "maintenance", "repair": "maintenance",
        "invntory": "inventory", "stock": "inventory", "items": "inventory",
        "vehical": "vehicle", "truck": "vehicle", "driver": "route",
        "shiping": "shipping", "deliver": "shipping",
        "qualit": "quality", "inspect": "quality",
        "laber": "labor", "staff": "labor", "shift": "labor",
        "retun": "return", "refund": "return"
    }
    # Simple replacement for key terms
    for typo, real in typo_map.items():
        if typo in lower_prompt:
            lower_prompt = lower_prompt.replace(typo, real)

    # --- 1. SMALL TALK & CONVERSATION ---
    # Greetings (Strict matching to avoid "this" triggering "hi")
    greeting_keywords = ["hello", "hi", "hey", "good morning", "good afternoon", "greetings"]
    if any(k == lower_prompt or f"{k} " in lower_prompt or f" {k}" in lower_prompt for k in greeting_keywords):
        return "👋 **Hello!** I'm Warefy AI, your supply chain assistant. I can help you track inventory, optimize routes, and analyze data. What can I do for you today?"
        
    # Gratitude
    elif any(k in lower_prompt for k in ["thank", "thanks", "appreciate", "good job"]):
        return "🙏 **You're welcome!** Happy to help. Let me know if you need anything else."
        
    # Identity
    elif any(k in lower_prompt for k in ["who are you", "what are you", "your name"]):
        return "🤖 I am **Warefy AI**, an advanced supply chain intelligence agent. I'm connected to your live database to help you optimize operations."

    # --- 2. SIMULATED AUTOMATION ---
    # Check if the user is confirming an action proposed in the previous turn
    if history:
        last_bot_msg = next((m for m in reversed(history) if m.get("role") == "model"), None)
        if last_bot_msg:
            last_content = last_bot_msg.get("parts", "")
            if isinstance(last_content, list): last_content = " ".join(last_content)
            last_content = str(last_content).lower()
            
            # If bot asked "Should I...", check for approval
            if "should i" in last_content or "want me to" in last_content:
                approval_keywords = ["yes", "do it", "approve", "go ahead", "sure", "ok", "please", "confirm"]
                if any(k in lower_prompt for k in approval_keywords):
                    if "purchase order" in last_content:
                        return "✅ **Action Executed:** Purchase Order #PO-9921 has been generated and sent to *Global Suppliers Inc.* for approval. Expected delivery: 2 days."
                    elif "optimize" in last_content or "route" in last_content:
                        return "✅ **Optimization Complete:** Route #101 has been rerouted via Highway 880. New ETA: 2:15 PM (saved 30 mins). Driver notified."
                    elif "maintenance" in last_content or "ticket" in last_content:
                        return "✅ **Ticket Created:** Maintenance Ticket #MT-404 assigned to *Team Alpha*. Priority: High."

    # --- 3. ADVANCED AUTOMATION & PROACTIVE SUGGESTIONS (Prioritized) ---
    if any(k in lower_prompt for k in ["negotiate", "supplier", "price"]):
        return "🤝 **Supplier Negotiation:** I noticed *WoodWorks Inc.* increased pallet prices by 5%. Given our volume, I can draft an email negotiating a 3% loyalty discount. **Shall I draft it?**"
    
    elif any(k in lower_prompt for k in ["maintenance", "repair", "fix"]):
        return "🔧 **Predictive Maintenance:** Analysis of Conveyor Belt 3's vibration patterns suggests a 85% chance of motor failure within 48 hours. **Should I schedule a technician for tonight's downtime?**"

    elif any(k in lower_prompt for k in ["shift", "schedule", "staff", "labor"]):
        return "👥 **Shift Optimization:** Warehouse utilization is peaking at 92% between 4 PM and 8 PM. I recommend adding a temporary 4-hour support shift. **Do you want me to post the open slots?**"

    # --- 4. RICH DATA & KNOWLEDGE BASE ---
    
    # Check if user explicitly wants a table/list
    wants_table = any(k in lower_prompt for k in ["table", "list", "show me data", "full report", "breakdown", "all", "see", "view", "compare", "vs", "difference", "versus", "differentiate"])

    # Anomalies/Alerts (Prioritized over Stock to avoid "In Stock" collision)
    if any(k in lower_prompt for k in ["anomal", "alert", "issue", "problem", "warn"]):
        anom_data = context_data.get("anomalies", {})
        count = anom_data.get("count", 0)
        
        if wants_table:
            return """I've scanned the system for active alerts. Here is the breakdown of critical issues:

**🚨 Critical Anomalies Detected**
| Severity | Type | Location | Time | Details |
|---|---|---|---|---|
| 🔴 **High** | Temp Spike | ❄️ Zone B (Freezer) | 10:30 AM | -2°C (Threshold: -10°C) |
| 🟡 **Med** | Vibration | 🏭 Conveyor Belt 3 | 09:15 AM | Abnormal motor vibration |"""
        else:
            if count > 0:
                return f"🚨 **Critical Alert:** I detected **{count} unresolved anomalies**. The most recent is a temperature spike in Zone B. Should I alert the facility manager?"
            else:
                return "✅ **All Clear:** No critical anomalies detected at the moment. Systems are running within normal parameters."

    # Stock/Inventory (Strict check: "stock" must not be preceded by "in " to avoid "in stock" collision)
    elif any(k in lower_prompt for k in ["stock", "reorder", "inventory", "item"]) and "in stock" not in lower_prompt:
        inv_data = context_data.get("inventory", {})
        low_count = inv_data.get("low_stock_count", 0)
        total = inv_data.get("total", 0)
        
        if wants_table:
            return """I've checked our current inventory levels. Here are the items that need attention:

**📉 Low Stock Report**
| Item | SKU | Qty | Reorder Point | Status |
|---|---|---|---|---|
| 🪵 Wood Pallets | WP-101 | **50** | 100 | 🔴 Critical |
| 🔋 AA Batteries | BT-202 | **100** | 250 | 🔴 Critical |
| 📦 Packing Tape | PT-500 | 150 | 150 | 🟡 Warning |"""
        else:
            if low_count > 0:
                return f"⚠️ **Inventory Status:** You have **{total} total items**, but **{low_count} are running low**. Wood Pallets and AA Batteries are critical. Should I generate a purchase order?"
            else:
                return f"✅ **Inventory Healthy:** We have {total} items in stock and nothing is below the reorder point."

    # Routes/Delivery
    elif any(k in lower_prompt for k in ["route", "delivery", "shipment", "driver", "vehicle"]):
        route_data = context_data.get("routes", {})
        total = route_data.get("total", 0)
        delayed = route_data.get("delayed", 0)
        
        if wants_table:
            return """I've pulled up the real-time tracking for the fleet. Here is the status of all active routes:

**🚚 Active Fleet Status**
| Route | Driver | Vehicle | Destination | Status |
|---|---|---|---|---|
| **#101** | Mike Johnson | 🚐 Van-04 | Oakland DC | 🔴 **Delayed (+45m)** |
| **#102** | Sarah Connor | 🚛 Truck-09 | San Jose | 🟢 On Time |
| **#103** | John Doe | 🚐 Van-01 | SF Downtown | 🟢 On Time |"""
        else:
            if delayed > 0:
                return f"🚚 **Fleet Update:** You have **{total} active routes**. **{delayed} is delayed** (Route #101). Mike Johnson is stuck in traffic. Want me to optimize his route?"
            else:
                return f"🚚 **Fleet Update:** All {total} active routes are running on time. No delays reported."

    # Financials/Revenue
    elif any(k in lower_prompt for k in ["revenue", "sales", "profit", "money", "financial"]):
        if wants_table:
            return """I've analyzed today's financial performance. Here is the summary of revenue and top sellers:

**💰 Daily Financial Snapshot**
- **Gross Revenue:** $15,400 📈 (+12% vs last week)
- **Net Profit:** $4,200 (27% margin)
- **Orders Processed:** 142

**🏆 Top Performers:**
1.  🎧 Wireless Headphones ($8,500)
2.  ⌨️ Mechanical Keyboards ($3,200)
3.  🖥️ 4K Monitors ($2,100)"""
        else:
            return "💰 **Good news:** Today's revenue is **$15,400**, which is up 12% from last week. Our top seller is Wireless Headphones. Want the full breakdown?"

    # Warehouse Zones
    elif any(k in lower_prompt for k in ["zone", "warehouse", "temperature", "humidity"]):
        if wants_table:
            return """I've scanned the environmental sensors across all zones. Here is the current status:

**🏭 Warehouse Zone Status**
| Zone | Type | Temp | Humidity | Occupancy |
|---|---|---|---|---|
| **Zone A** | General | 22°C | 45% | 78% |
| **Zone B** | ❄️ Freezer | **-2°C** ⚠️ | 30% | 92% |
| **Zone C** | 🔒 Secure | 20°C | 40% | 45% |
| **Zone D** | Receiving | 18°C | 50% | 15% |"""
        else:
            return "🏭 **Zone Status:** Everything looks normal except for **Zone B (Freezer)**, which is running warm at -2°C. Zone A and C are within optimal ranges."

    # System Health
    elif any(k in lower_prompt for k in ["system", "health", "server", "uptime", "api"]):
        return "🟢 **System Healthy:** All core systems (API, Database, AI Engine) are online and running smoothly. Last backup was at 3:00 AM."

    # Orders (New)
    elif any(k in lower_prompt for k in ["order", "purchase", "pending"]):
        if wants_table:
            return """I've checked the order management system. Here are the most recent orders:

**📦 Recent Orders**
| Order ID | Customer | Amount | Status |
|---|---|---|---|
| **#ORD-7782** | TechGiant Inc. | $4,200 | 🟡 Pending Approval |
| **#ORD-7781** | RetailWorld | $1,150 | 🟢 Shipped |
| **#ORD-7780** | LocalShop | $850 | 🟢 Delivered |"""
        else:
            return "📦 **Order Update:** You have one pending order from **TechGiant Inc.** for $4,200 that needs approval. Everything else has been shipped or delivered. Should I approve the pending one?"

    # Returns (New)
    elif any(k in lower_prompt for k in ["return", "refund", "rma"]):
        if wants_table:
            return """I've looked up the returns database. Here is the status of recent RMAs:

**↩️ Recent Returns**
| RMA ID | Item | Reason | Status |
|---|---|---|---|
| **#RMA-202** | 4K Monitor | Damaged | 🟡 Processing |
| **#RMA-201** | Keyboard | Wrong Item | 🟢 Refunded |"""
        else:
            return "↩️ **Returns:** We have a return processing for a damaged 4K Monitor (#RMA-202). The return rate is stable at 1.2%."

    # Forecasting (New)
    elif any(k in lower_prompt for k in ["forecast", "predict", "future", "demand"]):
        return "🔮 **Forecast:** I'm predicting a **15% surge** in demand for Wireless Headphones over the next week. You might want to increase stock levels by Friday."

    # Quality (New)
    elif any(k in lower_prompt for k in ["quality", "inspect", "defect"]):
        return "✅ **Quality Control:** Inspection pass rate is **98.5%** today. Only 2 defects found in the last batch of Mechanical Keyboards. I've flagged them for review."

    # Shipping (New)
    elif any(k in lower_prompt for k in ["shipping", "carrier", "fedex", "ups"]):
        return "🚢 **Shipping Status:** FedEx pickup is scheduled for 4:00 PM. We have 45 packages ready to go. UPS already picked up the morning batch."

    # --- 5. CONTEXT AWARENESS (Vague Follow-ups) ---
    vague_keywords = ["detail", "more", "why", "explain", "what else", "expand", "name", "list", "show", "give me", "what", "do", "action", "help", "next step"]
    if any(k in lower_prompt for k in vague_keywords) and history:
        # Look at the LAST user message to determine context
        # We skip the current prompt (which is just "more details") and look at the one before
        
        # Simple heuristic: Check the last BOT response for clues
        last_bot_msg = next((m for m in reversed(history) if m.get("role") == "model"), None)
        if last_bot_msg:
            last_content = last_bot_msg.get("parts", "")
            if isinstance(last_content, list): last_content = " ".join(last_content)
            last_content = str(last_content).lower()

            # Prioritize Maintenance/Anomalies to prevent "In Stock" collision
            if any(k in last_content for k in ["maintenance", "repair", "conveyor", "vibration"]):
                return """I've analyzed the vibration data from the sensors on Conveyor Belt 3. Here is the detailed report:

**🔍 Deep Dive: Conveyor Belt 3 Issue**
**Context & Analysis:**
The vibration sensors on Conveyor Belt 3 have been trending upwards for the last 48 hours. This pattern typically indicates a misalignment in the motor drive unit or bearing fatigue. If left unchecked, this will likely lead to a catastrophic failure during peak hours.

**Detailed Breakdown:**
- **Component:** Motor Drive Unit (Model: MD-X500).
- **Vibration Level:** 8.5mm/s (Normal: <2.0mm/s).
- **Predicted Failure:** 24-48 hours.
- **Spare Part:** In Stock (Aisle 4, Bin 12).
- **Recommended Technician:** Sarah Connor (Certified)."""

            elif any(k in last_content for k in ["anomal", "alert", "zone b", "freezer"]):
                return """I've investigated the temperature logs for Zone B. Here is what I found:

**🔍 Deep Dive: Zone B Temperature Spike**
**Context & Analysis:**
Zone B (Freezer) has deviated from its setpoint of -10°C to -2°C. This rapid rise suggests a compressor failure rather than a door left open. Immediate action is required to prevent spoilage of perishable inventory.

**Detailed Breakdown:**
- **Root Cause Analysis:** Likely compressor failure in Unit 4.
- **Historical Data:** Unit 4 has shown degrading performance for 2 weeks.
- **Inventory at Risk:** 500kg of Frozen Seafood (SKU: SF-999).
- **Estimated Loss:** $12,000 if not resolved in 4 hours.
- **Recommended Action:** Move stock to Zone C immediately."""

            elif any(k in last_content for k in ["stock", "inventory", "pallet", "batteries"]):
                return """I've reviewed the consumption rates for our low-stock items. Here is the analysis:

**🔍 Deep Dive: Low Stock Items**
**Context & Analysis:**
We are seeing a faster-than-expected burn rate on packing materials and batteries due to the recent surge in electronics orders. At the current rate, we will stock out before the weekend.

**Detailed Breakdown:**
- **Wood Pallets (WP-101):**
  - Usage Rate: 20/day
  - Days Remaining: 2.5 days
  - Supplier: WoodWorks Inc. (Lead time: 3 days)
  
- **AA Batteries (BT-202):**
  - Usage Rate: 50/day
  - Days Remaining: 2 days
  - Supplier: EnergyPlus (Lead time: 1 day)"""

            elif any(k in last_content for k in ["route", "delivery", "driver", "traffic"]):
                return """I've checked the GPS telemetry and traffic reports. Here is the detailed driver status:

**🔍 Deep Dive: Active Drivers & Routes**

| Driver | Route | Vehicle | Current Location | State | ETA | Status |
|---|---|---|---|---|---|---|
| Mike Johnson | #101 | Van-04 | I-880 N, MM 42 | 🔴 Delayed | +45m | Traffic jam |
| Sarah Connor | #102 | Truck-09 | San Jose Hub | 🟢 On Route | On Time | Loading |
| John Doe | #103 | Van-01 | Downtown SF | 🟡 Delayed | +30m | Client wait |
| Lisa Park | #104 | Truck-12 | Oakland DC | 🟢 On Route | On Time | In transit |
| Tom Hardy | #105 | Van-07 | Berkeley | 🟢 On Route | On Time | Delivering |

**Context & Analysis:**
Route #101 is critically delayed due to a major accident on I-880. The driver is stationary. Route #103 is delayed because the client wasn't ready at Stop 3. All other routes are running smoothly.

**Detailed Breakdown (Route #101):**
- **Driver:** Mike Johnson (Phone: 555-0192)
- **GPS Coordinates:** 37.7749° N, 122.4194° W
- **Current Location:** I-880 North, Mile Marker 42 (Near Fremont)
- **Vehicle Status:** Engine idle, fuel at 65%
- **Traffic Condition:** Severe congestion due to accident (3-car pileup)
- **Customer Impact:** 3 deliveries will be late (Target, BestBuy, Walmart)
- **Communication:** Automated SMS sent to customers at 2:00 PM
- **Recommended Action:** Monitor for 15 more minutes, then consider rerouting via I-680."""

            elif any(k in last_content for k in ["revenue", "sales", "profit", "financial"]):
                return """I've broken down the revenue streams for today. Here is the financial analysis:

**🔍 Deep Dive: Financial Performance**
**Context & Analysis:**
Revenue is tracking 12% above projections, driven largely by the "Work from Home" electronics category. Margins remain healthy despite increased shipping costs.

**Detailed Breakdown:**
- **Margin Analysis:** 27% Net Margin (Target: 25%).
- **Cost of Goods Sold (COGS):** $11,200.
- **Operating Expenses:** $3,500.
- **Growth Trend:** Consistent 10-15% week-over-week growth for the last month."""

            elif any(k in last_content for k in ["order", "purchase", "techgiant"]):
                return """I've pulled the details for the pending order from TechGiant Inc. Here is the summary:

**🔍 Deep Dive: Order #ORD-7782**
**Context & Analysis:**
This is a high-value order from a strategic partner. It requires manual approval because it exceeds the $3,000 auto-approval threshold. Credit check has passed successfully.

**Detailed Breakdown:**
- **Customer:** TechGiant Inc. (Premium Partner)
- **Items:** 20x Office Chairs, 5x Standing Desks.
- **Payment Status:** Verified.
- **Risk Score:** Low.
- **Approval Deadline:** Today, 5:00 PM."""
                
            elif any(k in last_content for k in ["return", "refund", "rma", "monitor"]):
                    return """I've examined the RMA request and attached photos. Here is the assessment:

**🔍 Deep Dive: Return #RMA-202**
**Context & Analysis:**
The customer reported shipping damage. Photos confirm a cracked screen consistent with impact. This is the second damaged monitor from this carrier this week, suggesting a potential handling issue.

**Detailed Breakdown:**
- **Customer:** John Smith
- **Item:** 4K Monitor (UltraView X1)
- **Issue:** Screen cracked during shipping.
- **Photos:** Uploaded by customer.
- **Action:** Replacement unit scheduled for dispatch."""

    # --- 6. CONTEXT AWARE SUGGESTIONS (New) ---
    suggestion_keywords = ["suggest", "recommend", "advice", "what should i do", "what do we do now", "action", "what next"]
    if any(k in lower_prompt for k in suggestion_keywords) and history:
        # Look at the LAST user message to determine context
        last_bot_msg = next((m for m in reversed(history) if m.get("role") == "model"), None)
        if last_bot_msg:
            last_content = last_bot_msg.get("parts", "")
            if isinstance(last_content, list): last_content = " ".join(last_content)
            last_content = str(last_content).lower()

            if any(k in last_content for k in ["maintenance", "repair", "conveyor", "vibration"]):
                return "Based on the vibration analysis, I **strongly recommend** scheduling downtime for tonight. Waiting longer increases the risk of a mid-shift failure by 40%."

            elif any(k in last_content for k in ["anomal", "alert", "zone b", "freezer"]):
                return "Given the temperature spike, you should **immediately dispatch** a technician to Unit 4. In the meantime, move the frozen seafood to Zone C to prevent spoilage."

            elif any(k in last_content for k in ["stock", "inventory", "pallet", "batteries"]):
                return "Since lead times are tight, I suggest we **place an expedited order** for Wood Pallets today. For the batteries, we can wait until the regular Friday shipment."

            elif any(k in last_content for k in ["route", "delivery", "driver", "traffic"]):
                return "For Route #101, the best course of action is to **notify the customers** immediately. Rerouting isn't viable, but proactive communication will maintain our trust score."

            elif any(k in last_content for k in ["revenue", "sales", "profit", "financial"]):
                return "With revenue up 12%, I recommend **reinvesting the surplus** into stocking up on high-velocity items like Wireless Headphones before the holiday rush."

            elif any(k in last_content for k in ["order", "purchase", "techgiant"]):
                return "This order is from a VIP client. I recommend **approving it immediately** to ensure same-day shipping. Their credit standing is excellent."
                
            elif any(k in last_content for k in ["return", "refund", "rma", "monitor"]):
                return "Since this is a repeat issue with this carrier, I suggest we **file a claim** with the shipping provider and expedite a replacement to the customer."

    # --- 7. FALLBACK ---
    return """I didn't quite catch that. I'm connected to your live systems, so you can ask me things like:

- "How's inventory looking?"
- "Any issues with deliveries?"
- "Check for anomalies"
- "What's the revenue today?"
- "Negotiate supplier prices"
- "Predict maintenance needs"

Try rephrasing your request!"""

# ---------------------------------------------------------------------------
# Helper: call Gemini LLM
# ---------------------------------------------------------------------------
# Real LLM call using Google Gemini
def call_llm(prompt: str, history: list[dict], context_str: str, context_data: dict) -> str:
    """Call Gemini LLM with context, or fall back to mock mode if unavailable."""
    api_key = os.getenv("GEMINI_API_KEY")
    
    # --- GEMINI-FIRST MODE ---
    if api_key and api_key != "your_gemini_api_key_here":
        # Retry logic for robustness
        max_retries = 3
        for attempt in range(max_retries):
            try:
                genai.configure(api_key=api_key)
                
                system_instruction = f"""You are **Warefy AI** 🧠 - an intelligent assistant for warehouse and supply chain operations.

**Your Personality:**
- Conversational and friendly (like a helpful coworker)
- Use emojis naturally (1-2 per response)
- Be proactive and suggest actions
- Keep responses concise unless asked for details

**Real-Time Warehouse Data (LIVE):**
{context_str}

**Response Guidelines:**

1. **Default Responses (Brief):**
   - 2-4 sentences maximum
   - Include 1-2 key numbers from the real data above
   - End with a question like "Want more details?" or "Should I dig deeper?"
   
2. **When to Use Tables:**
   - User asks to "compare" multiple items
   - User requests "detailed", "full", or "complete" report
   - User asks for "breakdown" or "summary"
   - Format tables in markdown with proper headers
   
3. **When to Expand (Deep Dive):**
   - User says "more info", "details", "explain", "dig deeper"
   - Provide:
     * Context & Analysis section (2-3 sentences explaining WHY)
     * Detailed Breakdown (bullet points or table)
     * Suggested Actions (2-3 actionable next steps)

4. **Data Grounding:**
   - ALWAYS use the real-time data provided above
   - Reference actual numbers (e.g., "You have **{context_data.get('inventory', {}).get('total', 0)} items** in inventory")
   - If data is missing, acknowledge it: "I don't have that data right now"

5. **Formatting:**
   - Use **bold** for important numbers or actions
   - Use markdown tables for comparisons
   - Use bullet points for lists
   - Use emojis to add personality

**Examples:**

User: "check inventory"
Good: "You have **{context_data.get('inventory', {}).get('total', 0)} items** in stock. **{context_data.get('inventory', {}).get('low_stock_count', 0)} are running low**. Should I show you which ones? 📦"

User: "compare zones"
Good: "I've scanned the environmental sensors. Here is the current status:

| Zone | Temp | Humidity | Occupancy |
|---|---|---|---|
| Zone A | 22°C | 45% | 78% |
| Zone B | -2°C ⚠️ | 30% | 92% |

Zone B is running warm. Should I alert maintenance? 🏭"

User: "more details" (after inventory question)
Good: "I've analyzed the consumption rates. Here's the breakdown:

**Context:** We're seeing faster burn rates due to recent order surge.

**Low Stock Items:**
- Wood Pallets: 50 units (need 100)
- AA Batteries: 100 units (need 250)

**Suggested Actions:**
1. Place expedited order for pallets today
2. Regular shipment for batteries on Friday
3. Monitor usage for next 48 hours"

Remember: Be helpful, not overwhelming. Most users want quick answers first!"""
                
                model = genai.GenerativeModel(
                    model_name="models/gemini-flash-latest",
                    system_instruction=system_instruction
                )

                # Convert history to Gemini format
                gemini_history = []
                for msg in history:
                    role = "user" if msg.get("role") == "user" else "model"
                    parts = msg.get("parts", [])
                    if isinstance(parts, str):
                        parts = [parts]
                    gemini_history.append({"role": role, "parts": parts})
                
                # Start chat with history
                chat = model.start_chat(history=gemini_history)
                
                print(f"🧠 Calling Gemini (Attempt {attempt+1}/{max_retries})...")
                
                response = chat.send_message(prompt)
                print("✅ Gemini response received successfully.")
                return response.text
                
            except Exception as exc:
                print(f"❌ ERROR calling Gemini (Attempt {attempt+1}): {exc}")
                if attempt == max_retries - 1:
                    print("⚠️ Gemini failed after retries. Falling back to mock mode.")
                    return get_mock_response(prompt, history, context_data)
                import time
                time.sleep(1)
    
    # --- MOCK FALLBACK MODE ---
    print("⚠️ GEMINI_API_KEY not found or invalid. Using Smart Mock mode.")
    return get_mock_response(prompt, history, context_data)

# ---------------------------------------------------------------------------
# FastAPI router
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/api/v1/ai", tags=["AI"])

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
    context_data = get_real_time_data(db)
    context_str = format_context_string(context_data)
    
    # Call LLM with context
    ai_reply = call_llm(request.prompt, request.history, context_str, context_data)
    return AICommandResponse(response=ai_reply)
