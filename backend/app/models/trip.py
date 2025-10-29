from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from sqlalchemy.sql import func
from ..database import Base


class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    destination = Column(String(255))
    start_date = Column(Date)
    end_date = Column(Date)
    description = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

