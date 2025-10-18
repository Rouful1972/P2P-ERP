from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional

from database.database import get_db
from database.models import Product, RawMaterial, Employee, Department, ProductCategory
from routers.auth import get_current_user

router = APIRouter()

@router.get("/products")
def get_product_lov(
    pcat_code: Optional[str] = Query(None, description="Product category code filter"),
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Product LOV based on your README requirements:
    SELECT A.P_DESC,A.P_CODE,A.PACK_SIZE,A.PACK_SIZE1||' X '||A.PACK_SIZE2 PACK,A.PTYPE_DESC,
    A.COM_CODE,A.PCAT_CODE
    FROM PRODUCT_ALL_VW A,
    (SELECT P_CODE FROM PRODUCT_ALL_VW
    MINUS
    SELECT P_CODE FROM BOM_MODIFIED_MST) B
    WHERE A.P_CODE = B.P_CODE 
    AND PCAT_CODE NOT IN ('STK','TRF','LON')
    AND NVL(PROD_STAT,'N') IN ('C','I')
    AND PCAT_CODE=:PCAT.PCAT_CODE
    ORDER BY A.P_DESC;
    """
    
    # Get products that don't have BOM yet (excluding certain categories)
    excluded_categories = ['STK', 'TRF', 'LON']
    
    # Subquery to get products without BOM
    products_without_bom = db.query(Product.product_code).filter(
        ~Product.product_code.in_(
            db.query(Product.product_code).join(Product.boms)
        )
    ).subquery()
    
    # Main query
    query = db.query(Product).filter(
        Product.product_code.in_(products_without_bom),
        ~Product.pcat_code.in_(excluded_categories),
        Product.prod_stat.in_(['C', 'I']),  # Current or Inactive
        Product.is_active == True
    )
    
    if pcat_code:
        query = query.filter(Product.pcat_code == pcat_code)
    
    products = query.order_by(Product.product_name).all()
    
    result = []
    for product in products:
        pack_display = ""
        if product.pack_size1 and product.pack_size2:
            pack_display = f"{product.pack_size1} X {product.pack_size2}"
        
        result.append({
            "p_desc": product.product_name,
            "p_code": product.product_code,
            "pack_size": product.pack_size,
            "pack": pack_display,
            "ptype_desc": product.ptype_desc,
            "pcat_code": product.pcat_code,
            "dosage_form": product.dosage_form,
            "strength": product.strength
        })
    
    return result

@router.get("/raw-materials")
def get_raw_material_lov(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Raw Material LOV based on your README requirements:
    SELECT RAW_CODE, RAW_DESC, RAW_GRADE, RAW_TYPE
    FROM RAW_MAT
    WHERE RAW_DESC NOT LIKE '%**%'
    AND NVL(RAW_STAT,'N')='C'
    ORDER BY RAW_DESC;
    """
    
    raw_materials = db.query(RawMaterial).filter(
        ~RawMaterial.raw_name.like('%**%'),  # Exclude items with ** in description
        RawMaterial.raw_stat == 'C',  # Current status
        RawMaterial.is_active == True
    ).order_by(RawMaterial.raw_name).all()
    
    result = []
    for raw_mat in raw_materials:
        result.append({
            "raw_code": raw_mat.raw_code,
            "raw_desc": raw_mat.raw_name,
            "raw_grade": raw_mat.raw_grade,
            "raw_type": raw_mat.raw_type,
            "unit_of_measure": raw_mat.unit_of_measure,
            "molecular_weight": raw_mat.molecular_weight
        })
    
    return result

@router.get("/employees")
def get_employee_lov(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Employee LOV based on your README requirements:
    SELECT A.EMP_OFFICE_NAME,A.EMP_CODE,B.DEPT_DESC
    FROM PMIS_EMP A,PMIS.PMIS_DEPARTMENT B
    WHERE A.DEPT_CODE = B.DEPT_CODE
    AND NVL(A.DEPT_CODE,'X') IN ('055','080','097','087','093','089','016','002','061','057')
    AND NVL(A.JOB_CATEGORY,'X')<>'5'
    ORDER BY 1;
    """
    
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

@router.get("/product-categories")
def get_product_category_lov(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all active product categories for LOV"""
    
    categories = db.query(ProductCategory).filter(
        ProductCategory.is_active == True
    ).order_by(ProductCategory.pcat_name).all()
    
    result = []
    for cat in categories:
        result.append({
            "pcat_code": cat.pcat_code,
            "pcat_name": cat.pcat_name,
            "pcat_desc": cat.pcat_desc
        })
    
    return result

@router.get("/products-with-bom")
def get_products_with_bom_lov(
    pcat_code: Optional[str] = Query(None, description="Product category code filter"),
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Get products that already have BOM for version management"""
    
    query = db.query(Product).filter(
        Product.product_code.in_(
            db.query(Product.product_code).join(Product.boms)
        ),
        Product.prod_stat.in_(['C', 'I']),
        Product.is_active == True
    )
    
    if pcat_code:
        query = query.filter(Product.pcat_code == pcat_code)
    
    products = query.order_by(Product.product_name).all()
    
    result = []
    for product in products:
        # Get latest BOM version
        latest_bom = db.query(product.boms).order_by(-product.boms.c.version_no).first()
        
        result.append({
            "p_desc": product.product_name,
            "p_code": product.product_code,
            "pack_size": product.pack_size,
            "pcat_code": product.pcat_code,
            "current_version": latest_bom.version_no if latest_bom else None,
            "dosage_form": product.dosage_form,
            "strength": product.strength
        })
    
    return result
