export default function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }) {
    const baseClasses = 'px-6 py-2 text-sm uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-gray-800',
        secondary: 'bg-white text-gray-900 border border-gray-900 hover:bg-gray-50',
        danger: 'bg-white text-red-600 border border-red-600 hover:bg-red-50',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

