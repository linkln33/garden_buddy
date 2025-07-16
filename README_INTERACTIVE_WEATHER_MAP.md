# Garden Buddy Interactive Weather Map

## Overview

The Interactive Weather Map is a powerful feature that enhances Garden Buddy's weather capabilities with:

- **Interactive field mapping** - Draw and save your garden/field polygons
- **Real-time weather overlays** - Temperature, precipitation, wind, and more
- **Animated radar** - See precipitation movement with RainViewer integration
- **Field-specific weather insights** - Get weather data for your exact field location
- **Smart spray recommendations** - Optimal spray times based on weather conditions
- **Storm alerts** - Receive warnings about adverse weather conditions

## Setup Instructions

### Prerequisites

- Garden Buddy app with Next.js and React Native Web
- Supabase account with project set up
- OpenWeatherMap API key (free tier works fine)

### Quick Setup

We've created a setup script to make installation easy:

```bash
# Make the script executable
chmod +x scripts/setup-weather-feature.js

# Run the setup script
node scripts/setup-weather-feature.js
```

This script will:
1. Install required npm packages (leaflet, react-leaflet, etc.)
2. Set up Leaflet marker icons in the public directory
3. Configure your OpenWeatherMap API key in .env.local

### Manual Setup

If you prefer to set up manually:

1. **Install required packages**:
   ```bash
   npm install leaflet react-leaflet leaflet-draw react-leaflet-draw
   ```

2. **Set up Leaflet marker icons**:
   ```bash
   chmod +x scripts/setup-leaflet-assets.sh
   bash scripts/setup-leaflet-assets.sh
   ```

3. **Configure OpenWeatherMap API key**:
   - Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
   - Add it to your `.env.local` file:
     ```
     NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_api_key_here
     ```

4. **Set up database tables**:
   - Run the SQL migration script in your Supabase project:
     ```sql
     -- From migrations/20250717_add_weather_tables.sql
     ```

## Using the Interactive Weather Map

1. Navigate to the Weather page in Garden Buddy
2. Click the "Interactive Map" button to switch from the simple map to the interactive map
3. Use the drawing tools to create field polygons:
   - Click the draw polygon button
   - Click on the map to create polygon vertices
   - Close the polygon by clicking on the first point
   - Enter a name and crop type for your field

4. Use the layer controls to toggle different weather overlays:
   - Temperature
   - Precipitation
   - Wind
   - Clouds
   - Pressure
   - Animated radar

5. Click on saved fields to view field-specific weather data and spray recommendations

## Smart Spraying Calendar

The Smart Spraying Calendar component provides:

- Optimal spray days based on weather conditions
- Risk scores for each day
- Best time of day to spray
- Ability to add spray events to your calendar
- Customized recommendations based on crop type

## Features and Components

### 1. WeatherMap Component

The main interactive map component with:
- Leaflet map integration
- Field polygon drawing and saving
- Weather overlay layers
- Animated radar from RainViewer
- Field selection and management

### 2. StormAlert Component

A reusable alert component for:
- Weather warnings
- Spray recommendations
- Severity-based color coding
- Dismissable alerts

### 3. SprayingCalendar Component

Smart calendar that:
- Analyzes forecast data
- Calculates optimal spray days
- Provides spray scores and recommendations
- Allows adding events to calendar

### 4. RainViewer Integration

Free animated radar integration:
- Real-time precipitation data
- Animation controls
- Historical radar frames
- No API key required

## Database Schema

The feature uses three main tables in Supabase:

1. **fields** - Stores user field polygons
   - id, user_id, name, coordinates (JSONB), crop_type, area, notes

2. **field_alerts** - Stores weather alerts for specific fields
   - id, field_id, user_id, alert_type, severity, title, description, resolved

3. **spray_events** - Tracks scheduled spray applications
   - id, field_id, user_id, scheduled_date, best_time_of_day, completed, weather_conditions

## Troubleshooting

### Map doesn't display properly
- Make sure Leaflet CSS is properly imported
- Check that marker icons are in the public/leaflet directory
- Verify that dynamic imports are working correctly

### Weather data not loading
- Confirm your OpenWeatherMap API key is valid
- Check browser console for API errors
- Verify internet connectivity

### Fields not saving
- Ensure Supabase is properly configured
- Check that the fields table exists in your database
- Verify Row Level Security policies are set up correctly

## Free Resources Used

This feature leverages several free resources:

- **OpenWeatherMap API** - Free tier provides current weather, forecasts, and map layers
- **RainViewer API** - Free animated radar data
- **Leaflet** - Open-source interactive mapping library
- **React-Leaflet** - React components for Leaflet maps
- **Leaflet.draw** - Drawing tools for Leaflet

## Future Enhancements

Potential future improvements:

- Offline support with cached weather data
- Field-specific crop disease risk modeling
- IoT sensor integration for local weather data
- Push notifications for severe weather alerts
- Mobile-optimized field drawing tools

## Credits

- OpenWeatherMap for weather data and map layers
- RainViewer for free radar data
- Leaflet and React-Leaflet contributors
- Garden Buddy development team

---

For more information, see the full implementation guide in `INTERACTIVE_WEATHER_MAP_IMPLEMENTATION.md`.
