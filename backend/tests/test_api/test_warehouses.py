"""
API Tests for Warehouses Endpoints
Tests CRUD operations for warehouses
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.models_lite import Warehouse


@pytest.mark.api
@pytest.mark.unit
class TestWarehousesAPI:
    """Test warehouses API endpoints"""
    
    def test_get_all_warehouses(self, client: TestClient, test_warehouse: Warehouse, auth_headers: dict):
        """Test getting all warehouses"""
        response = client.get("/api/v1/warehouses", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(wh["name"] == "Test Warehouse" for wh in data)
    
    def test_get_warehouse_by_id(self, client: TestClient, test_warehouse: Warehouse, auth_headers: dict):
        """Test getting specific warehouse"""
        response = client.get(f"/api/v1/warehouses/{test_warehouse.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == test_warehouse.name
        assert data["location"] == test_warehouse.location
    
    def test_get_warehouse_not_found(self, client: TestClient, auth_headers: dict):
        """Test getting non-existent warehouse"""
        response = client.get("/api/v1/warehouses/99999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_create_warehouse(self, client: TestClient, auth_headers: dict):
        """Test creating new warehouse"""
        new_warehouse = {
            "name": "New Warehouse",
            "location": "New City",
            "capacity": 15000
        }
        
        response = client.post("/api/v1/warehouses", json=new_warehouse, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == new_warehouse["name"]
        assert data["location"] == new_warehouse["location"]
        assert data["capacity"] == new_warehouse["capacity"]
    
    def test_update_warehouse(self, client: TestClient, test_warehouse: Warehouse, auth_headers: dict):
        """Test updating warehouse"""
        update_data = {
            "capacity": 20000,
            "location": "Updated City"
        }
        
        response = client.put(
            f"/api/v1/warehouses/{test_warehouse.id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["capacity"] == 20000
        assert data["location"] == "Updated City"
    
    def test_delete_warehouse(self, client: TestClient, test_warehouse: Warehouse, auth_headers: dict):
        """Test deleting warehouse"""
        response = client.delete(
            f"/api/v1/warehouses/{test_warehouse.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 204
        
        # Verify warehouse is deleted
        get_response = client.get(
            f"/api/v1/warehouses/{test_warehouse.id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404
    
    def test_unauthorized_access(self, client: TestClient):
        """Test accessing warehouses without authentication"""
        response = client.get("/api/v1/warehouses")
        
        assert response.status_code == 401


@pytest.mark.integration
class TestWarehousesIntegration:
    """Integration tests for warehouses workflows"""
    
    def test_warehouse_with_inventory(
        self,
        client: TestClient,
        test_warehouse: Warehouse,
        test_inventory_items: list,
        auth_headers: dict
    ):
        """Test warehouse with inventory items"""
        # Get warehouse
        warehouse_response = client.get(
            f"/api/v1/warehouses/{test_warehouse.id}",
            headers=auth_headers
        )
        assert warehouse_response.status_code == 200
        
        # Get inventory for warehouse
        inventory_response = client.get(
            f"/api/v1/inventory?warehouse_id={test_warehouse.id}",
            headers=auth_headers
        )
        assert inventory_response.status_code == 200
        inventory_data = inventory_response.json()
        assert len(inventory_data) == 5  # test_inventory_items creates 5 items
        
        # Get warehouse summary
        summary_response = client.get(
            f"/api/v1/inventory/warehouse/{test_warehouse.id}/summary",
            headers=auth_headers
        )
        assert summary_response.status_code == 200
        summary = summary_response.json()
        assert summary["total_items"] == 5
        assert summary["warehouse_name"] == test_warehouse.name
