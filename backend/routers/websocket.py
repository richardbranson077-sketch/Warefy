"""
WebSocket Router
Real-time endpoints for inventory, orders, dashboard, and collaboration
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
import uuid
import json
import logging
from typing import Optional

from backend.database_lite import get_db
from backend.websocket_manager import manager, notify_inventory_update, notify_order_update
from backend.auth_lite import get_current_user_from_token
from backend.models_lite import User

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/inventory")
async def websocket_inventory(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time inventory updates
    
    Clients will receive notifications when:
    - New items are added
    - Items are updated
    - Items are deleted
    - Stock levels change
    """
    connection_id = str(uuid.uuid4())
    user_id = None
    
    # Authenticate user if token provided
    if token:
        try:
            user = await get_current_user_from_token(token, db)
            user_id = user.id
        except Exception as e:
            logger.warning(f"WebSocket authentication failed: {e}")
    
    await manager.connect(websocket, connection_id, user_id)
    manager.join_room(connection_id, "inventory")
    
    try:
        while True:
            # Receive messages from client
            data = await websocket.receive_json()
            
            # Handle different message types
            if data.get("type") == "ping":
                await manager.send_personal_message(
                    {"type": "pong", "timestamp": data.get("timestamp")},
                    connection_id
                )
            
            elif data.get("type") == "subscribe":
                # Subscribe to specific SKU updates
                sku = data.get("sku")
                if sku:
                    manager.join_room(connection_id, f"inventory_{sku}")
                    await manager.send_personal_message(
                        {"type": "subscribed", "sku": sku},
                        connection_id
                    )
    
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
        logger.info(f"Client disconnected from inventory WebSocket: {connection_id}")
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(connection_id)


@router.websocket("/ws/orders")
async def websocket_orders(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time order updates
    
    Clients will receive notifications when:
    - New orders are created
    - Order status changes
    - Orders are fulfilled
    - Shipping updates occur
    """
    connection_id = str(uuid.uuid4())
    user_id = None
    
    if token:
        try:
            user = await get_current_user_from_token(token, db)
            user_id = user.id
        except Exception as e:
            logger.warning(f"WebSocket authentication failed: {e}")
    
    await manager.connect(websocket, connection_id, user_id)
    manager.join_room(connection_id, "orders")
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "ping":
                await manager.send_personal_message(
                    {"type": "pong", "timestamp": data.get("timestamp")},
                    connection_id
                )
            
            elif data.get("type") == "subscribe_order":
                order_id = data.get("order_id")
                if order_id:
                    manager.join_room(connection_id, f"order_{order_id}")
                    await manager.send_personal_message(
                        {"type": "subscribed", "order_id": order_id},
                        connection_id
                    )
    
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
        logger.info(f"Client disconnected from orders WebSocket: {connection_id}")
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(connection_id)


@router.websocket("/ws/dashboard")
async def websocket_dashboard(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for live dashboard metrics
    
    Clients will receive real-time updates for:
    - Total orders
    - Revenue metrics
    - Inventory levels
    - System performance
    """
    connection_id = str(uuid.uuid4())
    user_id = None
    
    if token:
        try:
            user = await get_current_user_from_token(token, db)
            user_id = user.id
        except Exception as e:
            logger.warning(f"WebSocket authentication failed: {e}")
    
    await manager.connect(websocket, connection_id, user_id)
    manager.join_room(connection_id, "dashboard")
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "ping":
                await manager.send_personal_message(
                    {"type": "pong", "timestamp": data.get("timestamp")},
                    connection_id
                )
            
            elif data.get("type") == "request_metrics":
                # Send current metrics
                # In production, fetch from database
                await manager.send_personal_message(
                    {
                        "type": "metrics_update",
                        "metrics": {
                            "total_orders": 1250,
                            "revenue_today": 45230.50,
                            "low_stock_items": 12,
                            "active_shipments": 34
                        }
                    },
                    connection_id
                )
    
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
        logger.info(f"Client disconnected from dashboard WebSocket: {connection_id}")
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(connection_id)


@router.websocket("/ws/collaboration/{document_id}")
async def websocket_collaboration(
    websocket: WebSocket,
    document_id: str,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for collaborative editing
    
    Supports:
    - Real-time cursor positions
    - Document edits
    - User presence
    - Comments and annotations
    """
    connection_id = str(uuid.uuid4())
    user_id = None
    
    if token:
        try:
            user = await get_current_user_from_token(token, db)
            user_id = user.id
        except Exception as e:
            logger.warning(f"WebSocket authentication failed: {e}")
    
    await manager.connect(websocket, connection_id, user_id)
    room = f"doc_{document_id}"
    manager.join_room(connection_id, room)
    
    # Notify others that user joined
    await manager.broadcast_to_room(
        room,
        {
            "type": "user_joined",
            "user_id": user_id,
            "document_id": document_id
        },
        exclude={connection_id}
    )
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "ping":
                await manager.send_personal_message(
                    {"type": "pong", "timestamp": data.get("timestamp")},
                    connection_id
                )
            
            elif data.get("type") in ["cursor_move", "edit", "comment"]:
                # Broadcast to all collaborators except sender
                await manager.broadcast_to_room(
                    room,
                    {
                        "type": data.get("type"),
                        "user_id": user_id,
                        "data": data.get("data")
                    },
                    exclude={connection_id}
                )
    
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
        
        # Notify others that user left
        await manager.broadcast_to_room(
            room,
            {
                "type": "user_left",
                "user_id": user_id,
                "document_id": document_id
            }
        )
        
        logger.info(f"Client disconnected from collaboration WebSocket: {connection_id}")
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(connection_id)


@router.get("/ws/stats")
async def get_websocket_stats():
    """
    Get WebSocket connection statistics
    
    Returns:
        Connection and room statistics
    """
    return {
        "active_connections": manager.get_connection_count(),
        "total_rooms": manager.get_room_count(),
        "rooms": {
            room: len(members)
            for room, members in manager.rooms.items()
        }
    }
