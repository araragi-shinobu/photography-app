import boto3
from botocore.exceptions import ClientError
from PIL import Image
from io import BytesIO
import hashlib
from datetime import datetime
from typing import Tuple, Optional
from ..config import settings


class StorageService:
    def __init__(self):
        if settings.storage_type == "s3":
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                region_name=settings.aws_region
            )
            self.bucket_name = settings.aws_bucket_name
        else:
            self.s3_client = None
            self.bucket_name = None
    
    def generate_unique_filename(self, original_filename: str) -> str:
        """Generate unique filename using timestamp and hash"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_hash = hashlib.md5(f"{original_filename}{timestamp}".encode()).hexdigest()[:8]
        ext = original_filename.split('.')[-1] if '.' in original_filename else 'jpg'
        return f"{timestamp}_{file_hash}.{ext}"
    
    def create_thumbnail(self, image_data: bytes, max_size: Tuple[int, int] = (400, 400)) -> bytes:
        """Create thumbnail from image data"""
        try:
            image = Image.open(BytesIO(image_data))
            
            # Convert RGBA to RGB if needed
            if image.mode == 'RGBA':
                image = image.convert('RGB')
            
            # Create thumbnail maintaining aspect ratio
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save to bytes
            output = BytesIO()
            image.save(output, format='JPEG', quality=85)
            return output.getvalue()
        except Exception as e:
            print(f"Error creating thumbnail: {e}")
            return image_data
    
    async def upload_image(
        self, 
        file_data: bytes, 
        storage_path: str,
        create_thumb: bool = True
    ) -> Tuple[str, Optional[str], str]:
        """
        Upload image to S3
        Returns: (original_url, thumbnail_url, storage_key)
        """
        if not self.s3_client or not self.bucket_name:
            raise Exception("S3 not configured")
        
        try:
            # Upload original image
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=storage_path,
                Body=file_data,
                ContentType='image/jpeg'
            )
            
            original_url = f"https://{self.bucket_name}.s3.{settings.aws_region}.amazonaws.com/{storage_path}"
            
            # Create and upload thumbnail
            thumbnail_url = None
            if create_thumb:
                thumbnail_data = self.create_thumbnail(file_data)
                thumb_path = storage_path.replace('/', '/thumb_', 1)
                
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=thumb_path,
                    Body=thumbnail_data,
                    ContentType='image/jpeg'
                )
                
                thumbnail_url = f"https://{self.bucket_name}.s3.{settings.aws_region}.amazonaws.com/{thumb_path}"
            
            return original_url, thumbnail_url, storage_path
            
        except ClientError as e:
            print(f"Error uploading to S3: {e}")
            raise Exception(f"Failed to upload image: {str(e)}")
    
    def delete(self, storage_key: str) -> bool:
        """Delete file from S3"""
        if not self.s3_client or not self.bucket_name:
            return False
        
        try:
            # Delete original
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=storage_key
            )
            
            # Delete thumbnail
            thumb_key = storage_key.replace('/', '/thumb_', 1)
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=thumb_key
            )
            
            return True
        except ClientError as e:
            print(f"Error deleting from S3: {e}")
            return False
    
    def delete_batch(self, storage_keys: list) -> bool:
        """Delete multiple files from S3"""
        if not self.s3_client or not self.bucket_name or not storage_keys:
            return False
        
        try:
            # Prepare objects for deletion
            objects = [{'Key': key} for key in storage_keys]
            # Add thumbnails
            thumb_objects = [{'Key': key.replace('/', '/thumb_', 1)} for key in storage_keys]
            objects.extend(thumb_objects)
            
            # Delete in batches of 1000 (S3 limit)
            for i in range(0, len(objects), 1000):
                batch = objects[i:i+1000]
                self.s3_client.delete_objects(
                    Bucket=self.bucket_name,
                    Delete={'Objects': batch}
                )
            
            return True
        except ClientError as e:
            print(f"Error batch deleting from S3: {e}")
            return False


# Singleton instance
storage_service = StorageService()

