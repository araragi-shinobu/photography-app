from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.gallery import Gallery
from ..models.photo import Photo
from ..schemas import gallery as schemas
from ..schemas.photo import Photo as PhotoSchema
from ..services.storage import storage_service

router = APIRouter()


@router.get("/", response_model=List[schemas.Gallery])
def get_galleries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all galleries"""
    galleries = db.query(Gallery).order_by(Gallery.created_at.desc()).offset(skip).limit(limit).all()
    return galleries


@router.get("/{gallery_id}", response_model=schemas.Gallery)
def get_gallery(gallery_id: int, db: Session = Depends(get_db)):
    """Get single gallery"""
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    return gallery


@router.post("/", response_model=schemas.Gallery)
def create_gallery(gallery: schemas.GalleryCreate, db: Session = Depends(get_db)):
    """Create new gallery"""
    db_gallery = Gallery(**gallery.model_dump())
    db.add(db_gallery)
    db.commit()
    db.refresh(db_gallery)
    return db_gallery


@router.put("/{gallery_id}", response_model=schemas.Gallery)
def update_gallery(gallery_id: int, gallery: schemas.GalleryUpdate, db: Session = Depends(get_db)):
    """Update gallery"""
    db_gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not db_gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    for key, value in gallery.model_dump(exclude_unset=True).items():
        setattr(db_gallery, key, value)
    
    db.commit()
    db.refresh(db_gallery)
    return db_gallery


@router.delete("/{gallery_id}")
def delete_gallery(gallery_id: int, db: Session = Depends(get_db)):
    """Delete gallery and all its photos"""
    db_gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not db_gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    # Get all photos
    photos = db.query(Photo).filter(Photo.gallery_id == gallery_id).all()
    
    # Delete from S3
    if photos:
        storage_keys = [photo.storage_key for photo in photos if photo.storage_key]
        if storage_keys:
            storage_service.delete_batch(storage_keys)
    
    # Delete from database
    db.query(Photo).filter(Photo.gallery_id == gallery_id).delete()
    db.delete(db_gallery)
    db.commit()
    
    return {"message": "Gallery deleted successfully"}


# Photo endpoints
@router.get("/{gallery_id}/photos", response_model=List[PhotoSchema])
def get_gallery_photos(gallery_id: int, db: Session = Depends(get_db)):
    """Get all photos in a gallery"""
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    photos = db.query(Photo).filter(Photo.gallery_id == gallery_id).order_by(Photo.display_order).all()
    return photos


@router.post("/{gallery_id}/photos", response_model=PhotoSchema)
async def upload_photo(
    gallery_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload single photo to gallery"""
    # Check if gallery exists
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    # Read file data
    file_data = await file.read()
    
    # Generate storage path
    filename = storage_service.generate_unique_filename(file.filename or "photo.jpg")
    storage_path = f"galleries/{gallery_id}/{filename}"
    
    # Upload to S3
    try:
        original_url, thumbnail_url, storage_key = await storage_service.upload_image(
            file_data, storage_path
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    # Get next display order
    max_order = db.query(Photo).filter(Photo.gallery_id == gallery_id).count()
    
    # Create photo record
    db_photo = Photo(
        gallery_id=gallery_id,
        original_url=original_url,
        thumbnail_url=thumbnail_url,
        storage_key=storage_key,
        file_size=len(file_data),
        display_order=max_order
    )
    db.add(db_photo)
    
    # Update gallery photo count and cover image
    gallery.photo_count = gallery.photo_count + 1
    if not gallery.cover_image_url:
        gallery.cover_image_url = thumbnail_url
    
    db.commit()
    db.refresh(db_photo)
    
    return db_photo


@router.delete("/{gallery_id}/photos/{photo_id}")
def delete_photo(gallery_id: int, photo_id: int, db: Session = Depends(get_db)):
    """Delete a photo"""
    photo = db.query(Photo).filter(
        Photo.id == photo_id,
        Photo.gallery_id == gallery_id
    ).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Delete from S3
    if photo.storage_key:
        storage_service.delete(photo.storage_key)
    
    # Delete from database
    db.delete(photo)
    
    # Update gallery photo count
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if gallery:
        gallery.photo_count = max(0, gallery.photo_count - 1)
        
        # Update cover image if deleted photo was the cover
        if gallery.cover_image_url == photo.thumbnail_url:
            remaining_photo = db.query(Photo).filter(Photo.gallery_id == gallery_id).first()
            gallery.cover_image_url = remaining_photo.thumbnail_url if remaining_photo else None
    
    db.commit()
    
    return {"message": "Photo deleted successfully"}


@router.put("/{gallery_id}/cover/{photo_id}")
def set_cover_photo(gallery_id: int, photo_id: int, db: Session = Depends(get_db)):
    """Set a photo as the gallery cover"""
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    photo = db.query(Photo).filter(
        Photo.id == photo_id,
        Photo.gallery_id == gallery_id
    ).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Set the cover image
    gallery.cover_image_url = photo.thumbnail_url or photo.original_url
    db.commit()
    
    return {"message": "Cover photo updated successfully", "cover_image_url": gallery.cover_image_url}

