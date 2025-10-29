from sqlalchemy import Column, Integer, String, BigInteger, DateTime
from sqlalchemy.sql import func
from ..database import Base


class Photo(Base):
    __tablename__ = "photos"
    
    id = Column(Integer, primary_key=True, index=True)
    gallery_id = Column(Integer, nullable=False, index=True)
    original_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500))
    storage_key = Column(String(500))
    file_size = Column(BigInteger)
    display_order = Column(Integer, default=0)
    uploaded_at = Column(DateTime, server_default=func.now())

