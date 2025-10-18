from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import LetterOfCredit, LetterOfCreditDetail, Supplier, RawMaterial
from routers.auth import get_current_user

router = APIRouter()

# Letter of Credit schemas (simplified for this implementation)
from pydantic import BaseModel
from datetime import date
from decimal import Decimal
from typing import Optional

class LCDetailBase(BaseModel):
    raw_code: str
    quantity: Decimal
    unit_of_measure: Optional[str] = None
    unit_price: Decimal
    amount: Decimal
    tolerance_percentage: Optional[Decimal] = 0

class LCDetailCreate(LCDetailBase):
    pass

class LCDetail(LCDetailBase):
    id: int
    lc_id: int
    
    class Config:
        from_attributes = True

class LCBase(BaseModel):
    lc_no: str
    lc_date: date
    sup_code: str
    bank_code: Optional[str] = None
    lc_amount: Decimal
    currency: str = "USD"
    expiry_date: Optional[date] = None
    latest_shipment_date: Optional[date] = None
    payment_terms: Optional[str] = None
    delivery_terms: Optional[str] = None
    port_of_loading: Optional[str] = None
    port_of_discharge: Optional[str] = None
    partial_shipment: bool = True
    transhipment: bool = True
    status: str = "Open"
    remarks: Optional[str] = None

class LCCreate(LCBase):
    items: List[LCDetailCreate] = []

class LCUpdate(LCBase):
    lc_no: Optional[str] = None
    lc_date: Optional[date] = None
    sup_code: Optional[str] = None
    lc_amount: Optional[Decimal] = None

class LC(LCBase):
    id: int
    created_by: Optional[str] = None
    created_at: date
    updated_at: date
    items: List[LCDetail] = []
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[LC])
def get_letter_of_credits(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    lcs = db.query(LetterOfCredit).offset(skip).limit(limit).all()
    return lcs

@router.get("/{lc_id}", response_model=LC)
def get_letter_of_credit(lc_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    lc = db.query(LetterOfCredit).filter(LetterOfCredit.id == lc_id).first()
    if lc is None:
        raise HTTPException(status_code=404, detail="Letter of Credit not found")
    return lc

@router.get("/by-number/{lc_no}", response_model=LC)
def get_lc_by_number(lc_no: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    lc = db.query(LetterOfCredit).filter(LetterOfCredit.lc_no == lc_no).first()
    if lc is None:
        raise HTTPException(status_code=404, detail="Letter of Credit not found")
    return lc

@router.post("/", response_model=LC)
def create_letter_of_credit(lc: LCCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Check if supplier exists
    supplier = db.query(Supplier).filter(Supplier.sup_code == lc.sup_code).first()
    if not supplier:
        raise HTTPException(status_code=400, detail="Supplier not found")
    
    # Check if LC number already exists
    existing_lc = db.query(LetterOfCredit).filter(LetterOfCredit.lc_no == lc.lc_no).first()
    if existing_lc:
        raise HTTPException(status_code=400, detail="Letter of Credit number already exists")
    
    # Create Letter of Credit
    db_lc = LetterOfCredit(
        lc_no=lc.lc_no,
        lc_date=lc.lc_date,
        sup_code=lc.sup_code,
        bank_code=lc.bank_code,
        lc_amount=lc.lc_amount,
        currency=lc.currency,
        expiry_date=lc.expiry_date,
        latest_shipment_date=lc.latest_shipment_date,
        payment_terms=lc.payment_terms,
        delivery_terms=lc.delivery_terms,
        port_of_loading=lc.port_of_loading,
        port_of_discharge=lc.port_of_discharge,
        partial_shipment=lc.partial_shipment,
        transhipment=lc.transhipment,
        status=lc.status,
        remarks=lc.remarks,
        created_by=current_user.username
    )
    db.add(db_lc)
    db.commit()
    db.refresh(db_lc)
    
    # Create LC items
    for item in lc.items:
        # Check if raw material exists
        raw_material = db.query(RawMaterial).filter(RawMaterial.raw_code == item.raw_code).first()
        if not raw_material:
            raise HTTPException(status_code=400, detail=f"Raw material {item.raw_code} not found")
        
        db_item = LetterOfCreditDetail(
            lc_id=db_lc.id,
            **item.dict()
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_lc)
    return db_lc

@router.put("/{lc_id}", response_model=LC)
def update_letter_of_credit(lc_id: int, lc: LCUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_lc = db.query(LetterOfCredit).filter(LetterOfCredit.id == lc_id).first()
    if db_lc is None:
        raise HTTPException(status_code=404, detail="Letter of Credit not found")
    
    update_data = lc.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_lc, field, value)
    
    db.commit()
    db.refresh(db_lc)
    return db_lc

@router.patch("/{lc_id}/status")
def update_lc_status(lc_id: int, status: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Update Letter of Credit status"""
    db_lc = db.query(LetterOfCredit).filter(LetterOfCredit.id == lc_id).first()
    if db_lc is None:
        raise HTTPException(status_code=404, detail="Letter of Credit not found")
    
    valid_statuses = ["Open", "Amended", "Closed", "Expired", "Cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    db_lc.status = status
    db.commit()
    
    return {"message": f"Letter of Credit status updated to {status}"}

@router.delete("/{lc_id}")
def delete_letter_of_credit(lc_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_lc = db.query(LetterOfCredit).filter(LetterOfCredit.id == lc_id).first()
    if db_lc is None:
        raise HTTPException(status_code=404, detail="Letter of Credit not found")
    
    # Check if LC can be deleted (only draft/open status)
    if db_lc.status not in ["Open", "Draft"]:
        raise HTTPException(status_code=400, detail="Only open or draft LCs can be deleted")
    
    db.delete(db_lc)
    db.commit()
    return {"message": "Letter of Credit deleted successfully"}

@router.get("/by-supplier/{sup_code}", response_model=List[LC])
def get_lcs_by_supplier(sup_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all LCs for a specific supplier"""
    lcs = db.query(LetterOfCredit).filter(LetterOfCredit.sup_code == sup_code).all()
    return lcs
