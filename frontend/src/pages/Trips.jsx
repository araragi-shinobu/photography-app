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
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Trips</h2>
                <Button onClick={() => setShowModal(true)}>New Trip</Button>
            </div>

            {trips.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No trips yet. Create your first trip to get started.
                </div>
            ) : (
                <div className="space-y-4">
                    {trips.map((trip) => (
                        <div
                            key={trip.id}
                            onClick={() => navigate(`/trips/${trip.id}`)}
                            className="border border-gray-200 p-6 hover:border-gray-400 transition-colors cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 text-lg mb-2">{trip.name}</h3>
                                    <div className="space-y-1 text-sm">
                                        {trip.destination && (
                                            <div className="text-gray-600">
                                                <span className="text-gray-500">Destination:</span> {trip.destination}
                                            </div>
                                        )}
                                        {trip.start_date && (
                                            <div className="text-gray-600">
                                                <span className="text-gray-500">Dates:</span>{' '}
                                                {trip.start_date}
                                                {trip.end_date && ` - ${trip.end_date}`}
                                            </div>
                                        )}
                                        {trip.description && (
                                            <div className="text-gray-600 mt-2 line-clamp-2">{trip.description}</div>
                                        )}
                                        {trip.images && trip.images.length > 0 && (
                                            <div className="text-gray-500 mt-2">
                                                {trip.images.length} inspiration image{trip.images.length !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {trip.images && trip.images.length > 0 && (
                                    <div className="ml-4 w-20 h-20">
                                        <img
                                            src={trip.images[0].thumbnail_url || trip.images[0].image_url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Trip">
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

