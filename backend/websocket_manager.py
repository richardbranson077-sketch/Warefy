"""
WebSocket Connection Manager
Handles WebSocket connections, broadcasting, and room management
"""

from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect
import json
import logging
from datetime import datetime
import asyncio

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections with support for rooms and broadcasting
    """
    
    def __init__(self):
        # Active connections: {connection_id: WebSocket}
        self.active_connections: Dict[str, WebSocket] = {}
        
        # Rooms: {room_name: Set[connection_id]}
        self.rooms: Dict[str, Set[str]] = {}
        
        # User mapping: {connection_id: user_id}
        self.user_mapping: Dict[str, int] = {}
    
    async def connect(self, websocket: WebSocket, connection_id: str, user_id: int = None):
        """
        Accept a new WebSocket connection
        
        Args:
            websocket: WebSocket connection
            connection_id: Unique connection identifier
            user_id: Optional user ID for authentication
        """
        await websocket.accept()
        self.active_connections[connection_id] = websocket
        
        if user_id:
            self.user_mapping[connection_id] = user_id
        
        logger.info(f"WebSocket connected: {connection_id} (user: {user_id})")
        
        # Send welcome message
        await self.send_personal_message(
            {
                "type": "connection",
                "status": "connected",
                "connection_id": connection_id,
                "timestamp": datetime.utcnow().isoformat()
            },
            connection_id
        )
    
    def disconnect(self, connection_id: str):
        """
        Remove a WebSocket connection
        
        Args:
            connection_id: Connection identifier to remove
        """
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        
        if connection_id in self.user_mapping:
            del self.user_mapping[connection_id]
        
        # Remove from all rooms
        for room in self.rooms.values():
            room.discard(connection_id)
        
        logger.info(f"WebSocket disconnected: {connection_id}")
    
    async def send_personal_message(self, message: dict, connection_id: str):
        """
        Send message to a specific connection
        
        Args:
            message: Message dictionary to send
            connection_id: Target connection ID
        """
        if connection_id in self.active_connections:
            try:
                await self.active_connections[connection_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {connection_id}: {e}")
                self.disconnect(connection_id)
    
    async def broadcast(self, message: dict, exclude: Set[str] = None):
        """
        Broadcast message to all connected clients
        
        Args:
            message: Message dictionary to broadcast
            exclude: Set of connection IDs to exclude
        """
        exclude = exclude or set()
        disconnected = []
        
        for connection_id, websocket in self.active_connections.items():
            if connection_id not in exclude:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {connection_id}: {e}")
                    disconnected.append(connection_id)
        
        # Clean up disconnected clients
        for connection_id in disconnected:
            self.disconnect(connection_id)
    
    async def broadcast_to_room(self, room: str, message: dict, exclude: Set[str] = None):
        """
        Broadcast message to all clients in a specific room
        
        Args:
            room: Room name
            message: Message dictionary to broadcast
            exclude: Set of connection IDs to exclude
        """
        exclude = exclude or set()
        
        if room not in self.rooms:
            return
        
        disconnected = []
        
        for connection_id in self.rooms[room]:
            if connection_id not in exclude and connection_id in self.active_connections:
                try:
                    await self.active_connections[connection_id].send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {connection_id} in room {room}: {e}")
                    disconnected.append(connection_id)
        
        # Clean up disconnected clients
        for connection_id in disconnected:
            self.disconnect(connection_id)
    
    def join_room(self, connection_id: str, room: str):
        """
        Add connection to a room
        
        Args:
            connection_id: Connection ID
            room: Room name
        """
        if room not in self.rooms:
            self.rooms[room] = set()
        
        self.rooms[room].add(connection_id)
        logger.info(f"Connection {connection_id} joined room: {room}")
    
    def leave_room(self, connection_id: str, room: str):
        """
        Remove connection from a room
        
        Args:
            connection_id: Connection ID
            room: Room name
        """
        if room in self.rooms:
            self.rooms[room].discard(connection_id)
            logger.info(f"Connection {connection_id} left room: {room}")
    
    def get_room_members(self, room: str) -> List[str]:
        """
        Get list of connection IDs in a room
        
        Args:
            room: Room name
            
        Returns:
            List of connection IDs
        """
        return list(self.rooms.get(room, set()))
    
    def get_connection_count(self) -> int:
        """
        Get total number of active connections
        
        Returns:
            Number of active connections
        """
        return len(self.active_connections)
    
    def get_room_count(self) -> int:
        """
        Get total number of rooms
        
        Returns:
            Number of rooms
        """
        return len(self.rooms)


# Global connection manager instance
manager = ConnectionManager()


# Helper functions for common operations

async def notify_inventory_update(item_id: int, action: str, data: dict):
    """
    Notify all clients about inventory update
    
    Args:
        item_id: Inventory item ID
        action: Action type (created, updated, deleted)
        data: Item data
    """
    message = {
        "type": "inventory_update",
        "action": action,
        "item_id": item_id,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.broadcast_to_room("inventory", message)
    logger.info(f"Inventory update broadcasted: {action} item {item_id}")


async def notify_order_update(order_id: int, status: str, data: dict):
    """
    Notify all clients about order status change
    
    Args:
        order_id: Order ID
        status: New order status
        data: Order data
    """
    message = {
        "type": "order_update",
        "order_id": order_id,
        "status": status,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.broadcast_to_room("orders", message)
    logger.info(f"Order update broadcasted: order {order_id} -> {status}")


async def notify_dashboard_metrics(metrics: dict):
    """
    Notify all clients about dashboard metrics update
    
    Args:
        metrics: Metrics data
    """
    message = {
        "type": "dashboard_metrics",
        "metrics": metrics,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.broadcast_to_room("dashboard", message)


async def notify_collaboration_event(document_id: str, user_id: int, event: str, data: dict):
    """
    Notify collaborators about document changes
    
    Args:
        document_id: Document ID
        user_id: User who made the change
        event: Event type (edit, cursor_move, etc.)
        data: Event data
    """
    message = {
        "type": "collaboration",
        "document_id": document_id,
        "user_id": user_id,
        "event": event,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    room = f"doc_{document_id}"
    await manager.broadcast_to_room(room, message, exclude={str(user_id)})
