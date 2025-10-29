import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Galleries from './pages/Galleries';
import GalleryDetail from './pages/GalleryDetail';
import FilmStocks from './pages/FilmStocks';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/galleries" replace />} />
                    <Route path="/galleries" element={<Galleries />} />
                    <Route path="/galleries/:id" element={<GalleryDetail />} />
                    <Route path="/film-stocks" element={<FilmStocks />} />
                    <Route path="/trips" element={<Trips />} />
                    <Route path="/trips/:id" element={<TripDetail />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;

