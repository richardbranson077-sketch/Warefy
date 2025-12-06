"""
ERP Integration Hub Router
Supports: QuickBooks Online, Xero, SAP Business One, NetSuite, 
Microsoft Dynamics 365, Sage Intacct, Oracle ERP Cloud, Odoo, Zoho Books
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import requests
import os
import json
try:
    import google.generativeai as genai
except ImportError:
    genai = None

from backend.database_lite import get_db
from backend.models_lite import ERPConnection, ERPSyncLog, Order, Inventory
from backend.auth_lite import get_current_active_user
from backend.models_lite import User

router = APIRouter(prefix="/api/v1/erp", tags=["ERP Integration"])

# ========================================================================
# PYDANTIC SCHEMAS
# ========================================================================

class ERPConnectionCreate(BaseModel):
    erp_type: str  # quickbooks, xero, sap, netsuite
    company_id: str
    access_token: str
    refresh_token: Optional[str] = None
    realm_id: Optional[str] = None
    tenant_id: Optional[str] = None
    sync_frequency: str = "hourly"
    sync_settings: dict = {}

class ERPConnectionResponse(BaseModel):
    id: int
    erp_type: str
    company_id: str
    is_active: bool
    last_sync: Optional[datetime]
    sync_frequency: str
    created_at: datetime

class SyncRequest(BaseModel):
    connection_id: int
    sync_types: List[str]  # invoice, purchase_order, inventory, customer

class SyncLogResponse(BaseModel):
    id: int
    sync_type: str
    direction: str
    status: str
    records_processed: int
    records_failed: int
    started_at: datetime
    completed_at: Optional[datetime]

class FieldMappingRequest(BaseModel):
    erp_fields: List[str]
    warefy_fields: List[str]

class MappingSuggestion(BaseModel):
    erp_field: str
    warefy_field: str
    confidence: float
    reasoning: str

class Discrepancy(BaseModel):
    id: str
    type: str  # inventory, order_status, price
    item_id: str
    erp_value: str
    warefy_value: str
    erp_source: str
    detected_at: datetime

class ResolveDiscrepancyRequest(BaseModel):
    discrepancy_id: str
    resolution: str  # accept_erp, keep_warefy, manual
    manual_value: Optional[str] = None

# ========================================================================
# ERP API INTEGRATIONS
# ========================================================================

class QuickBooksAPI:
    """QuickBooks Online API integration"""
    
    BASE_URL = "https://quickbooks.api.intuit.com/v3/company"
    
    @staticmethod
    def get_invoices(connection: ERPConnection):
        """Fetch invoices from QuickBooks"""
        try:
            url = f"{QuickBooksAPI.BASE_URL}/{connection.realm_id}/query"
            headers = {"Authorization": f"Bearer {connection.access_token}"}
            params = {"query": "SELECT * FROM Invoice MAXRESULTS 100"}
            
            # In production, make actual API call
            # response = requests.get(url, headers=headers, params=params)
            # return response.json()
            
            # Simulated response
            return {
                "QueryResponse": {
                    "Invoice": [
                        {"Id": "1", "TotalAmt": 1500.00, "CustomerRef": {"value": "1"}},
                        {"Id": "2", "TotalAmt": 2300.00, "CustomerRef": {"value": "2"}}
                    ]
                }
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"QuickBooks API error: {str(e)}")
    
    @staticmethod
    def create_invoice(connection: ERPConnection, invoice_data: dict):
        """Create invoice in QuickBooks"""
        try:
            url = f"{QuickBooksAPI.BASE_URL}/{connection.realm_id}/invoice"
            headers = {
                "Authorization": f"Bearer {connection.access_token}",
                "Content-Type": "application/json"
            }
            
            # In production, make actual API call
            # response = requests.post(url, headers=headers, json=invoice_data)
            # return response.json()
            
            return {"Invoice": {"Id": "123", "SyncToken": "0"}}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"QuickBooks invoice creation failed: {str(e)}")
    
    @staticmethod
    def sync_inventory(connection: ERPConnection, db: Session):
        """Sync inventory to QuickBooks"""
        try:
            # Get all inventory items
            items = db.query(Inventory).all()
            
            synced_count = 0
            failed_count = 0
            
            for item in items:
                try:
                    # Create/update item in QuickBooks
                    item_data = {
                        "Name": item.product_name,
                        "Sku": item.sku,
                        "QtyOnHand": item.quantity,
                        "InvStartDate": datetime.now().isoformat()
                    }
                    
                    # In production, make actual API call
                    synced_count += 1
                except Exception as e:
                    failed_count += 1
                    print(f"Failed to sync {item.sku}: {e}")
            
            return {"synced": synced_count, "failed": failed_count}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Inventory sync failed: {str(e)}")

class XeroAPI:
    """Xero API integration"""
    
    BASE_URL = "https://api.xero.com/api.xro/2.0"
    
    @staticmethod
    def get_invoices(connection: ERPConnection):
        """Fetch invoices from Xero"""
        try:
            url = f"{XeroAPI.BASE_URL}/Invoices"
            headers = {
                "Authorization": f"Bearer {connection.access_token}",
                "Xero-tenant-id": connection.tenant_id
            }
            
            # Simulated response
            return {
                "Invoices": [
                    {"InvoiceID": "1", "Total": 1500.00, "Status": "PAID"},
                    {"InvoiceID": "2", "Total": 2300.00, "Status": "DRAFT"}
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Xero API error: {str(e)}")
    
    @staticmethod
    def sync_contacts(connection: ERPConnection, db: Session):
        """Sync contacts/customers to Xero"""
        try:
            # Get unique customers from orders
            customers = db.query(Order.customer_name, Order.customer_email).distinct().all()
            
            synced_count = 0
            for customer in customers:
                contact_data = {
                    "Name": customer.customer_name,
                    "EmailAddress": customer.customer_email
                }
                # In production, create contact in Xero
                synced_count += 1
            
            return {"synced": synced_count, "failed": 0}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Contact sync failed: {str(e)}")

class SAPAPI:
    """SAP Business One Service Layer API integration"""
    
    @staticmethod
    def get_purchase_orders(connection: ERPConnection):
        """Fetch purchase orders from SAP"""
        try:
            # SAP Service Layer endpoint
            url = f"{connection.company_id}/b1s/v1/PurchaseOrders"
            headers = {"Authorization": f"Bearer {connection.access_token}"}
            
            # Simulated response
            return {
                "value": [
                    {"DocEntry": 1, "DocTotal": 5000.00, "CardName": "Supplier A"},
                    {"DocEntry": 2, "DocTotal": 3500.00, "CardName": "Supplier B"}
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"SAP API error: {str(e)}")

class NetSuiteAPI:
    """NetSuite SuiteTalk REST API integration"""
    
    @staticmethod
    def get_sales_orders(connection: ERPConnection):
        """Fetch sales orders from NetSuite"""
        try:
            # NetSuite REST API endpoint
            url = f"{connection.company_id}/services/rest/record/v1/salesOrder"
            headers = {"Authorization": f"Bearer {connection.access_token}"}
            
            # Simulated response
            return {
                "items": [
                    {"id": "1", "total": 2500.00, "status": "Pending Fulfillment"},
                    {"id": "2", "total": 1800.00, "status": "Billed"}
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"NetSuite API error: {str(e)}")

@router.get("/status")
def get_erp_status():
    """Get ERP system status (Mock for dashboard)"""
    return {
        "systems": [
            {"id": 1, "name": "SAP", "status": "connected"},
            {"id": 2, "name": "Oracle", "status": "disconnected"}
        ],
        "totalSyncs": 150,
        "lastSyncTime": datetime.utcnow().isoformat()
    }

class MicrosoftDynamics365API:
    """Microsoft Dynamics 365 Business Central API integration"""
    
    BASE_URL = "https://api.businesscentral.dynamics.com/v2.0"
    
    @staticmethod
    def get_sales_invoices(connection: ERPConnection):
        """Fetch sales invoices from Dynamics 365"""
        try:
            url = f"{MicrosoftDynamics365API.BASE_URL}/{connection.tenant_id}/api/v2.0/salesInvoices"
            headers = {"Authorization": f"Bearer {connection.access_token}"}
            
            # Simulated response
            return {
                "value": [
                    {"id": "1", "number": "INV-001", "totalAmountIncludingTax": 3500.00},
                    {"id": "2", "number": "INV-002", "totalAmountIncludingTax": 2800.00}
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Dynamics 365 API error: {str(e)}")
    
    @staticmethod
    def sync_items(connection: ERPConnection, db: Session):
        """Sync items/products to Dynamics 365"""
        try:
            items = db.query(Inventory).all()
            synced_count = 0
            
            for item in items:
                item_data = {
                    "number": item.sku,
                    "displayName": item.product_name,
                    "type": "Inventory",
                    "unitPrice": item.unit_price
                }
                # In production, POST to /items endpoint
                synced_count += 1
            
            return {"synced": synced_count, "failed": 0}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Dynamics 365 sync failed: {str(e)}")

class SageIntacctAPI:
    """Sage Intacct API integration"""
    
    BASE_URL = "https://api.intacct.com/ia/xml/xmlgw.phtml"
    
    @staticmethod
    def get_ar_invoices(connection: ERPConnection):
        """Fetch AR invoices from Sage Intacct"""
        try:
            # Sage Intacct uses XML API
            # Simulated response
            return {
                "arinvoice": [
                    {"RECORDNO": "1", "TOTALENTERED": 4200.00, "STATE": "Posted"},
                    {"RECORDNO": "2", "TOTALENTERED": 3100.00, "STATE": "Draft"}
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Sage Intacct API error: {str(e)}")
    
    @staticmethod
    def sync_customers(connection: ERPConnection, db: Session):
        """Sync customers to Sage Intacct"""
        try:
            customers = db.query(Order.customer_name, Order.customer_email).distinct().all()
            synced_count = 0
            
            for customer in customers:
                customer_data = {
                    "NAME": customer.customer_name,
                    "EMAIL1": customer.customer_email
                }
                # In production, create customer via XML API
                synced_count += 1
            
            return {"synced": synced_count, "failed": 0}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Sage Intacct sync failed: {str(e)}")

class OracleERPCloudAPI:
    """Oracle ERP Cloud REST API integration"""
    
    @staticmethod
    def get_purchase_orders(connection: ERPConnection):
        """Fetch purchase orders from Oracle ERP Cloud"""
        try:
            url = f"{connection.company_id}/fscmRestApi/resources/11.13.18.05/purchaseOrders"
            headers = {"Authorization": f"Bearer {connection.access_token}"}
            
            # Simulated response
            return {
                "items": [
                    {"OrderNumber": "PO-001", "TotalAmount": 15000.00, "Status": "Approved"},
                    {"OrderNumber": "PO-002", "TotalAmount": 12500.00, "Status": "In Process"}
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Oracle ERP Cloud API error: {str(e)}")
    
    @staticmethod
    def sync_suppliers(connection: ERPConnection, db: Session):
        """Sync suppliers to Oracle ERP Cloud"""
        try:
            # Get unique suppliers from inventory
            suppliers = db.query(Inventory.supplier).distinct().filter(Inventory.supplier.isnot(None)).all()
            synced_count = 0
            
            for supplier in suppliers:
                supplier_data = {
                    "SupplierName": supplier[0],
                    "SupplierType": "PURCHASE"
                }
                # In production, POST to suppliers endpoint
                synced_count += 1
            
            return {"synced": synced_count, "failed": 0}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Oracle ERP Cloud sync failed: {str(e)}")

class OdooAPI:
    """Odoo (OpenERP) XML-RPC API integration"""
    
    @staticmethod
    def get_sale_orders(connection: ERPConnection):
        """Fetch sale orders from Odoo"""
        try:
            # Odoo uses XML-RPC
            # Simulated response
            return {
                "sale_orders": [
                    {"id": 1, "name": "SO001", "amount_total": 2800.00, "state": "sale"},
                    {"id": 2, "name": "SO002", "amount_total": 3200.00, "state": "draft"}
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Odoo API error: {str(e)}")
    
    @staticmethod
    def sync_products(connection: ERPConnection, db: Session):
        """Sync products to Odoo"""
        try:
            items = db.query(Inventory).all()
            synced_count = 0
            
            for item in items:
                product_data = {
                    "name": item.product_name,
                    "default_code": item.sku,
                    "list_price": item.unit_price,
                    "type": "product"
                }
                # In production, create via XML-RPC
                synced_count += 1
            
            return {"synced": synced_count, "failed": 0}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Odoo sync failed: {str(e)}")

class ZohoBooksAPI:
    """Zoho Books API integration"""
    
    BASE_URL = "https://books.zoho.com/api/v3"
    
    @staticmethod
    def get_invoices(connection: ERPConnection):
        """Fetch invoices from Zoho Books"""
        try:
            url = f"{ZohoBooksAPI.BASE_URL}/invoices"
            headers = {
                "Authorization": f"Zoho-oauthtoken {connection.access_token}",
                "X-com-zoho-books-organizationid": connection.company_id
            }
            
            # Simulated response
            return {
                "invoices": [
                    {"invoice_id": "1", "invoice_number": "INV-001", "total": 1900.00},
                    {"invoice_id": "2", "invoice_number": "INV-002", "total": 2400.00}
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Zoho Books API error: {str(e)}")
    
    @staticmethod
    def sync_items(connection: ERPConnection, db: Session):
        """Sync items to Zoho Books"""
        try:
            items = db.query(Inventory).all()
            synced_count = 0
            
            for item in items:
                item_data = {
                    "name": item.product_name,
                    "sku": item.sku,
                    "rate": item.unit_price,
                    "account_name": "Inventory Asset"
                }
                # In production, POST to /items endpoint
                synced_count += 1
            
            return {"synced": synced_count, "failed": 0}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Zoho Books sync failed: {str(e)}")

# ========================================================================
# API ENDPOINTS
# ========================================================================

@router.post("/connections", response_model=ERPConnectionResponse)
def create_erp_connection(
    connection: ERPConnectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new ERP connection"""
    
    # Check if connection already exists
    existing = db.query(ERPConnection).filter(
        ERPConnection.erp_type == connection.erp_type
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail=f"{connection.erp_type} connection already exists")
    
    db_connection = ERPConnection(**connection.dict())
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)
    
    return db_connection

@router.get("/connections", response_model=List[ERPConnectionResponse])
def list_erp_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all ERP connections"""
    connections = db.query(ERPConnection).all()
    return connections

@router.get("/connections/{connection_id}")
def get_erp_connection(
    connection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get ERP connection details"""
    connection = db.query(ERPConnection).filter(ERPConnection.id == connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    return connection

@router.post("/sync")
def sync_erp_data(
    request: SyncRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Sync data with ERP system"""
    
    # Get connection
    connection = db.query(ERPConnection).filter(ERPConnection.id == request.connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    if not connection.is_active:
        raise HTTPException(status_code=400, detail="Connection is inactive")
    
    # Perform sync for each type
    results = []
    
    for sync_type in request.sync_types:
        # Create sync log
        sync_log = ERPSyncLog(
            connection_id=connection.id,
            sync_type=sync_type,
            direction="from_erp",
            status="in_progress",
            started_at=datetime.utcnow()
        )
        db.add(sync_log)
        db.commit()
        db.refresh(sync_log)
        
        try:
            if connection.erp_type == "quickbooks":
                if sync_type == "invoice":
                    data = QuickBooksAPI.get_invoices(connection)
                    records_processed = len(data.get("QueryResponse", {}).get("Invoice", []))
                elif sync_type == "inventory":
                    result = QuickBooksAPI.sync_inventory(connection, db)
                    records_processed = result["synced"]
                else:
                    records_processed = 0
                    
            elif connection.erp_type == "xero":
                if sync_type == "invoice":
                    data = XeroAPI.get_invoices(connection)
                    records_processed = len(data.get("Invoices", []))
                elif sync_type == "customer":
                    result = XeroAPI.sync_contacts(connection, db)
                    records_processed = result["synced"]
                else:
                    records_processed = 0
                    
            elif connection.erp_type == "sap":
                if sync_type == "purchase_order":
                    data = SAPAPI.get_purchase_orders(connection)
                    records_processed = len(data.get("value", []))
                else:
                    records_processed = 0
                    
            elif connection.erp_type == "netsuite":
                if sync_type == "sales_order":
                    data = NetSuiteAPI.get_sales_orders(connection)
                    records_processed = len(data.get("items", []))
                else:
                    records_processed = 0
                    
            elif connection.erp_type == "dynamics365":
                if sync_type == "invoice":
                    data = MicrosoftDynamics365API.get_sales_invoices(connection)
                    records_processed = len(data.get("value", []))
                elif sync_type == "inventory":
                    result = MicrosoftDynamics365API.sync_items(connection, db)
                    records_processed = result["synced"]
                else:
                    records_processed = 0
                    
            elif connection.erp_type == "sage_intacct":
                if sync_type == "invoice":
                    data = SageIntacctAPI.get_ar_invoices(connection)
                    records_processed = len(data.get("arinvoice", []))
                elif sync_type == "customer":
                    result = SageIntacctAPI.sync_customers(connection, db)
                    records_processed = result["synced"]
                else:
                    records_processed = 0
                    
            elif connection.erp_type == "oracle_erp":
                if sync_type == "purchase_order":
                    data = OracleERPCloudAPI.get_purchase_orders(connection)
                    records_processed = len(data.get("items", []))
                elif sync_type == "supplier":
                    result = OracleERPCloudAPI.sync_suppliers(connection, db)
                    records_processed = result["synced"]
                else:
                    records_processed = 0
                    
            elif connection.erp_type == "odoo":
                if sync_type == "sales_order":
                    data = OdooAPI.get_sale_orders(connection)
                    records_processed = len(data.get("sale_orders", []))
                elif sync_type == "inventory":
                    result = OdooAPI.sync_products(connection, db)
                    records_processed = result["synced"]
                else:
                    records_processed = 0
                    
            elif connection.erp_type == "zoho_books":
                if sync_type == "invoice":
                    data = ZohoBooksAPI.get_invoices(connection)
                    records_processed = len(data.get("invoices", []))
                elif sync_type == "inventory":
                    result = ZohoBooksAPI.sync_items(connection, db)
                    records_processed = result["synced"]
                else:
                    records_processed = 0
            else:
                records_processed = 0
            
            # Update sync log
            sync_log.status = "success"
            sync_log.records_processed = records_processed
            sync_log.records_failed = 0
            sync_log.completed_at = datetime.utcnow()
            
            results.append({
                "sync_type": sync_type,
                "status": "success",
                "records_processed": records_processed
            })
            
        except Exception as e:
            sync_log.status = "failed"
            sync_log.error_details = {"error": str(e)}
            sync_log.completed_at = datetime.utcnow()
            
            results.append({
                "sync_type": sync_type,
                "status": "failed",
                "error": str(e)
            })
        
        db.commit()
    
    # Update last sync time
    connection.last_sync = datetime.utcnow()
    db.commit()
    
    return {
        "message": "Sync completed",
        "connection_id": connection.id,
        "erp_type": connection.erp_type,
        "results": results
    }

@router.get("/sync-logs", response_model=List[SyncLogResponse])
def get_sync_logs(
    connection_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get ERP sync logs"""
    query = db.query(ERPSyncLog)
    
    if connection_id:
        query = query.filter(ERPSyncLog.connection_id == connection_id)
    
    logs = query.order_by(ERPSyncLog.started_at.desc()).limit(limit).all()
    return logs

@router.delete("/connections/{connection_id}")
def delete_erp_connection(
    connection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete ERP connection"""
    connection = db.query(ERPConnection).filter(ERPConnection.id == connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    db.delete(connection)
    db.commit()
    
    return {"message": "Connection deleted successfully"}

@router.get("/oauth/quickbooks/url")
def get_quickbooks_oauth_url(
    redirect_uri: str = "http://localhost:3000/dashboard/erp/callback"
):
    """Get QuickBooks OAuth authorization URL"""
    client_id = os.getenv("QUICKBOOKS_CLIENT_ID", "YOUR_CLIENT_ID")
    scope = "com.intuit.quickbooks.accounting"
    
    auth_url = (
        f"https://appcenter.intuit.com/connect/oauth2?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope={scope}&"
        f"state=security_token"
    )
    
    return {"authorization_url": auth_url}

@router.get("/oauth/xero/url")
def get_xero_oauth_url(
    redirect_uri: str = "http://localhost:3000/dashboard/erp/callback"
):
    """Get Xero OAuth authorization URL"""
    client_id = os.getenv("XERO_CLIENT_ID", "YOUR_CLIENT_ID")
    scope = "accounting.transactions accounting.contacts"
    
    auth_url = (
        f"https://login.xero.com/identity/connect/authorize?"
        f"response_type=code&"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope={scope}&"
        f"state=security_token"
    )
    
    return {"authorization_url": auth_url}

# ========================================================================
# AI & DISCREPANCY ENDPOINTS
# ========================================================================

@router.post("/ai-mapping", response_model=List[MappingSuggestion])
async def suggest_field_mapping(
    request: FieldMappingRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Use Gemini AI to suggest field mappings between ERP and Warefy"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not genai:
        # Mock fallback if no AI
        return [
            MappingSuggestion(erp_field=f, warefy_field="unknown", confidence=0.0, reasoning="AI not configured")
            for f in request.erp_fields
        ]
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')
    
    prompt = f"""
    Map these ERP fields to the most likely Warefy fields.
    
    ERP Fields: {request.erp_fields}
    Warefy Fields: {request.warefy_fields}
    
    Return a JSON array of objects with keys: erp_field, warefy_field, confidence (0.0-1.0), reasoning.
    Only map fields where you are reasonably confident.
    """
    
    try:
        response = await model.generate_content_async(prompt)
        text = response.text.strip().replace('```json', '').replace('```', '')
        data = json.loads(text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Mapping failed: {str(e)}")

@router.get("/discrepancies", response_model=List[Discrepancy])
def get_data_discrepancies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Detect data discrepancies between Warefy and connected ERPs"""
    # In a real app, this would compare live data. 
    # For demo, we'll generate realistic mock discrepancies based on DB items.
    
    discrepancies = []
    items = db.query(Inventory).limit(5).all()
    
    for i, item in enumerate(items):
        if i % 2 == 0: # Create discrepancy for every other item
            discrepancies.append(Discrepancy(
                id=f"disc_{item.id}",
                type="inventory",
                item_id=item.sku,
                erp_value=str(item.quantity + 5),
                warefy_value=str(item.quantity),
                erp_source="SAP Business One",
                detected_at=datetime.utcnow()
            ))
            
    return discrepancies

@router.post("/resolve-discrepancy")
def resolve_discrepancy(
    request: ResolveDiscrepancyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Resolve a data discrepancy"""
    # Logic to update DB based on resolution
    return {"status": "resolved", "resolution": request.resolution, "id": request.discrepancy_id}
