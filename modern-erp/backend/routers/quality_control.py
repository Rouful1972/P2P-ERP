from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import QualityControlTest
from schemas import QualityControlTestCreate, QualityControlTestUpdate, QualityControlTest as QualityControlTestSchema
from routers.auth import get_current_user

router = APIRouter()

@router.get("/tests", response_model=List[QualityControlTestSchema])
def get_qc_tests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    tests = db.query(QualityControlTest).offset(skip).limit(limit).all()
    return tests

@router.get("/tests/{test_id}", response_model=QualityControlTestSchema)
def get_qc_test(test_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    test = db.query(QualityControlTest).filter(QualityControlTest.id == test_id).first()
    if test is None:
        raise HTTPException(status_code=404, detail="QC test not found")
    return test

@router.get("/tests/by-code/{test_code}", response_model=QualityControlTestSchema)
def get_qc_test_by_code(test_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    test = db.query(QualityControlTest).filter(QualityControlTest.test_code == test_code).first()
    if test is None:
        raise HTTPException(status_code=404, detail="QC test not found")
    return test

@router.post("/tests", response_model=QualityControlTestSchema)
def create_qc_test(test: QualityControlTestCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Check if test code already exists
    existing_test = db.query(QualityControlTest).filter(QualityControlTest.test_code == test.test_code).first()
    if existing_test:
        raise HTTPException(status_code=400, detail="QC test code already exists")
    
    db_test = QualityControlTest(
        **test.dict(),
        created_by=current_user.username
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test

@router.put("/tests/{test_id}", response_model=QualityControlTestSchema)
def update_qc_test(test_id: int, test: QualityControlTestUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_test = db.query(QualityControlTest).filter(QualityControlTest.id == test_id).first()
    if db_test is None:
        raise HTTPException(status_code=404, detail="QC test not found")
    
    update_data = test.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_test, field, value)
    
    db.commit()
    db.refresh(db_test)
    return db_test

@router.delete("/tests/{test_id}")
def delete_qc_test(test_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_test = db.query(QualityControlTest).filter(QualityControlTest.id == test_id).first()
    if db_test is None:
        raise HTTPException(status_code=404, detail="QC test not found")
    
    # Soft delete by setting is_active to False
    db_test.is_active = False
    db.commit()
    return {"message": "QC test deleted successfully"}

@router.get("/tests/by-category/{category}", response_model=List[QualityControlTestSchema])
def get_qc_tests_by_category(category: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get QC tests by category (Raw Material, Finished Product, In-Process)"""
    tests = db.query(QualityControlTest).filter(QualityControlTest.test_category == category).all()
    return tests
