# Weather & Photography Times Feature 🌅

## Overview

The trip planning feature now includes automatic weather forecasts and photography time calculations to help you plan the perfect shoot.

## What Information is Provided?

### 1. Weather Forecast ☁️
- Temperature (min/max)
- Weather conditions (clear, cloudy, rain, etc.)
- Precipitation probability
- Date of forecast

### 2. Sun Times ☀️
- **Sunrise** - Exact time the sun rises
- **Sunset** - Exact time the sun sets
- **Solar Noon** - When the sun is at its highest point

### 3. Golden Hour 🌅
Perfect for warm, soft, flattering light:
- **Morning Golden Hour**: Starts at sunrise, lasts 1 hour
- **Evening Golden Hour**: Starts 1 hour before sunset, ends at sunset

Best for:
- Portraits
- Landscapes
- Warm tones
- Long shadows

### 4. Blue Hour 🌆
Perfect for moody, atmospheric shots:
- **Morning Blue Hour**: 30 minutes before sunrise
- **Evening Blue Hour**: 30 minutes after sunset

Best for:
- Cityscapes
- Architecture
- Moody atmospheres
- Twilight scenes

## How to Use

### Step 1: Create a Trip
```
1. Go to Trips section
2. Click "New Trip"
3. Fill in details:
   - Name: "Tokyo Street Photography"
   - Destination: "Tokyo" (IMPORTANT!)
   - Start Date: Your trip date
   - Description: Your notes
```

### Step 2: View Weather Info
```
1. Open your trip
2. The weather widget appears automatically below trip details
3. Click to expand/collapse details
```

### Step 3: Plan Your Shoot
```
Use the times to plan:
- Wake up for sunrise? Check blue hour morning time
- Evening golden hour shoot? Check golden hour evening time
- Need good weather? Check precipitation probability
```

## Technical Details

### APIs Used
- **Open-Meteo** (free, no API key) - Weather data
- **Sunrise-Sunset.org** (free, no API key) - Astronomical calculations

### How it Works
1. User enters destination (e.g., "Paris")
2. System geocodes location to get coordinates
3. Fetches weather forecast from Open-Meteo
4. Calculates sun times from Sunrise-Sunset API
5. Computes golden/blue hours mathematically:
   - Golden Hour Morning: sunrise → sunrise + 1 hour
   - Golden Hour Evening: sunset - 1 hour → sunset
   - Blue Hour Morning: sunrise - 30 min → sunrise
   - Blue Hour Evening: sunset → sunset + 30 min

### No Setup Required
- ✅ No API keys needed
- ✅ No configuration required
- ✅ Works out of the box
- ✅ Free unlimited requests

## Example Output

```json
{
  "location": {
    "name": "Tokyo",
    "country": "Japan",
    "latitude": 35.6762,
    "longitude": 139.6503
  },
  "weather": {
    "date": "2024-12-01",
    "temperature_max": 15,
    "temperature_min": 8,
    "description": "Partly cloudy",
    "precipitation_probability": 10
  },
  "sun_times": {
    "sunrise": "06:28",
    "sunset": "16:32",
    "solar_noon": "11:30",
    "golden_hour_morning": {
      "start": "06:28",
      "end": "07:28"
    },
    "golden_hour_evening": {
      "start": "15:32",
      "end": "16:32"
    },
    "blue_hour_morning": {
      "start": "05:58",
      "end": "06:28"
    },
    "blue_hour_evening": {
      "start": "16:32",
      "end": "17:02"
    }
  }
}
```

## Photography Tips

### Golden Hour Shooting
- Arrive 30 minutes early
- Shoot with sun behind subject for backlit glow
- Great for skin tones and warm colors
- Shadows are long and interesting

### Blue Hour Shooting
- Bring a tripod (longer exposures needed)
- Shoot in RAW for better color grading
- City lights look amazing against blue sky
- Perfect balance between ambient and artificial light

### Weather Considerations
- **Clear sky**: Harsh midday light, great golden hour
- **Partly cloudy**: Interesting skies, good all day
- **Overcast**: Soft, diffused light, great for portraits
- **Rain**: Reflections, moody atmosphere, bring protection

## Troubleshooting

### "Could not find weather information"
- Check destination spelling
- Try more specific location (e.g., "Tokyo, Japan" instead of just "Tokyo")
- Try major city nearby

### Times seem wrong
- Times are shown in local timezone of the destination
- Account for daylight saving time changes
- Double-check your trip date

### Weather not updating
- Click "Refresh data" button
- Weather is fetched when you open the trip
- Data is cached temporarily

## Future Enhancements (Potential)

- [ ] Multi-day forecasts
- [ ] Moon phase information
- [ ] Tide times (for coastal photography)
- [ ] Cloud cover percentage
- [ ] Wind speed (for long exposures)
- [ ] Historical weather data

---

Happy shooting! 📸🌅

