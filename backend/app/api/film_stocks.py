from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.film_stock import FilmStock
from ..schemas import film_stock as schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.FilmStock])
def get_film_stocks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all film stocks"""
    film_stocks = db.query(FilmStock).order_by(FilmStock.created_at.desc()).offset(skip).limit(limit).all()
    return film_stocks


@router.get("/{film_stock_id}", response_model=schemas.FilmStock)
def get_film_stock(film_stock_id: int, db: Session = Depends(get_db)):
    """Get single film stock"""
    film_stock = db.query(FilmStock).filter(FilmStock.id == film_stock_id).first()
    if not film_stock:
        raise HTTPException(status_code=404, detail="Film stock not found")
    return film_stock


@router.post("/", response_model=schemas.FilmStock)
def create_film_stock(film_stock: schemas.FilmStockCreate, db: Session = Depends(get_db)):
    """Create new film stock"""
    db_film_stock = FilmStock(**film_stock.model_dump())
    db.add(db_film_stock)
    db.commit()
    db.refresh(db_film_stock)
    return db_film_stock


@router.put("/{film_stock_id}", response_model=schemas.FilmStock)
def update_film_stock(
    film_stock_id: int, 
    film_stock: schemas.FilmStockUpdate, 
    db: Session = Depends(get_db)
):
    """Update film stock"""
    db_film_stock = db.query(FilmStock).filter(FilmStock.id == film_stock_id).first()
    if not db_film_stock:
        raise HTTPException(status_code=404, detail="Film stock not found")
    
    for key, value in film_stock.model_dump(exclude_unset=True).items():
        setattr(db_film_stock, key, value)
    
    db.commit()
    db.refresh(db_film_stock)
    return db_film_stock


@router.delete("/{film_stock_id}")
def delete_film_stock(film_stock_id: int, db: Session = Depends(get_db)):
    """Delete film stock"""
    db_film_stock = db.query(FilmStock).filter(FilmStock.id == film_stock_id).first()
    if not db_film_stock:
        raise HTTPException(status_code=404, detail="Film stock not found")
    
    db.delete(db_film_stock)
    db.commit()
    
    return {"message": "Film stock deleted successfully"}

