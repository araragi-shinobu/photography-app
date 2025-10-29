import { useState, useEffect } from 'react';
import { filmStocksAPI } from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

export default function FilmStocks() {
    const [filmStocks, setFilmStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        model: '',
        format: '',
        quantity: 0,
        expiry_date: '',
    });

    useEffect(() => {
        fetchFilmStocks();
    }, []);

    const fetchFilmStocks = async () => {
        try {
            const response = await filmStocksAPI.getAll();
            setFilmStocks(response.data);
        } catch (error) {
            console.error('Failed to fetch film stocks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await filmStocksAPI.update(editingId, formData);
            } else {
                await filmStocksAPI.create(formData);
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ model: '', format: '', quantity: 0, expiry_date: '' });
            fetchFilmStocks();
        } catch (error) {
            console.error('Failed to save film stock:', error);
            alert('Failed to save film stock');
        }
    };

    const handleEdit = (filmStock) => {
        setEditingId(filmStock.id);
        setFormData({
            model: filmStock.model,
            format: filmStock.format || '',
            quantity: filmStock.quantity,
            expiry_date: filmStock.expiry_date || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this film stock?')) return;

        try {
            await filmStocksAPI.delete(id);
            fetchFilmStocks();
        } catch (error) {
            console.error('Failed to delete film stock:', error);
            alert('Failed to delete film stock');
        }
    };

    const handleNewClick = () => {
        setEditingId(null);
        setFormData({ model: '', format: '', quantity: 0, expiry_date: '' });
        setShowModal(true);
    };

    if (loading) return <Loading />;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Film Stock</h2>
                <Button onClick={handleNewClick}>New Film Stock</Button>
            </div>

            {filmStocks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No film stocks yet. Add your first film stock to get started.
                </div>
            ) : (
                <div className="space-y-4">
                    {filmStocks.map((stock) => (
                        <div
                            key={stock.id}
                            className="border border-gray-200 p-6 hover:border-gray-400 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 text-lg mb-2">{stock.model}</h3>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Format:</span>
                                            <span className="ml-2 text-gray-900">{stock.format || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Quantity:</span>
                                            <span className="ml-2 text-gray-900 font-medium">{stock.quantity}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Expiry:</span>
                                            <span className="ml-2 text-gray-900">
                                                {stock.expiry_date || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button variant="secondary" onClick={() => handleEdit(stock)}>
                                        Edit
                                    </Button>
                                    <Button variant="danger" onClick={() => handleDelete(stock.id)}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingId ? 'Edit Film Stock' : 'New Film Stock'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Model *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Kodak Portra 400"
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Format
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 35mm, 120"
                            value={formData.format}
                            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                        </label>
                        <input
                            type="date"
                            value={formData.expiry_date}
                            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

