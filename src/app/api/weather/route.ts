import { NextRequest, NextResponse } from 'next/server';
import { getWeatherData, getSprayRecommendations } from '../../../lib/weather';

/**
 * Weather API route for fetching weather data and spray recommendations
 * GET /api/weather?lat=<latitude>&lon=<longitude>&crop=<crop_type>
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const cropType = searchParams.get('crop') || 'general';

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

    // Return combined weather and spray data
    return NextResponse.json({
      weather: weatherData,
      sprayRecommendations,
      location: {
        latitude,
        longitude,
        cropType
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
 * Health check endpoint
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
