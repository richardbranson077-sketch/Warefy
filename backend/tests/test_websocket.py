"""
WebSocket Tests
Tests WebSocket connections and real-time features
"""

import pytest
from fastapi.testclient import TestClient
import json


@pytest.mark.websocket
class TestWebSocketConnections:
    """Test WebSocket connection functionality"""
    
    def test_inventory_websocket_connection(self, client: TestClient):
        """Test connecting to inventory WebSocket"""
        with client.websocket_connect("/ws/inventory") as websocket:
            # Receive connection message
            data = websocket.receive_json()
            assert data["type"] == "connection"
            assert data["status"] == "connected"
    
    def test_orders_websocket_connection(self, client: TestClient):
        """Test connecting to orders WebSocket"""
        with client.websocket_connect("/ws/orders") as websocket:
            data = websocket.receive_json()
            assert data["type"] == "connection"
            assert data["status"] == "connected"
    
    def test_dashboard_websocket_connection(self, client: TestClient):
        """Test connecting to dashboard WebSocket"""
        with client.websocket_connect("/ws/dashboard") as websocket:
            data = websocket.receive_json()
            assert data["type"] == "connection"
            assert data["status"] == "connected"
    
    def test_collaboration_websocket_connection(self, client: TestClient):
        """Test connecting to collaboration WebSocket"""
        doc_id = "test-doc-123"
        with client.websocket_connect(f"/ws/collaboration/{doc_id}") as websocket:
            data = websocket.receive_json()
            assert data["type"] == "connection"
            assert data["status"] == "connected"


@pytest.mark.websocket
class TestWebSocketMessaging:
    """Test WebSocket message handling"""
    
    def test_ping_pong(self, client: TestClient):
        """Test ping/pong keep-alive"""
        with client.websocket_connect("/ws/inventory") as websocket:
            # Skip connection message
            websocket.receive_json()
            
            # Send ping
            websocket.send_json({"type": "ping", "timestamp": "2024-11-24T03:00:00Z"})
            
            # Receive pong
            response = websocket.receive_json()
            assert response["type"] == "pong"
            assert response["timestamp"] == "2024-11-24T03:00:00Z"
    
    def test_inventory_subscribe(self, client: TestClient):
        """Test subscribing to inventory updates"""
        with client.websocket_connect("/ws/inventory") as websocket:
            # Skip connection message
            websocket.receive_json()
            
            # Subscribe to SKU
            websocket.send_json({"type": "subscribe", "sku": "TEST-SKU-001"})
            
            # Receive subscription confirmation
            response = websocket.receive_json()
            assert response["type"] == "subscribed"
            assert response["sku"] == "TEST-SKU-001"
    
    def test_order_subscribe(self, client: TestClient):
        """Test subscribing to order updates"""
        with client.websocket_connect("/ws/orders") as websocket:
            # Skip connection message
            websocket.receive_json()
            
            # Subscribe to order
            websocket.send_json({"type": "subscribe_order", "order_id": 123})
            
            # Receive subscription confirmation
            response = websocket.receive_json()
            assert response["type"] == "subscribed"
            assert response["order_id"] == 123
    
    def test_dashboard_metrics_request(self, client: TestClient):
        """Test requesting dashboard metrics"""
        with client.websocket_connect("/ws/dashboard") as websocket:
            # Skip connection message
            websocket.receive_json()
            
            # Request metrics
            websocket.send_json({"type": "request_metrics"})
            
            # Receive metrics
            response = websocket.receive_json()
            assert response["type"] == "metrics_update"
            assert "metrics" in response
            assert "total_orders" in response["metrics"]


@pytest.mark.websocket
@pytest.mark.integration
class TestWebSocketIntegration:
    """Integration tests for WebSocket features"""
    
    def test_multiple_clients_inventory(self, client: TestClient):
        """Test multiple clients connecting to inventory WebSocket"""
        with client.websocket_connect("/ws/inventory") as ws1:
            with client.websocket_connect("/ws/inventory") as ws2:
                # Both should receive connection messages
                data1 = ws1.receive_json()
                data2 = ws2.receive_json()
                
                assert data1["type"] == "connection"
                assert data2["type"] == "connection"
                
                # Both should be able to ping
                ws1.send_json({"type": "ping"})
                ws2.send_json({"type": "ping"})
                
                response1 = ws1.receive_json()
                response2 = ws2.receive_json()
                
                assert response1["type"] == "pong"
                assert response2["type"] == "pong"
    
    def test_collaboration_multiple_users(self, client: TestClient):
        """Test multiple users in collaboration session"""
        doc_id = "test-doc-456"
        
        with client.websocket_connect(f"/ws/collaboration/{doc_id}") as ws1:
            # Skip connection message for ws1
            ws1.receive_json()
            
            with client.websocket_connect(f"/ws/collaboration/{doc_id}") as ws2:
                # Skip connection message for ws2
                ws2.receive_json()
                
                # ws1 should receive user_joined message when ws2 connects
                # (This depends on implementation details)
                
                # Send cursor move from ws1
                ws1.send_json({
                    "type": "cursor_move",
                    "data": {"x": 100, "y": 200}
                })
                
                # ws2 should receive the cursor move
                # (This would require proper broadcasting implementation)


@pytest.mark.websocket
class TestWebSocketStats:
    """Test WebSocket statistics endpoint"""
    
    def test_get_websocket_stats(self, client: TestClient, auth_headers: dict):
        """Test getting WebSocket connection statistics"""
        response = client.get("/ws/stats", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "active_connections" in data
        assert "total_rooms" in data
        assert "rooms" in data
        assert isinstance(data["active_connections"], int)
        assert isinstance(data["total_rooms"], int)
    
    def test_stats_with_active_connections(self, client: TestClient, auth_headers: dict):
        """Test stats with active WebSocket connections"""
        with client.websocket_connect("/ws/inventory"):
            # Get stats while connection is active
            response = client.get("/ws/stats", headers=auth_headers)
            
            assert response.status_code == 200
            data = response.json()
            # Should have at least 1 active connection
            assert data["active_connections"] >= 1
