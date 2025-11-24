"""
API Tests for Orders Endpoints
Tests CRUD operations for orders
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

from backend.models_lite import Order, Warehouse


@pytest.fixture
def test_order(test_db: Session, test_warehouse: Warehouse):
    """Create a test order"""
    order = Order(
        order_number="ORD-TEST-001",
        customer_name="Test Customer",
        customer_email="test@example.com",
        status="pending",
        total_amount=299.99,
        warehouse_id=test_warehouse.id,
        created_at=datetime.utcnow()
    )
    test_db.add(order)
    test_db.commit()
    test_db.refresh(order)
    return order


@pytest.mark.api
@pytest.mark.unit
class TestOrdersAPI:
    """Test orders API endpoints"""
    
    def test_get_all_orders(self, client: TestClient, test_order: Order, auth_headers: dict):
        """Test getting all orders"""
        response = client.get("/api/v1/orders", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(order["order_number"] == "ORD-TEST-001" for order in data)
    
    def test_get_order_by_id(self, client: TestClient, test_order: Order, auth_headers: dict):
        """Test getting specific order"""
        response = client.get(f"/api/v1/orders/{test_order.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["order_number"] == test_order.order_number
        assert data["customer_name"] == test_order.customer_name
    
    def test_get_order_not_found(self, client: TestClient, auth_headers: dict):
        """Test getting non-existent order"""
        response = client.get("/api/v1/orders/99999", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_create_order(self, client: TestClient, test_warehouse: Warehouse, auth_headers: dict):
        """Test creating new order"""
        new_order = {
            "order_number": "ORD-NEW-001",
            "customer_name": "New Customer",
            "customer_email": "new@example.com",
            "status": "pending",
            "total_amount": 499.99,
            "warehouse_id": test_warehouse.id
        }
        
        response = client.post("/api/v1/orders", json=new_order, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["order_number"] == new_order["order_number"]
        assert data["total_amount"] == new_order["total_amount"]
    
    def test_update_order_status(self, client: TestClient, test_order: Order, auth_headers: dict):
        """Test updating order status"""
        update_data = {"status": "shipped"}
        
        response = client.patch(
            f"/api/v1/orders/{test_order.id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "shipped"
    
    def test_filter_orders_by_status(self, client: TestClient, test_order: Order, auth_headers: dict):
        """Test filtering orders by status"""
        response = client.get(
            "/api/v1/orders?status=pending",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert all(order["status"] == "pending" for order in data)
    
    def test_unauthorized_access(self, client: TestClient):
        """Test accessing orders without authentication"""
        response = client.get("/api/v1/orders")
        
        assert response.status_code == 401


@pytest.mark.integration
class TestOrdersIntegration:
    """Integration tests for orders workflows"""
    
    def test_complete_order_workflow(
        self,
        client: TestClient,
        test_warehouse: Warehouse,
        auth_headers: dict
    ):
        """Test complete order lifecycle"""
        # Create order
        new_order = {
            "order_number": "ORD-WORKFLOW-001",
            "customer_name": "Workflow Customer",
            "customer_email": "workflow@example.com",
            "status": "pending",
            "total_amount": 599.99,
            "warehouse_id": test_warehouse.id
        }
        
        create_response = client.post("/api/v1/orders", json=new_order, headers=auth_headers)
        assert create_response.status_code == 201
        order_id = create_response.json()["id"]
        
        # Update to processing
        update_response = client.patch(
            f"/api/v1/orders/{order_id}",
            json={"status": "processing"},
            headers=auth_headers
        )
        assert update_response.status_code == 200
        assert update_response.json()["status"] == "processing"
        
        # Update to shipped
        ship_response = client.patch(
            f"/api/v1/orders/{order_id}",
            json={"status": "shipped"},
            headers=auth_headers
        )
        assert ship_response.status_code == 200
        assert ship_response.json()["status"] == "shipped"
        
        # Verify final state
        get_response = client.get(f"/api/v1/orders/{order_id}", headers=auth_headers)
        assert get_response.status_code == 200
        assert get_response.json()["status"] == "shipped"
