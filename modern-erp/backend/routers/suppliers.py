from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import Supplier
from schemas import SupplierCreate, SupplierUpdate, Supplier as SupplierSchema
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[SupplierSchema])
def get_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    suppliers = db.query(Supplier).offset(skip).limit(limit).all()
    return suppliers

@router.get("/{supplier_id}", response_model=SupplierSchema)
def get_supplier(supplier_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.get("/by-code/{sup_code}", response_model=SupplierSchema)
def get_supplier_by_code(sup_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    supplier = db.query(Supplier).filter(Supplier.sup_code == sup_code).first()
    if supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.post("/", response_model=SupplierSchema)
def create_supplier(supplier: SupplierCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Check if supplier code already exists
    db_supplier = db.query(Supplier).filter(Supplier.sup_code == supplier.sup_code).first()
    if db_supplier:
        raise HTTPException(status_code=400, detail="Supplier code already exists")
    
    db_supplier = Supplier(
        **supplier.dict(),
        created_by=current_user.username
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.put("/{supplier_id}", response_model=SupplierSchema)
def update_supplier(supplier_id: int, supplier: SupplierUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    update_data = supplier.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_supplier, field, value)
    
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Soft delete by setting is_active to False
    db_supplier.is_active = False
    db.commit()
    return {"message": "Supplier deleted successfully"}
