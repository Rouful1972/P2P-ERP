from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import uvicorn

from database.database import engine, get_db
from database import models
from routers import (
    auth, 
    raw_materials, 
    suppliers, 
    products, 
    bom, 
    procurement, 
    production_planning,
    quality_control,
    drug_management,
    letter_of_credit,
    reports,
    product_categories,
    departments,
    employees,
    lovs
)
from core.config import settings

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pharma P2P ERP System",
    description="Modern Pharmaceutical Procure-to-Pay ERP System",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(raw_materials.router, prefix="/api/raw-materials", tags=["Raw Materials"])
app.include_router(suppliers.router, prefix="/api/suppliers", tags=["Suppliers"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(bom.router, prefix="/api/bom", tags=["Bill of Materials"])
app.include_router(procurement.router, prefix="/api/procurement", tags=["Procurement"])
app.include_router(production_planning.router, prefix="/api/production", tags=["Production Planning"])
app.include_router(quality_control.router, prefix="/api/quality", tags=["Quality Control"])
app.include_router(drug_management.router, prefix="/api/drugs", tags=["Drug Management"])
app.include_router(letter_of_credit.router, prefix="/api/lc", tags=["Letter of Credit"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(product_categories.router, prefix="/api/product-categories", tags=["Product Categories"])
app.include_router(departments.router, prefix="/api/departments", tags=["Departments"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(lovs.router, prefix="/api/lovs", tags=["List of Values (LOVs)"])

@app.get("/")
async def root():
    return {"message": "Pharma P2P ERP System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
