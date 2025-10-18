from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Supplier schemas
class SupplierBase(BaseModel):
    sup_code: str
    sup_name: str
    address_1: Optional[str] = None
    address_2: Optional[str] = None
    address_3: Optional[str] = None
    address_4: Optional[str] = None
    phone: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    contact_person: Optional[str] = None
    mobile: Optional[str] = None
    country_code: Optional[str] = None
    currency: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[Decimal] = None
    is_active: bool = True

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(SupplierBase):
    sup_code: Optional[str] = None
    sup_name: Optional[str] = None

class Supplier(SupplierBase):
    id: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Raw Material schemas
class RawMaterialBase(BaseModel):
    raw_code: str
    raw_name: str
    raw_desc: Optional[str] = None
    raw_type: Optional[str] = None
    raw_grade: Optional[str] = None
    form_type: Optional[str] = None
    spec_group: Optional[str] = None
    unit_of_measure: Optional[str] = None
    shelf_life_months: Optional[int] = None
    storage_condition: Optional[str] = None
    cas_number: Optional[str] = None
    molecular_formula: Optional[str] = None
    molecular_weight: Optional[Decimal] = None
    hs_code: Optional[str] = None
    raw_stat: Optional[str] = 'C'
    is_active: bool = True

class RawMaterialCreate(RawMaterialBase):
    pass

class RawMaterialUpdate(RawMaterialBase):
    raw_code: Optional[str] = None
    raw_name: Optional[str] = None

class RawMaterial(RawMaterialBase):
    id: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Product Category schemas
class ProductCategoryBase(BaseModel):
    pcat_code: str
    pcat_name: str
    pcat_desc: Optional[str] = None
    is_active: bool = True

class ProductCategoryCreate(ProductCategoryBase):
    pass

class ProductCategoryUpdate(ProductCategoryBase):
    pcat_code: Optional[str] = None
    pcat_name: Optional[str] = None

class ProductCategory(ProductCategoryBase):
    id: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Department schemas
class DepartmentBase(BaseModel):
    dept_code: str
    dept_name: str
    dept_desc: Optional[str] = None
    is_active: bool = True

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int
    created_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Employee schemas
class EmployeeBase(BaseModel):
    emp_code: str
    emp_office_name: str
    dept_code: str
    job_category: Optional[str] = None
    is_active: bool = True

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    created_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Enhanced Product schemas
class ProductBase(BaseModel):
    product_code: str
    product_name: str
    product_desc: Optional[str] = None
    pcat_code: str
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    pack_size: Optional[str] = None
    pack_size1: Optional[str] = None
    pack_size2: Optional[str] = None
    ptype_desc: Optional[str] = None
    generic_name: Optional[str] = None
    therapeutic_class: Optional[str] = None
    drug_category: Optional[str] = None
    shelf_life_months: Optional[int] = None
    storage_condition: Optional[str] = None
    pack_type: Optional[str] = None
    mrp: Optional[Decimal] = None
    trade_price: Optional[Decimal] = None
    prod_stat: Optional[str] = 'C'
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    product_code: Optional[str] = None
    product_name: Optional[str] = None
    pcat_code: Optional[str] = None

class Product(ProductBase):
    id: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# BOM schemas
# Enhanced BOM Detail schemas
class BOMDetailBase(BaseModel):
    pcat_code: str
    p_code: str
    raw_code: str
    raw_type: Optional[str] = None
    declared_qnty: Optional[Decimal] = None
    declared_unit: Optional[str] = None
    ratio_type: Optional[str] = None
    ratio_ra: Optional[Decimal] = None
    unit_unit: Optional[str] = None
    unit_qnty: Optional[Decimal] = None
    qty_per_batch: Decimal
    overage: Optional[Decimal] = None
    qty_per_batch_issue: Optional[Decimal] = None
    batch_size: Optional[Decimal] = None
    batch_unit: Optional[str] = None
    annex_cont: Optional[Decimal] = None
    dec_volm_per_unit: Optional[Decimal] = None
    each_unit_qnty: Optional[Decimal] = None
    qty_per_batch_unit: Optional[str] = None
    qty_per_batch_cont: Optional[Decimal] = None
    qty_per_batch_unit_cont: Optional[str] = None
    filler_flag: Optional[str] = None
    annex: Optional[str] = None
    not_apper_flag: Optional[str] = None
    batch_size_qnty: Optional[Decimal] = None
    batch_size_qnty_unit: Optional[str] = None
    qs_to_make: Optional[str] = None
    each_unit_ratio: Optional[Decimal] = None
    raw_group: Optional[str] = None
    raw_cat: Optional[str] = None
    potency_ratio: Optional[Decimal] = None
    da_gen_code: Optional[str] = None
    each_unit_qnty_annex: Optional[Decimal] = None
    each_unit_qnty_unit_annex: Optional[str] = None
    seq: Optional[int] = None
    stat: Optional[str] = None
    prod_qty: Optional[Decimal] = None
    prod_qty_unit: Optional[str] = None
    version_no: Optional[str] = None
    raw_qnty: Optional[Decimal] = None
    raw_unit: Optional[str] = None
    raw_mole_wt: Optional[Decimal] = None
    gen_mole_wt: Optional[Decimal] = None
    raw_by_gen: Optional[Decimal] = None
    ref_book: Optional[str] = None
    ref_book_ver: Optional[str] = None
    ref_book_page: Optional[str] = None
    is_annex_raw: Optional[str] = None
    opl_p_code: Optional[str] = None
    opl_raw_code: Optional[str] = None
    raw_version_no: Optional[str] = None
    is_active: bool = True

class BOMDetailCreate(BOMDetailBase):
    pass

class BOMDetail(BOMDetailBase):
    id: int
    bom_id: int
    user_id: Optional[str] = None
    enter_dt: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Enhanced BOM Master schemas
class BOMBase(BaseModel):
    pcat_code: str
    product_code: str
    batch_size: Decimal
    batch_unit: Optional[str] = None
    bom_ratio: Optional[Decimal] = None
    annex_ratio: Optional[Decimal] = None
    batch_qnty: Optional[Decimal] = None
    batch_qnty_unit: Optional[str] = None
    pack1: Optional[str] = None
    pack2: Optional[str] = None
    pack3: Optional[str] = None
    per_unit_wt: Optional[Decimal] = None
    per_unit_wt_unit: Optional[str] = None
    std_avg_wt: Optional[Decimal] = None
    bmr_no: Optional[str] = None
    version_no: str
    eff_dt: Optional[date] = None
    prod_ld_time: Optional[int] = None
    prod_dosage_form: Optional[str] = None
    bom_code: Optional[str] = None
    label_ratio: Optional[Decimal] = None
    per_unit_solid_unit: Optional[str] = None
    dml_valid_upto: Optional[date] = None
    granul_method: Optional[str] = None
    max_bt_per_day: Optional[int] = None
    mon_sfty_stock: Optional[Decimal] = None
    bpr_version_no: Optional[str] = None
    bpr_eff_dt: Optional[date] = None
    bcr_version_no: Optional[str] = None
    bcr_eff_dt: Optional[date] = None
    opl_p_code: Optional[str] = None
    batch_per_large_unit: Optional[Decimal] = None
    batch_per_large_qnty: Optional[Decimal] = None
    note: Optional[str] = None
    initiator: Optional[str] = None
    aprv_by: Optional[str] = None
    aprv_dt: Optional[datetime] = None
    edit_by: Optional[str] = None
    edit_dt: Optional[datetime] = None
    auth_by: Optional[str] = None
    auth_dt: Optional[datetime] = None
    is_active: bool = True

class BOMCreate(BOMBase):
    details: list[BOMDetailCreate] = []

class BOMUpdate(BOMBase):
    pcat_code: Optional[str] = None
    product_code: Optional[str] = None
    batch_size: Optional[Decimal] = None
    version_no: Optional[str] = None

class BOM(BOMBase):
    id: int
    user_id: Optional[str] = None
    enter_dt: Optional[datetime] = None
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    details: list[BOMDetail] = []
    
    class Config:
        from_attributes = True

# Purchase Requisition schemas
class PurchaseRequisitionDetailBase(BaseModel):
    item_no: int
    raw_code: str
    quantity: Decimal
    unit_of_measure: Optional[str] = None
    estimated_rate: Optional[Decimal] = None
    estimated_amount: Optional[Decimal] = None
    required_date: Optional[date] = None
    specification: Optional[str] = None
    remarks: Optional[str] = None

class PurchaseRequisitionDetailCreate(PurchaseRequisitionDetailBase):
    pass

class PurchaseRequisitionDetail(PurchaseRequisitionDetailBase):
    id: int
    req_id: int
    
    class Config:
        from_attributes = True

class PurchaseRequisitionBase(BaseModel):
    req_no: str
    req_date: date
    department: Optional[str] = None
    requested_by: Optional[str] = None
    priority: str = "Normal"
    status: str = "Draft"
    total_amount: Optional[Decimal] = None
    currency: str = "USD"
    required_date: Optional[date] = None
    remarks: Optional[str] = None

class PurchaseRequisitionCreate(PurchaseRequisitionBase):
    items: list[PurchaseRequisitionDetailCreate] = []

class PurchaseRequisitionUpdate(PurchaseRequisitionBase):
    req_no: Optional[str] = None
    req_date: Optional[date] = None

class PurchaseRequisition(PurchaseRequisitionBase):
    id: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: list[PurchaseRequisitionDetail] = []
    
    class Config:
        from_attributes = True

# Production Plan schemas
class ProductionPlanBase(BaseModel):
    plan_no: str
    plan_date: date
    product_code: str
    planned_quantity: Decimal
    unit_of_measure: Optional[str] = None
    planned_start_date: Optional[date] = None
    planned_end_date: Optional[date] = None
    priority: str = "Normal"
    status: str = "Planned"
    batch_size: Optional[Decimal] = None
    number_of_batches: Optional[int] = None
    remarks: Optional[str] = None

class ProductionPlanCreate(ProductionPlanBase):
    pass

class ProductionPlanUpdate(ProductionPlanBase):
    plan_no: Optional[str] = None
    plan_date: Optional[date] = None
    product_code: Optional[str] = None
    planned_quantity: Optional[Decimal] = None

class ProductionPlan(ProductionPlanBase):
    id: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Quality Control schemas
class QualityControlTestBase(BaseModel):
    test_code: str
    test_name: str
    test_category: Optional[str] = None
    test_method: Optional[str] = None
    specification: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    is_active: bool = True

class QualityControlTestCreate(QualityControlTestBase):
    pass

class QualityControlTestUpdate(QualityControlTestBase):
    test_code: Optional[str] = None
    test_name: Optional[str] = None

class QualityControlTest(QualityControlTestBase):
    id: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Drug Registration schemas
class DrugRegistrationBase(BaseModel):
    drug_letter_ref_no: str
    drug_letter_date: Optional[date] = None
    product_code: str
    registration_type: Optional[str] = None
    application_date: Optional[date] = None
    approval_date: Optional[date] = None
    expiry_date: Optional[date] = None
    registration_number: Optional[str] = None
    status: str = "Applied"
    regulatory_authority: Optional[str] = None
    remarks: Optional[str] = None

class DrugRegistrationCreate(DrugRegistrationBase):
    pass

class DrugRegistrationUpdate(DrugRegistrationBase):
    drug_letter_ref_no: Optional[str] = None
    product_code: Optional[str] = None

class DrugRegistration(DrugRegistrationBase):
    id: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
