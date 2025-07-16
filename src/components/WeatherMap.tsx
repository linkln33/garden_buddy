import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { createBrowserClient } from '@supabase/ssr';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Dynamic imports for Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const FeatureGroup = dynamic(
  () => import('react-leaflet').then((mod) => mod.FeatureGroup),
  { ssr: false }
);

// Dynamic import for the EditControl component
const EditControl = dynamic(
  () => import('react-leaflet-draw').then((mod) => mod.EditControl),
  { ssr: false }
);

interface WeatherMapProps {
  latitude: number;
  longitude: number;
  onFieldSelect?: (fieldId: string, fieldCropType: string) => void;
}

export default function WeatherMap({ latitude, longitude, onFieldSelect }: WeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState<string>('temperature');
  const [fields, setFields] = useState<any[]>([]);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [fieldWeather, setFieldWeather] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const mapRef = useRef<any>(null);
  const [radarFrames, setRadarFrames] = useState<any[]>([]);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animationRef = useRef<any>(null);
  
  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Weather overlay layers
  const weatherLayers = {
    temperature: {
      name: 'Temperature',
      url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}`,
    },
    precipitation: {
      name: 'Precipitation',
      url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}`,
    },
    clouds: {
      name: 'Clouds',
      url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}`,
    },
    wind: {
      name: 'Wind',
      url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}`,
    },
    pressure: {
      name: 'Pressure',
      url: `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}`,
    },
  };

  // Load user's saved fields from Supabase
  const loadFields = async () => {
    try {
      // First check if the fields table exists
      const { error: tableError } = await supabase
        .from('fields')
        .select('count')
        .limit(1)
        .single();
      
      // If table doesn't exist yet, just return empty array
      if (tableError && tableError.code === 'PGRST116') {
        console.log('Fields table does not exist yet. Please run the database migration.');
        setFields([]);
        return;
      }

      const { data: userFields, error } = await supabase
        .from('fields')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading fields:', error);
        return;
      }

      setFields(userFields || []);
    } catch (error) {
      console.error('Error loading fields:', error);
      // Ensure fields is at least an empty array
      setFields([]);
    }
  };

  // Save a new field to Supabase
  const saveField = async (name: string, coordinates: any, cropType: string = 'general') => {
    try {
      const { data, error } = await supabase
        .from('fields')
        .insert({
          name,
          coordinates,
          crop_type: cropType,
        })
        .select();

      if (error) {
        console.error('Error saving field:', error);
        return null;
      }

      // Reload fields
      loadFields();
      return data[0];
    } catch (error) {
      console.error('Error saving field:', error);
      return null;
    }
  };

  // Fetch weather data for a specific field
  const fetchFieldWeather = async (field: any) => {
    setIsLoading(true);
    try {
      // Calculate the centroid of the field polygon
      const centroid = calculateCentroid(field.coordinates);
      
      // Fetch weather data from our API
      const response = await fetch(
        `/api/weather?lat=${centroid.lat}&lon=${centroid.lng}&crop=${field.crop_type}&field_id=${field.id}`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      setFieldWeather(data);
      
      // Call the onFieldSelect callback if provided
      if (onFieldSelect) {
        onFieldSelect({
          ...field,
          weather: data,
        });
      }
    } catch (error) {
      console.error('Error fetching field weather:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate the centroid of a polygon
  const calculateCentroid = (coordinates: any) => {
    // For simplicity, we'll just use the first point
    // In a real app, you'd calculate the actual centroid
    if (coordinates && coordinates.length > 0) {
      return {
        lat: coordinates[0][0],
        lng: coordinates[0][1],
      };
    }
    
    return { lat: latitude, lng: longitude };
  };

  // Handle draw created event
  const handleDrawCreated = (e: any) => {
    const { layerType, layer } = e;
    
    if (layerType === 'polygon' || layerType === 'rectangle') {
      // Get coordinates from the layer
      const coordinates = layer.getLatLngs()[0].map((latlng: any) => [
        latlng.lat,
        latlng.lng,
      ]);
      
      // Prompt user for field name and crop type
      const fieldName = prompt('Enter a name for this field:', 'New Field');
      const cropType = prompt('Enter crop type:', 'general');
      
      if (fieldName) {
        // Save the field to Supabase
        saveField(fieldName, coordinates, cropType || 'general');
      }
    }
  };

  // Handle field selection
  const handleFieldSelect = (field: any) => {
    setSelectedField(field);
    fetchFieldWeather(field);
  };

  // Fetch RainViewer radar data
  const fetchRainViewerData = async () => {
    try {
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      
      if (!response.ok) {
        throw new Error(`RainViewer API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching RainViewer data:', error);
      return null;
    }
  };

  // Create RainViewer tile URL
  const getRainViewerTileUrl = (
    host: string,
    path: string,
    options: {
      color?: number;
      smooth?: number;
      snow?: number;
      opacity?: number;
    } = {}
  ) => {
    const {
      color = 4,
      smooth = 1,
      snow = 1,
      opacity = 0.7
    } = options;
    
    return `https://${host}${path}/${color}/${smooth}_${snow}/${opacity}/{z}/{x}/{y}/256.png`;
  };

  // Load radar data
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

  // Animation control functions
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

  // Load fields and radar data on component mount
  useEffect(() => {
    loadFields();
    loadRadarData();
    
    // Set map as ready after a short delay to ensure proper rendering
    const timer = setTimeout(() => {
      setMapReady(true);
    }, 500);
    
    // Cleanup animation and timer on unmount
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      clearTimeout(timer);
    };
  }, []);

  // Fix for Leaflet icon paths in Next.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Import Leaflet dynamically on the client side
      import('leaflet').then((L) => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        
        // @ts-ignore
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        });
      });
    }
  }, []);

  // Render the map only on client-side
  if (typeof window === 'undefined') {
    return <View style={styles.container}><Text>Loading map...</Text></View>;
  }

  return (
    <View style={styles.container}>
      {mapReady && (
        <MapContainer
          center={[latitude, longitude]}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          {/* Base map layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Weather overlay layer */}
          <TileLayer
            url={weatherLayers[activeLayer as keyof typeof weatherLayers].url}
            opacity={0.6}
            zIndex={5}
          />
          
          {/* Radar animation layer */}
          {radarFrames.length > 0 && currentFrame < radarFrames.length && (
            <TileLayer
              url={radarFrames[currentFrame].url}
              opacity={0.7}
              zIndex={10}
            />
          )}
          
          {/* User location marker */}
          <Marker position={[latitude, longitude]}>
            <Popup>Your location</Popup>
          </Marker>
          
          {/* Field drawing tools */}
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={handleDrawCreated}
              draw={{
                rectangle: true,
                polygon: true,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
              }}
            />
          </FeatureGroup>
          
          {/* Render saved fields */}
          {fields.map((field) => (
            <FeatureGroup key={field.id} onClick={() => handleFieldSelect(field)}>
              {/* Render field polygon */}
              {/* This would require converting the coordinates to Leaflet format */}
              {/* For simplicity, we're not implementing the full polygon rendering here */}
            </FeatureGroup>
          ))}
        </MapContainer>
      )}
      
      {/* Weather layer selector */}
      <View style={styles.layerSelector}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Weather Layers</Text>
        {Object.entries(weatherLayers).map(([key, layer]) => (
          <Text
            key={key}
            style={[
              styles.layerOption,
              activeLayer === key ? styles.activeLayer : null,
            ]}
            onPress={() => setActiveLayer(key)}
          >
            {layer.name}
          </Text>
        ))}
      </View>
      
      {/* Radar animation controls */}
      {radarFrames.length > 0 && (
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
      )}
      
      {/* Field weather info */}
      {selectedField && fieldWeather && (
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldName}>{selectedField.name}</Text>
          <Text>Crop: {selectedField.crop_type}</Text>
          <Text>Temperature: {fieldWeather.weather.current.temp}°C</Text>
          <Text>Conditions: {fieldWeather.weather.current.weather[0].description}</Text>
          
          {fieldWeather.sprayRecommendations && (
            <View style={styles.sprayInfo}>
              <Text style={styles.sprayTitle}>
                Spray Recommendation: {fieldWeather.sprayRecommendations.shouldSpray ? 'Recommended' : 'Not Recommended'}
              </Text>
              <Text>{fieldWeather.sprayRecommendations.reason}</Text>
            </View>
          )}
          
          <Button 
            mode="contained" 
            onPress={() => setSelectedField(null)}
            style={{ marginTop: 8 }}
          >
            Close
          </Button>
        </View>
      )}
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
  radarControls: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    zIndex: 1000,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  radarTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  radarButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldInfo: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 1000,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    maxWidth: 300,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sprayInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  sprayTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
