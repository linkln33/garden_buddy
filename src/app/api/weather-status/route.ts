import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    
    if (!apiKey || apiKey === 'your-openweathermap-api-key') {
      return NextResponse.json({
        status: 'error',
        message: 'OpenWeatherMap API key not configured',
        hasApiKey: false
      });
    }

    // Test the API with a simple call
    const testUrl = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}`;
    const response = await fetch(testUrl);
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'success',
        message: 'Weather API is working correctly',
        hasApiKey: true,
        testLocation: data.name,
        temperature: data.main.temp
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: `API Error: ${response.status}`,
        hasApiKey: true
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: `Network error: ${error}`,
      hasApiKey: true
    });
  }
}
