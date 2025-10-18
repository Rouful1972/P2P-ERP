from sqlalchemy import Column, Integer, String, DateTime, Numeric, Date, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

# User Management
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Suppliers
class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    sup_code = Column(String(10), unique=True, index=True, nullable=False)
    sup_name = Column(String(100), nullable=False)
    address_1 = Column(String(100))
    address_2 = Column(String(100))
    address_3 = Column(String(50))
    address_4 = Column(String(50))
    phone = Column(String(50))
    fax = Column(String(30))
    email = Column(String(50))
    website = Column(String(50))
    contact_person = Column(String(100))
    mobile = Column(String(30))
    country_code = Column(String(3))
    currency = Column(String(3))
    payment_terms = Column(String(50))
    credit_limit = Column(Numeric(15, 2))
    is_active = Column(Boolean, default=True)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Raw Materials
class RawMaterial(Base):
    __tablename__ = "raw_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    raw_code = Column(String(10), unique=True, index=True, nullable=False)
    raw_name = Column(String(300), nullable=False)
    raw_desc = Column(String(500))
    raw_type = Column(String(10))
    raw_grade = Column(String(20))  # Added for LOV support
    form_type = Column(String(10))
    spec_group = Column(String(10))
    unit_of_measure = Column(String(5))
    shelf_life_months = Column(Integer)
    storage_condition = Column(String(100))
    cas_number = Column(String(50))
    molecular_formula = Column(String(100))
    molecular_weight = Column(Numeric(10, 4))
    hs_code = Column(String(12))
    raw_stat = Column(String(1), default='C')  # C=Current, I=Inactive, N=New
    is_active = Column(Boolean, default=True)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Raw Material Specifications
class RawMaterialSpec(Base):
    __tablename__ = "raw_material_specs"
    
    id = Column(Integer, primary_key=True, index=True)
    raw_code = Column(String(10), ForeignKey("raw_materials.raw_code"), nullable=False)
    version_no = Column(String(6), nullable=False)
    test_parameter = Column(String(200), nullable=False)
    specification = Column(String(500))
    test_method = Column(String(200))
    acceptance_criteria = Column(String(500))
    is_active = Column(Boolean, default=True)
    effective_date = Column(Date)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    raw_material = relationship("RawMaterial", backref="specifications")

# Products
class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String(5), unique=True, index=True, nullable=False)
    product_name = Column(String(200), nullable=False)
    product_desc = Column(String(500))
    pcat_code = Column(String(10), ForeignKey("product_categories.pcat_code"), nullable=False)
    dosage_form = Column(String(50))
    strength = Column(String(100))
    pack_size = Column(String(50))
    pack_size1 = Column(String(20))  # For pack display
    pack_size2 = Column(String(20))  # For pack display
    ptype_desc = Column(String(100))
    generic_name = Column(String(200))
    therapeutic_class = Column(String(100))
    drug_category = Column(String(50))
    shelf_life_months = Column(Integer)
    storage_condition = Column(String(100))
    pack_type = Column(String(50))
    mrp = Column(Numeric(12, 4))
    trade_price = Column(Numeric(12, 4))
    prod_stat = Column(String(1), default='C')  # C=Current, I=Inactive, N=New
    is_active = Column(Boolean, default=True)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    category = relationship("ProductCategory", backref="products")

# Product Categories (PCAT)
class ProductCategory(Base):
    __tablename__ = "product_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    pcat_code = Column(String(10), unique=True, index=True, nullable=False)
    pcat_name = Column(String(100), nullable=False)
    pcat_desc = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Enhanced Bill of Materials (BOM_MODIFIED_MST)
class BillOfMaterials(Base):
    __tablename__ = "bill_of_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    pcat_code = Column(String(10), ForeignKey("product_categories.pcat_code"), nullable=False)
    product_code = Column(String(5), ForeignKey("products.product_code"), nullable=False)
    batch_size = Column(Numeric(12, 4), nullable=False)
    batch_unit = Column(String(5))
    bom_ratio = Column(Numeric(10, 4))
    annex_ratio = Column(Numeric(10, 4))
    batch_qnty = Column(Numeric(12, 4))
    batch_qnty_unit = Column(String(5))
    pack1 = Column(String(20))
    pack2 = Column(String(20))
    pack3 = Column(String(20))
    per_unit_wt = Column(Numeric(10, 4))
    per_unit_wt_unit = Column(String(5))
    std_avg_wt = Column(Numeric(10, 4))
    bmr_no = Column(String(50))  # Batch Manufacturing Record Number
    version_no = Column(String(6), nullable=False)
    eff_dt = Column(Date)  # Effective Date
    prod_ld_time = Column(Integer)  # Production Lead Time
    prod_dosage_form = Column(String(50))
    bom_code = Column(String(20))
    label_ratio = Column(Numeric(10, 4))
    per_unit_solid_unit = Column(String(5))
    dml_valid_upto = Column(Date)  # Document Valid Until
    granul_method = Column(String(100))  # Granulation Method
    max_bt_per_day = Column(Integer)  # Max Batches Per Day
    mon_sfty_stock = Column(Numeric(12, 4))  # Monthly Safety Stock
    bpr_version_no = Column(String(6))  # Batch Production Record Version
    bpr_eff_dt = Column(Date)  # BPR Effective Date
    bcr_version_no = Column(String(6))  # Batch Control Record Version
    bcr_eff_dt = Column(Date)  # BCR Effective Date
    opl_p_code = Column(String(5))  # Original Product Code
    batch_per_large_unit = Column(Numeric(12, 4))
    batch_per_large_qnty = Column(Numeric(12, 4))
    note = Column(Text)
    user_id = Column(String(10))
    enter_dt = Column(DateTime, default=datetime.utcnow)
    initiator = Column(String(10), ForeignKey("employees.emp_code"))
    aprv_by = Column(String(10), ForeignKey("employees.emp_code"))  # Approved By
    aprv_dt = Column(DateTime)  # Approval Date
    edit_by = Column(String(10), ForeignKey("employees.emp_code"))  # Edited By
    edit_dt = Column(DateTime)  # Edit Date
    auth_by = Column(String(10), ForeignKey("employees.emp_code"))  # Authorized By
    auth_dt = Column(DateTime)  # Authorization Date
    is_active = Column(Boolean, default=True)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    product = relationship("Product", backref="boms")
    category = relationship("ProductCategory", backref="boms")
    initiator_emp = relationship("Employee", foreign_keys=[initiator], backref="initiated_boms")
    approver_emp = relationship("Employee", foreign_keys=[aprv_by], backref="approved_boms")
    editor_emp = relationship("Employee", foreign_keys=[edit_by], backref="edited_boms")
    authorizer_emp = relationship("Employee", foreign_keys=[auth_by], backref="authorized_boms")

# Enhanced BOM Details (BOM_MODIFIED)
class BOMDetail(Base):
    __tablename__ = "bom_details"
    
    id = Column(Integer, primary_key=True, index=True)
    bom_id = Column(Integer, ForeignKey("bill_of_materials.id"), nullable=False)
    pcat_code = Column(String(10), ForeignKey("product_categories.pcat_code"), nullable=False)
    p_code = Column(String(5), ForeignKey("products.product_code"), nullable=False)
    raw_code = Column(String(10), ForeignKey("raw_materials.raw_code"), nullable=False)
    raw_type = Column(String(10))
    declared_qnty = Column(Numeric(12, 4))
    declared_unit = Column(String(5))
    ratio_type = Column(String(10))
    ratio_ra = Column(Numeric(10, 4))
    unit_unit = Column(String(5))
    unit_qnty = Column(Numeric(12, 4))
    qty_per_batch = Column(Numeric(12, 4), nullable=False)
    overage = Column(Numeric(10, 4))
    qty_per_batch_issue = Column(Numeric(12, 4))
    batch_size = Column(Numeric(12, 4))
    batch_unit = Column(String(5))
    annex_cont = Column(Numeric(10, 4))
    dec_volm_per_unit = Column(Numeric(10, 4))
    each_unit_qnty = Column(Numeric(12, 4))
    qty_per_batch_unit = Column(String(5))
    qty_per_batch_cont = Column(Numeric(12, 4))
    qty_per_batch_unit_cont = Column(String(5))
    filler_flag = Column(String(1))
    annex = Column(String(1))
    not_apper_flag = Column(String(1))
    batch_size_qnty = Column(Numeric(12, 4))
    batch_size_qnty_unit = Column(String(5))
    qs_to_make = Column(String(100))  # QS (Quantum Sufficit) to make
    each_unit_ratio = Column(Numeric(10, 4))
    raw_group = Column(String(10))
    raw_cat = Column(String(10))
    potency_ratio = Column(Numeric(10, 4))
    da_gen_code = Column(String(10))
    each_unit_qnty_annex = Column(Numeric(12, 4))
    each_unit_qnty_unit_annex = Column(String(5))
    seq = Column(Integer)  # Sequence
    stat = Column(String(1))  # Status
    prod_qty = Column(Numeric(12, 4))
    prod_qty_unit = Column(String(5))
    version_no = Column(String(6))
    raw_qnty = Column(Numeric(12, 4))
    raw_unit = Column(String(5))
    raw_mole_wt = Column(Numeric(10, 4))  # Raw Material Molecular Weight
    gen_mole_wt = Column(Numeric(10, 4))  # Generic Molecular Weight
    raw_by_gen = Column(Numeric(10, 4))
    ref_book = Column(String(100))  # Reference Book
    ref_book_ver = Column(String(10))  # Reference Book Version
    ref_book_page = Column(String(20))  # Reference Book Page
    is_annex_raw = Column(String(1))
    opl_p_code = Column(String(5))  # Original Product Code
    opl_raw_code = Column(String(10))  # Original Raw Material Code
    raw_version_no = Column(String(6))
    user_id = Column(String(10))
    enter_dt = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    bom = relationship("BillOfMaterials", backref="details")
    raw_material = relationship("RawMaterial", backref="bom_usages")
    product = relationship("Product", backref="bom_raw_materials")
    category = relationship("ProductCategory", backref="bom_details")

# Purchase Requisitions
class PurchaseRequisition(Base):
    __tablename__ = "purchase_requisitions"
    
    id = Column(Integer, primary_key=True, index=True)
    req_no = Column(String(20), unique=True, index=True, nullable=False)
    req_date = Column(Date, nullable=False)
    department = Column(String(50))
    requested_by = Column(String(50))
    priority = Column(String(10), default="Normal")  # High, Normal, Low
    status = Column(String(20), default="Draft")  # Draft, Submitted, Approved, Rejected
    total_amount = Column(Numeric(15, 2))
    currency = Column(String(3), default="USD")
    required_date = Column(Date)
    remarks = Column(Text)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Purchase Requisition Details
class PurchaseRequisitionDetail(Base):
    __tablename__ = "purchase_requisition_details"
    
    id = Column(Integer, primary_key=True, index=True)
    req_id = Column(Integer, ForeignKey("purchase_requisitions.id"), nullable=False)
    item_no = Column(Integer, nullable=False)
    raw_code = Column(String(10), ForeignKey("raw_materials.raw_code"), nullable=False)
    quantity = Column(Numeric(12, 4), nullable=False)
    unit_of_measure = Column(String(5))
    estimated_rate = Column(Numeric(12, 4))
    estimated_amount = Column(Numeric(15, 2))
    required_date = Column(Date)
    specification = Column(Text)
    remarks = Column(Text)
    
    requisition = relationship("PurchaseRequisition", backref="items")
    raw_material = relationship("RawMaterial", backref="requisitions")

# Purchase Orders
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    po_no = Column(String(20), unique=True, index=True, nullable=False)
    po_date = Column(Date, nullable=False)
    sup_code = Column(String(10), ForeignKey("suppliers.sup_code"), nullable=False)
    currency = Column(String(3), default="USD")
    exchange_rate = Column(Numeric(10, 4), default=1)
    payment_terms = Column(String(100))
    delivery_terms = Column(String(100))
    delivery_address = Column(Text)
    total_amount = Column(Numeric(15, 2))
    discount_amount = Column(Numeric(15, 2), default=0)
    tax_amount = Column(Numeric(15, 2), default=0)
    net_amount = Column(Numeric(15, 2))
    status = Column(String(20), default="Draft")  # Draft, Sent, Acknowledged, Closed
    delivery_date = Column(Date)
    remarks = Column(Text)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    supplier = relationship("Supplier", backref="purchase_orders")

# Purchase Order Details
class PurchaseOrderDetail(Base):
    __tablename__ = "purchase_order_details"
    
    id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    item_no = Column(Integer, nullable=False)
    raw_code = Column(String(10), ForeignKey("raw_materials.raw_code"), nullable=False)
    quantity = Column(Numeric(12, 4), nullable=False)
    unit_of_measure = Column(String(5))
    unit_rate = Column(Numeric(12, 4), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    delivery_date = Column(Date)
    specification = Column(Text)
    remarks = Column(Text)
    
    purchase_order = relationship("PurchaseOrder", backref="items")
    raw_material = relationship("RawMaterial", backref="purchase_orders")

# Production Plans
class ProductionPlan(Base):
    __tablename__ = "production_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_no = Column(String(20), unique=True, index=True, nullable=False)
    plan_date = Column(Date, nullable=False)
    product_code = Column(String(5), ForeignKey("products.product_code"), nullable=False)
    planned_quantity = Column(Numeric(12, 4), nullable=False)
    unit_of_measure = Column(String(5))
    planned_start_date = Column(Date)
    planned_end_date = Column(Date)
    priority = Column(String(10), default="Normal")
    status = Column(String(20), default="Planned")  # Planned, In Progress, Completed, Cancelled
    batch_size = Column(Numeric(12, 4))
    number_of_batches = Column(Integer)
    remarks = Column(Text)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    product = relationship("Product", backref="production_plans")

# Drug Registration
class DrugRegistration(Base):
    __tablename__ = "drug_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    drug_letter_ref_no = Column(String(40), unique=True, index=True, nullable=False)
    drug_letter_date = Column(Date)
    product_code = Column(String(5), ForeignKey("products.product_code"), nullable=False)
    registration_type = Column(String(20))  # New, Renewal, Amendment
    application_date = Column(Date)
    approval_date = Column(Date)
    expiry_date = Column(Date)
    registration_number = Column(String(50))
    status = Column(String(20), default="Applied")  # Applied, Approved, Rejected, Expired
    regulatory_authority = Column(String(100))
    remarks = Column(Text)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    product = relationship("Product", backref="registrations")

# Quality Control Tests
class QualityControlTest(Base):
    __tablename__ = "qc_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    test_code = Column(String(10), unique=True, index=True, nullable=False)
    test_name = Column(String(200), nullable=False)
    test_category = Column(String(50))  # Raw Material, Finished Product, In-Process
    test_method = Column(Text)
    specification = Column(Text)
    acceptance_criteria = Column(Text)
    is_active = Column(Boolean, default=True)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Letter of Credit
class LetterOfCredit(Base):
    __tablename__ = "letter_of_credits"
    
    id = Column(Integer, primary_key=True, index=True)
    lc_no = Column(String(20), unique=True, index=True, nullable=False)
    lc_date = Column(Date, nullable=False)
    sup_code = Column(String(10), ForeignKey("suppliers.sup_code"), nullable=False)
    bank_code = Column(String(10))
    lc_amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String(3), default="USD")
    expiry_date = Column(Date)
    latest_shipment_date = Column(Date)
    payment_terms = Column(String(100))
    delivery_terms = Column(String(100))
    port_of_loading = Column(String(100))
    port_of_discharge = Column(String(100))
    partial_shipment = Column(Boolean, default=True)
    transhipment = Column(Boolean, default=True)
    status = Column(String(20), default="Open")  # Open, Amended, Closed, Expired
    remarks = Column(Text)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    supplier = relationship("Supplier", backref="lcs")

# LC Details
class LetterOfCreditDetail(Base):
    __tablename__ = "lc_details"
    
    id = Column(Integer, primary_key=True, index=True)
    lc_id = Column(Integer, ForeignKey("letter_of_credits.id"), nullable=False)
    raw_code = Column(String(10), ForeignKey("raw_materials.raw_code"), nullable=False)
    quantity = Column(Numeric(12, 4), nullable=False)
    unit_of_measure = Column(String(5))
    unit_price = Column(Numeric(12, 4), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    tolerance_percentage = Column(Numeric(5, 2), default=0)
    
    lc = relationship("LetterOfCredit", backref="items")
    raw_material = relationship("RawMaterial", backref="lc_items")

# Employee Management
class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    dept_code = Column(String(10), unique=True, index=True, nullable=False)
    dept_name = Column(String(100), nullable=False)
    dept_desc = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    emp_code = Column(String(10), unique=True, index=True, nullable=False)
    emp_office_name = Column(String(100), nullable=False)
    dept_code = Column(String(10), ForeignKey("departments.dept_code"), nullable=False)
    job_category = Column(String(5))
    is_active = Column(Boolean, default=True)
    created_by = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    department = relationship("Department", backref="employees")

# BOM History Master Table (HBOM_MODIFIED_MST)
class BOMHistoryMaster(Base):
    __tablename__ = "bom_history_master"
    
    id = Column(Integer, primary_key=True, index=True)
    pcat_code = Column(String(10), nullable=False)
    p_code = Column(String(5), nullable=False)
    batch_size = Column(Numeric(12, 4))
    batch_unit = Column(String(5))
    bom_ratio = Column(Numeric(10, 4))
    annex_ratio = Column(Numeric(10, 4))
    batch_qnty = Column(Numeric(12, 4))
    batch_qnty_unit = Column(String(5))
    pack1 = Column(String(20))
    pack2 = Column(String(20))
    pack3 = Column(String(20))
    per_unit_wt = Column(Numeric(10, 4))
    per_unit_wt_unit = Column(String(5))
    std_avg_wt = Column(Numeric(10, 4))
    bmr_no = Column(String(50))
    version_no = Column(String(6))
    eff_dt = Column(Date)
    prod_ld_time = Column(Integer)
    prod_dosage_form = Column(String(50))
    bom_code = Column(String(20))
    label_ratio = Column(Numeric(10, 4))
    per_unit_solid_unit = Column(String(5))
    dml_valid_upto = Column(Date)
    granul_method = Column(String(100))
    max_bt_per_day = Column(Integer)
    mon_sfty_stock = Column(Numeric(12, 4))
    bpr_version_no = Column(String(6))
    bpr_eff_dt = Column(Date)
    bcr_version_no = Column(String(6))
    bcr_eff_dt = Column(Date)
    opl_p_code = Column(String(5))
    batch_per_large_unit = Column(Numeric(12, 4))
    batch_per_large_qnty = Column(Numeric(12, 4))
    note = Column(Text)
    user_id = Column(String(10))
    enter_dt = Column(DateTime)
    initiator = Column(String(10))
    aprv_by = Column(String(10))
    aprv_dt = Column(DateTime)
    edit_by = Column(String(10))
    edit_dt = Column(DateTime)
    auth_by = Column(String(10))
    auth_dt = Column(DateTime)
    sl_no = Column(Integer)  # Serial Number for history
    hist_by = Column(String(10))  # History Created By
    hist_dt = Column(DateTime, default=datetime.utcnow)  # History Created Date

# BOM History Details Table (HBOM_MODIFIED)
class BOMHistoryDetail(Base):
    __tablename__ = "bom_history_details"
    
    id = Column(Integer, primary_key=True, index=True)
    hist_master_id = Column(Integer, ForeignKey("bom_history_master.id"), nullable=False)
    pcat_code = Column(String(10))
    p_code = Column(String(5))
    raw_code = Column(String(10))
    raw_type = Column(String(10))
    declared_qnty = Column(Numeric(12, 4))
    declared_unit = Column(String(5))
    ratio_type = Column(String(10))
    ratio_ra = Column(Numeric(10, 4))
    unit_unit = Column(String(5))
    unit_qnty = Column(Numeric(12, 4))
    qty_per_batch = Column(Numeric(12, 4))
    overage = Column(Numeric(10, 4))
    qty_per_batch_issue = Column(Numeric(12, 4))
    batch_size = Column(Numeric(12, 4))
    batch_unit = Column(String(5))
    annex_cont = Column(Numeric(10, 4))
    dec_volm_per_unit = Column(Numeric(10, 4))
    each_unit_qnty = Column(Numeric(12, 4))
    qty_per_batch_unit = Column(String(5))
    qty_per_batch_cont = Column(Numeric(12, 4))
    qty_per_batch_unit_cont = Column(String(5))
    filler_flag = Column(String(1))
    annex = Column(String(1))
    not_apper_flag = Column(String(1))
    batch_size_qnty = Column(Numeric(12, 4))
    batch_size_qnty_unit = Column(String(5))
    qs_to_make = Column(String(100))
    each_unit_ratio = Column(Numeric(10, 4))
    raw_group = Column(String(10))
    raw_cat = Column(String(10))
    potency_ratio = Column(Numeric(10, 4))
    da_gen_code = Column(String(10))
    each_unit_qnty_annex = Column(Numeric(12, 4))
    each_unit_qnty_unit_annex = Column(String(5))
    seq = Column(Integer)
    stat = Column(String(1))
    prod_qty = Column(Numeric(12, 4))
    prod_qty_unit = Column(String(5))
    version_no = Column(String(6))
    raw_qnty = Column(Numeric(12, 4))
    raw_unit = Column(String(5))
    raw_mole_wt = Column(Numeric(10, 4))
    gen_mole_wt = Column(Numeric(10, 4))
    raw_by_gen = Column(Numeric(10, 4))
    ref_book = Column(String(100))
    ref_book_ver = Column(String(10))
    ref_book_page = Column(String(20))
    is_annex_raw = Column(String(1))
    opl_p_code = Column(String(5))
    opl_raw_code = Column(String(10))
    raw_version_no = Column(String(6))
    user_id = Column(String(10))
    enter_dt = Column(DateTime)
    sl_no = Column(Integer)
    hist_by = Column(String(10))
    hist_dt = Column(DateTime, default=datetime.utcnow)
    
    history_master = relationship("BOMHistoryMaster", backref="history_details")
