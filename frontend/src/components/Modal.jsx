export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
                <div className="relative bg-white w-full max-w-2xl p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-900 text-2xl leading-none"
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

