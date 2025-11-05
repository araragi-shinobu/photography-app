import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripsAPI } from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

export default function Trips() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        destination: '',
        start_date: '',
        end_date: '',
        description: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await tripsAPI.getAll();
            setTrips(response.data);
        } catch (error) {
            console.error('Failed to fetch trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await tripsAPI.create(formData);
            setShowModal(false);
            setFormData({ name: '', destination: '', start_date: '', end_date: '', description: '' });
            navigate(`/trips/${response.data.id}`);
        } catch (error) {
            console.error('Failed to create trip:', error);
            alert('Failed to create trip');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-12 fade-in">
            <div className="gradient-panel px-8 py-7 flex flex-wrap items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-semibold tracking-[0.35em] uppercase text-gray-100">Trips</h2>
                    <p className="mt-2 text-xs uppercase tracking-[0.4em] text-gray-400">Map the journeys ahead</p>
                </div>
                <Button onClick={() => setShowModal(true)}>New Trip</Button>
            </div>

            {trips.length === 0 ? (
                <div className="glass-panel--soft px-10 py-16 text-center text-gray-400 tracking-[0.3em] uppercase">
                    No trips yet · Plan your first adventure
                </div>
            ) : (
                <div className="space-y-5 fade-in-up">
                    {trips.map((trip, index) => (
                        <div
                            key={trip.id}
                            onClick={() => navigate(`/trips/${trip.id}`)}
                            className={`glass-panel px-7 py-6 border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_45px_rgba(0,0,0,0.45)] fade-in-up cursor-pointer ${index % 2 === 1 ? 'fade-in-delay' : ''}`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-6">
                                <div className="flex-1 min-w-[240px] space-y-3">
                                    <h3 className="text-lg font-medium uppercase tracking-[0.3em] text-white">{trip.name}</h3>
                                    <div className="space-y-2 text-sm text-gray-200">
                                        {trip.destination && (
                                            <div className="uppercase tracking-[0.25em] text-gray-400">
                                                Destination
                                                <div className="mt-1 text-sm normal-case tracking-normal text-gray-100">
                                                    {trip.destination}
                                                </div>
                                            </div>
                                        )}
                                        {trip.start_date && (
                                            <div className="uppercase tracking-[0.25em] text-gray-400">
                                                Dates
                                                <div className="mt-1 text-sm normal-case tracking-normal text-gray-100">
                                                    {trip.start_date}
                                                    {trip.end_date && ` – ${trip.end_date}`}
                                                </div>
                                            </div>
                                        )}
                                        {trip.description && (
                                            <div className="text-sm text-gray-300/90 leading-relaxed line-clamp-2">
                                                {trip.description}
                                            </div>
                                        )}
                                        {trip.images && trip.images.length > 0 && (
                                            <div className="text-xs uppercase tracking-[0.35em] text-gray-500">
                                                {trip.images.length} inspiration image{trip.images.length !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {trip.images && trip.images.length > 0 && (
                                    <div className="min-w-[96px] max-w-[96px] h-24 bg-white/10 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={trip.images[0].thumbnail_url || trip.images[0].image_url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Trip">
                <form onSubmit={handleSubmit} className="space-y-5">
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

