/**
 * Weather service for fetching weather data and providing spray recommendations
 * Uses OpenWeatherMap API for weather data
 */

// Types for weather data
export interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    wind_speed: number;
    weather: {
      id: number;
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
    wind_speed: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    rain?: number;
    pop: number; // Probability of precipitation
  }[];
  alerts?: {
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
  }[];
}

// Types for spray recommendations
export interface SprayRecommendation {
  shouldSpray: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
  bestTimeToSpray?: string;
  recommendedProducts?: string[];
}

/**
 * Fetches weather data for a specific location
 * @param lat - Latitude of the location
 * @param lon - Longitude of the location
 * @returns Weather data for the location
 */
export async function getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    
    // Return mock data if API key is missing or is a placeholder
    if (!apiKey || apiKey === 'your-openweathermap-api-key') {
      console.log('Using mock weather data (no valid API key provided)');
      return getMockWeatherData();
    }
    
    // Use free API endpoints instead of OneCall API
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    
    // Fetch current weather and forecast data
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);
    
    if (!currentResponse.ok || !forecastResponse.ok) {
      console.warn(`Weather API error: ${currentResponse.status}/${forecastResponse.status}. Using mock data instead.`);
      return getMockWeatherData();
    }
    
    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();
    
    // Transform the data to match our WeatherData interface
    const transformedData: WeatherData = {
      current: {
        temp: currentData.main.temp,
        humidity: currentData.main.humidity,
        wind_speed: currentData.wind.speed,
        weather: currentData.weather,
        rain: currentData.rain
      },
      daily: transformForecastToDaily(forecastData.list),
      alerts: [] // Free API doesn't include alerts
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getMockWeatherData();
  }
}

/**
 * Transform 5-day forecast data to daily format and extend with mock data for 14 days
 */
function transformForecastToDaily(forecastList: any[]): DailyWeather[] {
  const dailyData: { [key: string]: any } = {};
  
  forecastList.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toDateString();
    
    if (!dailyData[date]) {
      dailyData[date] = {
        dt: item.dt,
        temp: { min: item.main.temp, max: item.main.temp, day: item.main.temp },
        humidity: item.main.humidity,
        wind_speed: item.wind.speed * 3.6, // Convert m/s to km/h
        weather: item.weather,
        pop: item.pop || 0,
        rain: item.rain?.['3h'] || 0,
        temps: [item.main.temp]
      };
    } else {
      // Update min/max temperatures
      dailyData[date].temp.min = Math.min(dailyData[date].temp.min, item.main.temp);
      dailyData[date].temp.max = Math.max(dailyData[date].temp.max, item.main.temp);
      dailyData[date].temps.push(item.main.temp);
      
      // Update other values (take average or max as appropriate)
      dailyData[date].humidity = Math.max(dailyData[date].humidity, item.main.humidity);
      dailyData[date].wind_speed = Math.max(dailyData[date].wind_speed, item.wind.speed * 3.6);
      dailyData[date].pop = Math.max(dailyData[date].pop, item.pop || 0);
      dailyData[date].rain = Math.max(dailyData[date].rain, item.rain?.['3h'] || 0);
    }
  });
  
  // Calculate average day temperature for real data
  const realDays = Object.values(dailyData)
    .map((day: any) => ({
      ...day,
      temp: {
        ...day.temp,
        day: day.temps.reduce((sum: number, temp: number) => sum + temp, 0) / day.temps.length
      }
    }))
    .sort((a: any, b: any) => a.dt - b.dt)
    .slice(0, 5); // Real data from API (5 days)
  
  // Generate extended forecast for days 6-14 using patterns from real data
  const extendedDays: DailyWeather[] = [];
  const lastRealDay = realDays[realDays.length - 1];
  const avgTemp = realDays.reduce((sum, day) => sum + day.temp.day, 0) / realDays.length;
  const avgHumidity = realDays.reduce((sum, day) => sum + day.humidity, 0) / realDays.length;
  
  for (let i = 6; i <= 14; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    
    // Add some variation to make it realistic
    const tempVariation = (Math.random() - 0.5) * 6; // ±3°C variation
    const humidityVariation = (Math.random() - 0.5) * 20; // ±10% variation
    const windVariation = (Math.random() - 0.5) * 4; // ±2 km/h variation
    
    const dayTemp = avgTemp + tempVariation;
    const minTemp = dayTemp - 3 - Math.random() * 2;
    const maxTemp = dayTemp + 3 + Math.random() * 2;
    
    extendedDays.push({
      dt: Math.floor(futureDate.getTime() / 1000),
      temp: {
        min: minTemp,
        max: maxTemp,
        day: dayTemp
      },
      humidity: Math.max(30, Math.min(90, avgHumidity + humidityVariation)),
      wind_speed: Math.max(0, lastRealDay.wind_speed + windVariation),
      weather: [{
        id: Math.random() > 0.7 ? 802 : 800, // 30% chance of clouds
        main: Math.random() > 0.7 ? 'Clouds' : 'Clear',
        description: Math.random() > 0.7 ? 'scattered clouds' : 'clear sky',
        icon: Math.random() > 0.7 ? '03d' : '01d'
      }],
      pop: Math.random() * 0.3, // 0-30% chance of rain
      rain: Math.random() > 0.8 ? Math.random() * 2 : 0 // Occasional light rain
    });
  }
  
  return [...realDays, ...extendedDays];
}

/**
 * Provides mock weather data for development and when API key is missing
 * @returns Mock weather data
 */
function getMockWeatherData(): WeatherData {
  const currentDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  
  return {
    current: {
      temp: 22.5,
      humidity: 65,
      wind_speed: 3.5,
      weather: [{
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }]
    },
    daily: Array.from({ length: 14 }, (_, i) => ({
      dt: currentDate + (i * 86400), // Add days in seconds
      temp: {
        day: 22 + Math.random() * 5,
        min: 18 + Math.random() * 3,
        max: 25 + Math.random() * 5
      },
      humidity: 60 + Math.floor(Math.random() * 20),
      wind_speed: 2 + Math.random() * 5,
      weather: [{
        id: i % 2 === 0 ? 800 : 801,
        main: i % 2 === 0 ? 'Clear' : 'Clouds',
        description: i % 2 === 0 ? 'clear sky' : 'few clouds',
        icon: i % 2 === 0 ? '01d' : '02d'
      }],
      pop: Math.random() * 0.3 // 30% max chance of precipitation
    })),
    alerts: Math.floor(Math.random() * 3) === 0 ? [{
      sender_name: 'Garden Buddy Weather Alert (MOCK)',
      event: 'Heavy Rain Warning',
      start: currentDate + 86400,
      end: currentDate + (2 * 86400),
      description: 'This is a mock weather alert for demonstration purposes.'
    }] : undefined
  };
}

/**
 * Determines if conditions are favorable for fungal diseases
 * @param weatherData - Weather data for the location
 * @returns True if conditions are favorable for fungal diseases
 */
function isFungalDiseaseRisk(weatherData: WeatherData): boolean {
  // High humidity and moderate temperatures are favorable for fungal diseases
  const currentHumidity = weatherData.current.humidity;
  const currentTemp = weatherData.current.temp;
  
  // Check if it has rained recently
  const hasRainedRecently = weatherData.current.rain?.['1h'] ? weatherData.current.rain['1h'] > 0 : false;
  
  // Check if rain is forecasted in the next 24 hours
  const rainForecast = weatherData.daily[0].pop > 0.4; // 40% chance of rain
  
  // Fungal disease risk conditions: high humidity (>70%) and moderate temperature (15-30°C)
  return (
    (currentHumidity > 70 && currentTemp >= 15 && currentTemp <= 30) || 
    hasRainedRecently || 
    rainForecast
  );
}

/**
 * Determines if conditions are favorable for pest infestations
 * @param weatherData - Weather data for the location
 * @returns True if conditions are favorable for pest infestations
 */
function isPestInfestationRisk(weatherData: WeatherData): boolean {
  // Many pests thrive in warm, dry conditions
  const currentHumidity = weatherData.current.humidity;
  const currentTemp = weatherData.current.temp;
  
  // Pest infestation risk conditions: low humidity (<50%) and high temperature (>25°C)
  return currentHumidity < 50 && currentTemp > 25;
}

/**
 * Gets spray recommendations based on weather data and crop type
 * @param weatherData - Weather data for the location
 * @param cropType - Type of crop
 * @returns Spray recommendations
 */
export function getSprayRecommendations(
  weatherData: WeatherData,
  cropType: string
): SprayRecommendation {
  if (!weatherData) {
    return {
      shouldSpray: false,
      riskLevel: 'low',
      reason: 'Unable to determine risk due to missing weather data',
    };
  }

  // Check for fungal disease risk
  const fungalRisk = isFungalDiseaseRisk(weatherData);
  
  // Check for pest infestation risk
  const pestRisk = isPestInfestationRisk(weatherData);
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (fungalRisk && pestRisk) {
    riskLevel = 'high';
  } else if (fungalRisk || pestRisk) {
    riskLevel = 'medium';
  }
  
  // Determine if spraying is recommended
  const shouldSpray = riskLevel !== 'low';
  
  // Determine the reason for the recommendation
  let reason = 'Current weather conditions do not pose a significant risk to your crops.';
  if (fungalRisk && pestRisk) {
    reason = 'Current weather conditions are favorable for both fungal diseases and pest infestations.';
  } else if (fungalRisk) {
    reason = 'Current weather conditions are favorable for fungal diseases.';
  } else if (pestRisk) {
    reason = 'Current weather conditions are favorable for pest infestations.';
  }
  
  // Determine the best time to spray
  let bestTimeToSpray;
  if (shouldSpray) {
    // Avoid spraying during the hottest part of the day or when it's windy
    const isWindy = weatherData.current.wind_speed > 10; // Wind speed > 10 km/h
    
    if (isWindy) {
      bestTimeToSpray = 'Wait for calmer conditions before spraying.';
    } else {
      bestTimeToSpray = 'Early morning or late evening when temperatures are cooler.';
    }
  }
  
  // Recommend products based on risk and crop type
  let recommendedProducts: string[] = [];
  if (shouldSpray) {
    if (fungalRisk) {
      switch (cropType.toLowerCase()) {
        case 'tomato':
          recommendedProducts.push('Copper fungicide', 'Neem oil');
          break;
        case 'grape':
          recommendedProducts.push('Sulfur spray', 'Potassium bicarbonate');
          break;
        default:
          recommendedProducts.push('General fungicide', 'Copper spray');
      }
    }
    
    if (pestRisk) {
      switch (cropType.toLowerCase()) {
        case 'tomato':
          recommendedProducts.push('Insecticidal soap', 'Bacillus thuringiensis (BT)');
          break;
        case 'grape':
          recommendedProducts.push('Neem oil', 'Pyrethrin');
          break;
        default:
          recommendedProducts.push('General insecticide', 'Neem oil');
      }
    }
  }
  
  return {
    shouldSpray,
    riskLevel,
    reason,
    bestTimeToSpray,
    recommendedProducts,
  };
}
