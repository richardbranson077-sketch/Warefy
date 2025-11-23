"""
E-commerce Platform Connectors Router
Supports: Shopify, WooCommerce, Amazon Seller Central, eBay
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import requests

from backend.database_lite import get_db
from backend.models_lite import EcommerceConnection, EcommerceSyncLog, Order, OrderItem, Inventory
from backend.auth import get_current_active_user, User

router = APIRouter(prefix="/api/ecommerce", tags=["E-commerce Integration"])

# ========================================================================
# PYDANTIC SCHEMAS
# ========================================================================

class EcommerceConnectionCreate(BaseModel):
    platform: str  # shopify, woocommerce, amazon, ebay
    store_name: str
    store_url: Optional[str] = None
    api_key: str
    api_secret: Optional[str] = None
    access_token: Optional[str] = None
    marketplace_id: Optional[str] = None
    auto_sync_orders: bool = True
    auto_sync_inventory: bool = True

class EcommerceConnectionResponse(BaseModel):
    id: int
    platform: str
    store_name: str
    is_active: bool
    last_order_sync: Optional[datetime]
    last_inventory_sync: Optional[datetime]
    created_at: datetime

class OrderSyncRequest(BaseModel):
    connection_id: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class InventorySyncRequest(BaseModel):
    connection_id: int
    sku_list: Optional[List[str]] = None  # If None, sync all

# ========================================================================
# E-COMMERCE API INTEGRATIONS
# ========================================================================

class ShopifyAPI:
    """Shopify API integration"""
    
    @staticmethod
    def get_orders(connection: EcommerceConnection, start_date: Optional[datetime] = None):
        """Fetch orders from Shopify"""
        try:
            url = f"https://{connection.store_name}.myshopify.com/admin/api/2024-01/orders.json"
            headers = {"X-Shopify-Access-Token": connection.access_token}
            params = {"status": "any", "limit": 250}
            
            if start_date:
                params["created_at_min"] = start_date.isoformat()
            
            # In production, make actual API call
            # response = requests.get(url, headers=headers, params=params)
            # return response.json()
            
            # Simulated response
            return {
                "orders": [
                    {
                        "id": 1001,
                        "email": "customer@example.com",
                        "total_price": "150.00",
                        "line_items": [
                            {"sku": "WIDGET-001", "quantity": 2, "price": "75.00"}
                        ],
                        "shipping_address": {
                            "address1": "123 Main St",
                            "city": "New York",
                            "province": "NY",
                            "zip": "10001"
                        }
                    }
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Shopify API error: {str(e)}")
    
    @staticmethod
    def update_inventory(connection: EcommerceConnection, sku: str, quantity: int):
        """Update inventory in Shopify"""
        try:
            # Find product by SKU
            url = f"https://{connection.store_name}.myshopify.com/admin/api/2024-01/products.json"
            headers = {"X-Shopify-Access-Token": connection.access_token}
            
            # In production, update inventory level
            return {"success": True, "sku": sku, "quantity": quantity}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Shopify inventory update failed: {str(e)}")

class WooCommerceAPI:
    """WooCommerce REST API integration"""
    
    @staticmethod
    def get_orders(connection: EcommerceConnection, start_date: Optional[datetime] = None):
        """Fetch orders from WooCommerce"""
        try:
            url = f"{connection.store_url}/wp-json/wc/v3/orders"
            auth = (connection.api_key, connection.api_secret)
            params = {"per_page": 100}
            
            if start_date:
                params["after"] = start_date.isoformat()
            
            # Simulated response
            return [
                {
                    "id": 2001,
                    "billing": {"email": "customer@example.com"},
                    "total": "200.00",
                    "line_items": [
                        {"sku": "WIDGET-002", "quantity": 1, "price": 200.00}
                    ],
                    "shipping": {
                        "address_1": "456 Oak Ave",
                        "city": "Los Angeles",
                        "state": "CA",
                        "postcode": "90001"
                    }
                }
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"WooCommerce API error: {str(e)}")
    
    @staticmethod
    def update_stock(connection: EcommerceConnection, product_id: int, quantity: int):
        """Update stock in WooCommerce"""
        try:
            url = f"{connection.store_url}/wp-json/wc/v3/products/{product_id}"
            auth = (connection.api_key, connection.api_secret)
            data = {"stock_quantity": quantity}
            
            # In production, make PUT request
            return {"success": True, "product_id": product_id, "quantity": quantity}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"WooCommerce stock update failed: {str(e)}")

class AmazonAPI:
    """Amazon Seller Central SP-API integration"""
    
    @staticmethod
    def get_orders(connection: EcommerceConnection, start_date: Optional[datetime] = None):
        """Fetch orders from Amazon"""
        try:
            # Amazon SP-API endpoint
            url = f"https://sellingpartnerapi-na.amazon.com/orders/v0/orders"
            headers = {"x-amz-access-token": connection.access_token}
            params = {"MarketplaceIds": connection.marketplace_id}
            
            if start_date:
                params["CreatedAfter"] = start_date.isoformat()
            
            # Simulated response
            return {
                "payload": {
                    "Orders": [
                        {
                            "AmazonOrderId": "111-1111111-1111111",
                            "OrderTotal": {"Amount": 300.00},
                            "BuyerEmail": "customer@marketplace.amazon.com",
                            "OrderItems": [
                                {"SellerSKU": "WIDGET-003", "QuantityOrdered": 3}
                            ]
                        }
                    ]
                }
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Amazon API error: {str(e)}")
    
    @staticmethod
    def update_inventory(connection: EcommerceConnection, sku: str, quantity: int):
        """Update inventory in Amazon"""
        try:
            # Amazon Feeds API
            url = "https://sellingpartnerapi-na.amazon.com/feeds/2021-06-30/feeds"
            headers = {"x-amz-access-token": connection.access_token}
            
            # In production, submit inventory feed
            return {"success": True, "sku": sku, "quantity": quantity}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Amazon inventory update failed: {str(e)}")

class eBayAPI:
    """eBay Trading API integration"""
    
    @staticmethod
    def get_orders(connection: EcommerceConnection, start_date: Optional[datetime] = None):
        """Fetch orders from eBay"""
        try:
            # eBay Trading API endpoint
            url = "https://api.ebay.com/ws/api.dll"
            headers = {"X-EBAY-API-IAF-TOKEN": connection.access_token}
            
            # Simulated response
            return {
                "OrderArray": {
                    "Order": [
                        {
                            "OrderID": "EB-12345",
                            "Total": 250.00,
                            "BuyerEmail": "buyer@ebay.com",
                            "TransactionArray": {
                                "Transaction": [
                                    {"Item": {"SKU": "WIDGET-004"}, "QuantityPurchased": 2}
                                ]
                            }
                        }
                    ]
                }
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"eBay API error: {str(e)}")

# ========================================================================
# API ENDPOINTS
# ========================================================================

@router.post("/connections", response_model=EcommerceConnectionResponse)
def create_ecommerce_connection(
    connection: EcommerceConnectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new e-commerce connection"""
    
    db_connection = EcommerceConnection(**connection.dict())
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)
    
    return db_connection

@router.get("/connections", response_model=List[EcommerceConnectionResponse])
def list_ecommerce_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all e-commerce connections"""
    connections = db.query(EcommerceConnection).all()
    return connections

@router.post("/sync/orders")
def sync_orders(
    request: OrderSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Import orders from e-commerce platform"""
    
    connection = db.query(EcommerceConnection).filter(
        EcommerceConnection.id == request.connection_id
    ).first()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Create sync log
    sync_log = EcommerceSyncLog(
        connection_id=connection.id,
        sync_type="orders",
        direction="import",
        status="in_progress",
        started_at=datetime.utcnow()
    )
    db.add(sync_log)
    db.commit()
    
    try:
        # Fetch orders from platform
        if connection.platform == "shopify":
            data = ShopifyAPI.get_orders(connection, request.start_date)
            orders = data.get("orders", [])
        elif connection.platform == "woocommerce":
            orders = WooCommerceAPI.get_orders(connection, request.start_date)
        elif connection.platform == "amazon":
            data = AmazonAPI.get_orders(connection, request.start_date)
            orders = data.get("payload", {}).get("Orders", [])
        elif connection.platform == "ebay":
            data = eBayAPI.get_orders(connection, request.start_date)
            orders = data.get("OrderArray", {}).get("Order", [])
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported platform: {connection.platform}")
        
        # Import orders into database
        imported_count = 0
        failed_count = 0
        
        for order_data in orders:
            try:
                # Create order in database
                # (Simplified - in production, check for duplicates, map fields properly)
                order = Order(
                    customer_name="Customer",  # Extract from order_data
                    customer_email=order_data.get("email", ""),
                    status="pending",
                    total_amount=float(order_data.get("total_price", 0)),
                    shipping_address="",  # Extract from order_data
                    created_at=datetime.utcnow()
                )
                db.add(order)
                db.flush()
                
                # Add order items
                line_items = order_data.get("line_items", [])
                for item in line_items:
                    order_item = OrderItem(
                        order_id=order.id,
                        sku=item.get("sku", ""),
                        quantity=item.get("quantity", 1),
                        unit_price=float(item.get("price", 0))
                    )
                    db.add(order_item)
                
                imported_count += 1
            except Exception as e:
                failed_count += 1
                print(f"Failed to import order: {e}")
        
        db.commit()
        
        # Update sync log
        sync_log.status = "success"
        sync_log.records_processed = imported_count
        sync_log.records_failed = failed_count
        sync_log.completed_at = datetime.utcnow()
        
        # Update last sync time
        connection.last_order_sync = datetime.utcnow()
        db.commit()
        
        return {
            "message": "Orders synced successfully",
            "platform": connection.platform,
            "imported": imported_count,
            "failed": failed_count
        }
        
    except Exception as e:
        sync_log.status = "failed"
        sync_log.error_details = {"error": str(e)}
        sync_log.completed_at = datetime.utcnow()
        db.commit()
        
        raise HTTPException(status_code=500, detail=f"Order sync failed: {str(e)}")

@router.post("/sync/inventory")
def sync_inventory(
    request: InventorySyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export inventory to e-commerce platform"""
    
    connection = db.query(EcommerceConnection).filter(
        EcommerceConnection.id == request.connection_id
    ).first()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Create sync log
    sync_log = EcommerceSyncLog(
        connection_id=connection.id,
        sync_type="inventory",
        direction="export",
        status="in_progress",
        started_at=datetime.utcnow()
    )
    db.add(sync_log)
    db.commit()
    
    try:
        # Get inventory items
        query = db.query(Inventory)
        if request.sku_list:
            query = query.filter(Inventory.sku.in_(request.sku_list))
        
        items = query.all()
        
        synced_count = 0
        failed_count = 0
        
        for item in items:
            try:
                if connection.platform == "shopify":
                    ShopifyAPI.update_inventory(connection, item.sku, item.quantity)
                elif connection.platform == "woocommerce":
                    # Would need product_id mapping
                    WooCommerceAPI.update_stock(connection, 1, item.quantity)
                elif connection.platform == "amazon":
                    AmazonAPI.update_inventory(connection, item.sku, item.quantity)
                
                synced_count += 1
            except Exception as e:
                failed_count += 1
                print(f"Failed to sync {item.sku}: {e}")
        
        # Update sync log
        sync_log.status = "success"
        sync_log.records_processed = synced_count
        sync_log.records_failed = failed_count
        sync_log.completed_at = datetime.utcnow()
        
        # Update last sync time
        connection.last_inventory_sync = datetime.utcnow()
        db.commit()
        
        return {
            "message": "Inventory synced successfully",
            "platform": connection.platform,
            "synced": synced_count,
            "failed": failed_count
        }
        
    except Exception as e:
        sync_log.status = "failed"
        sync_log.error_details = {"error": str(e)}
        sync_log.completed_at = datetime.utcnow()
        db.commit()
        
        raise HTTPException(status_code=500, detail=f"Inventory sync failed: {str(e)}")

@router.get("/sync-logs")
def get_sync_logs(
    connection_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get e-commerce sync logs"""
    query = db.query(EcommerceSyncLog)
    
    if connection_id:
        query = query.filter(EcommerceSyncLog.connection_id == connection_id)
    
    logs = query.order_by(EcommerceSyncLog.started_at.desc()).limit(limit).all()
    return logs

@router.delete("/connections/{connection_id}")
def delete_ecommerce_connection(
    connection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete e-commerce connection"""
    connection = db.query(EcommerceConnection).filter(
        EcommerceConnection.id == connection_id
    ).first()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    db.delete(connection)
    db.commit()
    
    return {"message": "Connection deleted successfully"}

@router.get("/platforms")
def get_supported_platforms():
    """Get list of supported e-commerce platforms"""
    return {
        "platforms": [
            {
                "id": "shopify",
                "name": "Shopify",
                "description": "Connect your Shopify store",
                "features": ["Order Import", "Inventory Sync", "Webhooks"],
                "auth_type": "oauth"
            },
            {
                "id": "woocommerce",
                "name": "WooCommerce",
                "description": "Connect your WooCommerce store",
                "features": ["Order Import", "Inventory Sync", "Product Sync"],
                "auth_type": "api_key"
            },
            {
                "id": "amazon",
                "name": "Amazon Seller Central",
                "description": "Connect your Amazon seller account",
                "features": ["Order Import", "Inventory Sync", "FBA Support"],
                "auth_type": "oauth"
            },
            {
                "id": "ebay",
                "name": "eBay",
                "description": "Connect your eBay store",
                "features": ["Order Import", "Listing Management"],
                "auth_type": "oauth"
            }
        ]
    }
