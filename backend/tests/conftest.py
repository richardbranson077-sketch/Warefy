"""
Pytest Configuration and Fixtures
Provides test database, client, and mock data
"""

import pytest
import os
import sys
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database_lite import Base, get_db
from backend.main_lite import app
from backend.models_lite import User, Warehouse, Inventory, Order
from backend.auth_lite import get_password_hash


# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def test_db() -> Generator[Session, None, None]:
    """
    Create a test database session
    
    Yields:
        Database session for testing
    """
    # Create test engine
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with test database
    
    Args:
        test_db: Test database session
        
    Yields:
        FastAPI test client
    """
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(test_db: Session) -> User:
    """
    Create a test user
    
    Args:
        test_db: Test database session
        
    Returns:
        Test user instance
    """
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword"),
        full_name="Test User",
        role="admin",
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture(scope="function")
def auth_headers(client: TestClient, test_user: User) -> dict:
    """
    Get authentication headers for test user
    
    Args:
        client: Test client
        test_user: Test user
        
    Returns:
        Headers with authentication token
    """
    response = client.post(
        "/api/v1/auth/token",
        data={"username": "testuser", "password": "testpassword"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def test_warehouse(test_db: Session) -> Warehouse:
    """
    Create a test warehouse
    
    Args:
        test_db: Test database session
        
    Returns:
        Test warehouse instance
    """
    warehouse = Warehouse(
        name="Test Warehouse",
        location="Test City",
        capacity=10000
    )
    test_db.add(warehouse)
    test_db.commit()
    test_db.refresh(warehouse)
    return warehouse


@pytest.fixture(scope="function")
def test_inventory_item(test_db: Session, test_warehouse: Warehouse) -> Inventory:
    """
    Create a test inventory item
    
    Args:
        test_db: Test database session
        test_warehouse: Test warehouse
        
    Returns:
        Test inventory item
    """
    item = Inventory(
        sku="TEST-SKU-001",
        name="Test Product",
        quantity=100,
        warehouse_id=test_warehouse.id,
        reorder_point=20,
        unit_price=29.99
    )
    test_db.add(item)
    test_db.commit()
    test_db.refresh(item)
    return item


@pytest.fixture(scope="function")
def test_inventory_items(test_db: Session, test_warehouse: Warehouse) -> list[Inventory]:
    """
    Create multiple test inventory items
    
    Args:
        test_db: Test database session
        test_warehouse: Test warehouse
        
    Returns:
        List of test inventory items
    """
    items = []
    for i in range(5):
        item = Inventory(
            sku=f"TEST-SKU-{i:03d}",
            name=f"Test Product {i}",
            quantity=100 + i * 10,
            warehouse_id=test_warehouse.id,
            reorder_point=20,
            unit_price=29.99 + i
        )
        test_db.add(item)
        items.append(item)
    
    test_db.commit()
    for item in items:
        test_db.refresh(item)
    
    return items


# Mock data generators

def generate_mock_user_data() -> dict:
    """Generate mock user data"""
    return {
        "username": "mockuser",
        "email": "mock@example.com",
        "password": "mockpassword123",
        "full_name": "Mock User",
        "role": "manager"
    }


def generate_mock_inventory_data(warehouse_id: int) -> dict:
    """Generate mock inventory data"""
    return {
        "sku": "MOCK-SKU-001",
        "name": "Mock Product",
        "quantity": 50,
        "warehouse_id": warehouse_id,
        "reorder_point": 10,
        "unit_price": 19.99
    }


def generate_mock_warehouse_data() -> dict:
    """Generate mock warehouse data"""
    return {
        "name": "Mock Warehouse",
        "location": "Mock City",
        "capacity": 5000
    }
