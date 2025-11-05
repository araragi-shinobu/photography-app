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
        <div className="space-y-12 fade-in">
            <div className="gradient-panel px-8 py-7 flex flex-wrap items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-semibold tracking-[0.35em] uppercase text-gray-100">Film Stock</h2>
                    <p className="mt-2 text-xs uppercase tracking-[0.4em] text-gray-400">Catalogue every roll</p>
                </div>
                <Button onClick={handleNewClick}>New Film Stock</Button>
            </div>

            {filmStocks.length === 0 ? (
                <div className="glass-panel--soft px-10 py-16 text-center text-gray-400 tracking-[0.3em] uppercase">
                    No film stocks yet · Add your first roll
                </div>
            ) : (
                <div className="space-y-5 fade-in-up">
                    {filmStocks.map((stock, index) => (
                        <div
                            key={stock.id}
                            className={`glass-panel px-7 py-6 border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_45px_rgba(0,0,0,0.45)] fade-in-up ${index % 2 === 1 ? 'fade-in-delay' : ''}`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-6">
                                <div className="flex-1 min-w-[220px] space-y-3">
                                    <h3 className="text-lg font-medium uppercase tracking-[0.3em] text-white">{stock.model}</h3>
                                    <div className="grid gap-3 text-xs uppercase tracking-[0.35em] text-gray-400 md:grid-cols-3">
                                        <div>
                                            <span>Format</span>
                                            <div className="mt-1 text-sm normal-case tracking-normal text-gray-100">
                                                {stock.format || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <span>Quantity</span>
                                            <div className="mt-1 text-sm normal-case tracking-normal text-white">
                                                {stock.quantity}
                                            </div>
                                        </div>
                                        <div>
                                            <span>Expiry</span>
                                            <div className="mt-1 text-sm normal-case tracking-normal text-gray-100">
                                                {stock.expiry_date || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
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
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
                            Model *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Kodak Portra 400"
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            className="w-full bg-white/5 px-5 py-3 text-sm text-white placeholder:text-gray-500 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
                            Format
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 35mm, 120"
                            value={formData.format}
                            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                            className="w-full bg-white/5 px-5 py-3 text-sm text-white placeholder:text-gray-500 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
                            Quantity *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
                            className="w-full bg-white/5 px-5 py-3 text-sm text-white placeholder:text-gray-500 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
                            Expiry Date
                        </label>
                        <input
                            type="date"
                            value={formData.expiry_date}
                            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                            className="w-full bg-white/5 px-5 py-3 text-sm text-white placeholder:text-gray-500 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-0"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 justify-end">
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

