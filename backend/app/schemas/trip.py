from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class TripImageBase(BaseModel):
    caption: Optional[str] = None


class TripImageCreate(TripImageBase):
    pass


class TripImage(TripImageBase):
    id: int
    trip_id: int
    image_url: str
    thumbnail_url: Optional[str]
    display_order: int
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


class TripBase(BaseModel):
    name: str
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    name: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None


class Trip(TripBase):
    id: int
    created_at: datetime
    updated_at: datetime
    images: List[TripImage] = []
    
    class Config:
        from_attributes = True

