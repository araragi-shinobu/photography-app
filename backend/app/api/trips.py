from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.trip import Trip
from ..models.trip_image import TripImage
from ..schemas import trip as schemas
from ..services.storage import storage_service
from ..services.weather import weather_service

router = APIRouter()


@router.get("/", response_model=List[schemas.Trip])
def get_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all trips"""
    trips = db.query(Trip).order_by(Trip.created_at.desc()).offset(skip).limit(limit).all()
    
    # Load images for each trip
    for trip in trips:
        trip.images = db.query(TripImage).filter(
            TripImage.trip_id == trip.id
        ).order_by(TripImage.display_order).all()
    
    return trips


@router.get("/{trip_id}", response_model=schemas.Trip)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    """Get single trip"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Load images
    trip.images = db.query(TripImage).filter(
        TripImage.trip_id == trip_id
    ).order_by(TripImage.display_order).all()
    
    return trip


@router.post("/", response_model=schemas.Trip)
def create_trip(trip: schemas.TripCreate, db: Session = Depends(get_db)):
    """Create new trip"""
    db_trip = Trip(**trip.model_dump())
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    db_trip.images = []
    return db_trip


@router.put("/{trip_id}", response_model=schemas.Trip)
def update_trip(trip_id: int, trip: schemas.TripUpdate, db: Session = Depends(get_db)):
    """Update trip"""
    db_trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    for key, value in trip.model_dump(exclude_unset=True).items():
        setattr(db_trip, key, value)
    
    db.commit()
    db.refresh(db_trip)
    
    # Load images
    db_trip.images = db.query(TripImage).filter(
        TripImage.trip_id == trip_id
    ).order_by(TripImage.display_order).all()
    
    return db_trip


@router.delete("/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    """Delete trip and all its images"""
    db_trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Get all images
    images = db.query(TripImage).filter(TripImage.trip_id == trip_id).all()
    
    # Delete from S3
    if images:
        storage_keys = [img.storage_key for img in images if img.storage_key]
        if storage_keys:
            storage_service.delete_batch(storage_keys)
    
    # Delete from database
    db.query(TripImage).filter(TripImage.trip_id == trip_id).delete()
    db.delete(db_trip)
    db.commit()
    
    return {"message": "Trip deleted successfully"}


# Image endpoints
@router.post("/{trip_id}/images", response_model=schemas.TripImage)
async def upload_trip_image(
    trip_id: int,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload inspiration image to trip"""
    # Check if trip exists
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Read file data
    file_data = await file.read()
    
    # Generate storage path
    filename = storage_service.generate_unique_filename(file.filename or "image.jpg")
    storage_path = f"trips/{trip_id}/{filename}"
    
    # Upload to S3
    try:
        original_url, thumbnail_url, storage_key = await storage_service.upload_image(
            file_data, storage_path
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    # Get next display order
    max_order = db.query(TripImage).filter(TripImage.trip_id == trip_id).count()
    
    # Create image record
    db_image = TripImage(
        trip_id=trip_id,
        image_url=original_url,
        thumbnail_url=thumbnail_url,
        storage_key=storage_key,
        file_size=len(file_data),
        caption=caption,
        display_order=max_order
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    return db_image


@router.delete("/{trip_id}/images/{image_id}")
def delete_trip_image(trip_id: int, image_id: int, db: Session = Depends(get_db)):
    """Delete trip inspiration image"""
    image = db.query(TripImage).filter(
        TripImage.id == image_id,
        TripImage.trip_id == trip_id
    ).first()
    
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Delete from S3
    if image.storage_key:
        storage_service.delete(image.storage_key)
    
    # Delete from database
    db.delete(image)
    db.commit()
    
    return {"message": "Image deleted successfully"}


# Weather and photography times endpoint
@router.get("/{trip_id}/weather")
def get_trip_weather(
    trip_id: int, 
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """Get weather, sunrise/sunset, and photography golden/blue hours for trip destination"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if not trip.destination:
        raise HTTPException(status_code=400, detail="Trip has no destination set")
    
    # Use trip start date if no date specified
    if not date and trip.start_date:
        date = trip.start_date.isoformat()
    
    # Get weather and sun times
    info = weather_service.get_complete_info(trip.destination, date)
    
    if not info:
        raise HTTPException(
            status_code=404, 
            detail="Could not find weather information for this destination"
        )
    
    return info

