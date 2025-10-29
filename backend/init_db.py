"""
Database initialization script
Run this to create all tables in MySQL
"""
from app.database import engine, Base
from app.models import Gallery, Photo, FilmStock, Trip, TripImage


def init_database():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


if __name__ == "__main__":
    init_database()

