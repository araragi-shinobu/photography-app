import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import pytz
from timezonefinder import TimezoneFinder


class WeatherService:
    """Service for fetching weather and astronomical data for photography"""
    
    def __init__(self):
        self.geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"
        self.weather_url = "https://api.open-meteo.com/v1/forecast"
        self.sunrise_url = "https://api.sunrise-sunset.org/json"
        self.tf = TimezoneFinder()
    
    def get_coordinates(self, location: str) -> Optional[Dict[str, float]]:
        """Get latitude and longitude from location name"""
        try:
            response = requests.get(
                self.geocoding_url,
                params={"name": location, "count": 1, "language": "en", "format": "json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("results") and len(data["results"]) > 0:
                    result = data["results"][0]
                    return {
                        "latitude": result["latitude"],
                        "longitude": result["longitude"],
                        "name": result.get("name", location),
                        "country": result.get("country", "")
                    }
            return None
        except Exception as e:
            print(f"Error getting coordinates: {e}")
            return None
    
    def get_weather(self, latitude: float, longitude: float, date: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get weather forecast for location"""
        try:
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "daily": "temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max",
                "timezone": "auto",
                "forecast_days": 7
            }
            
            if date:
                params["start_date"] = date
                params["end_date"] = date
            
            response = requests.get(self.weather_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                daily = data.get("daily", {})
                
                if daily and len(daily.get("time", [])) > 0:
                    return {
                        "date": daily["time"][0],
                        "temp_max": daily["temperature_2m_max"][0],
                        "temp_min": daily["temperature_2m_min"][0],
                        "weather_code": daily["weathercode"][0],
                        "precipitation_probability": daily.get("precipitation_probability_max", [0])[0],
                        "timezone": data.get("timezone", "UTC")
                    }
            return None
        except Exception as e:
            print(f"Error getting weather: {e}")
            return None
    
    def get_sun_times(self, latitude: float, longitude: float, date: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get sunrise, sunset, and photography hours"""
        try:
            # Get timezone for the location
            timezone_str = self.tf.timezone_at(lat=latitude, lng=longitude)
            if not timezone_str:
                # Fallback to UTC if timezone not found
                timezone_str = "UTC"
            
            local_tz = pytz.timezone(timezone_str)
            
            params = {
                "lat": latitude,
                "lng": longitude,
                "formatted": 0  # Get ISO 8601 format
            }
            
            if date:
                params["date"] = date
            
            response = requests.get(self.sunrise_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("status") == "OK":
                    results = data["results"]
                    
                    # Parse times and convert to local timezone
                    sunrise_utc = datetime.fromisoformat(results["sunrise"].replace("Z", "+00:00"))
                    sunset_utc = datetime.fromisoformat(results["sunset"].replace("Z", "+00:00"))
                    solar_noon_utc = datetime.fromisoformat(results["solar_noon"].replace("Z", "+00:00"))
                    
                    # Convert to local timezone
                    sunrise = sunrise_utc.astimezone(local_tz)
                    sunset = sunset_utc.astimezone(local_tz)
                    solar_noon = solar_noon_utc.astimezone(local_tz)
                    
                    # Calculate golden hours (1 hour after sunrise, 1 hour before sunset)
                    golden_hour_morning_start = sunrise
                    golden_hour_morning_end = sunrise + timedelta(hours=1)
                    golden_hour_evening_start = sunset - timedelta(hours=1)
                    golden_hour_evening_end = sunset
                    
                    # Calculate blue hours (30 min before sunrise, 30 min after sunset)
                    blue_hour_morning_start = sunrise - timedelta(minutes=30)
                    blue_hour_morning_end = sunrise
                    blue_hour_evening_start = sunset
                    blue_hour_evening_end = sunset + timedelta(minutes=30)
                    
                    return {
                        "sunrise": sunrise.strftime("%H:%M"),
                        "sunset": sunset.strftime("%H:%M"),
                        "solar_noon": solar_noon.strftime("%H:%M"),
                        "day_length": results["day_length"],
                        "timezone": timezone_str,
                        "golden_hour_morning": {
                            "start": golden_hour_morning_start.strftime("%H:%M"),
                            "end": golden_hour_morning_end.strftime("%H:%M")
                        },
                        "golden_hour_evening": {
                            "start": golden_hour_evening_start.strftime("%H:%M"),
                            "end": golden_hour_evening_end.strftime("%H:%M")
                        },
                        "blue_hour_morning": {
                            "start": blue_hour_morning_start.strftime("%H:%M"),
                            "end": blue_hour_morning_end.strftime("%H:%M")
                        },
                        "blue_hour_evening": {
                            "start": blue_hour_evening_start.strftime("%H:%M"),
                            "end": blue_hour_evening_end.strftime("%H:%M")
                        }
                    }
            return None
        except Exception as e:
            print(f"Error getting sun times: {e}")
            return None
    
    def get_weather_description(self, weather_code: int) -> str:
        """Convert WMO weather code to description"""
        weather_codes = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail"
        }
        return weather_codes.get(weather_code, "Unknown")
    
    def get_complete_info(self, location: str, date: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get all information (weather + sun times) for a location"""
        # Get coordinates
        coords = self.get_coordinates(location)
        if not coords:
            return None
        
        latitude = coords["latitude"]
        longitude = coords["longitude"]
        
        # Get weather
        weather = self.get_weather(latitude, longitude, date)
        
        # Get sun times
        sun_times = self.get_sun_times(latitude, longitude, date)
        
        result = {
            "location": {
                "name": coords["name"],
                "country": coords["country"],
                "latitude": latitude,
                "longitude": longitude
            }
        }
        
        if weather:
            result["weather"] = {
                "date": weather["date"],
                "temperature_max": weather["temp_max"],
                "temperature_min": weather["temp_min"],
                "description": self.get_weather_description(weather["weather_code"]),
                "precipitation_probability": weather["precipitation_probability"]
            }
        
        if sun_times:
            result["sun_times"] = sun_times
        
        return result


# Singleton instance
weather_service = WeatherService()

