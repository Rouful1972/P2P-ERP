from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import RawMaterial
from schemas import RawMaterialCreate, RawMaterialUpdate, RawMaterial as RawMaterialSchema
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[RawMaterialSchema])
def get_raw_materials(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    raw_materials = db.query(RawMaterial).offset(skip).limit(limit).all()
    return raw_materials

@router.get("/{raw_material_id}", response_model=RawMaterialSchema)
def get_raw_material(raw_material_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    raw_material = db.query(RawMaterial).filter(RawMaterial.id == raw_material_id).first()
    if raw_material is None:
        raise HTTPException(status_code=404, detail="Raw material not found")
    return raw_material

@router.get("/by-code/{raw_code}", response_model=RawMaterialSchema)
def get_raw_material_by_code(raw_code: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    raw_material = db.query(RawMaterial).filter(RawMaterial.raw_code == raw_code).first()
    if raw_material is None:
        raise HTTPException(status_code=404, detail="Raw material not found")
    return raw_material

@router.post("/", response_model=RawMaterialSchema)
def create_raw_material(raw_material: RawMaterialCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Check if raw material code already exists
    db_raw_material = db.query(RawMaterial).filter(RawMaterial.raw_code == raw_material.raw_code).first()
    if db_raw_material:
        raise HTTPException(status_code=400, detail="Raw material code already exists")
    
    db_raw_material = RawMaterial(
        **raw_material.dict(),
        created_by=current_user.username
    )
    db.add(db_raw_material)
    db.commit()
    db.refresh(db_raw_material)
    return db_raw_material

@router.put("/{raw_material_id}", response_model=RawMaterialSchema)
def update_raw_material(raw_material_id: int, raw_material: RawMaterialUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_raw_material = db.query(RawMaterial).filter(RawMaterial.id == raw_material_id).first()
    if db_raw_material is None:
        raise HTTPException(status_code=404, detail="Raw material not found")
    
    update_data = raw_material.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_raw_material, field, value)
    
    db.commit()
    db.refresh(db_raw_material)
    return db_raw_material

@router.delete("/{raw_material_id}")
def delete_raw_material(raw_material_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_raw_material = db.query(RawMaterial).filter(RawMaterial.id == raw_material_id).first()
    if db_raw_material is None:
        raise HTTPException(status_code=404, detail="Raw material not found")
    
    # Soft delete by setting is_active to False
    db_raw_material.is_active = False
    db.commit()
    return {"message": "Raw material deleted successfully"}
