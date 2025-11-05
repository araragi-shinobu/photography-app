import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="min-h-screen text-gray-100">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-semibold tracking-[0.4em] uppercase text-gray-200">Film Photography</h1>
                        <span className="hidden md:block text-xs uppercase tracking-[0.5em] text-gray-400">Captured in Grain</span>
                    </div>
                    <nav className="mt-6 flex gap-10 text-xs uppercase tracking-[0.35em]">
                        <Link
                            to="/galleries"
                            className={`pb-3 transition-all ${isActive('/galleries')
                                    ? 'text-white border-b border-white'
                                    : 'text-gray-500 hover:text-gray-200 border-b border-transparent'
                                }`}
                        >
                            Galleries
                        </Link>
                        <Link
                            to="/film-stocks"
                            className={`pb-3 transition-all ${isActive('/film-stocks')
                                    ? 'text-white border-b border-white'
                                    : 'text-gray-500 hover:text-gray-200 border-b border-transparent'
                                }`}
                        >
                            Film Stock
                        </Link>
                        <Link
                            to="/trips"
                            className={`pb-3 transition-all ${isActive('/trips')
                                    ? 'text-white border-b border-white'
                                    : 'text-gray-500 hover:text-gray-200 border-b border-transparent'
                                }`}
                        >
                            Trips
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-6 py-10">
                {children}
            </main>
        </div>
    );
}

