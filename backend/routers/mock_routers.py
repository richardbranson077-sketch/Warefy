"""
Mock routers for lite backend - return empty/mock data
These routers provide endpoints that return mock data to prevent 404 errors
"""

from fastapi import APIRouter

# Shipping router
shipping_router = APIRouter(prefix="/api/v1/shipping", tags=["Shipping"])

@shipping_router.get("/shipments")
async def get_shipments():
    return []

@shipping_router.get("/shipments/{id}")
async def get_shipment(id: int):
    return {"id": id, "status": "pending", "message": "Mock data - feature coming soon"}

@shipping_router.post("/shipments")
async def create_shipment():
    return {"message": "Mock endpoint - feature coming soon"}

@shipping_router.post("/rates")
async def get_rates():
    return []

# Returns router
returns_router = APIRouter(prefix="/api/v1/returns", tags=["Returns"])

@returns_router.get("")
async def get_returns():
    return []

@returns_router.get("/{id}")
async def get_return(id: int):
    return {"id": id, "status": "pending", "message": "Mock data - feature coming soon"}

@returns_router.post("")
async def create_return():
    return {"message": "Mock endpoint - feature coming soon"}

# Labor router
labor_router = APIRouter(prefix="/api/v1/labor", tags=["Labor"])

@labor_router.get("/employees")
async def get_employees():
    return []

@labor_router.get("/stats")
async def get_labor_stats():
    return {
        "totalEmployees": 0,
        "activeNow": 0,
        "totalHoursToday": 0,
        "overtimeHoursToday": 0,
        "laborCostToday": 0,
        "productivityScore": 0
    }

# Quality router
quality_router = APIRouter(prefix="/api/v1/quality", tags=["Quality"])

@quality_router.get("/inspections")
async def get_inspections():
    return []

@quality_router.get("/stats")
async def get_quality_stats():
    return {
        "passRate": 0,
        "defectRate": 0,
        "inspectionsToday": 0,
        "pendingInspections": 0,
        "topDefects": []
    }

# Demand router
demand_router = APIRouter(prefix="/api/v1/demand", tags=["Demand"])

@demand_router.get("/forecast")
async def get_forecast():
    return {"message": "Mock endpoint - feature coming soon", "forecast": []}

@demand_router.post("/forecast")
async def create_forecast():
    return {"message": "Mock endpoint - feature coming soon", "forecast": []}

@demand_router.get("/historical")
async def get_historical():
    return []

# Inventory router (mock)
inventory_router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])

@inventory_router.get("")
async def get_inventory():
    return []

@inventory_router.get("/stats")
async def get_inventory_stats():
    return {"totalItems": 0, "lowStock": 0, "outOfStock": 0}

# Anomalies router (mock)
anomalies_router = APIRouter(prefix="/api/v1/anomalies", tags=["Anomalies"])

@anomalies_router.get("")
async def get_anomalies():
    return []

@anomalies_router.get("/recent")
async def get_recent_anomalies():
    return []

# Forecasting router
forecasting_router = APIRouter(prefix="/api/v1/forecasting", tags=["Forecasting"])

@forecasting_router.get("")
async def get_forecasts():
    return []

# Orders stats endpoint (fix 422 error)
orders_stats_router = APIRouter(prefix="/api/v1/orders", tags=["Orders Stats"])

@orders_stats_router.get("/stats")
async def get_orders_stats():
    return {
        "total": 150,
        "pending": 12,
        "processing": 45,
        "shipped": 89,
        "delivered": 342,
        "cancelled": 5
    }

@orders_stats_router.get("")
async def get_orders(status: str = None, warehouse_id: int = None):
    return [
        {
            "id": 1,
            "order_number": "ORD-2023-001",
            "customer_name": "Acme Corp",
            "status": "pending",
            "total_amount": 1500.00,
            "created_at": "2023-11-25T10:00:00Z"
        },
        {
            "id": 2,
            "order_number": "ORD-2023-002",
            "customer_name": "Globex Inc",
            "status": "shipped",
            "total_amount": 2300.50,
            "created_at": "2023-11-24T14:30:00Z"
        }
    ]

@orders_stats_router.post("")
async def create_order():
    return {"message": "Mock order created", "id": 3, "status": "pending"}

@orders_stats_router.get("/{id}")
async def get_order(id: int):
    return {
        "id": id,
        "order_number": f"ORD-2023-{id:03d}",
        "customer_name": "Mock Customer",
        "status": "pending",
        "items": []
    }

@orders_stats_router.put("/{id}")
async def update_order(id: int):
    return {"message": "Mock order updated", "id": id}

@orders_stats_router.delete("/{id}")
async def delete_order(id: int):
    return {"message": "Mock order deleted", "id": id}

# AI Reports router
ai_reports_router = APIRouter(prefix="/api/v1/ai/reports", tags=["AI Reports"])

@ai_reports_router.get("")
async def get_ai_reports():
    return []

@ai_reports_router.post("")
async def create_ai_report():
    return {"message": "Mock report created"}

# Edge AI router
edge_ai_router = APIRouter(prefix="/api/v1/edge-ai", tags=["Edge AI"])

@edge_ai_router.get("/models")
async def get_edge_models():
    return []

@edge_ai_router.post("/models")
async def deploy_edge_model():
    return {"message": "Mock model deployed"}

# AI Recommendations router
ai_recommendations_router = APIRouter(prefix="/api/v1/ai/recommendations", tags=["AI Recommendations"])

@ai_recommendations_router.get("")
async def get_recommendations():
    return []

@ai_recommendations_router.post("")
async def create_recommendation():
    return {"message": "Mock recommendation created"}

# AI Commands router
ai_commands_router = APIRouter(prefix="/api/v1/ai/commands", tags=["AI Commands"])

@ai_commands_router.get("")
async def get_commands():
    return []

@ai_commands_router.post("/{command_id}/execute")
async def execute_command(command_id: str):
    return {"message": "Command executed", "status": "success"}

# Financials router
financials_router = APIRouter(prefix="/api/v1/financials", tags=["Financials"])

@financials_router.get("/summary")
async def get_financial_summary():
    return {
        "totalRevenue": 0,
        "totalExpenses": 0,
        "netProfit": 0,
        "profitMargin": 0,
        "period": "month"
    }

@financials_router.get("/transactions")
async def get_transactions():
    return []

@financials_router.get("/profit-loss")
async def get_profit_loss():
    return {}

# Blockchain router
blockchain_router = APIRouter(prefix="/api/v1/blockchain", tags=["Blockchain"])

@blockchain_router.get("/transactions")
async def get_blockchain_transactions():
    return []

# Collaboration router
collaboration_router = APIRouter(prefix="/api/v1/collaboration", tags=["Collaboration"])

@collaboration_router.get("/sessions")
async def get_collaboration_sessions():
    return []

# Knowledge Base router
knowledge_base_router = APIRouter(prefix="/api/v1/knowledge", tags=["Knowledge Base"])

@knowledge_base_router.get("/articles")
async def get_articles():
    return []

# Settings router
settings_router = APIRouter(prefix="/api/v1/settings", tags=["Settings"])

@settings_router.get("")
async def get_settings():
    return []

# Computer Vision router
computer_vision_router = APIRouter(prefix="/api/v1/vision", tags=["Computer Vision"])

@computer_vision_router.get("/results")
async def get_vision_results():
    return []

@computer_vision_router.post("/analyze")
async def analyze_image():
    return {"message": "Image analyzed", "results": []}

# AI Chat router
ai_chat_router = APIRouter(prefix="/api/v1/ai/chat", tags=["AI Chat"])

@ai_chat_router.post("/message")
async def send_chat_message():
    return {"response": "I am a mock AI assistant."}

@ai_chat_router.get("/history")
async def get_chat_history():
    return []
