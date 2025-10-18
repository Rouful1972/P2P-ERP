from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database.database import get_db
from database.models import BillOfMaterials, BOMDetail, Product, RawMaterial, ProductCategory, Employee, BOMHistoryMaster, BOMHistoryDetail
from schemas import BOMCreate, BOMUpdate, BOM as BOMSchema
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[BOMSchema])
def get_boms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all BOMs"""
    boms = db.query(BillOfMaterials).offset(skip).limit(limit).all()
    return boms

@router.get("/{bom_id}", response_model=BOMSchema)
def get_bom(bom_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get a specific BOM"""
    bom = db.query(BillOfMaterials).filter(BillOfMaterials.id == bom_id).first()
    if bom is None:
        raise HTTPException(status_code=404, detail="BOM not found")
    return bom

@router.get("/by-product/{product_code}", response_model=List[BOMSchema])
def get_boms_by_product(product_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all BOMs for a specific product"""
    boms = db.query(BillOfMaterials).filter(BillOfMaterials.product_code == product_code).all()
    return boms

@router.post("/", response_model=BOMSchema)
def create_bom(bom: BOMCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Create a new BOM with enhanced pharma-specific fields"""
    # Check if product exists
    product = db.query(Product).filter(Product.product_code == bom.product_code).first()
    if not product:
        raise HTTPException(status_code=400, detail="Product not found")
    
    # Check if product category exists
    category = db.query(ProductCategory).filter(ProductCategory.pcat_code == bom.pcat_code).first()
    if not category:
        raise HTTPException(status_code=400, detail="Product category not found")
    
    # Check if BOM with same product and version already exists
    existing_bom = db.query(BillOfMaterials).filter(
        BillOfMaterials.product_code == bom.product_code,
        BillOfMaterials.version_no == bom.version_no
    ).first()
    if existing_bom:
        raise HTTPException(status_code=400, detail="BOM with this product and version already exists")
    
    # Validate initiator if provided
    if bom.initiator:
        initiator_emp = db.query(Employee).filter(Employee.emp_code == bom.initiator).first()
        if not initiator_emp:
            raise HTTPException(status_code=400, detail="Initiator employee not found")
    
    # Create BOM Master
    db_bom = BillOfMaterials(
        pcat_code=bom.pcat_code,
        product_code=bom.product_code,
        batch_size=bom.batch_size,
        batch_unit=bom.batch_unit,
        bom_ratio=bom.bom_ratio,
        annex_ratio=bom.annex_ratio,
        batch_qnty=bom.batch_qnty,
        batch_qnty_unit=bom.batch_qnty_unit,
        pack1=bom.pack1,
        pack2=bom.pack2,
        pack3=bom.pack3,
        per_unit_wt=bom.per_unit_wt,
        per_unit_wt_unit=bom.per_unit_wt_unit,
        std_avg_wt=bom.std_avg_wt,
        bmr_no=bom.bmr_no,
        version_no=bom.version_no,
        eff_dt=bom.eff_dt,
        prod_ld_time=bom.prod_ld_time,
        prod_dosage_form=bom.prod_dosage_form,
        bom_code=bom.bom_code,
        label_ratio=bom.label_ratio,
        per_unit_solid_unit=bom.per_unit_solid_unit,
        dml_valid_upto=bom.dml_valid_upto,
        granul_method=bom.granul_method,
        max_bt_per_day=bom.max_bt_per_day,
        mon_sfty_stock=bom.mon_sfty_stock,
        bpr_version_no=bom.bpr_version_no,
        bpr_eff_dt=bom.bpr_eff_dt,
        bcr_version_no=bom.bcr_version_no,
        bcr_eff_dt=bom.bcr_eff_dt,
        opl_p_code=bom.opl_p_code,
        batch_per_large_unit=bom.batch_per_large_unit,
        batch_per_large_qnty=bom.batch_per_large_qnty,
        note=bom.note,
        initiator=bom.initiator,
        user_id=current_user.username,
        enter_dt=datetime.utcnow(),
        created_by=current_user.username,
        is_active=bom.is_active
    )
    db.add(db_bom)
    db.commit()
    db.refresh(db_bom)
    
    # Create BOM details
    for detail in bom.details:
        # Check if raw material exists
        raw_material = db.query(RawMaterial).filter(RawMaterial.raw_code == detail.raw_code).first()
        if not raw_material:
            raise HTTPException(status_code=400, detail=f"Raw material {detail.raw_code} not found")
        
        db_detail = BOMDetail(
            bom_id=db_bom.id,
            pcat_code=detail.pcat_code,
            p_code=detail.p_code,
            raw_code=detail.raw_code,
            raw_type=detail.raw_type,
            declared_qnty=detail.declared_qnty,
            declared_unit=detail.declared_unit,
            ratio_type=detail.ratio_type,
            ratio_ra=detail.ratio_ra,
            unit_unit=detail.unit_unit,
            unit_qnty=detail.unit_qnty,
            qty_per_batch=detail.qty_per_batch,
            overage=detail.overage,
            qty_per_batch_issue=detail.qty_per_batch_issue,
            batch_size=detail.batch_size,
            batch_unit=detail.batch_unit,
            annex_cont=detail.annex_cont,
            dec_volm_per_unit=detail.dec_volm_per_unit,
            each_unit_qnty=detail.each_unit_qnty,
            qty_per_batch_unit=detail.qty_per_batch_unit,
            qty_per_batch_cont=detail.qty_per_batch_cont,
            qty_per_batch_unit_cont=detail.qty_per_batch_unit_cont,
            filler_flag=detail.filler_flag,
            annex=detail.annex,
            not_apper_flag=detail.not_apper_flag,
            batch_size_qnty=detail.batch_size_qnty,
            batch_size_qnty_unit=detail.batch_size_qnty_unit,
            qs_to_make=detail.qs_to_make,
            each_unit_ratio=detail.each_unit_ratio,
            raw_group=detail.raw_group,
            raw_cat=detail.raw_cat,
            potency_ratio=detail.potency_ratio,
            da_gen_code=detail.da_gen_code,
            each_unit_qnty_annex=detail.each_unit_qnty_annex,
            each_unit_qnty_unit_annex=detail.each_unit_qnty_unit_annex,
            seq=detail.seq,
            stat=detail.stat,
            prod_qty=detail.prod_qty,
            prod_qty_unit=detail.prod_qty_unit,
            version_no=detail.version_no,
            raw_qnty=detail.raw_qnty,
            raw_unit=detail.raw_unit,
            raw_mole_wt=detail.raw_mole_wt,
            gen_mole_wt=detail.gen_mole_wt,
            raw_by_gen=detail.raw_by_gen,
            ref_book=detail.ref_book,
            ref_book_ver=detail.ref_book_ver,
            ref_book_page=detail.ref_book_page,
            is_annex_raw=detail.is_annex_raw,
            opl_p_code=detail.opl_p_code,
            opl_raw_code=detail.opl_raw_code,
            raw_version_no=detail.raw_version_no,
            user_id=current_user.username,
            enter_dt=datetime.utcnow(),
            is_active=detail.is_active
        )
        db.add(db_detail)
    
    db.commit()
    db.refresh(db_bom)
    return db_bom

@router.put("/{bom_id}", response_model=BOMSchema)
def update_bom(bom_id: int, bom: BOMUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_bom = db.query(BillOfMaterials).filter(BillOfMaterials.id == bom_id).first()
    if db_bom is None:
        raise HTTPException(status_code=404, detail="BOM not found")
    
    update_data = bom.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_bom, field, value)
    
    db.commit()
    db.refresh(db_bom)
    return db_bom

@router.delete("/{bom_id}")
def delete_bom(bom_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_bom = db.query(BillOfMaterials).filter(BillOfMaterials.id == bom_id).first()
    if db_bom is None:
        raise HTTPException(status_code=404, detail="BOM not found")
    
    # Soft delete by setting is_active to False
    db_bom.is_active = False
    db.commit()
    return {"message": "BOM deleted successfully"}

@router.get("/{bom_id}/material-requirements")
def get_material_requirements(bom_id: int, production_quantity: float, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Calculate material requirements based on BOM and production quantity"""
    bom = db.query(BillOfMaterials).filter(BillOfMaterials.id == bom_id).first()
    if bom is None:
        raise HTTPException(status_code=404, detail="BOM not found")
    
    requirements = []
    for detail in bom.details:
        required_quantity = (detail.quantity_per_batch * production_quantity) / bom.batch_size
        # Add waste percentage
        if detail.waste_percentage:
            required_quantity = required_quantity * (1 + detail.waste_percentage / 100)
        
        requirements.append({
            "raw_code": detail.raw_code,
            "raw_material": detail.raw_material.raw_name if detail.raw_material else None,
            "required_quantity": round(required_quantity, 4),
            "unit_of_measure": detail.unit_of_measure,
            "batch_quantity": detail.quantity_per_batch,
            "waste_percentage": detail.waste_percentage
        })
    
    return {
        "bom_id": bom_id,
        "product_code": bom.product_code,
        "production_quantity": production_quantity,
        "batch_size": bom.batch_size,
        "requirements": requirements
    }

@router.put("/{bom_id}/approve")
def approve_bom(bom_id: int, approver_emp_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Approve a BOM"""
    bom = db.query(BillOfMaterials).filter(BillOfMaterials.id == bom_id).first()
    if bom is None:
        raise HTTPException(status_code=404, detail="BOM not found")
    
    # Validate approver
    approver = db.query(Employee).filter(Employee.emp_code == approver_emp_code).first()
    if not approver:
        raise HTTPException(status_code=400, detail="Approver employee not found")
    
    # Update BOM with approval
    bom.aprv_by = approver_emp_code
    bom.aprv_dt = datetime.utcnow()
    
    db.commit()
    db.refresh(bom)
    return {"message": "BOM approved successfully", "approved_by": approver_emp_code, "approved_at": bom.aprv_dt}

@router.put("/{bom_id}/authorize")
def authorize_bom(bom_id: int, authorizer_emp_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Authorize a BOM"""
    bom = db.query(BillOfMaterials).filter(BillOfMaterials.id == bom_id).first()
    if bom is None:
        raise HTTPException(status_code=404, detail="BOM not found")
    
    # Check if BOM is approved first
    if not bom.aprv_by or not bom.aprv_dt:
        raise HTTPException(status_code=400, detail="BOM must be approved before authorization")
    
    # Validate authorizer
    authorizer = db.query(Employee).filter(Employee.emp_code == authorizer_emp_code).first()
    if not authorizer:
        raise HTTPException(status_code=400, detail="Authorizer employee not found")
    
    # Update BOM with authorization
    bom.auth_by = authorizer_emp_code
    bom.auth_dt = datetime.utcnow()
    
    db.commit()
    db.refresh(bom)
    return {"message": "BOM authorized successfully", "authorized_by": authorizer_emp_code, "authorized_at": bom.auth_dt}

@router.post("/{bom_id}/create-history")
def create_bom_history(bom_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Create history record before modifying BOM (as per your README INSERT scripts)"""
    bom = db.query(BillOfMaterials).filter(BillOfMaterials.id == bom_id).first()
    if bom is None:
        raise HTTPException(status_code=404, detail="BOM not found")
    
    # Get next serial number for history
    max_sl_no = db.query(BOMHistoryMaster).filter(
        BOMHistoryMaster.p_code == bom.product_code
    ).count()
    
    # Create history master record
    hist_master = BOMHistoryMaster(
        pcat_code=bom.pcat_code,
        p_code=bom.product_code,
        batch_size=bom.batch_size,
        batch_unit=bom.batch_unit,
        bom_ratio=bom.bom_ratio,
        annex_ratio=bom.annex_ratio,
        batch_qnty=bom.batch_qnty,
        batch_qnty_unit=bom.batch_qnty_unit,
        pack1=bom.pack1,
        pack2=bom.pack2,
        pack3=bom.pack3,
        per_unit_wt=bom.per_unit_wt,
        per_unit_wt_unit=bom.per_unit_wt_unit,
        std_avg_wt=bom.std_avg_wt,
        bmr_no=bom.bmr_no,
        version_no=bom.version_no,
        eff_dt=bom.eff_dt,
        prod_ld_time=bom.prod_ld_time,
        prod_dosage_form=bom.prod_dosage_form,
        bom_code=bom.bom_code,
        label_ratio=bom.label_ratio,
        per_unit_solid_unit=bom.per_unit_solid_unit,
        dml_valid_upto=bom.dml_valid_upto,
        granul_method=bom.granul_method,
        max_bt_per_day=bom.max_bt_per_day,
        mon_sfty_stock=bom.mon_sfty_stock,
        bpr_version_no=bom.bpr_version_no,
        bpr_eff_dt=bom.bpr_eff_dt,
        bcr_version_no=bom.bcr_version_no,
        bcr_eff_dt=bom.bcr_eff_dt,
        opl_p_code=bom.opl_p_code,
        batch_per_large_unit=bom.batch_per_large_unit,
        batch_per_large_qnty=bom.batch_per_large_qnty,
        note=bom.note,
        user_id=bom.user_id,
        enter_dt=bom.enter_dt,
        initiator=bom.initiator,
        aprv_by=bom.aprv_by,
        aprv_dt=bom.aprv_dt,
        edit_by=bom.edit_by,
        edit_dt=bom.edit_dt,
        auth_by=bom.auth_by,
        auth_dt=bom.auth_dt,
        sl_no=max_sl_no + 1,
        hist_by=current_user.username,
        hist_dt=datetime.utcnow()
    )
    db.add(hist_master)
    db.commit()
    db.refresh(hist_master)
    
    # Create history detail records
    for detail in bom.details:
        hist_detail = BOMHistoryDetail(
            hist_master_id=hist_master.id,
            pcat_code=detail.pcat_code,
            p_code=detail.p_code,
            raw_code=detail.raw_code,
            raw_type=detail.raw_type,
            declared_qnty=detail.declared_qnty,
            declared_unit=detail.declared_unit,
            ratio_type=detail.ratio_type,
            ratio_ra=detail.ratio_ra,
            unit_unit=detail.unit_unit,
            unit_qnty=detail.unit_qnty,
            qty_per_batch=detail.qty_per_batch,
            overage=detail.overage,
            qty_per_batch_issue=detail.qty_per_batch_issue,
            batch_size=detail.batch_size,
            batch_unit=detail.batch_unit,
            annex_cont=detail.annex_cont,
            dec_volm_per_unit=detail.dec_volm_per_unit,
            each_unit_qnty=detail.each_unit_qnty,
            qty_per_batch_unit=detail.qty_per_batch_unit,
            qty_per_batch_cont=detail.qty_per_batch_cont,
            qty_per_batch_unit_cont=detail.qty_per_batch_unit_cont,
            filler_flag=detail.filler_flag,
            annex=detail.annex,
            not_apper_flag=detail.not_apper_flag,
            batch_size_qnty=detail.batch_size_qnty,
            batch_size_qnty_unit=detail.batch_size_qnty_unit,
            qs_to_make=detail.qs_to_make,
            each_unit_ratio=detail.each_unit_ratio,
            raw_group=detail.raw_group,
            raw_cat=detail.raw_cat,
            potency_ratio=detail.potency_ratio,
            da_gen_code=detail.da_gen_code,
            each_unit_qnty_annex=detail.each_unit_qnty_annex,
            each_unit_qnty_unit_annex=detail.each_unit_qnty_unit_annex,
            seq=detail.seq,
            stat=detail.stat,
            prod_qty=detail.prod_qty,
            prod_qty_unit=detail.prod_qty_unit,
            version_no=detail.version_no,
            raw_qnty=detail.raw_qnty,
            raw_unit=detail.raw_unit,
            raw_mole_wt=detail.raw_mole_wt,
            gen_mole_wt=detail.gen_mole_wt,
            raw_by_gen=detail.raw_by_gen,
            ref_book=detail.ref_book,
            ref_book_ver=detail.ref_book_ver,
            ref_book_page=detail.ref_book_page,
            is_annex_raw=detail.is_annex_raw,
            opl_p_code=detail.opl_p_code,
            opl_raw_code=detail.opl_raw_code,
            raw_version_no=detail.raw_version_no,
            user_id=detail.user_id,
            enter_dt=detail.enter_dt,
            sl_no=max_sl_no + 1,
            hist_by=current_user.username,
            hist_dt=datetime.utcnow()
        )
        db.add(hist_detail)
    
    db.commit()
    return {"message": "BOM history created successfully", "history_id": hist_master.id}

@router.put("/{bom_id}/update-version")
def update_bom_version(
    bom_id: int, 
    new_version_no: str,
    new_initiator: str,
    new_note: str = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Update BOM version (as per your README UPDATE scripts)"""
    bom = db.query(BillOfMaterials).filter(BillOfMaterials.id == bom_id).first()
    if bom is None:
        raise HTTPException(status_code=404, detail="BOM not found")
    
    # Check if new version already exists
    existing_version = db.query(BillOfMaterials).filter(
        BillOfMaterials.product_code == bom.product_code,
        BillOfMaterials.version_no == new_version_no
    ).first()
    if existing_version:
        raise HTTPException(status_code=400, detail="BOM version already exists")
    
    # Validate new initiator
    initiator = db.query(Employee).filter(Employee.emp_code == new_initiator).first()
    if not initiator:
        raise HTTPException(status_code=400, detail="Initiator employee not found")
    
    # Update BOM Master
    bom.version_no = new_version_no
    bom.initiator = new_initiator
    if new_note:
        bom.note = new_note
    bom.user_id = current_user.username
    bom.enter_dt = datetime.utcnow()
    bom.aprv_by = None  # Reset approval
    bom.aprv_dt = None
    
    # Update BOM Details version
    for detail in bom.details:
        detail.version_no = new_version_no
        detail.user_id = current_user.username
        detail.enter_dt = datetime.utcnow()
    
    db.commit()
    return {"message": "BOM version updated successfully", "new_version": new_version_no}
