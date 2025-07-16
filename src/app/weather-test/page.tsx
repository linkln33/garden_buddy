"use client";

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WeatherWidget from '../../components/weather/WeatherWidget';

/**
 * Simple weather test page to verify integration
 */
export default function WeatherTestPage() {
  const [apiStatus, setApiStatus] = useState<string>('Testing...');

  useEffect(() => {
    testWeatherAPI();
  }, []);

  const testWeatherAPI = async () => {
    try {
      const response = await fetch('/api/weather?lat=40.7128&lon=-74.0060&crop=general');
      if (response.ok) {
        const data = await response.json();
        setApiStatus(`✅ Weather API Working! Temperature: ${data.weather.current.temp}°C`);
      } else {
        setApiStatus(`❌ API Error: ${response.status}`);
      }
    } catch (error) {
      setApiStatus(`❌ Network Error: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌤️ Weather Integration Test</Text>
      <Text style={styles.status}>{apiStatus}</Text>
      
      <View style={styles.widgetContainer}>
        <WeatherWidget 
          latitude={40.7128} 
          longitude={-74.0060} 
          cropType="general"
          compact={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    color: '#333',
  },
  widgetContainer: {
    flex: 1,
  },
});
