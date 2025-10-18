-- Initialize Pharma ERP Database
-- This script will be run when the PostgreSQL container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial admin user (password will be hashed by the application)
-- This is just a placeholder, actual user creation happens through the API

-- Create indexes for better performance
-- These will be created by SQLAlchemy, but we can add additional ones here if needed

-- Sample data (optional)
-- You can add sample data here for testing purposes

COMMENT ON DATABASE pharma_erp IS 'Pharmaceutical P2P ERP System Database';
