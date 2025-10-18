from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import ProductionPlan, Product
from schemas import ProductionPlanCreate, ProductionPlanUpdate, ProductionPlan as ProductionPlanSchema
from routers.auth import get_current_user

router = APIRouter()

@router.get("/plans", response_model=List[ProductionPlanSchema])
def get_production_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    plans = db.query(ProductionPlan).offset(skip).limit(limit).all()
    return plans

@router.get("/plans/{plan_id}", response_model=ProductionPlanSchema)
def get_production_plan(plan_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    plan = db.query(ProductionPlan).filter(ProductionPlan.id == plan_id).first()
    if plan is None:
        raise HTTPException(status_code=404, detail="Production plan not found")
    return plan

@router.get("/plans/by-number/{plan_no}", response_model=ProductionPlanSchema)
def get_production_plan_by_number(plan_no: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    plan = db.query(ProductionPlan).filter(ProductionPlan.plan_no == plan_no).first()
    if plan is None:
        raise HTTPException(status_code=404, detail="Production plan not found")
    return plan

@router.post("/plans", response_model=ProductionPlanSchema)
def create_production_plan(plan: ProductionPlanCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Check if product exists
    product = db.query(Product).filter(Product.product_code == plan.product_code).first()
    if not product:
        raise HTTPException(status_code=400, detail="Product not found")
    
    # Check if plan number already exists
    existing_plan = db.query(ProductionPlan).filter(ProductionPlan.plan_no == plan.plan_no).first()
    if existing_plan:
        raise HTTPException(status_code=400, detail="Production plan number already exists")
    
    db_plan = ProductionPlan(
        **plan.dict(),
        created_by=current_user.username
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.put("/plans/{plan_id}", response_model=ProductionPlanSchema)
def update_production_plan(plan_id: int, plan: ProductionPlanUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_plan = db.query(ProductionPlan).filter(ProductionPlan.id == plan_id).first()
    if db_plan is None:
        raise HTTPException(status_code=404, detail="Production plan not found")
    
    update_data = plan.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_plan, field, value)
    
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.patch("/plans/{plan_id}/status")
def update_plan_status(plan_id: int, status: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Update production plan status"""
    db_plan = db.query(ProductionPlan).filter(ProductionPlan.id == plan_id).first()
    if db_plan is None:
        raise HTTPException(status_code=404, detail="Production plan not found")
    
    valid_statuses = ["Planned", "In Progress", "Completed", "Cancelled", "On Hold"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    db_plan.status = status
    db.commit()
    
    return {"message": f"Production plan status updated to {status}"}

@router.delete("/plans/{plan_id}")
def delete_production_plan(plan_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_plan = db.query(ProductionPlan).filter(ProductionPlan.id == plan_id).first()
    if db_plan is None:
        raise HTTPException(status_code=404, detail="Production plan not found")
    
    # Check if plan can be deleted (only planned status)
    if db_plan.status not in ["Planned", "Cancelled"]:
        raise HTTPException(status_code=400, detail="Only planned or cancelled production plans can be deleted")
    
    db.delete(db_plan)
    db.commit()
    return {"message": "Production plan deleted successfully"}

@router.get("/plans/by-product/{product_code}", response_model=List[ProductionPlanSchema])
def get_production_plans_by_product(product_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all production plans for a specific product"""
    plans = db.query(ProductionPlan).filter(ProductionPlan.product_code == product_code).all()
    return plans

@router.get("/batch-calculation/{plan_id}")
def calculate_batch_requirements(plan_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Calculate batch requirements for a production plan"""
    plan = db.query(ProductionPlan).filter(ProductionPlan.id == plan_id).first()
    if plan is None:
        raise HTTPException(status_code=404, detail="Production plan not found")
    
    # Calculate number of batches needed
    if plan.batch_size and plan.planned_quantity:
        batches_needed = plan.planned_quantity / plan.batch_size
        full_batches = int(batches_needed)
        partial_batch_quantity = plan.planned_quantity % plan.batch_size
        
        return {
            "plan_id": plan_id,
            "product_code": plan.product_code,
            "planned_quantity": plan.planned_quantity,
            "batch_size": plan.batch_size,
            "batches_needed": round(batches_needed, 2),
            "full_batches": full_batches,
            "partial_batch_quantity": partial_batch_quantity,
            "total_production": full_batches * plan.batch_size + partial_batch_quantity
        }
    else:
        raise HTTPException(status_code=400, detail="Batch size or planned quantity not defined")
