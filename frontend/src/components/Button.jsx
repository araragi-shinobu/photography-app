export default function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }) {
    const baseClasses = 'px-7 py-2.5 text-xs uppercase tracking-[0.35em] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/30 backdrop-blur';

    const variants = {
        primary: 'bg-white/90 text-gray-900 hover:bg-white hover:text-black',
        secondary: 'bg-transparent text-gray-200 border border-white/30 hover:bg-white/10',
        danger: 'bg-transparent text-red-400 border border-red-400/60 hover:bg-red-500/10',
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

