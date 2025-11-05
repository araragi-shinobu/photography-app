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
        <div className="space-y-12 fade-in">
            <div className="gradient-panel px-8 py-7 flex flex-wrap items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-semibold tracking-[0.35em] uppercase text-gray-100">Galleries</h2>
                    <p className="mt-2 text-xs uppercase tracking-[0.4em] text-gray-400">Curate your best frames</p>
                </div>
                <Button onClick={() => setShowModal(true)}>New Gallery</Button>
            </div>

            {galleries.length === 0 ? (
                <div className="glass-panel--soft px-10 py-16 text-center text-gray-400 tracking-[0.3em] uppercase">
                    No galleries yet · Let&apos;s start your archive
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in-up">
                    {galleries.map((gallery, index) => (
                        <div
                            key={gallery.id}
                            onClick={() => navigate(`/galleries/${gallery.id}`)}
                            className={`cursor-pointer group p-5 glass-panel transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_45px_rgba(0,0,0,0.45)] fade-in-up ${index % 3 === 1 ? 'fade-in-delay' : index % 3 === 2 ? 'fade-in-delay-lg' : ''}`}
                        >
                            <div className="aspect-square relative overflow-hidden bg-black/40">
                                {gallery.cover_image_url ? (
                                    <img
                                        src={gallery.cover_image_url}
                                        alt={gallery.name}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 tracking-[0.3em] uppercase">
                                        No Photos
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                            <div className="mt-4 space-y-2">
                                <h3 className="text-lg font-medium text-white uppercase tracking-[0.25em]">{gallery.name}</h3>
                                <p className="text-xs uppercase tracking-[0.35em] text-gray-400">{gallery.photo_count} photos</p>
                                {gallery.description && (
                                    <p className="text-sm text-gray-300/90 leading-relaxed line-clamp-2">
                                        {gallery.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Gallery">
                <form onSubmit={handleSubmit} className="space-y-6">
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

