from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class GalleryBase(BaseModel):
    name: str
    description: Optional[str] = None


class GalleryCreate(GalleryBase):
    pass


class GalleryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class Gallery(GalleryBase):
    id: int
    cover_image_url: Optional[str] = None
    photo_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

