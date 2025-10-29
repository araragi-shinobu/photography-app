from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PhotoBase(BaseModel):
    pass


class PhotoCreate(PhotoBase):
    pass


class Photo(PhotoBase):
    id: int
    gallery_id: int
    original_url: str
    thumbnail_url: Optional[str]
    file_size: Optional[int]
    display_order: int
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

