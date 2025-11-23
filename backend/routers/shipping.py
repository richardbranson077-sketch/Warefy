"""
Multi-Carrier Shipping Integration Router
Supports: FedEx, UPS, USPS, DHL
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import os
import requests

from backend.database_lite import get_db
from backend.models_lite import Shipment, CarrierAccount, Order
from backend.auth import get_current_active_user, User

router = APIRouter(prefix="/api/shipping", tags=["Shipping"])

# ========================================================================
# PYDANTIC SCHEMAS
# ========================================================================

class Address(BaseModel):
    name: str
    company: Optional[str] = None
    street1: str
    street2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str = "US"
    phone: Optional[str] = None
    email: Optional[str] = None

class PackageDetails(BaseModel):
    weight: float  # in pounds
    length: float  # in inches
    width: float
    height: float
    insurance_value: Optional[float] = None

class RateRequest(BaseModel):
    from_address: Address
    to_address: Address
    package: PackageDetails
    carriers: Optional[List[str]] = None  # If None, get rates from all carriers

class RateResponse(BaseModel):
    carrier: str
    service_type: str
    cost: float
    estimated_days: int
    estimated_delivery: Optional[str] = None

class ShipmentRequest(BaseModel):
    order_id: int
    carrier: str
    service_type: str
    from_address: Address
    to_address: Address
    package: PackageDetails

class ShipmentResponse(BaseModel):
    id: int
    tracking_number: str
    label_url: str
    cost: float
    estimated_delivery: Optional[datetime]
    carrier: str
    service_type: str

class CarrierAccountCreate(BaseModel):
    carrier: str
    account_number: str
    api_key: str
    api_secret: Optional[str] = None
    meter_number: Optional[str] = None
    user_id: Optional[str] = None
    is_test_mode: bool = True

# ========================================================================
# CARRIER API INTEGRATIONS
# ========================================================================

class FedExAPI:
    """FedEx API integration"""
    
    @staticmethod
    def get_rates(from_addr: Address, to_addr: Address, package: PackageDetails, account: CarrierAccount):
        """Get FedEx shipping rates"""
        # This is a simplified example. Real implementation would use FedEx API
        # You would need to install: pip install fedex
        
        try:
            # Simulated response for demo
            return [
                {"service_type": "FEDEX_GROUND", "cost": 12.50, "estimated_days": 5},
                {"service_type": "FEDEX_2_DAY", "cost": 25.00, "estimated_days": 2},
                {"service_type": "FEDEX_OVERNIGHT", "cost": 45.00, "estimated_days": 1},
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"FedEx API error: {str(e)}")
    
    @staticmethod
    def create_shipment(from_addr: Address, to_addr: Address, package: PackageDetails, service_type: str, account: CarrierAccount):
        """Create FedEx shipment and generate label"""
        try:
            # Simulated response
            return {
                "tracking_number": f"FEDEX{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "label_url": "https://example.com/label.pdf",
                "cost": 12.50,
                "estimated_delivery": datetime.now()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"FedEx shipment creation failed: {str(e)}")

class UPSAPI:
    """UPS API integration"""
    
    @staticmethod
    def get_rates(from_addr: Address, to_addr: Address, package: PackageDetails, account: CarrierAccount):
        """Get UPS shipping rates"""
        try:
            return [
                {"service_type": "UPS_GROUND", "cost": 11.75, "estimated_days": 5},
                {"service_type": "UPS_3_DAY", "cost": 22.00, "estimated_days": 3},
                {"service_type": "UPS_NEXT_DAY", "cost": 42.00, "estimated_days": 1},
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"UPS API error: {str(e)}")
    
    @staticmethod
    def create_shipment(from_addr: Address, to_addr: Address, package: PackageDetails, service_type: str, account: CarrierAccount):
        """Create UPS shipment"""
        try:
            return {
                "tracking_number": f"1Z{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "label_url": "https://example.com/ups_label.pdf",
                "cost": 11.75,
                "estimated_delivery": datetime.now()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"UPS shipment creation failed: {str(e)}")

class USPSAPI:
    """USPS API integration"""
    
    @staticmethod
    def get_rates(from_addr: Address, to_addr: Address, package: PackageDetails, account: CarrierAccount):
        """Get USPS shipping rates"""
        try:
            return [
                {"service_type": "USPS_PRIORITY", "cost": 9.50, "estimated_days": 3},
                {"service_type": "USPS_EXPRESS", "cost": 28.00, "estimated_days": 1},
                {"service_type": "USPS_FIRST_CLASS", "cost": 5.50, "estimated_days": 5},
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"USPS API error: {str(e)}")
    
    @staticmethod
    def create_shipment(from_addr: Address, to_addr: Address, package: PackageDetails, service_type: str, account: CarrierAccount):
        """Create USPS shipment"""
        try:
            return {
                "tracking_number": f"USPS{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "label_url": "https://example.com/usps_label.pdf",
                "cost": 9.50,
                "estimated_delivery": datetime.now()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"USPS shipment creation failed: {str(e)}")

class DHLAPI:
    """DHL Express API integration"""
    
    @staticmethod
    def get_rates(from_addr: Address, to_addr: Address, package: PackageDetails, account: CarrierAccount):
        """Get DHL shipping rates"""
        try:
            return [
                {"service_type": "DHL_EXPRESS_WORLDWIDE", "cost": 55.00, "estimated_days": 2},
                {"service_type": "DHL_ECONOMY_SELECT", "cost": 35.00, "estimated_days": 4},
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"DHL API error: {str(e)}")
    
    @staticmethod
    def create_shipment(from_addr: Address, to_addr: Address, package: PackageDetails, service_type: str, account: CarrierAccount):
        """Create DHL shipment"""
        try:
            return {
                "tracking_number": f"DHL{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "label_url": "https://example.com/dhl_label.pdf",
                "cost": 55.00,
                "estimated_delivery": datetime.now()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"DHL shipment creation failed: {str(e)}")

# ========================================================================
# API ENDPOINTS
# ========================================================================

@router.post("/rates", response_model=List[RateResponse])
def get_shipping_rates(
    request: RateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get shipping rates from multiple carriers"""
    
    # Get active carrier accounts
    accounts = db.query(CarrierAccount).filter(CarrierAccount.is_active == True).all()
    
    if not accounts:
        raise HTTPException(status_code=400, detail="No carrier accounts configured")
    
    all_rates = []
    
    for account in accounts:
        # Skip if specific carriers requested and this isn't one of them
        if request.carriers and account.carrier not in request.carriers:
            continue
        
        try:
            if account.carrier == "fedex":
                rates = FedExAPI.get_rates(request.from_address, request.to_address, request.package, account)
            elif account.carrier == "ups":
                rates = UPSAPI.get_rates(request.from_address, request.to_address, request.package, account)
            elif account.carrier == "usps":
                rates = USPSAPI.get_rates(request.from_address, request.to_address, request.package, account)
            elif account.carrier == "dhl":
                rates = DHLAPI.get_rates(request.from_address, request.to_address, request.package, account)
            else:
                continue
            
            # Add carrier name to each rate
            for rate in rates:
                all_rates.append(RateResponse(
                    carrier=account.carrier,
                    **rate
                ))
        except Exception as e:
            print(f"Error getting rates from {account.carrier}: {e}")
            continue
    
    # Sort by cost (cheapest first)
    all_rates.sort(key=lambda x: x.cost)
    
    return all_rates

@router.post("/shipments", response_model=ShipmentResponse)
def create_shipment(
    request: ShipmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a shipment and generate shipping label"""
    
    # Verify order exists
    order = db.query(Order).filter(Order.id == request.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get carrier account
    account = db.query(CarrierAccount).filter(
        CarrierAccount.carrier == request.carrier,
        CarrierAccount.is_active == True
    ).first()
    
    if not account:
        raise HTTPException(status_code=400, detail=f"No active {request.carrier} account found")
    
    # Create shipment via carrier API
    try:
        if request.carrier == "fedex":
            result = FedExAPI.create_shipment(request.from_address, request.to_address, request.package, request.service_type, account)
        elif request.carrier == "ups":
            result = UPSAPI.create_shipment(request.from_address, request.to_address, request.package, request.service_type, account)
        elif request.carrier == "usps":
            result = USPSAPI.create_shipment(request.from_address, request.to_address, request.package, request.service_type, account)
        elif request.carrier == "dhl":
            result = DHLAPI.create_shipment(request.from_address, request.to_address, request.package, request.service_type, account)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported carrier: {request.carrier}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shipment creation failed: {str(e)}")
    
    # Save shipment to database
    shipment = Shipment(
        order_id=request.order_id,
        carrier=request.carrier,
        service_type=request.service_type,
        tracking_number=result["tracking_number"],
        label_url=result["label_url"],
        cost=result["cost"],
        estimated_delivery=result.get("estimated_delivery"),
        from_address=request.from_address.dict(),
        to_address=request.to_address.dict(),
        package_details=request.package.dict(),
        status="pending"
    )
    
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    
    return ShipmentResponse(
        id=shipment.id,
        tracking_number=shipment.tracking_number,
        label_url=shipment.label_url,
        cost=shipment.cost,
        estimated_delivery=shipment.estimated_delivery,
        carrier=shipment.carrier,
        service_type=shipment.service_type
    )

@router.get("/shipments/{shipment_id}")
def get_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get shipment details"""
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@router.get("/shipments/tracking/{tracking_number}")
def track_shipment(
    tracking_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Track shipment by tracking number"""
    shipment = db.query(Shipment).filter(Shipment.tracking_number == tracking_number).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    # In production, this would call the carrier's tracking API
    # For now, return stored data
    return {
        "tracking_number": shipment.tracking_number,
        "carrier": shipment.carrier,
        "status": shipment.status,
        "estimated_delivery": shipment.estimated_delivery,
        "actual_delivery": shipment.actual_delivery,
        "tracking_events": shipment.tracking_events
    }

@router.post("/carriers", response_model=dict)
def add_carrier_account(
    account: CarrierAccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a new carrier account"""
    
    # Check if carrier account already exists
    existing = db.query(CarrierAccount).filter(
        CarrierAccount.carrier == account.carrier
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail=f"{account.carrier} account already exists")
    
    db_account = CarrierAccount(**account.dict())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    
    return {"message": f"{account.carrier} account added successfully", "id": db_account.id}

@router.get("/carriers")
def list_carrier_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all carrier accounts"""
    accounts = db.query(CarrierAccount).all()
    return accounts
