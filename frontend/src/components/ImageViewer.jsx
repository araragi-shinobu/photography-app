import { useEffect } from 'react';

export default function ImageViewer({ imageUrl, onClose }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
            >
                ×
            </button>

            <img
                src={imageUrl}
                alt="Full size"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 text-white text-sm">
                Click outside or press ESC to close
            </div>
        </div>
    );
}

