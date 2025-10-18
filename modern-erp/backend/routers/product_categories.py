from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import ProductCategory
from schemas import ProductCategoryCreate, ProductCategoryUpdate, ProductCategory as ProductCategorySchema
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ProductCategorySchema])
def get_product_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all product categories"""
    categories = db.query(ProductCategory).offset(skip).limit(limit).all()
    return categories

@router.get("/{pcat_code}", response_model=ProductCategorySchema)
def get_product_category(pcat_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get a specific product category by code"""
    category = db.query(ProductCategory).filter(ProductCategory.pcat_code == pcat_code).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Product category not found")
    return category

@router.post("/", response_model=ProductCategorySchema)
def create_product_category(category: ProductCategoryCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Create a new product category"""
    # Check if category already exists
    existing_category = db.query(ProductCategory).filter(ProductCategory.pcat_code == category.pcat_code).first()
    if existing_category:
        raise HTTPException(status_code=400, detail="Product category with this code already exists")
    
    db_category = ProductCategory(
        **category.dict(),
        created_by=current_user.username
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{pcat_code}", response_model=ProductCategorySchema)
def update_product_category(pcat_code: str, category: ProductCategoryUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Update a product category"""
    db_category = db.query(ProductCategory).filter(ProductCategory.pcat_code == pcat_code).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Product category not found")
    
    update_data = category.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{pcat_code}")
def delete_product_category(pcat_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Delete a product category (soft delete)"""
    db_category = db.query(ProductCategory).filter(ProductCategory.pcat_code == pcat_code).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Product category not found")
    
    # Soft delete by setting is_active to False
    db_category.is_active = False
    db.commit()
    return {"message": "Product category deleted successfully"}

@router.get("/active/list", response_model=List[ProductCategorySchema])
def get_active_product_categories(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all active product categories for LOV (List of Values)"""
    categories = db.query(ProductCategory).filter(ProductCategory.is_active == True).all()
    return categories
