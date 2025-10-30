import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { galleriesAPI } from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ImageViewer from '../components/ImageViewer';

export default function GalleryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [gallery, setGallery] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [viewingImage, setViewingImage] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchGallery();
        fetchPhotos();
    }, [id]);

    const fetchGallery = async () => {
        try {
            const response = await galleriesAPI.getOne(id);
            setGallery(response.data);
        } catch (error) {
            console.error('Failed to fetch gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPhotos = async () => {
        try {
            const response = await galleriesAPI.getPhotos(id);
            setPhotos(response.data);
        } catch (error) {
            console.error('Failed to fetch photos:', error);
        }
    };

    const onDrop = async (acceptedFiles) => {
        setUploading(true);
        setUploadProgress({ current: 0, total: acceptedFiles.length });

        for (let i = 0; i < acceptedFiles.length; i++) {
            try {
                await galleriesAPI.uploadPhoto(id, acceptedFiles[i]);
                setUploadProgress({ current: i + 1, total: acceptedFiles.length });
            } catch (error) {
                console.error(`Failed to upload ${acceptedFiles[i].name}:`, error);
            }
        }

        setUploading(false);
        fetchGallery();
        fetchPhotos();
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true,
        disabled: uploading,
    });

    const handleDelete = async () => {
        if (!confirm('Delete this gallery and all photos?')) return;

        try {
            await galleriesAPI.delete(id);
            navigate('/galleries');
        } catch (error) {
            console.error('Failed to delete gallery:', error);
            alert('Failed to delete gallery');
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!confirm('Delete this photo?')) return;

        try {
            await galleriesAPI.deletePhoto(id, photoId);
            fetchGallery();
            fetchPhotos();
        } catch (error) {
            console.error('Failed to delete photo:', error);
            alert('Failed to delete photo');
        }
    };

    const handleSetCover = async (photoId) => {
        try {
            await galleriesAPI.setCoverPhoto(id, photoId);
            fetchGallery();
        } catch (error) {
            console.error('Failed to set cover photo:', error);
            alert('Failed to set cover photo');
        }
    };

    const handleEdit = () => {
        setEditFormData({
            name: gallery.name,
            description: gallery.description || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateGallery = async (e) => {
        e.preventDefault();
        try {
            await galleriesAPI.update(id, editFormData);
            setShowEditModal(false);
            fetchGallery();
        } catch (error) {
            console.error('Failed to update gallery:', error);
            alert('Failed to update gallery');
        }
    };

    if (loading) return <Loading />;
    if (!gallery) return <div className="text-center py-12">Gallery not found</div>;

    return (
        <div>
            <div className="mb-8">
                <button
                    onClick={() => navigate('/galleries')}
                    className="text-sm text-gray-500 hover:text-gray-900 mb-4"
                >
                    ← Back to galleries
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{gallery.name}</h2>
                        {gallery.description && (
                            <p className="text-gray-600">{gallery.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">{gallery.photo_count} photos</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleEdit}>
                            Edit
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 mb-8 text-center cursor-pointer transition-colors ${isDragActive
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div>
                        <p className="text-gray-900 mb-2">
                            Uploading {uploadProgress.current} / {uploadProgress.total}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                            <div
                                className="bg-gray-900 h-2 rounded-full transition-all"
                                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-600">
                        {isDragActive
                            ? 'Drop photos here'
                            : 'Drag photos here or click to select'}
                    </p>
                )}
            </div>

            {photos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No photos yet. Upload some photos to get started.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => {
                        const isCover = gallery.cover_image_url === (photo.thumbnail_url || photo.original_url);
                        return (
                            <div key={photo.id} className="group relative aspect-square">
                                <img
                                    src={photo.thumbnail_url || photo.original_url}
                                    alt=""
                                    className={`w-full h-full object-cover cursor-pointer ${isCover ? 'ring-4 ring-gray-900' : ''}`}
                                    onClick={() => setViewingImage(photo.original_url)}
                                />
                                {isCover && (
                                    <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-1">
                                        Cover
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setViewingImage(photo.original_url)}
                                            className="opacity-0 group-hover:opacity-100 text-white text-xs px-3 py-2 border border-white hover:bg-white hover:text-black transition-colors"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDeletePhoto(photo.id)}
                                            className="opacity-0 group-hover:opacity-100 text-white text-xs px-3 py-2 border border-white hover:bg-red-500 hover:border-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    {!isCover && (
                                        <button
                                            onClick={() => handleSetCover(photo.id)}
                                            className="opacity-0 group-hover:opacity-100 text-white text-xs px-3 py-2 border border-white hover:bg-gray-900 hover:border-gray-900 transition-colors"
                                        >
                                            Set as Cover
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Image Viewer */}
            <ImageViewer
                imageUrl={viewingImage}
                onClose={() => setViewingImage(null)}
            />

            {/* Edit Gallery Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Gallery">
                <form onSubmit={handleUpdateGallery}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={editFormData.description}
                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Update</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

