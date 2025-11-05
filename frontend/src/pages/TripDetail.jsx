import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { tripsAPI } from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import WeatherInfo from '../components/WeatherInfo';
import ImageViewer from '../components/ImageViewer';

export default function TripDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [viewingImage, setViewingImage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        destination: '',
        start_date: '',
        end_date: '',
        description: '',
    });

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const fetchTrip = async () => {
        try {
            const response = await tripsAPI.getOne(id);
            setTrip(response.data);
            setFormData({
                name: response.data.name,
                destination: response.data.destination || '',
                start_date: response.data.start_date || '',
                end_date: response.data.end_date || '',
                description: response.data.description || '',
            });
        } catch (error) {
            console.error('Failed to fetch trip:', error);
        } finally {
            setLoading(false);
        }
    };

    const onDrop = async (acceptedFiles) => {
        setUploading(true);

        for (const file of acceptedFiles) {
            try {
                await tripsAPI.uploadImage(id, file, '');
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
            }
        }

        setUploading(false);
        fetchTrip();
        setShowUploadModal(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true,
        disabled: uploading,
    });

    const handleDelete = async () => {
        if (!confirm('Delete this trip and all images?')) return;

        try {
            await tripsAPI.delete(id);
            navigate('/trips');
        } catch (error) {
            console.error('Failed to delete trip:', error);
            alert('Failed to delete trip');
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!confirm('Delete this image?')) return;

        try {
            await tripsAPI.deleteImage(id, imageId);
            fetchTrip();
        } catch (error) {
            console.error('Failed to delete image:', error);
            alert('Failed to delete image');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await tripsAPI.update(id, formData);
            setShowEditModal(false);
            fetchTrip();
        } catch (error) {
            console.error('Failed to update trip:', error);
            alert('Failed to update trip');
        }
    };

    const handleCloseUpload = () => {
        if (uploading) return;
        setShowUploadModal(false);
    };

    const normalizeImageUrl = (url) => {
        if (!url) return url;
        if (url.startsWith('http://')) {
            return `https://${url.slice('http://'.length)}`;
        }
        return url;
    };

    if (loading) return <Loading />;
    if (!trip) return <div className="text-center py-12">Trip not found</div>;

    return (
        <div className="space-y-12 fade-in">
            <div className="glass-panel px-8 py-7">
                <button
                    onClick={() => navigate('/trips')}
                    className="inline-flex items-center text-xs uppercase tracking-[0.35em] text-gray-400 hover:text-white transition-colors"
                >
                    ← Back to trips
                </button>
                <div className="mt-6 flex flex-wrap items-start justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-3xl uppercase tracking-[0.3em] text-white">{trip.name}</h2>
                        <div className="space-y-3 text-sm text-gray-300">
                            {trip.destination && (
                                <div>
                                    <div className="uppercase tracking-[0.3em] text-gray-500">Destination</div>
                                    <div className="mt-1 text-base tracking-normal text-gray-100">{trip.destination}</div>
                                </div>
                            )}
                            {trip.start_date && (
                                <div>
                                    <div className="uppercase tracking-[0.3em] text-gray-500">Dates</div>
                                    <div className="mt-1 text-base tracking-normal text-gray-100">
                                        {trip.start_date}
                                        {trip.end_date && ` – ${trip.end_date}`}
                                    </div>
                                </div>
                            )}
                            {trip.description && (
                                <div>
                                    <div className="uppercase tracking-[0.3em] text-gray-500">Notes</div>
                                    <p className="mt-1 text-base tracking-normal text-gray-200 leading-relaxed">
                                        {trip.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button onClick={() => setShowUploadModal(true)}>
                            Add Inspiration
                        </Button>
                        <Button variant="secondary" onClick={() => setShowEditModal(true)}>
                            Edit
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            <div className="glass-panel--soft px-8 py-6">
                <WeatherInfo tripId={id} destination={trip.destination} />
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl uppercase tracking-[0.3em] text-white">Inspiration Images</h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.35em] text-gray-500">Curate visual ideas for the journey</p>
                    </div>
                </div>

                {!trip.images || trip.images.length === 0 ? (
                    <div className="glass-panel--soft px-10 py-16 text-center text-gray-400 tracking-[0.3em] uppercase">
                        No inspiration images yet · Upload to begin the moodboard
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 fade-in-up">
                        {trip.images.map((image, index) => {
                            const previewUrl = normalizeImageUrl(image.thumbnail_url || image.image_url);
                            const fullUrl = normalizeImageUrl(image.image_url || image.thumbnail_url);
                            return (
                            <div
                                key={image.id}
                                className={`group relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_35px_65px_rgba(0,0,0,0.55)] fade-in-up ${index % 4 === 1 ? 'fade-in-delay' : index % 4 === 2 ? 'fade-in-delay-lg' : ''}`}
                            >
                                <img
                                    src={previewUrl}
                                    alt={image.caption || ''}
                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                    onClick={() => setViewingImage({ src: fullUrl, fallback: previewUrl })}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                {image.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-3 text-xs text-gray-200 backdrop-blur">
                                        {image.caption}
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => setViewingImage({ src: fullUrl, fallback: previewUrl })}
                                        className="opacity-0 group-hover:opacity-100 border border-white/40 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-white transition-all hover:bg-white hover:text-black"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleDeleteImage(image.id)}
                                        className="opacity-0 group-hover:opacity-100 border border-red-300/70 bg-red-400/10 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-red-200 transition-all hover:bg-red-400 hover:text-black"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal
                isOpen={showUploadModal}
                onClose={handleCloseUpload}
                title="Add Inspiration"
            >
                <div className="space-y-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-gray-400">
                        Drag inspiration frames here or use the picker
                    </p>
                    <div
                        {...getRootProps()}
                        className={`relative border border-dashed border-white/15 px-10 py-16 text-center transition-all duration-500 backdrop-blur-xl ${isDragActive ? 'bg-white/15 border-white/40 shadow-[0_30px_60px_rgba(0,0,0,0.45)]' : 'bg-white/5 hover:bg-white/10 hover:border-white/30'} ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                        <input {...getInputProps()} />
                        <p className="text-sm uppercase tracking-[0.35em] text-gray-300">
                            {uploading
                                ? 'Uploading inspiration...'
                                : isDragActive
                                    ? 'Release to upload your frames'
                                    : 'Drop frames here or click to select'}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">JPEG · PNG · HEIC supported</p>
                    </div>
                    {uploading && (
                        <p className="text-xs text-gray-500 text-center">
                            Please wait until the current batch finishes.
                        </p>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Trip"
            >
                <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                        <label className="block text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
                            Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white/5 px-5 py-3 text-sm text-white placeholder:text-gray-500 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
                            Destination
                        </label>
                        <input
                            type="text"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            className="w-full bg-white/5 px-5 py-3 text-sm text-white placeholder:text-gray-500 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-0"
                        />
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="block text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full bg-white/5 px-5 py-3 text-sm text-white placeholder:text-gray-500 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full bg-white/5 px-5 py-3 text-sm text-white placeholder:text-gray-500 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-0"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

            <ImageViewer
                image={viewingImage}
                onClose={() => setViewingImage(null)}
            />
        </div>
    );
}

