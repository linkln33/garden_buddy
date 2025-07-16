#!/usr/bin/env node

/**
 * Test script to verify OpenWeatherMap API integration
 */

const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Simple fetch replacement using https module
function fetch(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        resolve({
          ok: response.statusCode >= 200 && response.statusCode < 300,
          status: response.statusCode,
          statusText: response.statusMessage,
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data)
        });
      });
    });
    request.on('error', reject);
  });
}

async function testWeatherAPI() {
  console.log('🌤️  Testing Garden Buddy Weather API Integration');
  console.log('================================================\n');

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  
  if (!apiKey) {
    console.log('❌ OPENWEATHERMAP_API_KEY not found in .env.local');
    return;
  }

  if (apiKey === 'your-openweathermap-api-key') {
    console.log('❌ Please replace placeholder API key with real key');
    return;
  }

  console.log('✅ API Key found:', apiKey.substring(0, 8) + '...');

  // Test coordinates (New York City)
  const lat = 40.7128;
  const lon = -74.0060;

  try {
    console.log(`🌍 Testing weather data for coordinates: ${lat}, ${lon}`);
    
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${apiKey}`;
    
    console.log('📡 Making API request...');
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('✅ Weather API Response received!');
    console.log('\n📊 Current Weather:');
    console.log(`   Temperature: ${data.current.temp}°C`);
    console.log(`   Humidity: ${data.current.humidity}%`);
    console.log(`   Wind Speed: ${data.current.wind_speed} m/s`);
    console.log(`   Weather: ${data.current.weather[0].description}`);
    
    console.log('\n📅 7-Day Forecast:');
    data.daily.slice(0, 3).forEach((day, index) => {
      const date = new Date(day.dt * 1000).toLocaleDateString();
      console.log(`   Day ${index + 1} (${date}): ${day.temp.min}°C - ${day.temp.max}°C, ${day.weather[0].description}`);
    });

    if (data.alerts && data.alerts.length > 0) {
      console.log('\n⚠️  Weather Alerts:');
      data.alerts.forEach(alert => {
        console.log(`   ${alert.event}: ${alert.description.substring(0, 100)}...`);
      });
    }

    console.log('\n🎉 Weather API integration is working correctly!');
    console.log('🌱 Garden Buddy can now provide real-time weather data and spray recommendations.');

  } catch (error) {
    console.error('❌ Error testing weather API:', error.message);
  }
}

testWeatherAPI();
