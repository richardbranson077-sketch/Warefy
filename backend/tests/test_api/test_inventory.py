"""
API Tests for Inventory Endpoints
Tests CRUD operations and filtering
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.models_lite import Inventory, Warehouse


@pytest.mark.api
@pytest.mark.unit
class TestInventoryAPI:
    """Test inventory API endpoints"""
    
    def test_get_all_inventory(self, client: TestClient, test_inventory_items: list, auth_headers: dict):
        """Test getting all inventory items"""
        response = client.get("/api/v1/inventory", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        assert data[0]["sku"] == "TEST-SKU-000"
    
    def test_get_inventory_by_id(self, client: TestClient, test_inventory_item: Inventory, auth_headers: dict):
        """Test getting specific inventory item"""
        response = client.get(f"/api/v1/inventory/{test_inventory_item.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["sku"] == test_inventory_item.sku
        assert data["name"] == test_inventory_item.name
    
    def test_get_inventory_not_found(self, client: TestClient, auth_headers: dict):
        """Test getting non-existent inventory item"""
        response = client.get("/api/v1/inventory/99999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_filter_inventory_by_warehouse(
        self,
        client: TestClient,
        test_inventory_items: list,
        test_warehouse: Warehouse,
        auth_headers: dict
    ):
        """Test filtering inventory by warehouse"""
        response = client.get(
            f"/api/v1/inventory?warehouse_id={test_warehouse.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        assert all(item["warehouse_id"] == test_warehouse.id for item in data)
    
    def test_filter_inventory_by_sku(
        self,
        client: TestClient,
        test_inventory_item: Inventory,
        auth_headers: dict
    ):
        """Test filtering inventory by SKU"""
        response = client.get(
            f"/api/v1/inventory?sku={test_inventory_item.sku}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["sku"] == test_inventory_item.sku
    
    def test_create_inventory_item(
        self,
        client: TestClient,
        test_warehouse: Warehouse,
        auth_headers: dict
    ):
        """Test creating new inventory item"""
        new_item = {
            "sku": "NEW-SKU-001",
            "name": "New Product",
            "quantity": 75,
            "warehouse_id": test_warehouse.id,
            "reorder_point": 15,
            "unit_price": 39.99
        }
        
        response = client.post("/api/v1/inventory", json=new_item, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["sku"] == new_item["sku"]
        assert data["quantity"] == new_item["quantity"]
    
    def test_update_inventory_item(
        self,
        client: TestClient,
        test_inventory_item: Inventory,
        auth_headers: dict
    ):
        """Test updating inventory item"""
        update_data = {
            "quantity": 150,
            "unit_price": 34.99
        }
        
        response = client.put(
            f"/api/v1/inventory/{test_inventory_item.id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["quantity"] == 150
        assert data["unit_price"] == 34.99
    
    def test_delete_inventory_item(
        self,
        client: TestClient,
        test_inventory_item: Inventory,
        auth_headers: dict
    ):
        """Test deleting inventory item"""
        response = client.delete(
            f"/api/v1/inventory/{test_inventory_item.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 204
        
        # Verify item is deleted
        get_response = client.get(
            f"/api/v1/inventory/{test_inventory_item.id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404
    
    def test_unauthorized_access(self, client: TestClient):
        """Test accessing inventory without authentication"""
        response = client.get("/api/v1/inventory")
        
        assert response.status_code == 401


@pytest.mark.integration
class TestInventoryIntegration:
    """Integration tests for inventory workflows"""
    
    def test_create_and_update_workflow(
        self,
        client: TestClient,
        test_warehouse: Warehouse,
        auth_headers: dict
    ):
        """Test complete create and update workflow"""
        # Create item
        new_item = {
            "sku": "WORKFLOW-001",
            "name": "Workflow Product",
            "quantity": 100,
            "warehouse_id": test_warehouse.id,
            "reorder_point": 20,
            "unit_price": 49.99
        }
        
        create_response = client.post("/api/v1/inventory", json=new_item, headers=auth_headers)
        assert create_response.status_code == 201
        item_id = create_response.json()["id"]
        
        # Update item
        update_data = {"quantity": 75}
        update_response = client.put(
            f"/api/v1/inventory/{item_id}",
            json=update_data,
            headers=auth_headers
        )
        assert update_response.status_code == 200
        assert update_response.json()["quantity"] == 75
        
        # Verify update persisted
        get_response = client.get(f"/api/v1/inventory/{item_id}", headers=auth_headers)
        assert get_response.status_code == 200
        assert get_response.json()["quantity"] == 75
