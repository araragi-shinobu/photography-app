from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class FilmStockBase(BaseModel):
    model: str
    format: Optional[str] = None
    quantity: int = 0
    expiry_date: Optional[date] = None


class FilmStockCreate(FilmStockBase):
    pass


class FilmStockUpdate(BaseModel):
    model: Optional[str] = None
    format: Optional[str] = None
    quantity: Optional[int] = None
    expiry_date: Optional[date] = None


class FilmStock(FilmStockBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

