export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-6 py-10">
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative w-full max-w-2xl glass-panel px-9 py-8">
                    <div className="flex items-start justify-between mb-6">
                        <h2 className="text-xl font-semibold uppercase tracking-[0.35em] text-gray-100">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
                        >
                            ×
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

