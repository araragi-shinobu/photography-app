import { useEffect, useState } from 'react';

export default function ImageViewer({ image, onClose }) {
    const [src, setSrc] = useState(image?.src || null);

    useEffect(() => {
        setSrc(image?.src || null);
    }, [image]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!image) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-6 fade-in"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition-colors z-10"
            >
                ×
            </button>

            <img
                key={src}
                src={src}
                alt="Full size"
                className="max-w-full max-h-full object-contain shadow-2xl shadow-black/70"
                onClick={(e) => e.stopPropagation()}
                onError={() => {
                    if (image?.fallback && image.fallback !== src) {
                        setSrc(image.fallback);
                    }
                }}
            />

            <div className="absolute bottom-8 text-sm uppercase tracking-[0.4em] text-gray-300">
                Click outside or press ESC to close
            </div>
        </div>
    );
}

