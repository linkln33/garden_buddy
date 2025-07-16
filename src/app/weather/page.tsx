"use client";

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { createBrowserClient } from '@supabase/ssr';
import { 
  FaMapMarkerAlt, FaSync, FaTint, FaCloudRain, FaWind, FaSun, FaThermometerHalf, FaExclamationTriangle,
  FaSearch, FaLocationArrow, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';
import type { Database } from '../../lib/supabase/types';

interface WeatherData {
  current: {
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: Array<{ main: string; description: string; icon: string }>;
    rain?: { '1h': number };
    uvi: number;
  };
  daily: Array<{
    dt: number;
    temp: { day: number; min: number; max: number };
    weather: Array<{ main: string; description: string; icon: string }>;
    pop: number;
    wind_speed: number;
  }>;
  alerts?: Array<{
    event: string;
    description: string;
    start: number;
    end: number;
  }>;
  location?: {
    name: string;
    country: string;
  };
}

interface SprayRecommendation {
  id?: string;
  riskLevel: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  bestSprayTime?: string;
  products?: string[];
  reason?: string;
  bestTimeToSpray?: string;
  recommendedProducts?: string[];
}

/**
 * Enhanced Weather page with comprehensive agricultural weather dashboard
 */
export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [sprayRecommendations, setSprayRecommendations] = useState<SprayRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [location, setLocation] = useState<{ 
    name: string; 
    country: string; 
    latitude: number | undefined; 
    longitude: number | undefined 
  }>({ 
    name: 'Loading...', 
    country: '', 
    latitude: undefined, 
    longitude: undefined 
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationOptions, setLocationOptions] = useState<Array<{name: string; country: string; lat: number; lon: number}>>([]);
  const [currentForecastIndex, setCurrentForecastIndex] = useState(0);
  const [visibleForecastDays, setVisibleForecastDays] = useState(5);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchWeatherData();
  }, []);
  
  const getDailyForecastLength = (): number => {
    return weatherData?.daily?.length || 0;
  };

  const fetchWeatherData = async (lat?: number, lon?: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setError('You must be logged in to view weather data');
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('location, latitude, longitude')
        .eq('id', session.user.id)
        .single();

      const latitude = profile?.latitude || 37.7749;
      const longitude = profile?.longitude || -122.4194;
      const locationName = profile?.location || 'San Francisco, US';

      const [city, country] = locationName.split(',').map((part: string) => part.trim());
      setLocation({ 
        name: city, 
        country: country || 'US',
        latitude,
        longitude
      });

      const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeatherData(data.weather);

      if (data.sprayRecommendations) {
        setSprayRecommendations([data.sprayRecommendations]);
      }

      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const searchLocations = async (query: string) => {
    if (!query || query.length < 3) return;

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
      const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`);

      if (!response.ok) {
        throw new Error('Failed to search locations');
      }

      const data = await response.json();
      setLocationOptions(data.map((item: any) => ({
        name: item.name,
        country: item.country,
        lat: item.lat,
        lon: item.lon
      })));
    } catch (err) {
      console.error('Error searching locations:', err);
    }
  };

  const handleLocationSelect = (loc: {name: string; country: string; lat: number; lon: number}) => {
    fetchWeatherData(loc.lat, loc.lon);
    setShowLocationSearch(false);
    setLocationOptions([]);
    setSearchQuery('');
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
          setShowLocationSearch(false);
        },
        (err) => {
          setError('Unable to get your location: ' + err.message);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const handleDismissAlert = (alertId: string) => {
    setSprayRecommendations(prev => prev.filter(rec => rec.id !== alertId));
  };

  const convertTemp = (celsius: number): number => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9/5) + 32);
    }
    return Math.round(celsius);
  };

  const getRiskColor = (risk: string): string => {
    switch (risk.toLowerCase()) {
      case 'high':
        return '#FF6B35';
      case 'medium':
        return '#F9A03F';
      case 'low':
        return '#4CAF50';
      default:
        return '#4CAF50';
    }
  };

  const getWeatherIcon = (condition: string): string => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return '☀️';
      case 'clouds':
        return '☁️';
      case 'rain':
        return '🌧️';
      case 'drizzle':
        return '🌦️';
      case 'thunderstorm':
        return '⛈️';
      case 'snow':
        return '❄️';
      case 'mist':
      case 'fog':
        return '🌫️';
      default:
        return '🌤️';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Card style={styles.card}>
          <Text style={styles.errorTitle}>Weather Data Unavailable</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={() => fetchWeatherData()} style={styles.retryButton}>Retry</Button>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Location Search */}
      {showLocationSearch ? (
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Find Location</Text>
            <Pressable onPress={() => setShowLocationSearch(false)} style={styles.closeButton}>
              <Text>✕</Text>
            </Pressable>
          </View>
          
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter city name..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.length >= 3) searchLocations(text);
              }}
            />
            <Pressable onPress={() => searchLocations(searchQuery)} style={styles.searchButton}>
              <FaSearch size={16} color="#fff" />
            </Pressable>
          </View>
          
          <Pressable onPress={useCurrentLocation} style={styles.currentLocationButton}>
            <FaLocationArrow size={14} color="#4CAF50" />
            <Text style={styles.currentLocationText}>Use my current location</Text>
          </Pressable>
          
          {locationOptions.length > 0 && (
            <View style={styles.locationResults}>
              {locationOptions.map((loc, index) => (
                <Pressable 
                  key={`${loc.name}-${loc.country}-${index}`}
                  style={styles.locationOption}
                  onPress={() => handleLocationSelect(loc)}
                >
                  <FaMapMarkerAlt size={14} color="#666" />
                  <Text style={styles.locationOptionText}>
                    {loc.name}, {loc.country}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Card>
      ) : (
        /* Current Conditions Hero Section */
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Pressable 
              style={styles.locationContainer} 
              onPress={() => setShowLocationSearch(true)}
            >
              <FaMapMarkerAlt size={16} color="#666" />
              <Text style={styles.locationName}>
                {location.name}, {location.country}
              </Text>
            </Pressable>
            <Pressable 
              style={styles.refreshButton} 
              onPress={() => fetchWeatherData(location.latitude, location.longitude)}
            >
              <FaSync size={14} color="#666" />
              <Text style={styles.refreshText}>
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Pressable>
          </View>
          
          <View style={styles.mainContentContainer}>
            {/* Left side - Current conditions and forecast carousel */}
            <View style={styles.leftContent}>
              <View style={styles.currentConditions}>
                <View style={styles.temperatureSection}>
                  <Text style={styles.weatherIcon}>
                    {getWeatherIcon(weatherData?.current?.weather?.[0]?.main || '')}
                  </Text>
                  <View style={styles.tempContainer}>
                    <Pressable onPress={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}>
                      <Text style={styles.temperature}>
                        {convertTemp(weatherData?.current?.temp || 0)}°{tempUnit}
                      </Text>
                    </Pressable>
                    <Text style={styles.weatherDescription}>
                      {weatherData?.current?.weather?.[0]?.description || 'Clear'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.conditionsGrid}>
                  <View style={styles.conditionItem}>
                    <FaTint size={16} color="#2196F3" />
                    <Text style={styles.conditionLabel}>Humidity</Text>
                    <Text style={styles.conditionValue}>{weatherData?.current?.humidity || 0}%</Text>
                  </View>
                  <View style={styles.conditionItem}>
                    <FaCloudRain size={16} color="#2196F3" />
                    <Text style={styles.conditionLabel}>Rainfall</Text>
                    <Text style={styles.conditionValue}>{weatherData?.current?.rain?.['1h'] || 0} mm</Text>
                  </View>
                  <View style={styles.conditionItem}>
                    <FaWind size={16} color="#607D8B" />
                    <Text style={styles.conditionLabel}>Wind</Text>
                    <Text style={styles.conditionValue}>{Math.round(weatherData?.current?.wind_speed || 0)} km/h</Text>
                  </View>
                  <View style={styles.conditionItem}>
                    <FaSun size={16} color="#FF9800" />
                    <Text style={styles.conditionLabel}>UV Index</Text>
                    <Text style={styles.conditionValue}>{weatherData?.current?.uvi || 0}</Text>
                  </View>
                </View>
              </View>
              
              {/* Forecast Carousel */}
              <View style={styles.forecastCarouselContainer}>
                <View style={styles.carouselHeader}>
                  <Text style={styles.title}>14-Day Forecast</Text>
                  <View style={styles.carouselControls}>
                    <Pressable 
                      onPress={() => setCurrentForecastIndex(Math.max(0, currentForecastIndex - 1))}
                      style={[styles.carouselButton, currentForecastIndex === 0 && styles.carouselButtonDisabled]}
                      disabled={currentForecastIndex === 0}
                    >
                      <FaChevronLeft size={14} color={currentForecastIndex === 0 ? "#ccc" : "#666"} />
                    </Pressable>
                    <Pressable 
                      onPress={() => setCurrentForecastIndex(Math.min(getDailyForecastLength() - visibleForecastDays, currentForecastIndex + 1))}
                      style={[styles.carouselButton, currentForecastIndex >= (getDailyForecastLength() - visibleForecastDays) && styles.carouselButtonDisabled]}
                      disabled={currentForecastIndex >= (getDailyForecastLength() - visibleForecastDays)}
                    >
                      <FaChevronRight size={14} color={currentForecastIndex >= (getDailyForecastLength() - visibleForecastDays) ? "#ccc" : "#666"} />
                    </Pressable>
                  </View>
                </View>
                
                <View style={styles.forecastCarousel}>
                  {weatherData?.daily?.slice(currentForecastIndex, currentForecastIndex + visibleForecastDays).map((day, index) => (
                    <View key={day.dt || index} style={styles.forecastDay}>
                      <Text style={styles.forecastDayName}>
                        {new Date((day.dt || 0) * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Text style={styles.forecastIcon}>
                        {getWeatherIcon(day.weather?.[0]?.main || '')}
                      </Text>
                      <Text style={styles.forecastTemp}>
                        {convertTemp(day.temp?.max || 0)}° / {convertTemp(day.temp?.min || 0)}°
                      </Text>
                      <Text style={styles.forecastRain}>{Math.round((day.pop || 0) * 100)}%</Text>
                      <Text style={styles.forecastWind}>{Math.round(day.wind_speed || 0)}km/h</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            
            {/* Right side - Weather Map */}
            <View style={styles.rightContent}>
              <Text style={styles.title}>Weather Map</Text>
              <View style={styles.weatherMapContainer}>
                <iframe 
                  src={`https://openweathermap.org/weathermap?basemap=map&cities=false&layer=temperature&lat=${location.latitude || 37.7749}&lon=${location.longitude || -122.4194}&zoom=10`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: 8
                  }}
                  title="Weather Map"
                ></iframe>
              </View>
            </View>
          </View>
        </Card>
      )}

      {/* Disease & Spray Alerts */}
      {sprayRecommendations.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.title}>Spray Recommendations</Text>
          {sprayRecommendations.map((recommendation: SprayRecommendation, index: number) => (
            <View key={recommendation.id || index} style={styles.alertItem}>
              <View style={[styles.alertBadge, { backgroundColor: getRiskColor(recommendation.riskLevel || 'low') }]}>
                <Text style={styles.alertBadgeText}>{recommendation.riskLevel}</Text>
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{recommendation.title}</Text>
                <Text style={styles.alertDescription}>{recommendation.description}</Text>
                {recommendation.bestSprayTime && (
                  <Text style={styles.alertInfo}>
                    <Text style={styles.alertInfoLabel}>Best spray time: </Text>
                    {recommendation.bestSprayTime}
                  </Text>
                )}
                {recommendation.products && recommendation.products.length > 0 && (
                  <Text style={styles.alertInfo}>
                    <Text style={styles.alertInfoLabel}>Recommended products: </Text>
                    {recommendation.products.join(', ')}
                  </Text>
                )}
              </View>
              <Button
                title="Got it"
                onPress={() => handleDismissAlert(recommendation.id!)}
                style={styles.dismissButton}
              />
            </View>
          ))}
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Text style={styles.title}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Button 
            title="📍 Change Location" 
            style={styles.actionButton} 
            onPress={() => setShowLocationSearch(true)} 
          />
          <Button 
            title="📊 View History" 
            style={styles.actionButton} 
            onPress={() => console.log('View history')} 
          />
          <Button 
            title="🔔 Set Alerts" 
            style={styles.actionButton} 
            onPress={() => console.log('Set alerts')} 
          />
          <Button 
            title="📅 Add to Calendar" 
            style={styles.actionButton} 
            onPress={() => console.log('Add to calendar')} 
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  leftContent: {
    width: '60%',
    marginRight: 16,
  },
  rightContent: {
    width: '38%',
  },
  mainContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  currentConditions: {
    marginBottom: 16,
  },
  temperatureSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  tempContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333333',
  },
  weatherDescription: {
    fontSize: 16,
    color: '#666666',
    textTransform: 'capitalize',
  },
  conditionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  conditionItem: {
    width: '48%',
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    alignItems: 'center',
  },
  conditionLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  conditionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  forecastCarouselContainer: {
    marginBottom: 16,
  },
  carouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carouselControls: {
    flexDirection: 'row',
  },
  carouselButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    marginLeft: 8,
  },
  carouselButtonDisabled: {
    backgroundColor: '#F7F7F7',
  },
  forecastCarousel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastDay: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    alignItems: 'center',
  },
  forecastDayName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  forecastIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  forecastRain: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  forecastWind: {
    fontSize: 14,
    color: '#666666',
  },
  weatherMapContainer: {
    height: 300,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  closeButton: {
    padding: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentLocationText: {
    marginLeft: 8,
    color: '#4CAF50',
  },
  locationResults: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  locationOptionText: {
    marginLeft: 8,
  },
  alertItem: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
  },
  alertBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  alertInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  alertInfoLabel: {
    fontWeight: '600',
    color: '#444',
  },
  dismissButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 120,
    padding: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
  },
  errorCard: {
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  retryButton: {
    padding: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  }
});
