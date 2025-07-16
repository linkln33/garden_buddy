# Interactive Weather Map Implementation Guide

## Overview
This guide outlines how to implement an interactive weather map feature for the Garden Buddy app using React, Next.js, React-Leaflet, and free weather APIs. This implementation will enhance the current weather page with field-level insights, storm tracking, and smart spraying recommendations.

## Goals
- Add interactive map with weather overlays (rain, temperature, wind)
- Implement field polygon drawing and management
- Provide field-specific weather insights
- Add storm alerts and smart spraying suggestions
- Integrate GPS location services

## Tech Stack
| Purpose | Tools/Libraries |
|---------|----------------|
| Mapping | Leaflet.js + React-Leaflet |
| Base map | OpenStreetMap |
| Weather overlays | OpenWeatherMap Tile API, RainViewer |
| Field drawing | react-leaflet-draw |
| Location services | Browser Geolocation API |
| Frontend | React + Next.js |
| Backend | Supabase (store user fields/preferences) |

## Implementation Steps

### 1. Set Up Dependencies
```bash
npm install leaflet react-leaflet @react-leaflet/core leaflet-draw react-leaflet-draw
```

Add Leaflet CSS to your project in `_app.tsx` or layout component:
```tsx
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
```

### 2. Create Map Component
Create a new component at `src/components/WeatherMap.tsx`:

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Popup, Polygon, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../lib/supabase/types';
import { View, Text, StyleSheet } from 'react-native';
import L from 'leaflet';

interface WeatherMapProps {
  latitude: number;
  longitude: number;
  onFieldSelect?: (field: any) => void;
}

interface Field {
  id: string;
  name: string;
  coordinates: any;
  crop_type?: string;
  user_id: string;
}

export default function WeatherMap({ latitude, longitude, onFieldSelect }: WeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState<string>('temperature');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [fieldWeather, setFieldWeather] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const mapRef = useRef(null);
  const featureGroupRef = useRef(null);
  
  // Fix Leaflet icon issues in Next.js
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      });
    }
  }, []);

  // Weather overlay options
  const WEATHER_LAYERS = {
    temperature: {
      name: 'Temperature',
      url: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid={apiKey}',
    },
    precipitation: {
      name: 'Precipitation',
      url: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid={apiKey}',
    },
    clouds: {
      name: 'Clouds',
      url: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid={apiKey}',
    },
    wind: {
      name: 'Wind',
      url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid={apiKey}',
    },
    pressure: {
      name: 'Pressure',
      url: 'https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid={apiKey}',
    },
    none: {
      name: 'None',
      url: '',
    },
  };

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Get API key from environment
    setApiKey(process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || '');
    
    // Load user's saved fields
    loadUserFields();
  }, []);

  // Load user's saved fields from Supabase
  const loadUserFields = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return;
      
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      
      if (data) {
        setFields(data);
      }
    } catch (error) {
      console.error('Error loading fields:', error);
    }
  };

  // Save a new field to Supabase
  const saveField = async (name: string, coordinates: any, cropType: string = 'general') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return;
      
      const { data, error } = await supabase
        .from('fields')
        .insert({
          name,
          coordinates,
          crop_type: cropType,
          user_id: session.user.id
        })
        .select();
        
      if (error) throw error;
      
      if (data) {
        setFields([...fields, data[0]]);
        return data[0];
      }
    } catch (error) {
      console.error('Error saving field:', error);
    }
  };

  // Handle field creation from draw tool
  const handleCreate = (e: any) => {
    const { layerType, layer } = e;
    
    if (layerType === 'polygon') {
      const coordinates = layer.getLatLngs()[0].map((latlng: any) => [latlng.lat, latlng.lng]);
      
      // Prompt user for field name and crop type
      const name = prompt('Enter field name:') || 'Unnamed Field';
      const cropType = prompt('Enter crop type:') || 'general';
      
      saveField(name, coordinates, cropType);
    }
  };

  // Get field-specific weather
  const getFieldWeather = async (field: Field) => {
    try {
      // Calculate center point of field
      const coords = field.coordinates;
      const centerLat = coords.reduce((sum: number, point: number[]) => sum + point[0], 0) / coords.length;
      const centerLng = coords.reduce((sum: number, point: number[]) => sum + point[1], 0) / coords.length;
      
      // Fetch weather for this location
      const response = await fetch(`/api/weather?lat=${centerLat}&lon=${centerLng}&crop=${field.crop_type || 'general'}`);
      const data = await response.json();
      
      setFieldWeather(data);
      setSelectedField(field);
      
      if (onFieldSelect) {
        onFieldSelect(field);
      }
    } catch (error) {
      console.error('Error getting field weather:', error);
    }
  };

  // Map center component to update view when coordinates change
  const MapCenter = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.layerSelector}>
        {Object.entries(WEATHER_LAYERS).map(([key, layer]) => (
          <Text
            key={key}
            style={[
              styles.layerOption,
              activeLayer === key && styles.activeLayer
            ]}
            onPress={() => setActiveLayer(key)}
          >
            {layer.name}
          </Text>
        ))}
      </View>
      
      <MapContainer
        center={[latitude, longitude]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <MapCenter center={[latitude, longitude]} />
        
        {/* Base map layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        {/* Weather overlay layer */}
        {activeLayer !== 'none' && apiKey && (
          <TileLayer
            url={WEATHER_LAYERS[activeLayer].url.replace('{apiKey}', apiKey)}
            attribution="Weather data © OpenWeatherMap"
          />
        )}
        
        {/* Field drawing tools */}
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreate}
            draw={{
              rectangle: false,
              circle: false,
              marker: false,
              polyline: false,
              polygon: true,
              circlemarker: false,
            }}
          />
          
          {/* Render saved fields */}
          {fields.map((field) => (
            <Polygon
              key={field.id}
              positions={field.coordinates}
              eventHandlers={{
                click: () => getFieldWeather(field),
              }}
              pathOptions={{
                color: selectedField?.id === field.id ? '#ff7800' : '#3388ff',
                weight: 3,
                fillOpacity: 0.2,
              }}
            >
              <Popup>
                <div>
                  <h3>{field.name}</h3>
                  <p>Crop: {field.crop_type || 'Not specified'}</p>
                  {fieldWeather && selectedField?.id === field.id && (
                    <div>
                      <p>Temperature: {fieldWeather.weather.current.temp}°C</p>
                      <p>Humidity: {fieldWeather.weather.current.humidity}%</p>
                      <p>Wind: {fieldWeather.weather.current.wind_speed} km/h</p>
                      {fieldWeather.sprayRecommendations && (
                        <div>
                          <p>Spray Recommendation: {fieldWeather.sprayRecommendations.shouldSpray ? 'Yes' : 'No'}</p>
                          <p>Risk Level: {fieldWeather.sprayRecommendations.riskLevel}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Polygon>
          ))}
        </FeatureGroup>
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 500,
    width: '100%',
    position: 'relative',
  },
  layerSelector: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'column',
  },
  layerOption: {
    padding: 8,
    marginBottom: 4,
  },
  activeLayer: {
    backgroundColor: '#e0e0e0',
    fontWeight: 'bold',
  },
});

### 3. Update Database Schema
Create a new migration file to add the fields table to your Supabase database:

```sql
-- Create fields table
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  crop_type TEXT DEFAULT 'general',
  area FLOAT,
  notes TEXT
);

-- Add RLS policies
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own fields
CREATE POLICY "Users can view their own fields" ON public.fields
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own fields
CREATE POLICY "Users can insert their own fields" ON public.fields
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own fields
CREATE POLICY "Users can update their own fields" ON public.fields
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own fields
CREATE POLICY "Users can delete their own fields" ON public.fields
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX fields_user_id_idx ON public.fields (user_id);

CREATE POLICY "Users can delete their own fields" ON public.fields
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX fields_user_id_idx ON public.fields (user_id);
```

### 4. Create RainViewer API Integration
Create a new file at `src/lib/weather/rainviewer.ts` to integrate the free RainViewer API for animated radar:

```typescript
/**
 * RainViewer API integration for animated radar maps
 * Based on the free RainViewer API: https://www.rainviewer.com/api.html
 */

interface RainViewerAPIResponse {
  radar: {
    past: RainViewerFrame[];
    nowcast: RainViewerFrame[];
  };
  host: string;
  version: string;
}

interface RainViewerFrame {
  time: number;
  path: string;
}

/**
 * Fetches the latest radar data from RainViewer API
 * @returns RainViewer API response with past and forecast frames
 */
export async function fetchRainViewerData(): Promise<RainViewerAPIResponse | null> {
  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    
    if (!response.ok) {
      throw new Error(`RainViewer API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching RainViewer data:', error);
    return null;
  }
}

/**
 * Creates a tile layer URL for a specific radar frame
 * @param host - RainViewer API host
 * @param path - Path to the radar frame
 * @param options - Options for the radar display
 * @returns URL for the tile layer
 */
export function getRainViewerTileUrl(
  host: string,
  path: string,
  options: {
    color?: string;
    smooth?: boolean;
    snow?: boolean;
    opacity?: number;
  } = {}
): string {
  const {
    color = 4,
    smooth = 1,
    snow = 1,
    opacity = 0.7
  } = options;
  
  return `https://${host}${path}/${color}/${smooth}_${snow}/${opacity}/{z}/{x}/{y}/256.png`;
}
```

### 5. Enhance the Weather API
Update the weather API route to include field-specific data and storm alerts:

```typescript
// src/app/api/weather/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getWeatherData, getSprayRecommendations } from '../../../lib/weather';

/**
 * Enhanced Weather API route for fetching weather data and spray recommendations
 * GET /api/weather?lat=<latitude>&lon=<longitude>&crop=<crop_type>&field_id=<field_id>
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const cropType = searchParams.get('crop') || 'general';
    const fieldId = searchParams.get('field_id'); // Optional field ID

    // Validate required parameters
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat and lon' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    // Validate coordinate ranges
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180' },
        { status: 400 }
      );
    }

    // Fetch weather data
    const weatherData = await getWeatherData(latitude, longitude);
    
    if (!weatherData) {
      return NextResponse.json(
        { error: 'Failed to fetch weather data' },
        { status: 500 }
      );
    }

    // Get spray recommendations based on weather and crop type
    const sprayRecommendations = getSprayRecommendations(weatherData, cropType);
    
    // Check for severe weather alerts
    const stormAlert = checkForStormAlert(weatherData);

    // Return combined weather and spray data
    return NextResponse.json({
      weather: weatherData,
      sprayRecommendations,
      stormAlert,
      location: {
        latitude,
        longitude,
        cropType,
        fieldId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check for severe weather conditions that would warrant a storm alert
 */
function checkForStormAlert(weatherData: any) {
  if (!weatherData) return null;
  
  // Check for existing alerts from the API
  if (weatherData.alerts && weatherData.alerts.length > 0) {
    return {
      type: 'api_alert',
      severity: 'high',
      title: weatherData.alerts[0].event,
      description: weatherData.alerts[0].description,
      start: weatherData.alerts[0].start,
      end: weatherData.alerts[0].end
    };
  }
  
  // Check for high winds
  const windSpeed = weatherData.current.wind_speed;
  if (windSpeed > 50) { // km/h
    return {
      type: 'high_wind',
      severity: 'high',
      title: 'High Wind Warning',
      description: `Strong winds detected (${windSpeed} km/h). Delay spraying and secure equipment.`,
    };
  }
  
  // Check for heavy rain
  const rainAmount = weatherData.current.rain?.['1h'] || 0;
  if (rainAmount > 10) { // mm in last hour
    return {
      type: 'heavy_rain',
      severity: 'medium',
      title: 'Heavy Rain Alert',
      description: `Heavy rainfall detected (${rainAmount} mm). Delay spraying until conditions improve.`,
    };
  }
  
  // Check for high probability of precipitation in next 3 hours
  const nextFewHours = weatherData.daily[0];
  if (nextFewHours && nextFewHours.pop > 0.7) { // >70% chance
    return {
      type: 'rain_forecast',
      severity: 'low',
      title: 'Rain Expected Soon',
      description: `High probability of rain in the next few hours. Consider delaying spray applications.`,
    };
  }
  
  return null;
}

/**
 * Health check endpoint
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
```

### 6. Update the Weather Page
Update the existing weather page to integrate the interactive map:

```tsx
// In src/app/weather/page.tsx
// Add the WeatherMap component import
import WeatherMap from '../../components/WeatherMap';

// Replace the existing iframe weather map with our interactive map
// Find this section in the existing code:
<View style={styles.rightContent}>
  <Text style={styles.title}>Weather Map</Text>
  <View style={styles.weatherMapContainer}>
    {/* Replace this iframe with our WeatherMap component */}
    <WeatherMap 
      latitude={location.latitude || 37.7749}
      longitude={location.longitude || -122.4194}
      onFieldSelect={(field) => {
        console.log('Selected field:', field);
        // You can add additional functionality here
      }}
    />
  </View>
</View>
```

### 7. Add Storm Alerts Component
Create a new component for displaying storm alerts:

```tsx
// src/components/StormAlert.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { FaExclamationTriangle } from 'react-icons/fa';

interface StormAlertProps {
  alert: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    start?: number;
    end?: number;
  };
  onDismiss: () => void;
}

export default function StormAlert({ alert, onDismiss }: StormAlertProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#FFCC00';
      default:
        return '#FF9500';
    }
  };

  return (
    <Card style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
      <View style={styles.alertHeader}>
        <FaExclamationTriangle size={24} color={getSeverityColor(alert.severity)} />
        <Text style={styles.alertTitle}>{alert.title}</Text>
        <Button onPress={onDismiss} style={styles.dismissButton}>Dismiss</Button>
      </View>
      
      <Text style={styles.alertDescription}>{alert.description}</Text>
      
      {alert.start && alert.end && (
        <Text style={styles.alertTiming}>
          Valid: {new Date(alert.start * 1000).toLocaleString()} to {new Date(alert.end * 1000).toLocaleString()}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  alertCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  alertDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  alertTiming: {
    fontSize: 12,
    color: '#666',
  },
  dismissButton: {
    marginLeft: 'auto',
  },
});
```

### 8. Add Leaflet Assets
Create a `public/leaflet` directory and download the required Leaflet marker icons:

```bash
mkdir -p public/leaflet
# Download the marker icons from the Leaflet repository
curl -o public/leaflet/marker-icon.png https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png
curl -o public/leaflet/marker-icon-2x.png https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png
curl -o public/leaflet/marker-shadow.png https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png
```

### 9. Update Environment Variables
Add the OpenWeatherMap API key to your `.env.local` file:

```
# Add this to your existing .env.local file
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your-openweathermap-api-key
```

## Bonus Features Implementation

### 1. Animated Rain Radar
Enhance the WeatherMap component to include animated rain radar:

```tsx
// Add to src/components/WeatherMap.tsx
import { fetchRainViewerData, getRainViewerTileUrl } from '../lib/weather/rainviewer';

// Add to the state variables
const [radarFrames, setRadarFrames] = useState<any[]>([]);
const [currentFrame, setCurrentFrame] = useState<number>(0);
const [isPlaying, setIsPlaying] = useState<boolean>(false);
const animationRef = useRef<any>(null);

// Add this function to load radar data
const loadRadarData = async () => {
  const data = await fetchRainViewerData();
  if (data) {
    // Combine past and forecast frames
    const frames = [
      ...data.radar.past,
      ...data.radar.nowcast
    ].map(frame => ({
      time: frame.time,
      url: getRainViewerTileUrl(data.host, frame.path)
    }));
    
    setRadarFrames(frames);
    setCurrentFrame(data.radar.past.length - 1); // Start with the most recent past frame
  }
};

// Add to useEffect
useEffect(() => {
  loadRadarData();
  
  // Cleanup animation on unmount
  return () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
  };
}, []);

// Add animation control functions
const playAnimation = () => {
  if (animationRef.current) clearInterval(animationRef.current);
  
  setIsPlaying(true);
  animationRef.current = setInterval(() => {
    setCurrentFrame(prev => {
      if (prev >= radarFrames.length - 1) return 0;
      return prev + 1;
    });
  }, 500); // Change frame every 500ms
};

const pauseAnimation = () => {
  if (animationRef.current) clearInterval(animationRef.current);
  setIsPlaying(false);
};

// Add radar layer to the map component
{radarFrames.length > 0 && currentFrame < radarFrames.length && (
  <TileLayer
    url={radarFrames[currentFrame].url}
    opacity={0.7}
    zIndex={10}
  />
)}

// Add radar controls
<View style={styles.radarControls}>
  <Text style={styles.radarTitle}>Radar Animation</Text>
  <View style={styles.radarButtons}>
    <Button onPress={isPlaying ? pauseAnimation : playAnimation}>
      {isPlaying ? 'Pause' : 'Play'}
    </Button>
    <Text>
      {radarFrames.length > 0 && new Date(radarFrames[currentFrame].time * 1000).toLocaleTimeString()}
    </Text>
  </View>
</View>
```

### 2. Field-Specific Weather Alerts
Implement field-specific weather alerts in the database:

```sql
-- Add to your database migration
CREATE TABLE IF NOT EXISTS public.field_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE public.field_alerts ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own alerts
CREATE POLICY "Users can view their own field alerts" ON public.field_alerts
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own alerts
CREATE POLICY "Users can insert their own field alerts" ON public.field_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own alerts
CREATE POLICY "Users can update their own field alerts" ON public.field_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX field_alerts_field_id_idx ON public.field_alerts (field_id);
CREATE INDEX field_alerts_user_id_idx ON public.field_alerts (user_id);
```

### 3. Smart Spraying Calendar
Implement a smart spraying calendar component:

```tsx
// src/components/SprayingCalendar.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../lib/supabase/types';

interface SprayingCalendarProps {
  fieldId?: string;
  weatherData: any;
  cropType: string;
}

export default function SprayingCalendar({ fieldId, weatherData, cropType }: SprayingCalendarProps) {
  const [optimalSprayDays, setOptimalSprayDays] = useState<any[]>([]);
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (weatherData?.daily) {
      calculateOptimalSprayDays();
    }
  }, [weatherData, cropType]);

  const calculateOptimalSprayDays = () => {
    if (!weatherData?.daily) return;
    
    const optimalDays = weatherData.daily.map((day: any) => {
      // Calculate spray score based on weather conditions
      let score = 100; // Start with perfect score
      let reasons = [];
      
      // Check wind speed (ideal is < 10 km/h)
      if (day.wind_speed > 20) {
        score -= 50;
        reasons.push('High wind');
      } else if (day.wind_speed > 10) {
        score -= 20;
        reasons.push('Moderate wind');
      }
      
      // Check precipitation probability (ideal is 0%)
      if (day.pop > 0.5) {
        score -= 50;
        reasons.push('High chance of rain');
      } else if (day.pop > 0.2) {
        score -= 20;
        reasons.push('Chance of rain');
      }
      
      // Check temperature (ideal depends on crop type)
      const temp = day.temp.day;
      let idealTemp = 20; // Default ideal temperature
      
      switch (cropType.toLowerCase()) {
        case 'tomato':
          idealTemp = 22;
          break;
        case 'grape':
          idealTemp = 18;
          break;
        case 'apple':
          idealTemp = 15;
          break;
      }
      
      const tempDiff = Math.abs(temp - idealTemp);
      if (tempDiff > 10) {
        score -= 30;
        reasons.push('Temperature not ideal');
      } else if (tempDiff > 5) {
        score -= 10;
        reasons.push('Temperature slightly off');
      }
      
      // Determine best time of day based on conditions
      let bestTimeOfDay = 'morning';
      if (day.humidity < 40) {
        bestTimeOfDay = 'evening'; // Less evaporation in evening when dry
      }
      
      return {
        date: new Date(day.dt * 1000),
        score,
        reasons,
        bestTimeOfDay,
        conditions: day.weather[0].main,
        temp: day.temp.day,
        wind: day.wind_speed,
        rain: day.pop
      };
    });
    
    setOptimalSprayDays(optimalDays);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    return '#F44336';
  };

  const addToCalendar = (day: any) => {
    // Implementation for adding to device calendar would go here
    // This would typically use a library like react-native-calendars
    alert(`Added spray event on ${day.date.toDateString()} (${day.bestTimeOfDay}) to calendar`);
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Smart Spraying Calendar</Text>
      <Text style={styles.subtitle}>Optimal spray days for {cropType}</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {optimalSprayDays.map((day, index) => (
          <Card key={index} style={styles.dayCard}>
            <Text style={styles.dayDate}>{day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
            <View style={[styles.scoreIndicator, { backgroundColor: getScoreColor(day.score) }]}>
              <Text style={styles.scoreText}>{day.score}%</Text>
            </View>
            <Text style={styles.bestTime}>Best: {day.bestTimeOfDay}</Text>
            <Text style={styles.conditions}>{day.conditions}, {Math.round(day.temp)}°C</Text>
            <Text style={styles.wind}>Wind: {Math.round(day.wind)} km/h</Text>
            <Text style={styles.rain}>Rain: {Math.round(day.rain * 100)}%</Text>
            
            {day.reasons.length > 0 && (
              <View style={styles.reasonsContainer}>
                {day.reasons.map((reason: string, i: number) => (
                  <Text key={i} style={styles.reason}>• {reason}</Text>
                ))}
              </View>
            )}
            
            <Button 
              mode="outlined" 
              style={styles.calendarButton}
              onPress={() => addToCalendar(day)}
            >
              Add to Calendar
            </Button>
          </Card>
        ))}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  dayCard: {
    padding: 12,
    width: 180,
    marginRight: 12,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreText: {
    color: 'white',
    fontWeight: '700',
  },
  bestTime: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  conditions: {
    fontSize: 14,
    marginBottom: 4,
  },
  wind: {
    fontSize: 12,
    color: '#666',
  },
  rain: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  reasonsContainer: {
    marginVertical: 8,
  },
  reason: {
    fontSize: 12,
    color: '#F44336',
  },
  calendarButton: {
    marginTop: 8,
  },
});
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install leaflet react-leaflet @react-leaflet/core leaflet-draw react-leaflet-draw
   ```

2. **Get API Keys**
   - Sign up for a free OpenWeatherMap API key at https://openweathermap.org/api
   - Add the API key to your `.env.local` file

3. **Create Database Tables**
   - Run the SQL migration to create the fields table in your Supabase database

4. **Add Leaflet Assets**
   - Create the public/leaflet directory and add the required marker icons

5. **Update Weather Page**
   - Replace the iframe weather map with the interactive WeatherMap component

6. **Test the Implementation**
   - Start your development server and navigate to the weather page
   - Test drawing fields and viewing field-specific weather data

## Free Resources

| Resource | URL | Description |
|----------|-----|-------------|
| OpenWeatherMap | https://openweathermap.org/api | Free weather data API with generous limits |
| RainViewer | https://www.rainviewer.com/api.html | Free radar data API with no API key required |
| OpenStreetMap | https://www.openstreetmap.org/ | Free map tiles |
| Leaflet | https://leafletjs.com/ | Free open-source mapping library |
| React-Leaflet | https://react-leaflet.js.org/ | React components for Leaflet maps |

## Future Enhancements

1. **Offline Support**
   - Implement service workers to cache map tiles and weather data
   - Store field geometries in IndexedDB for offline access

2. **Advanced Field Analytics**
   - Calculate field area and perimeter
   - Track spray history per field
   - Generate field-specific reports

3. **IoT Integration**
   - Connect with weather stations for hyperlocal data
   - Integrate with soil moisture sensors

4. **Mobile Notifications**
   - Implement push notifications for weather alerts
   - Send spray reminders based on optimal conditions
