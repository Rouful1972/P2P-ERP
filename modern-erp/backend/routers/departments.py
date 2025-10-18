from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import Department
from schemas import DepartmentCreate, Department as DepartmentSchema
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[DepartmentSchema])
def get_departments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all departments"""
    departments = db.query(Department).offset(skip).limit(limit).all()
    return departments

@router.get("/{dept_code}", response_model=DepartmentSchema)
def get_department(dept_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get a specific department by code"""
    department = db.query(Department).filter(Department.dept_code == dept_code).first()
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@router.post("/", response_model=DepartmentSchema)
def create_department(department: DepartmentCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Create a new department"""
    # Check if department already exists
    existing_dept = db.query(Department).filter(Department.dept_code == department.dept_code).first()
    if existing_dept:
        raise HTTPException(status_code=400, detail="Department with this code already exists")
    
    db_department = Department(
        **department.dict(),
        created_by=current_user.username
    )
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department

@router.get("/active/list", response_model=List[DepartmentSchema])
def get_active_departments(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all active departments for LOV (List of Values)"""
    departments = db.query(Department).filter(Department.is_active == True).all()
    return departments

# LOV for BOM-specific departments (as per your README requirement)
@router.get("/bom/list", response_model=List[DepartmentSchema])
def get_bom_departments(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get departments eligible for BOM operations"""
    # Based on your README: dept_codes '055','080','097','087','093','089','016','002','061','057'
    eligible_codes = ['055','080','097','087','093','089','016','002','061','057']
    departments = db.query(Department).filter(
        Department.dept_code.in_(eligible_codes),
        Department.is_active == True
    ).all()
    return departments
