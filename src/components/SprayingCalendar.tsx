import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { createBrowserClient } from '@supabase/ssr';

interface SprayingCalendarProps {
  fieldId?: string;
  weatherData: any;
  cropType: string;
}

export default function SprayingCalendar({ fieldId, weatherData, cropType }: SprayingCalendarProps) {
  const [optimalSprayDays, setOptimalSprayDays] = useState<any[]>([]);
  
  const supabase = createBrowserClient(
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

  const addToCalendar = async (day: any) => {
    try {
      // Save spray event to database if we have a field ID
      if (fieldId) {
        await supabase.from('spray_events').insert({
          field_id: fieldId,
          scheduled_date: day.date.toISOString(),
          best_time_of_day: day.bestTimeOfDay,
          weather_conditions: {
            temp: day.temp,
            wind: day.wind,
            rain_probability: day.rain,
            conditions: day.conditions
          },
          notes: `Spray score: ${day.score}%`
        });
      }
      
      // Alert the user
      alert(`Added spray event on ${day.date.toDateString()} (${day.bestTimeOfDay}) to calendar`);
    } catch (error) {
      console.error('Error adding spray event:', error);
      alert('Failed to add spray event to calendar');
    }
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
