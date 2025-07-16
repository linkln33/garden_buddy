"use client";

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FaThermometerHalf, FaTint, FaWind, FaCloudRain, FaExclamationTriangle } from 'react-icons/fa';
import Card from '../ui/Card';

interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    wind_speed: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    }[];
    rain?: {
      '1h'?: number;
    };
  };
  daily: {
    dt: number;
    temp: {
      day: number;
      min: number;
      max: number;
    };
    humidity: number;
    pop: number; // Probability of precipitation
  }[];
}

interface SprayRecommendation {
  type: 'preventive' | 'treatment' | 'warning';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  timing: string;
  conditions: string;
}

interface WeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  cropType?: string;
  compact?: boolean;
}

export default function WeatherWidget({ 
  latitude = 40.7128, 
  longitude = -74.0060, 
  cropType = 'general',
  compact = false 
}: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [sprayRecommendations, setSprayRecommendations] = useState<SprayRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, [latitude, longitude, cropType]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/weather?lat=${latitude}&lon=${longitude}&crop=${cropType}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      setWeatherData(data.weather);
      setSprayRecommendations(data.sprayRecommendations || []);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <Card style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </View>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.container}>
        <View style={styles.errorContainer}>
          <FaExclamationTriangle size={24} color="#F44336" />
          <Text style={styles.errorText}>Weather data unavailable</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </Card>
    );
  }

  if (!weatherData) {
    return null;
  }

  const { current, daily } = weatherData;
  const today = daily[0];

  return (
    <Card style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌤️ Weather & Spray Alerts</Text>
        {current.weather[0] && (
          <img 
            src={getWeatherIcon(current.weather[0].icon)} 
            alt={current.weather[0].description}
            style={styles.weatherIcon}
          />
        )}
      </View>

      {/* Current Weather */}
      <View style={styles.currentWeather}>
        <View style={styles.tempContainer}>
          <Text style={styles.temperature}>{Math.round(current.temp)}°C</Text>
          <Text style={styles.description}>
            {current.weather[0]?.description || 'Clear'}
          </Text>
        </View>

        <View style={styles.weatherDetails}>
          <View style={styles.weatherItem}>
            <FaTint size={16} color="#2196F3" />
            <Text style={styles.weatherValue}>{current.humidity}%</Text>
          </View>
          <View style={styles.weatherItem}>
            <FaWind size={16} color="#607D8B" />
            <Text style={styles.weatherValue}>{Math.round(current.wind_speed)} m/s</Text>
          </View>
          {current.rain?.['1h'] && (
            <View style={styles.weatherItem}>
              <FaCloudRain size={16} color="#2196F3" />
              <Text style={styles.weatherValue}>{current.rain['1h']}mm</Text>
            </View>
          )}
        </View>
      </View>

      {/* Spray Recommendations */}
      {sprayRecommendations.length > 0 && (
        <View style={styles.recommendations}>
          <Text style={styles.recommendationsTitle}>🧪 Spray Recommendations</Text>
          {sprayRecommendations.slice(0, compact ? 2 : 3).map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(rec.priority) }]} />
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.recommendationDescription}>{rec.description}</Text>
                <Text style={styles.recommendationTiming}>⏰ {rec.timing}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Today's Forecast */}
      {!compact && (
        <View style={styles.forecast}>
          <Text style={styles.forecastTitle}>Today's Forecast</Text>
          <View style={styles.forecastDetails}>
            <Text style={styles.forecastItem}>
              🌡️ {Math.round(today.temp.min)}° - {Math.round(today.temp.max)}°C
            </Text>
            <Text style={styles.forecastItem}>
              💧 {Math.round(today.pop * 100)}% chance of rain
            </Text>
            <Text style={styles.forecastItem}>
              💨 Humidity: {today.humidity}%
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  errorSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherIcon: {
    width: 50,
    height: 50,
  },
  currentWeather: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tempContainer: {
    alignItems: 'flex-start',
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  weatherDetails: {
    alignItems: 'flex-end',
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  weatherValue: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  recommendations: {
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  priorityIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  recommendationTiming: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  forecast: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  forecastDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  forecastItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
