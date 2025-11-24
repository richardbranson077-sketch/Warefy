"""
API Tests for Authentication Endpoints
Tests login, registration, and token management
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.models_lite import User
from backend.auth_lite import get_password_hash


@pytest.mark.api
@pytest.mark.auth
class TestAuthenticationAPI:
    """Test authentication API endpoints"""
    
    def test_login_success(self, client: TestClient, test_user: User):
        """Test successful login"""
        response = client.post(
            "/api/v1/auth/token",
            data={"username": "testuser", "password": "testpassword"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self, client: TestClient, test_user: User):
        """Test login with invalid credentials"""
        response = client.post(
            "/api/v1/auth/token",
            data={"username": "testuser", "password": "wrongpassword"}
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent user"""
        response = client.post(
            "/api/v1/auth/token",
            data={"username": "nonexistent", "password": "password"}
        )
        
        assert response.status_code == 401
    
    def test_get_current_user(self, client: TestClient, auth_headers: dict):
        """Test getting current user info"""
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
    
    def test_get_current_user_unauthorized(self, client: TestClient):
        """Test getting current user without token"""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == 401
    
    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401
    
    def test_register_new_user(self, client: TestClient, test_db: Session):
        """Test user registration"""
        new_user = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword123",
            "full_name": "New User"
        }
        
        response = client.post("/api/v1/auth/register", json=new_user)
        
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == new_user["username"]
        assert data["email"] == new_user["email"]
        assert "password" not in data  # Password should not be returned
    
    def test_register_duplicate_username(self, client: TestClient, test_user: User):
        """Test registration with duplicate username"""
        duplicate_user = {
            "username": "testuser",  # Already exists
            "email": "different@example.com",
            "password": "password123",
            "full_name": "Duplicate User"
        }
        
        response = client.post("/api/v1/auth/register", json=duplicate_user)
        
        assert response.status_code == 409  # Conflict
    
    def test_register_duplicate_email(self, client: TestClient, test_user: User):
        """Test registration with duplicate email"""
        duplicate_user = {
            "username": "differentuser",
            "email": "test@example.com",  # Already exists
            "password": "password123",
            "full_name": "Duplicate Email User"
        }
        
        response = client.post("/api/v1/auth/register", json=duplicate_user)
        
        assert response.status_code == 409  # Conflict


@pytest.mark.integration
@pytest.mark.auth
class TestAuthenticationIntegration:
    """Integration tests for authentication workflows"""
    
    def test_complete_auth_workflow(self, client: TestClient):
        """Test complete authentication workflow"""
        # 1. Register new user
        new_user = {
            "username": "workflowuser",
            "email": "workflow@example.com",
            "password": "workflow123",
            "full_name": "Workflow User"
        }
        
        register_response = client.post("/api/v1/auth/register", json=new_user)
        assert register_response.status_code == 201
        
        # 2. Login with new user
        login_response = client.post(
            "/api/v1/auth/token",
            data={"username": "workflowuser", "password": "workflow123"}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # 3. Access protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        me_response = client.get("/api/v1/auth/me", headers=headers)
        assert me_response.status_code == 200
        assert me_response.json()["username"] == "workflowuser"
        
        # 4. Access another protected endpoint
        inventory_response = client.get("/api/v1/inventory", headers=headers)
        assert inventory_response.status_code == 200
    
    def test_token_expiration_handling(self, client: TestClient, test_user: User):
        """Test handling of expired tokens"""
        # This would require mocking time or using a very short expiration
        # For now, we just test with an invalid token
        headers = {"Authorization": "Bearer expired_or_invalid_token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 401
