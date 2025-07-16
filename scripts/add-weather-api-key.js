#!/usr/bin/env node

/**
 * Script to add OpenWeatherMap API key to .env.local
 * This helps users set up weather integration securely
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(process.cwd(), '.env.local');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🌤️  Garden Buddy Weather API Setup');
console.log('=====================================\n');

console.log('To enable weather integration, you need a free OpenWeatherMap API key.');
console.log('1. Go to: https://openweathermap.org/api');
console.log('2. Sign up for a free account');
console.log('3. Get your API key from the dashboard');
console.log('4. Free tier includes: 60 calls/minute, 1,000 calls/day\n');

rl.question('Enter your OpenWeatherMap API key: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.log('❌ No API key provided. Weather integration will use mock data.');
    rl.close();
    return;
  }

  try {
    let envContent = '';
    
    // Read existing .env.local if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Check if OPENWEATHERMAP_API_KEY already exists
    const lines = envContent.split('\n');
    let keyExists = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('OPENWEATHERMAP_API_KEY=')) {
        lines[i] = `OPENWEATHERMAP_API_KEY=${apiKey.trim()}`;
        keyExists = true;
        break;
      }
    }
    
    // Add the key if it doesn't exist
    if (!keyExists) {
      if (envContent && !envContent.endsWith('\n')) {
        envContent += '\n';
      }
      envContent += `OPENWEATHERMAP_API_KEY=${apiKey.trim()}\n`;
    } else {
      envContent = lines.join('\n');
    }

    // Write the updated content
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ OpenWeatherMap API key added successfully!');
    console.log('🔄 Please restart your development server to apply changes.');
    console.log('\nWeather features now available:');
    console.log('• Real-time weather data');
    console.log('• Humidity and temperature alerts');
    console.log('• Spray timing recommendations');
    console.log('• 7-day weather forecast');
    
  } catch (error) {
    console.error('❌ Error updating .env.local:', error.message);
  }
  
  rl.close();
});
