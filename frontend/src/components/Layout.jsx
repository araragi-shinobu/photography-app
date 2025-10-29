import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Film Photography</h1>
                    <nav className="flex gap-8">
                        <Link
                            to="/galleries"
                            className={`text-sm uppercase tracking-wider pb-2 border-b-2 transition-colors ${isActive('/galleries')
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Galleries
                        </Link>
                        <Link
                            to="/film-stocks"
                            className={`text-sm uppercase tracking-wider pb-2 border-b-2 transition-colors ${isActive('/film-stocks')
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Film Stock
                        </Link>
                        <Link
                            to="/trips"
                            className={`text-sm uppercase tracking-wider pb-2 border-b-2 transition-colors ${isActive('/trips')
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Trips
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}

