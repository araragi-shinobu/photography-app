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

    if (loading) return <Loading />;
    if (!trip) return <div className="text-center py-12">Trip not found</div>;

    return (
        <div>
            <div className="mb-8">
                <button
                    onClick={() => navigate('/trips')}
                    className="text-sm text-gray-500 hover:text-gray-900 mb-4"
                >
                    ← Back to trips
                </button>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{trip.name}</h2>
                        {trip.destination && (
                            <p className="text-gray-600 mb-1">
                                <span className="text-gray-500">Destination:</span> {trip.destination}
                            </p>
                        )}
                        {trip.start_date && (
                            <p className="text-gray-600 mb-1">
                                <span className="text-gray-500">Dates:</span>{' '}
                                {trip.start_date}
                                {trip.end_date && ` - ${trip.end_date}`}
                            </p>
                        )}
                        {trip.description && (
                            <p className="text-gray-600 mt-3">{trip.description}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setShowEditModal(true)}>
                            Edit
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            {/* Weather and Photography Times */}
            <div className="mb-8">
                <WeatherInfo tripId={id} destination={trip.destination} />
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Inspiration Images</h3>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors ${isDragActive
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                >
                    <input {...getInputProps()} />
                    <p className="text-gray-600">
                        {uploading
                            ? 'Uploading...'
                            : isDragActive
                                ? 'Drop images here'
                                : 'Drag inspiration images here or click to select'}
                    </p>
                </div>

                {!trip.images || trip.images.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border border-gray-200">
                        No inspiration images yet. Upload some to get started.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {trip.images.map((image) => (
                            <div key={image.id} className="group relative aspect-square">
                                <img
                                    src={image.thumbnail_url || image.image_url}
                                    alt={image.caption || ''}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => setViewingImage(image.image_url)}
                                />
                                {image.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                                        {image.caption}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setViewingImage(image.image_url)}
                                        className="opacity-0 group-hover:opacity-100 text-white text-sm px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleDeleteImage(image.id)}
                                        className="opacity-0 group-hover:opacity-100 text-white text-sm px-4 py-2 border border-white hover:bg-red-500 hover:border-red-500 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Trip"
            >
                <form onSubmit={handleUpdate}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Destination
                        </label>
                        <input
                            type="text"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

            {/* Image Viewer */}
            <ImageViewer
                imageUrl={viewingImage}
                onClose={() => setViewingImage(null)}
            />
        </div>
    );
}

