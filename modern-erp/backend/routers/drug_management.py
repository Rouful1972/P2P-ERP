from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import DrugRegistration, Product
from schemas import DrugRegistrationCreate, DrugRegistrationUpdate, DrugRegistration as DrugRegistrationSchema
from routers.auth import get_current_user

router = APIRouter()

@router.get("/registrations", response_model=List[DrugRegistrationSchema])
def get_drug_registrations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    registrations = db.query(DrugRegistration).offset(skip).limit(limit).all()
    return registrations

@router.get("/registrations/{registration_id}", response_model=DrugRegistrationSchema)
def get_drug_registration(registration_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    registration = db.query(DrugRegistration).filter(DrugRegistration.id == registration_id).first()
    if registration is None:
        raise HTTPException(status_code=404, detail="Drug registration not found")
    return registration

@router.get("/registrations/by-ref/{drug_letter_ref_no}", response_model=DrugRegistrationSchema)
def get_drug_registration_by_ref(drug_letter_ref_no: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    registration = db.query(DrugRegistration).filter(DrugRegistration.drug_letter_ref_no == drug_letter_ref_no).first()
    if registration is None:
        raise HTTPException(status_code=404, detail="Drug registration not found")
    return registration

@router.post("/registrations", response_model=DrugRegistrationSchema)
def create_drug_registration(registration: DrugRegistrationCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Check if product exists
    product = db.query(Product).filter(Product.product_code == registration.product_code).first()
    if not product:
        raise HTTPException(status_code=400, detail="Product not found")
    
    # Check if drug letter ref number already exists
    existing_registration = db.query(DrugRegistration).filter(DrugRegistration.drug_letter_ref_no == registration.drug_letter_ref_no).first()
    if existing_registration:
        raise HTTPException(status_code=400, detail="Drug letter reference number already exists")
    
    db_registration = DrugRegistration(
        **registration.dict(),
        created_by=current_user.username
    )
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    return db_registration

@router.put("/registrations/{registration_id}", response_model=DrugRegistrationSchema)
def update_drug_registration(registration_id: int, registration: DrugRegistrationUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_registration = db.query(DrugRegistration).filter(DrugRegistration.id == registration_id).first()
    if db_registration is None:
        raise HTTPException(status_code=404, detail="Drug registration not found")
    
    update_data = registration.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_registration, field, value)
    
    db.commit()
    db.refresh(db_registration)
    return db_registration

@router.patch("/registrations/{registration_id}/status")
def update_registration_status(registration_id: int, status: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Update drug registration status"""
    db_registration = db.query(DrugRegistration).filter(DrugRegistration.id == registration_id).first()
    if db_registration is None:
        raise HTTPException(status_code=404, detail="Drug registration not found")
    
    valid_statuses = ["Applied", "Under Review", "Approved", "Rejected", "Expired", "Cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    db_registration.status = status
    db.commit()
    
    return {"message": f"Drug registration status updated to {status}"}

@router.delete("/registrations/{registration_id}")
def delete_drug_registration(registration_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_registration = db.query(DrugRegistration).filter(DrugRegistration.id == registration_id).first()
    if db_registration is None:
        raise HTTPException(status_code=404, detail="Drug registration not found")
    
    db.delete(db_registration)
    db.commit()
    return {"message": "Drug registration deleted successfully"}

@router.get("/registrations/by-product/{product_code}", response_model=List[DrugRegistrationSchema])
def get_drug_registrations_by_product(product_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all drug registrations for a specific product"""
    registrations = db.query(DrugRegistration).filter(DrugRegistration.product_code == product_code).all()
    return registrations
