from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.sql import func
from ..database import Base


class FilmStock(Base):
    __tablename__ = "film_stocks"
    
    id = Column(Integer, primary_key=True, index=True)
    model = Column(String(100), nullable=False)
    format = Column(String(50))
    quantity = Column(Integer, default=0)
    expiry_date = Column(Date)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

