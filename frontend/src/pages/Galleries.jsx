import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { galleriesAPI } from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

export default function Galleries() {
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchGalleries();
    }, []);

    const fetchGalleries = async () => {
        try {
            const response = await galleriesAPI.getAll();
            setGalleries(response.data);
        } catch (error) {
            console.error('Failed to fetch galleries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await galleriesAPI.create(formData);
            setShowModal(false);
            setFormData({ name: '', description: '' });
            navigate(`/galleries/${response.data.id}`);
        } catch (error) {
            console.error('Failed to create gallery:', error);
            alert('Failed to create gallery');
        }
    };

    if (loading) return <Loading />;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Galleries</h2>
                <Button onClick={() => setShowModal(true)}>New Gallery</Button>
            </div>

            {galleries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No galleries yet. Create your first gallery to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleries.map((gallery) => (
                        <div
                            key={gallery.id}
                            onClick={() => navigate(`/galleries/${gallery.id}`)}
                            className="cursor-pointer group"
                        >
                            <div className="aspect-square bg-gray-100 mb-3 overflow-hidden">
                                {gallery.cover_image_url ? (
                                    <img
                                        src={gallery.cover_image_url}
                                        alt={gallery.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No photos
                                    </div>
                                )}
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">{gallery.name}</h3>
                            <p className="text-sm text-gray-500">{gallery.photo_count} photos</p>
                            {gallery.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{gallery.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Gallery">
                <form onSubmit={handleSubmit}>
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
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

