from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import Employee, Department
from schemas import EmployeeCreate, Employee as EmployeeSchema
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[EmployeeSchema])
def get_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all employees"""
    employees = db.query(Employee).offset(skip).limit(limit).all()
    return employees

@router.get("/{emp_code}", response_model=EmployeeSchema)
def get_employee(emp_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get a specific employee by code"""
    employee = db.query(Employee).filter(Employee.emp_code == emp_code).first()
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.post("/", response_model=EmployeeSchema)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Create a new employee"""
    # Check if employee already exists
    existing_emp = db.query(Employee).filter(Employee.emp_code == employee.emp_code).first()
    if existing_emp:
        raise HTTPException(status_code=400, detail="Employee with this code already exists")
    
    # Verify department exists
    department = db.query(Department).filter(Department.dept_code == employee.dept_code).first()
    if not department:
        raise HTTPException(status_code=400, detail="Department not found")
    
    db_employee = Employee(
        **employee.dict(),
        created_by=current_user.username
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.get("/active/list")
def get_active_employees(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all active employees for LOV (List of Values)"""
    employees = db.query(Employee, Department).join(Department).filter(
        Employee.is_active == True
    ).all()
    
    result = []
    for emp, dept in employees:
        result.append({
            "emp_office_name": emp.emp_office_name,
            "emp_code": emp.emp_code,
            "dept_desc": dept.dept_name
        })
    
    return result

# LOV for BOM-specific employees (as per your README requirement)
@router.get("/bom/list")
def get_bom_employees(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get employees eligible for BOM operations (initiator, approver, etc.)"""
    # Based on your README: specific departments and excluding job_category '5'
    eligible_dept_codes = ['055','080','097','087','093','089','016','002','061','057']
    
    employees = db.query(Employee, Department).join(Department).filter(
        Employee.dept_code.in_(eligible_dept_codes),
        Employee.job_category != '5',  # Exclude job category 5
        Employee.is_active == True,
        Department.is_active == True
    ).order_by(Employee.emp_office_name).all()
    
    result = []
    for emp, dept in employees:
        result.append({
            "emp_office_name": emp.emp_office_name,
            "emp_code": emp.emp_code,
            "dept_desc": dept.dept_name,
            "dept_code": emp.dept_code,
            "job_category": emp.job_category
        })
    
    return result
