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
    
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Weather API error: ${response.status}. Using mock data instead.`);
      return getMockWeatherData();
    }
    
    const data = await response.json();
    return data as WeatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getMockWeatherData();
  }
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
    daily: Array.from({ length: 7 }, (_, i) => ({
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
