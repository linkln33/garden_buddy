import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Card from '../ui/Card';
import { WeatherData } from '../../lib/weather';

interface WeatherForecastProps {
  weatherData: WeatherData;
  location: {
    name: string;
    country: string;
  };
}

/**
 * WeatherForecast component displays current and upcoming weather conditions
 */
export const WeatherForecast: React.FC<WeatherForecastProps> = ({
  weatherData,
  location,
}) => {
  // Function to format date from timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to get weather icon URL from OpenWeatherMap
  const getWeatherIconUrl = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <Card title={`Weather for ${location.name}, ${location.country}`}>
      <View style={styles.currentWeatherContainer}>
        <View style={styles.currentWeatherMain}>
          <Image
            source={{
              uri: getWeatherIconUrl(weatherData.current.weather[0].icon),
            }}
            style={styles.currentWeatherIcon}
          />
          <Text style={styles.currentTemp}>
            {Math.round(weatherData.current.temp)}°C
          </Text>
        </View>
        
        <View style={styles.currentWeatherDetails}>
          <Text style={styles.weatherDescription}>
            {weatherData.current.weather[0].description.charAt(0).toUpperCase() +
              weatherData.current.weather[0].description.slice(1)}
          </Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>{weatherData.current.humidity}%</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailValue}>
                {Math.round(weatherData.current.wind_speed)} km/h
              </Text>
            </View>
            
            {weatherData.current.rain && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Rain</Text>
                <Text style={styles.detailValue}>
                  {weatherData.current.rain['1h']} mm
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <Text style={styles.forecastTitle}>7-Day Forecast</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
        {weatherData.daily.map((day, index) => (
          <View key={index} style={styles.forecastDay}>
            <Text style={styles.forecastDate}>{formatDate(day.dt)}</Text>
            <Image
              source={{ uri: getWeatherIconUrl(day.weather[0].icon) }}
              style={styles.forecastIcon}
            />
            <View style={styles.forecastTemps}>
              <Text style={styles.forecastTempHigh}>
                {Math.round(day.temp.max)}°
              </Text>
              <Text style={styles.forecastTempLow}>
                {Math.round(day.temp.min)}°
              </Text>
            </View>
            <Text style={styles.forecastDescription}>
              {day.weather[0].main}
            </Text>
            {day.pop > 0 && (
              <Text style={styles.precipChance}>
                {Math.round(day.pop * 100)}% rain
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
      
      {weatherData.alerts && weatherData.alerts.length > 0 && (
        <View style={styles.alertsContainer}>
          <Text style={styles.alertsTitle}>Weather Alerts</Text>
          {weatherData.alerts.map((alert, index) => (
            <View key={index} style={styles.alertItem}>
              <Text style={styles.alertEvent}>{alert.event}</Text>
              <Text style={styles.alertDescription}>{alert.description}</Text>
              <Text style={styles.alertTime}>
                {new Date(alert.start * 1000).toLocaleString()} - 
                {new Date(alert.end * 1000).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  currentWeatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  currentWeatherMain: {
    alignItems: 'center',
    marginRight: 16,
  },
  currentWeatherIcon: {
    width: 80,
    height: 80,
  },
  currentTemp: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333333',
  },
  currentWeatherDetails: {
    flex: 1,
  },
  weatherDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  forecastScroll: {
    marginBottom: 16,
  },
  forecastDay: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  forecastDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  forecastIcon: {
    width: 50,
    height: 50,
  },
  forecastTemps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  forecastTempHigh: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  forecastTempLow: {
    fontSize: 14,
    color: '#666666',
  },
  forecastDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  precipChance: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 2,
  },
  alertsContainer: {
    marginTop: 16,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  alertItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  alertEvent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#666666',
  },
});

export default WeatherForecast;
