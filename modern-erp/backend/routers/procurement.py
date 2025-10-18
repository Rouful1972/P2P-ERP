from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import PurchaseRequisition, PurchaseRequisitionDetail, RawMaterial
from schemas import PurchaseRequisitionCreate, PurchaseRequisitionUpdate, PurchaseRequisition as PurchaseRequisitionSchema
from routers.auth import get_current_user

router = APIRouter()

@router.get("/requisitions", response_model=List[PurchaseRequisitionSchema])
def get_purchase_requisitions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    requisitions = db.query(PurchaseRequisition).offset(skip).limit(limit).all()
    return requisitions

@router.get("/requisitions/{req_id}", response_model=PurchaseRequisitionSchema)
def get_purchase_requisition(req_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    requisition = db.query(PurchaseRequisition).filter(PurchaseRequisition.id == req_id).first()
    if requisition is None:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    return requisition

@router.get("/requisitions/by-number/{req_no}", response_model=PurchaseRequisitionSchema)
def get_purchase_requisition_by_number(req_no: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    requisition = db.query(PurchaseRequisition).filter(PurchaseRequisition.req_no == req_no).first()
    if requisition is None:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    return requisition

@router.post("/requisitions", response_model=PurchaseRequisitionSchema)
def create_purchase_requisition(requisition: PurchaseRequisitionCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Check if requisition number already exists
    existing_req = db.query(PurchaseRequisition).filter(PurchaseRequisition.req_no == requisition.req_no).first()
    if existing_req:
        raise HTTPException(status_code=400, detail="Purchase requisition number already exists")
    
    # Create purchase requisition
    db_requisition = PurchaseRequisition(
        req_no=requisition.req_no,
        req_date=requisition.req_date,
        department=requisition.department,
        requested_by=requisition.requested_by,
        priority=requisition.priority,
        status=requisition.status,
        total_amount=requisition.total_amount,
        currency=requisition.currency,
        required_date=requisition.required_date,
        remarks=requisition.remarks,
        created_by=current_user.username
    )
    db.add(db_requisition)
    db.commit()
    db.refresh(db_requisition)
    
    # Create requisition items
    for item in requisition.items:
        # Check if raw material exists
        raw_material = db.query(RawMaterial).filter(RawMaterial.raw_code == item.raw_code).first()
        if not raw_material:
            raise HTTPException(status_code=400, detail=f"Raw material {item.raw_code} not found")
        
        db_item = PurchaseRequisitionDetail(
            req_id=db_requisition.id,
            **item.dict()
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_requisition)
    return db_requisition

@router.put("/requisitions/{req_id}", response_model=PurchaseRequisitionSchema)
def update_purchase_requisition(req_id: int, requisition: PurchaseRequisitionUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_requisition = db.query(PurchaseRequisition).filter(PurchaseRequisition.id == req_id).first()
    if db_requisition is None:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    update_data = requisition.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_requisition, field, value)
    
    db.commit()
    db.refresh(db_requisition)
    return db_requisition

@router.patch("/requisitions/{req_id}/status")
def update_requisition_status(req_id: int, status: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Update purchase requisition status"""
    db_requisition = db.query(PurchaseRequisition).filter(PurchaseRequisition.id == req_id).first()
    if db_requisition is None:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    valid_statuses = ["Draft", "Submitted", "Approved", "Rejected", "Cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    db_requisition.status = status
    db.commit()
    
    return {"message": f"Purchase requisition status updated to {status}"}

@router.delete("/requisitions/{req_id}")
def delete_purchase_requisition(req_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_requisition = db.query(PurchaseRequisition).filter(PurchaseRequisition.id == req_id).first()
    if db_requisition is None:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    # Check if requisition can be deleted (only draft status)
    if db_requisition.status != "Draft":
        raise HTTPException(status_code=400, detail="Only draft requisitions can be deleted")
    
    db.delete(db_requisition)
    db.commit()
    return {"message": "Purchase requisition deleted successfully"}
