-- Enhanced Pharma ERP Database Migration Script
-- This script adds all the new tables and fields for full alignment with your business requirements

-- Create Product Categories table (PCAT)
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    pcat_code VARCHAR(10) UNIQUE NOT NULL,
    pcat_name VARCHAR(100) NOT NULL,
    pcat_desc VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    dept_code VARCHAR(10) UNIQUE NOT NULL,
    dept_name VARCHAR(100) NOT NULL,
    dept_desc VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    emp_code VARCHAR(10) UNIQUE NOT NULL,
    emp_office_name VARCHAR(100) NOT NULL,
    dept_code VARCHAR(10) REFERENCES departments(dept_code),
    job_category VARCHAR(5),
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS pcat_code VARCHAR(10) REFERENCES product_categories(pcat_code);
ALTER TABLE products ADD COLUMN IF NOT EXISTS pack_size1 VARCHAR(20);
ALTER TABLE products ADD COLUMN IF NOT EXISTS pack_size2 VARCHAR(20);
ALTER TABLE products ADD COLUMN IF NOT EXISTS ptype_desc VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS prod_stat VARCHAR(1) DEFAULT 'C';

-- Add missing columns to raw_materials table
ALTER TABLE raw_materials ADD COLUMN IF NOT EXISTS raw_grade VARCHAR(20);
ALTER TABLE raw_materials ADD COLUMN IF NOT EXISTS raw_stat VARCHAR(1) DEFAULT 'C';

-- Drop and recreate bill_of_materials table with enhanced fields
DROP TABLE IF EXISTS bom_details CASCADE;
DROP TABLE IF EXISTS bill_of_materials CASCADE;

CREATE TABLE bill_of_materials (
    id SERIAL PRIMARY KEY,
    pcat_code VARCHAR(10) REFERENCES product_categories(pcat_code) NOT NULL,
    product_code VARCHAR(5) REFERENCES products(product_code) NOT NULL,
    batch_size DECIMAL(12,4) NOT NULL,
    batch_unit VARCHAR(5),
    bom_ratio DECIMAL(10,4),
    annex_ratio DECIMAL(10,4),
    batch_qnty DECIMAL(12,4),
    batch_qnty_unit VARCHAR(5),
    pack1 VARCHAR(20),
    pack2 VARCHAR(20),
    pack3 VARCHAR(20),
    per_unit_wt DECIMAL(10,4),
    per_unit_wt_unit VARCHAR(5),
    std_avg_wt DECIMAL(10,4),
    bmr_no VARCHAR(50),
    version_no VARCHAR(6) NOT NULL,
    eff_dt DATE,
    prod_ld_time INTEGER,
    prod_dosage_form VARCHAR(50),
    bom_code VARCHAR(20),
    label_ratio DECIMAL(10,4),
    per_unit_solid_unit VARCHAR(5),
    dml_valid_upto DATE,
    granul_method VARCHAR(100),
    max_bt_per_day INTEGER,
    mon_sfty_stock DECIMAL(12,4),
    bpr_version_no VARCHAR(6),
    bpr_eff_dt DATE,
    bcr_version_no VARCHAR(6),
    bcr_eff_dt DATE,
    opl_p_code VARCHAR(5),
    batch_per_large_unit DECIMAL(12,4),
    batch_per_large_qnty DECIMAL(12,4),
    note TEXT,
    user_id VARCHAR(10),
    enter_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    initiator VARCHAR(10) REFERENCES employees(emp_code),
    aprv_by VARCHAR(10) REFERENCES employees(emp_code),
    aprv_dt TIMESTAMP,
    edit_by VARCHAR(10) REFERENCES employees(emp_code),
    edit_dt TIMESTAMP,
    auth_by VARCHAR(10) REFERENCES employees(emp_code),
    auth_dt TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enhanced BOM Details table
CREATE TABLE bom_details (
    id SERIAL PRIMARY KEY,
    bom_id INTEGER REFERENCES bill_of_materials(id) NOT NULL,
    pcat_code VARCHAR(10) REFERENCES product_categories(pcat_code) NOT NULL,
    p_code VARCHAR(5) REFERENCES products(product_code) NOT NULL,
    raw_code VARCHAR(10) REFERENCES raw_materials(raw_code) NOT NULL,
    raw_type VARCHAR(10),
    declared_qnty DECIMAL(12,4),
    declared_unit VARCHAR(5),
    ratio_type VARCHAR(10),
    ratio_ra DECIMAL(10,4),
    unit_unit VARCHAR(5),
    unit_qnty DECIMAL(12,4),
    qty_per_batch DECIMAL(12,4) NOT NULL,
    overage DECIMAL(10,4),
    qty_per_batch_issue DECIMAL(12,4),
    batch_size DECIMAL(12,4),
    batch_unit VARCHAR(5),
    annex_cont DECIMAL(10,4),
    dec_volm_per_unit DECIMAL(10,4),
    each_unit_qnty DECIMAL(12,4),
    qty_per_batch_unit VARCHAR(5),
    qty_per_batch_cont DECIMAL(12,4),
    qty_per_batch_unit_cont VARCHAR(5),
    filler_flag VARCHAR(1),
    annex VARCHAR(1),
    not_apper_flag VARCHAR(1),
    batch_size_qnty DECIMAL(12,4),
    batch_size_qnty_unit VARCHAR(5),
    qs_to_make VARCHAR(100),
    each_unit_ratio DECIMAL(10,4),
    raw_group VARCHAR(10),
    raw_cat VARCHAR(10),
    potency_ratio DECIMAL(10,4),
    da_gen_code VARCHAR(10),
    each_unit_qnty_annex DECIMAL(12,4),
    each_unit_qnty_unit_annex VARCHAR(5),
    seq INTEGER,
    stat VARCHAR(1),
    prod_qty DECIMAL(12,4),
    prod_qty_unit VARCHAR(5),
    version_no VARCHAR(6),
    raw_qnty DECIMAL(12,4),
    raw_unit VARCHAR(5),
    raw_mole_wt DECIMAL(10,4),
    gen_mole_wt DECIMAL(10,4),
    raw_by_gen DECIMAL(10,4),
    ref_book VARCHAR(100),
    ref_book_ver VARCHAR(10),
    ref_book_page VARCHAR(20),
    is_annex_raw VARCHAR(1),
    opl_p_code VARCHAR(5),
    opl_raw_code VARCHAR(10),
    raw_version_no VARCHAR(6),
    user_id VARCHAR(10),
    enter_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create BOM History Master table
CREATE TABLE bom_history_master (
    id SERIAL PRIMARY KEY,
    pcat_code VARCHAR(10) NOT NULL,
    p_code VARCHAR(5) NOT NULL,
    batch_size DECIMAL(12,4),
    batch_unit VARCHAR(5),
    bom_ratio DECIMAL(10,4),
    annex_ratio DECIMAL(10,4),
    batch_qnty DECIMAL(12,4),
    batch_qnty_unit VARCHAR(5),
    pack1 VARCHAR(20),
    pack2 VARCHAR(20),
    pack3 VARCHAR(20),
    per_unit_wt DECIMAL(10,4),
    per_unit_wt_unit VARCHAR(5),
    std_avg_wt DECIMAL(10,4),
    bmr_no VARCHAR(50),
    version_no VARCHAR(6),
    eff_dt DATE,
    prod_ld_time INTEGER,
    prod_dosage_form VARCHAR(50),
    bom_code VARCHAR(20),
    label_ratio DECIMAL(10,4),
    per_unit_solid_unit VARCHAR(5),
    dml_valid_upto DATE,
    granul_method VARCHAR(100),
    max_bt_per_day INTEGER,
    mon_sfty_stock DECIMAL(12,4),
    bpr_version_no VARCHAR(6),
    bpr_eff_dt DATE,
    bcr_version_no VARCHAR(6),
    bcr_eff_dt DATE,
    opl_p_code VARCHAR(5),
    batch_per_large_unit DECIMAL(12,4),
    batch_per_large_qnty DECIMAL(12,4),
    note TEXT,
    user_id VARCHAR(10),
    enter_dt TIMESTAMP,
    initiator VARCHAR(10),
    aprv_by VARCHAR(10),
    aprv_dt TIMESTAMP,
    edit_by VARCHAR(10),
    edit_dt TIMESTAMP,
    auth_by VARCHAR(10),
    auth_dt TIMESTAMP,
    sl_no INTEGER,
    hist_by VARCHAR(10),
    hist_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create BOM History Details table
CREATE TABLE bom_history_details (
    id SERIAL PRIMARY KEY,
    hist_master_id INTEGER REFERENCES bom_history_master(id) NOT NULL,
    pcat_code VARCHAR(10),
    p_code VARCHAR(5),
    raw_code VARCHAR(10),
    raw_type VARCHAR(10),
    declared_qnty DECIMAL(12,4),
    declared_unit VARCHAR(5),
    ratio_type VARCHAR(10),
    ratio_ra DECIMAL(10,4),
    unit_unit VARCHAR(5),
    unit_qnty DECIMAL(12,4),
    qty_per_batch DECIMAL(12,4),
    overage DECIMAL(10,4),
    qty_per_batch_issue DECIMAL(12,4),
    batch_size DECIMAL(12,4),
    batch_unit VARCHAR(5),
    annex_cont DECIMAL(10,4),
    dec_volm_per_unit DECIMAL(10,4),
    each_unit_qnty DECIMAL(12,4),
    qty_per_batch_unit VARCHAR(5),
    qty_per_batch_cont DECIMAL(12,4),
    qty_per_batch_unit_cont VARCHAR(5),
    filler_flag VARCHAR(1),
    annex VARCHAR(1),
    not_apper_flag VARCHAR(1),
    batch_size_qnty DECIMAL(12,4),
    batch_size_qnty_unit VARCHAR(5),
    qs_to_make VARCHAR(100),
    each_unit_ratio DECIMAL(10,4),
    raw_group VARCHAR(10),
    raw_cat VARCHAR(10),
    potency_ratio DECIMAL(10,4),
    da_gen_code VARCHAR(10),
    each_unit_qnty_annex DECIMAL(12,4),
    each_unit_qnty_unit_annex VARCHAR(5),
    seq INTEGER,
    stat VARCHAR(1),
    prod_qty DECIMAL(12,4),
    prod_qty_unit VARCHAR(5),
    version_no VARCHAR(6),
    raw_qnty DECIMAL(12,4),
    raw_unit VARCHAR(5),
    raw_mole_wt DECIMAL(10,4),
    gen_mole_wt DECIMAL(10,4),
    raw_by_gen DECIMAL(10,4),
    ref_book VARCHAR(100),
    ref_book_ver VARCHAR(10),
    ref_book_page VARCHAR(20),
    is_annex_raw VARCHAR(1),
    opl_p_code VARCHAR(5),
    opl_raw_code VARCHAR(10),
    raw_version_no VARCHAR(6),
    user_id VARCHAR(10),
    enter_dt TIMESTAMP,
    sl_no INTEGER,
    hist_by VARCHAR(10),
    hist_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for Product Categories
INSERT INTO product_categories (pcat_code, pcat_name, pcat_desc, created_by) VALUES
('TAB', 'Tablets', 'Solid dosage form tablets', 'SYSTEM'),
('CAP', 'Capsules', 'Hard and soft gelatin capsules', 'SYSTEM'),
('SYR', 'Syrups', 'Liquid oral dosage forms', 'SYSTEM'),
('INJ', 'Injections', 'Parenteral dosage forms', 'SYSTEM'),
('OIN', 'Ointments', 'Topical semi-solid dosage forms', 'SYSTEM'),
('STK', 'Stock Items', 'Stock/Inventory items', 'SYSTEM'),
('TRF', 'Transfer Items', 'Transfer items', 'SYSTEM'),
('LON', 'Loan Items', 'Loan items', 'SYSTEM');

-- Insert sample departments (BOM eligible departments as per your README)
INSERT INTO departments (dept_code, dept_name, dept_desc, created_by) VALUES
('055', 'Production Planning', 'Production Planning Department', 'SYSTEM'),
('080', 'Quality Control', 'Quality Control Department', 'SYSTEM'),
('097', 'Research & Development', 'R&D Department', 'SYSTEM'),
('087', 'Manufacturing', 'Manufacturing Department', 'SYSTEM'),
('093', 'Quality Assurance', 'Quality Assurance Department', 'SYSTEM'),
('089', 'Regulatory Affairs', 'Regulatory Affairs Department', 'SYSTEM'),
('016', 'Engineering', 'Engineering Department', 'SYSTEM'),
('002', 'Administration', 'Administration Department', 'SYSTEM'),
('061', 'Purchase', 'Purchase Department', 'SYSTEM'),
('057', 'Store & Inventory', 'Store & Inventory Department', 'SYSTEM');

-- Insert sample employees
INSERT INTO employees (emp_code, emp_office_name, dept_code, job_category, created_by) VALUES
('EMP001', 'John Doe - Production Manager', '055', '3', 'SYSTEM'),
('EMP002', 'Jane Smith - QC Manager', '080', '3', 'SYSTEM'),
('EMP003', 'Bob Johnson - R&D Manager', '097', '3', 'SYSTEM'),
('EMP004', 'Alice Brown - Manufacturing Manager', '087', '3', 'SYSTEM'),
('EMP005', 'Charlie Wilson - QA Manager', '093', '3', 'SYSTEM');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bom_product_version ON bill_of_materials(product_code, version_no);
CREATE INDEX IF NOT EXISTS idx_bom_details_bom_id ON bom_details(bom_id);
CREATE INDEX IF NOT EXISTS idx_bom_details_raw_code ON bom_details(raw_code);
CREATE INDEX IF NOT EXISTS idx_bom_history_p_code ON bom_history_master(p_code);
CREATE INDEX IF NOT EXISTS idx_product_categories_code ON product_categories(pcat_code);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(dept_code);

-- Create update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bill_of_materials_updated_at BEFORE UPDATE ON bill_of_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMENT ON TABLE product_categories IS 'Product Categories (PCAT) - Base table for product classification';
COMMENT ON TABLE bill_of_materials IS 'Enhanced Bill of Materials Master (BOM_MODIFIED_MST) with pharma-specific fields';
COMMENT ON TABLE bom_details IS 'Enhanced BOM Details (BOM_MODIFIED) with all pharma formulation fields';
COMMENT ON TABLE bom_history_master IS 'BOM History Master (HBOM_MODIFIED_MST) for audit trail';
COMMENT ON TABLE bom_history_details IS 'BOM History Details (HBOM_MODIFIED) for audit trail';
COMMENT ON TABLE departments IS 'Department master for employee management';
COMMENT ON TABLE employees IS 'Employee master for BOM approval workflow';
