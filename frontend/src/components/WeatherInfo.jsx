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
            <div className="border border-gray-200 p-6 bg-gray-50">
                <p className="text-gray-500 text-sm">
                    Add a destination to see weather and photography times
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="border border-gray-200 p-6">
                <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span className="text-sm">Loading weather data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="border border-gray-200 p-6 bg-gray-50">
                <p className="text-gray-600 text-sm mb-2">{error}</p>
                <button
                    onClick={fetchWeather}
                    className="text-sm text-gray-900 underline hover:no-underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!weatherData) return null;

    return (
        <div className="border border-gray-200">
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="text-left">
                    <h3 className="font-medium text-gray-900 mb-1">
                        Weather & Photography Times
                    </h3>
                    <p className="text-sm text-gray-600">
                        {weatherData.location.name}, {weatherData.location.country}
                    </p>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {showDetails && (
                <div className="border-t border-gray-200 p-6 space-y-6">
                    {/* Weather Section */}
                    {weatherData.weather && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Weather Forecast</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Condition:</span>
                                    <span className="ml-2 text-gray-900">{weatherData.weather.description}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Temperature:</span>
                                    <span className="ml-2 text-gray-900">
                                        {Math.round(weatherData.weather.temperature_min)}°C - {Math.round(weatherData.weather.temperature_max)}°C
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Rain Probability:</span>
                                    <span className="ml-2 text-gray-900">{weatherData.weather.precipitation_probability}%</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Date:</span>
                                    <span className="ml-2 text-gray-900">{weatherData.weather.date}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sun Times Section */}
                    {weatherData.sun_times && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Sun Times</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Sunrise:</span>
                                    <span className="ml-2 text-gray-900 font-medium">{weatherData.sun_times.sunrise}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Sunset:</span>
                                    <span className="ml-2 text-gray-900 font-medium">{weatherData.sun_times.sunset}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Solar Noon:</span>
                                    <span className="ml-2 text-gray-900">{weatherData.sun_times.solar_noon}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Timezone:</span>
                                    <span className="ml-2 text-gray-900">{weatherData.sun_times.timezone || 'Local'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Golden Hour Section */}
                    {weatherData.sun_times && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                                Golden Hour 🌅
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="bg-amber-50 border border-amber-200 p-3">
                                    <div className="text-gray-700 font-medium mb-1">Morning</div>
                                    <div className="text-gray-900">
                                        {weatherData.sun_times.golden_hour_morning.start} - {weatherData.sun_times.golden_hour_morning.end}
                                    </div>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 p-3">
                                    <div className="text-gray-700 font-medium mb-1">Evening</div>
                                    <div className="text-gray-900">
                                        {weatherData.sun_times.golden_hour_evening.start} - {weatherData.sun_times.golden_hour_evening.end}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Blue Hour Section */}
                    {weatherData.sun_times && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                                Blue Hour 🌆
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="bg-blue-50 border border-blue-200 p-3">
                                    <div className="text-gray-700 font-medium mb-1">Morning</div>
                                    <div className="text-gray-900">
                                        {weatherData.sun_times.blue_hour_morning.start} - {weatherData.sun_times.blue_hour_morning.end}
                                    </div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 p-3">
                                    <div className="text-gray-700 font-medium mb-1">Evening</div>
                                    <div className="text-gray-900">
                                        {weatherData.sun_times.blue_hour_evening.start} - {weatherData.sun_times.blue_hour_evening.end}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                        <button
                            onClick={fetchWeather}
                            className="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            Refresh data
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

