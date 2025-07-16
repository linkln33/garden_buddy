"use client";

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { createBrowserClient } from '@supabase/ssr';
import WeatherForecast from '../../components/weather/WeatherForecast';
import WeatherAlert from '../../components/weather/WeatherAlert';
import Card from '../../components/ui/Card';
import { getWeatherData, getSprayRecommendations } from '../../lib/weather';
import type { Database } from '../../lib/supabase/types';

/**
 * Weather page for displaying forecasts and spray recommendations
 */
export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [sprayRecommendations, setSprayRecommendations] = useState<any[]>([]);
  const [location, setLocation] = useState<{name: string; country: string}>({
    name: 'Loading...',
    country: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  // Fetch weather data and spray recommendations
  useEffect(() => {
    async function fetchWeatherData() {
      try {
        // Get current user and their location
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setError('You must be logged in to view weather data');
          setLoading(false);
          return;
        }
        
        // Get user's location from profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('location, latitude, longitude')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        // If user hasn't set location, use default
        const latitude = profile?.latitude || 37.7749;
        const longitude = profile?.longitude || -122.4194;
        const locationName = profile?.location || 'San Francisco, US';
        
        // Parse location name
        const [city, country] = locationName.split(',').map(part => part.trim());
        setLocation({ name: city, country: country || 'US' });
        
        // Fetch weather data
        const weather = await getWeatherData(latitude, longitude);
        setWeatherData(weather);
        
        // Get spray recommendations based on weather
        const recommendations = getSprayRecommendations(weather);
        setSprayRecommendations(recommendations);
        
        // Save recommendations to database
        if (recommendations.length > 0) {
          await saveRecommendationsToDatabase(recommendations, session.user.id);
        }
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to load weather data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchWeatherData();
  }, []);

  // Save spray recommendations to database
  const saveRecommendationsToDatabase = async (recommendations: any[], userId: string) => {
    try {
      // First, delete old recommendations
      await supabase
        .from('weather_alerts')
        .delete()
        .eq('user_id', userId);
      
      // Then insert new ones
      const alertsToInsert = recommendations.map(rec => ({
        user_id: userId,
        alert_type: rec.type,
        risk_level: rec.riskLevel,
        description: rec.description,
        recommended_action: rec.recommendedAction,
        best_time: rec.bestTime,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      }));
      
      const { error } = await supabase
        .from('weather_alerts')
        .insert(alertsToInsert);
      
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Error saving recommendations to database:', err);
      // Don't set UI error since this is a background operation
    }
  };

  // Handle dismissing a spray recommendation
  const handleDismissAlert = async (alertId: string) => {
    try {
      // Remove from local state
      setSprayRecommendations(prev => 
        prev.filter(rec => rec.id !== alertId)
      );
      
      // Remove from database
      await supabase
        .from('weather_alerts')
        .delete()
        .eq('id', alertId);
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.container}>
        <Card>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weather & Spray Alerts</Text>
        <Text style={styles.subtitle}>
          Weather forecast and spray recommendations for your garden
        </Text>
      </View>

      {weatherData && (
        <WeatherForecast weatherData={weatherData} location={location} />
      )}

      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>Spray Recommendations</Text>
        
        {sprayRecommendations.length > 0 ? (
          sprayRecommendations.map((recommendation, index) => (
            <View key={recommendation.id || index} style={styles.alertItem}>
              <WeatherAlert
                type={recommendation.type}
                riskLevel={recommendation.riskLevel}
                description={recommendation.description}
                recommendedAction={recommendation.recommendedAction}
                bestTime={recommendation.bestTime}
                recommendedProducts={recommendation.recommendedProducts}
                onDismiss={() => handleDismissAlert(recommendation.id)}
              />
            </View>
          ))
        ) : (
          <Card>
            <View style={styles.noAlertsContainer}>
              <Text style={styles.noAlertsTitle}>No Spray Alerts</Text>
              <Text style={styles.noAlertsText}>
                Current weather conditions don't require any special spraying. Enjoy your garden!
              </Text>
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  alertsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  alertItem: {
    marginBottom: 16,
  },
  noAlertsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noAlertsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  noAlertsText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
});
