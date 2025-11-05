import { useState, useEffect } from 'react';
import { tripsAPI } from '../services/api';

export default function WeatherInfo({ tripId, destination }) {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(true);

    useEffect(() => {
        if (destination) {
            fetchWeather();
        }
    }, [tripId, destination]);

    const fetchWeather = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await tripsAPI.getWeather(tripId);
            setWeatherData(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to fetch weather data');
            console.error('Weather fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!destination) {
        return (
            <div className="glass-panel--soft px-6 py-5 text-sm text-gray-400">
                Add a destination to see weather and photography times
            </div>
        );
    }

    if (loading) {
        return (
            <div className="glass-panel--soft px-6 py-5">
                <div className="flex items-center gap-2 text-gray-300">
                    <div className="animate-spin h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm uppercase tracking-[0.35em]">Loading weather data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel--soft px-6 py-5 text-sm text-gray-200">
                <p className="mb-3 text-gray-300">{error}</p>
                <button
                    onClick={fetchWeather}
                    className="uppercase tracking-[0.35em] text-xs text-gray-100 underline hover:text-white"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!weatherData) return null;

    return (
        <div className="glass-panel">
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/10 transition-colors"
            >
                <div className="text-left">
                    <h3 className="font-medium text-white mb-1 uppercase tracking-[0.3em] text-sm">
                        Weather & Photography Times
                    </h3>
                    <p className="text-xs text-gray-300 uppercase tracking-[0.35em]">
                        {weatherData.location.name}, {weatherData.location.country}
                    </p>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-300 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {showDetails && (
                <div className="border-t border-white/10 px-6 py-6 space-y-6">
                    {/* Weather Section */}
                    {weatherData.weather && (
                        <div>
                            <h4 className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-4">Weather Forecast</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-200">
                                <div>
                                    <span className="text-gray-400 uppercase tracking-[0.3em] text-xs">Condition</span>
                                    <div className="mt-1 text-base tracking-normal text-white">{weatherData.weather.description}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400 uppercase tracking-[0.3em] text-xs">Temperature</span>
                                    <div className="mt-1 text-base tracking-normal text-white">
                                        {Math.round(weatherData.weather.temperature_min)}°C - {Math.round(weatherData.weather.temperature_max)}°C
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-400 uppercase tracking-[0.3em] text-xs">Rain Probability</span>
                                    <div className="mt-1 text-base tracking-normal text-white">{weatherData.weather.precipitation_probability}%</div>
                                </div>
                                <div>
                                    <span className="text-gray-400 uppercase tracking-[0.3em] text-xs">Date</span>
                                    <div className="mt-1 text-base tracking-normal text-white">{weatherData.weather.date}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sun Times Section */}
                    {weatherData.sun_times && (
                        <div>
                            <h4 className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-4">Sun Times</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-200">
                                <div>
                                    <span className="text-gray-400 uppercase tracking-[0.3em] text-xs">Sunrise</span>
                                    <div className="mt-1 text-base tracking-normal text-white font-medium">{weatherData.sun_times.sunrise}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400 uppercase tracking-[0.3em] text-xs">Sunset</span>
                                    <div className="mt-1 text-base tracking-normal text-white font-medium">{weatherData.sun_times.sunset}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400 uppercase tracking-[0.3em] text-xs">Solar Noon</span>
                                    <div className="mt-1 text-base tracking-normal text-white">{weatherData.sun_times.solar_noon}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400 uppercase tracking-[0.3em] text-xs">Timezone</span>
                                    <div className="mt-1 text-base tracking-normal text-white">{weatherData.sun_times.timezone || 'Local'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Golden Hour Section */}
                    {weatherData.sun_times && (
                        <div>
                            <h4 className="text-xs uppercase tracking-[0.35em] text-amber-200 mb-4">
                                Golden Hour 🌅
                            </h4>
                            <div className="grid gap-3 text-sm">
                                <div className="border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-amber-100">
                                    <div className="text-xs uppercase tracking-[0.35em] text-amber-200 mb-2">Morning</div>
                                    <div className="text-base tracking-normal text-white">
                                        {weatherData.sun_times.golden_hour_morning.start} - {weatherData.sun_times.golden_hour_morning.end}
                                    </div>
                                </div>
                                <div className="border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-amber-100">
                                    <div className="text-xs uppercase tracking-[0.35em] text-amber-200 mb-2">Evening</div>
                                    <div className="text-base tracking-normal text-white">
                                        {weatherData.sun_times.golden_hour_evening.start} - {weatherData.sun_times.golden_hour_evening.end}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Blue Hour Section */}
                    {weatherData.sun_times && (
                        <div>
                            <h4 className="text-xs uppercase tracking-[0.35em] text-blue-200 mb-4">
                                Blue Hour 🌆
                            </h4>
                            <div className="grid gap-3 text-sm">
                                <div className="border border-blue-300/40 bg-blue-400/10 px-4 py-3 text-blue-100">
                                    <div className="text-xs uppercase tracking-[0.35em] text-blue-200 mb-2">Morning</div>
                                    <div className="text-base tracking-normal text-white">
                                        {weatherData.sun_times.blue_hour_morning.start} - {weatherData.sun_times.blue_hour_morning.end}
                                    </div>
                                </div>
                                <div className="border border-blue-300/40 bg-blue-400/10 px-4 py-3 text-blue-100">
                                    <div className="text-xs uppercase tracking-[0.35em] text-blue-200 mb-2">Evening</div>
                                    <div className="text-base tracking-normal text-white">
                                        {weatherData.sun_times.blue_hour_evening.start} - {weatherData.sun_times.blue_hour_evening.end}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-5 border-t border-white/10 text-right">
                        <button
                            onClick={fetchWeather}
                            className="text-xs uppercase tracking-[0.35em] text-gray-300 hover:text-white underline"
                        >
                            Refresh data
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

