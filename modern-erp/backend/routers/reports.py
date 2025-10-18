from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from typing import List, Optional
from datetime import date, datetime

from database.database import get_db
from database.models import (
    RawMaterial, Product, Supplier, PurchaseRequisition, 
    ProductionPlan, BillOfMaterials, BOMDetail, DrugRegistration
)
from routers.auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get dashboard summary data"""
    
    # Count totals
    total_raw_materials = db.query(RawMaterial).filter(RawMaterial.is_active == True).count()
    total_products = db.query(Product).filter(Product.is_active == True).count()
    total_suppliers = db.query(Supplier).filter(Supplier.is_active == True).count()
    
    # Recent activity
    recent_requisitions = db.query(PurchaseRequisition).order_by(PurchaseRequisition.created_at.desc()).limit(5).all()
    recent_production_plans = db.query(ProductionPlan).order_by(ProductionPlan.created_at.desc()).limit(5).all()
    
    # Status counts
    requisition_status_counts = db.query(
        PurchaseRequisition.status,
        func.count(PurchaseRequisition.id)
    ).group_by(PurchaseRequisition.status).all()
    
    production_status_counts = db.query(
        ProductionPlan.status,
        func.count(ProductionPlan.id)
    ).group_by(ProductionPlan.status).all()
    
    return {
        "totals": {
            "raw_materials": total_raw_materials,
            "products": total_products,
            "suppliers": total_suppliers
        },
        "recent_activity": {
            "requisitions": [
                {
                    "id": req.id,
                    "req_no": req.req_no,
                    "req_date": req.req_date,
                    "status": req.status,
                    "total_amount": req.total_amount
                } for req in recent_requisitions
            ],
            "production_plans": [
                {
                    "id": plan.id,
                    "plan_no": plan.plan_no,
                    "product_code": plan.product_code,
                    "planned_quantity": plan.planned_quantity,
                    "status": plan.status
                } for plan in recent_production_plans
            ]
        },
        "status_counts": {
            "requisitions": dict(requisition_status_counts),
            "production_plans": dict(production_status_counts)
        }
    }

@router.get("/raw-materials/inventory-report")
def get_raw_material_inventory_report(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get raw material inventory report"""
    raw_materials = db.query(RawMaterial).filter(RawMaterial.is_active == True).all()
    
    report_data = []
    for rm in raw_materials:
        # Calculate usage from BOMs
        bom_usage = db.query(
            func.sum(BOMDetail.quantity_per_batch)
        ).join(BillOfMaterials).filter(
            and_(
                BOMDetail.raw_code == rm.raw_code,
                BillOfMaterials.is_active == True,
                BOMDetail.is_active == True
            )
        ).scalar() or 0
        
        report_data.append({
            "raw_code": rm.raw_code,
            "raw_name": rm.raw_name,
            "raw_type": rm.raw_type,
            "unit_of_measure": rm.unit_of_measure,
            "shelf_life_months": rm.shelf_life_months,
            "total_bom_usage": float(bom_usage),
            "storage_condition": rm.storage_condition
        })
    
    return {"raw_materials": report_data}

@router.get("/products/bom-report")
def get_product_bom_report(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get product BOM report"""
    products = db.query(Product).filter(Product.is_active == True).all()
    
    report_data = []
    for product in products:
        # Get active BOMs for this product
        boms = db.query(BillOfMaterials).filter(
            and_(
                BillOfMaterials.product_code == product.product_code,
                BillOfMaterials.is_active == True
            )
        ).all()
        
        bom_info = []
        for bom in boms:
            material_count = db.query(BOMDetail).filter(
                and_(
                    BOMDetail.bom_id == bom.id,
                    BOMDetail.is_active == True
                )
            ).count()
            
            bom_info.append({
                "version_no": bom.version_no,
                "batch_size": float(bom.batch_size),
                "material_count": material_count,
                "effective_date": bom.effective_date
            })
        
        report_data.append({
            "product_code": product.product_code,
            "product_name": product.product_name,
            "dosage_form": product.dosage_form,
            "strength": product.strength,
            "boms": bom_info
        })
    
    return {"products": report_data}

@router.get("/procurement/requisition-summary")
def get_requisition_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get purchase requisition summary report"""
    query = db.query(PurchaseRequisition)
    
    if start_date:
        query = query.filter(PurchaseRequisition.req_date >= start_date)
    if end_date:
        query = query.filter(PurchaseRequisition.req_date <= end_date)
    
    requisitions = query.all()
    
    # Summary by status
    status_summary = {}
    total_amount = 0
    
    for req in requisitions:
        status = req.status
        if status not in status_summary:
            status_summary[status] = {"count": 0, "total_amount": 0}
        
        status_summary[status]["count"] += 1
        if req.total_amount:
            status_summary[status]["total_amount"] += float(req.total_amount)
            total_amount += float(req.total_amount)
    
    # Monthly summary
    monthly_summary = db.query(
        extract('month', PurchaseRequisition.req_date).label('month'),
        extract('year', PurchaseRequisition.req_date).label('year'),
        func.count(PurchaseRequisition.id).label('count'),
        func.sum(PurchaseRequisition.total_amount).label('total_amount')
    ).group_by(
        extract('month', PurchaseRequisition.req_date),
        extract('year', PurchaseRequisition.req_date)
    ).all()
    
    return {
        "summary": {
            "total_requisitions": len(requisitions),
            "total_amount": total_amount,
            "status_breakdown": status_summary
        },
        "monthly_summary": [
            {
                "month": int(row.month),
                "year": int(row.year),
                "count": row.count,
                "total_amount": float(row.total_amount) if row.total_amount else 0
            } for row in monthly_summary
        ]
    }

@router.get("/production/planning-summary")
def get_production_planning_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get production planning summary report"""
    query = db.query(ProductionPlan)
    
    if start_date:
        query = query.filter(ProductionPlan.plan_date >= start_date)
    if end_date:
        query = query.filter(ProductionPlan.plan_date <= end_date)
    
    plans = query.all()
    
    # Summary by status
    status_summary = {}
    total_planned_quantity = 0
    
    for plan in plans:
        status = plan.status
        if status not in status_summary:
            status_summary[status] = {"count": 0, "total_quantity": 0}
        
        status_summary[status]["count"] += 1
        if plan.planned_quantity:
            status_summary[status]["total_quantity"] += float(plan.planned_quantity)
            total_planned_quantity += float(plan.planned_quantity)
    
    # Product-wise summary
    product_summary = db.query(
        ProductionPlan.product_code,
        func.count(ProductionPlan.id).label('plan_count'),
        func.sum(ProductionPlan.planned_quantity).label('total_quantity')
    ).filter(
        ProductionPlan.plan_date >= (start_date or date(2020, 1, 1))
    ).filter(
        ProductionPlan.plan_date <= (end_date or date.today())
    ).group_by(ProductionPlan.product_code).all()
    
    return {
        "summary": {
            "total_plans": len(plans),
            "total_planned_quantity": total_planned_quantity,
            "status_breakdown": status_summary
        },
        "product_summary": [
            {
                "product_code": row.product_code,
                "plan_count": row.plan_count,
                "total_quantity": float(row.total_quantity) if row.total_quantity else 0
            } for row in product_summary
        ]
    }

@router.get("/drugs/registration-status")
def get_drug_registration_status(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get drug registration status report"""
    registrations = db.query(DrugRegistration).all()
    
    # Status summary
    status_summary = {}
    for reg in registrations:
        status = reg.status
        if status not in status_summary:
            status_summary[status] = 0
        status_summary[status] += 1
    
    # Expiring soon (within 90 days)
    expiring_soon = db.query(DrugRegistration).filter(
        and_(
            DrugRegistration.expiry_date.isnot(None),
            DrugRegistration.expiry_date <= date.today() + datetime.timedelta(days=90),
            DrugRegistration.status == 'Approved'
        )
    ).all()
    
    return {
        "total_registrations": len(registrations),
        "status_summary": status_summary,
        "expiring_soon": [
            {
                "id": reg.id,
                "drug_letter_ref_no": reg.drug_letter_ref_no,
                "product_code": reg.product_code,
                "expiry_date": reg.expiry_date,
                "days_to_expiry": (reg.expiry_date - date.today()).days
            } for reg in expiring_soon
        ]
    }
