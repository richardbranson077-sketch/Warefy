'''Order management router'''

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..auth_lite import get_current_active_user
from ..database_lite import get_db
from ..models_lite import Order, OrderItem, User
from ..schemas import OrderCreate, OrderUpdate, OrderResponse

router = APIRouter(prefix="/api/orders", tags=["Order Management"])

@router.get("/", response_model=List[OrderResponse])
def list_orders(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    return query.order_by(Order.created_at.desc()).limit(limit).all()

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/", response_model=OrderResponse)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Calculate total
    total = sum(item.quantity * item.unit_price for item in payload.items)
    
    new_order = Order(
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        shipping_address=payload.shipping_address,
        status=payload.status,
        total_amount=total
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Create items
    for item in payload.items:
        order_item = OrderItem(
            order_id=new_order.id,
            sku=item.sku,
            quantity=item.quantity,
            unit_price=item.unit_price
        )
        db.add(order_item)
    
    db.commit()
    db.refresh(new_order)
    return new_order

@router.patch("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    payload: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if payload.status is not None:
        order.status = payload.status
    if payload.shipping_address is not None:
        order.shipping_address = payload.shipping_address
        
    db.commit()
    db.refresh(order)
    return order
