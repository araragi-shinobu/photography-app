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
    const [showUploadModal, setShowUploadModal] = useState(false);
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
        setShowUploadModal(false);
        setUploadProgress({ current: 0, total: 0 });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true,
        disabled: uploading,
    });

    const normalizeImageUrl = (url) => {
        if (!url) return url;
        if (url.startsWith('http://')) {
            return `https://${url.slice('http://'.length)}`;
        }
        return url;
    };

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

    const handleSetCover = async (photo) => {
        try {
            await galleriesAPI.setCoverPhoto(id, photo.id);
            setGallery((prev) => {
                if (!prev) return prev;
                const coverUrl = photo.original_url || photo.thumbnail_url;
                return {
                    ...prev,
                    cover_image_url: coverUrl,
                };
            });
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

    const handleUploadModalClose = () => {
        if (uploading) return;
        setShowUploadModal(false);
        setUploadProgress({ current: 0, total: 0 });
    };

    if (loading) return <Loading />;
    if (!gallery) return <div className="text-center py-12">Gallery not found</div>;

    const normalizedCoverImageUrl = normalizeImageUrl(gallery.cover_image_url);

    return (
        <div className="space-y-12 fade-in">
            <div className="glass-panel px-8 py-7">
                <button
                    onClick={() => navigate('/galleries')}
                    className="inline-flex items-center text-xs uppercase tracking-[0.35em] text-gray-400 hover:text-white transition-colors"
                >
                    ← Back to galleries
                </button>
                <div className="mt-6 flex flex-wrap items-start justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-3xl uppercase tracking-[0.3em] text-white">{gallery.name}</h2>
                        {gallery.description && (
                            <p className="text-sm leading-relaxed text-gray-300">
                                {gallery.description}
                            </p>
                        )}
                        <p className="text-xs uppercase tracking-[0.35em] text-gray-400">
                            {gallery.photo_count} photos in collection
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button onClick={() => setShowUploadModal(true)}>
                            Add Photos
                        </Button>
                        <Button variant="secondary" onClick={handleEdit}>
                            Edit
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            {photos.length === 0 ? (
                <div className="glass-panel--soft px-10 py-16 text-center text-gray-400 tracking-[0.3em] uppercase">
                    No photos yet · Use Add Photos to begin the story
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 fade-in-up">
                    {photos.map((photo, index) => {
                        const previewUrl = normalizeImageUrl(photo.thumbnail_url || photo.original_url);
                        const fullUrl = normalizeImageUrl(photo.original_url || photo.thumbnail_url);
                        const isCover = normalizedCoverImageUrl && (normalizedCoverImageUrl === fullUrl || normalizedCoverImageUrl === previewUrl);
                        return (
                            <div
                                key={photo.id}
                                className={`group relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_35px_65px_rgba(0,0,0,0.55)] fade-in-up ${index % 4 === 1 ? 'fade-in-delay' : index % 4 === 2 ? 'fade-in-delay-lg' : ''}`}
                            >
                                <img
                                    src={previewUrl}
                                    alt=""
                                    className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${isCover ? 'ring-2 ring-white/80' : ''}`}
                                    onClick={() => setViewingImage({ src: fullUrl, fallback: previewUrl })}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                {isCover && (
                                    <div className="absolute top-3 left-3 bg-white/15 px-4 py-1 text-[10px] uppercase tracking-[0.35em] text-white backdrop-blur">
                                        Cover
                                    </div>
                                )}
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <button
                                            onClick={() => setViewingImage({ src: fullUrl, fallback: previewUrl })}
                                            className="opacity-0 group-hover:opacity-100 border border-white/40 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-white transition-all hover:bg-white hover:text-black"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDeletePhoto(photo.id)}
                                            className="opacity-0 group-hover:opacity-100 border border-red-300/70 bg-red-400/10 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-red-200 transition-all hover:bg-red-400 hover:text-black"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    {!isCover && (
                                        <button
                                            onClick={() => handleSetCover(photo)}
                                            className="opacity-0 group-hover:opacity-100 border border-white/40 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-white transition-all hover:bg-white hover:text-black"
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

            <ImageViewer image={viewingImage} onClose={() => setViewingImage(null)} />

            <Modal isOpen={showUploadModal} onClose={handleUploadModalClose} title="Add Photos">
                <div className="space-y-6">
                    <p className="text-xs uppercase tracking-[0.35em] text-gray-400">
                        Drag images into the frame or click to browse
                    </p>
                    <div
                        {...getRootProps()}
                        className={`relative border border-dashed border-white/15 px-10 py-16 text-center transition-all duration-500 backdrop-blur-xl ${isDragActive ? 'bg-white/15 border-white/40 shadow-[0_30px_60px_rgba(0,0,0,0.45)]' : 'bg-white/5 hover:bg-white/10 hover:border-white/30'} ${uploading ? 'opacity-80 pointer-events-none' : ''}`}
                    >
                        <input {...getInputProps()} />
                        {uploading ? (
                            <div className="space-y-4">
                                <p className="text-sm uppercase tracking-[0.35em] text-gray-300">
                                    Uploading {uploadProgress.current} / {uploadProgress.total}
                                </p>
                                <div className="mx-auto h-2 w-full max-w-sm overflow-hidden bg-white/10">
                                    <div
                                        className="h-full bg-white/80 transition-all"
                                        style={{ width: `${(uploadProgress.current / Math.max(uploadProgress.total, 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-sm uppercase tracking-[0.35em] text-gray-300">
                                    {isDragActive ? 'Release to upload your frames' : 'Drop your frames here'}
                                </div>
                                <div className="text-xs text-gray-500">
                                    JPEG · PNG · HEIC · Up to 10 files per batch
                                </div>
                                <div className="text-xs text-gray-500">
                                    Tip: Hold Shift or Cmd/Ctrl to multi-select.
                                </div>
                            </div>
                        )}
                    </div>
                    {!uploading && (
                        <p className="text-xs text-gray-500 text-center">
                            Upload window closes automatically after the batch completes.
                        </p>
                    )}
                </div>
            </Modal>

            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Gallery">
                <form onSubmit={handleUpdateGallery} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
                            Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="w-full bg-white/5 px-5 py-3 text-sm text-white placeholder:text-gray-500 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={editFormData.description}
                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                            className="w-full bg-white/5 px-5 py-3 text-sm text-white placeholder:text-gray-500 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-0"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 justify-end">
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

