#!/usr/bin/env node

/**
 * Script to set up the OpenWeatherMap API key for Garden Buddy
 * This script helps users add their OpenWeatherMap API key to the .env.local file
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');

// Check if .env.local exists
const checkEnvFile = () => {
  try {
    if (fs.existsSync(ENV_FILE_PATH)) {
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error checking for .env.local file:', err);
    return false;
  }
};

// Read the current .env.local file
const readEnvFile = () => {
  try {
    return fs.readFileSync(ENV_FILE_PATH, 'utf8');
  } catch (err) {
    console.error('Error reading .env.local file:', err);
    return '';
  }
};

// Write the updated .env.local file
const writeEnvFile = (content) => {
  try {
    fs.writeFileSync(ENV_FILE_PATH, content);
    return true;
  } catch (err) {
    console.error('Error writing to .env.local file:', err);
    return false;
  }
};

// Update the OpenWeatherMap API key in the .env.local file
const updateOpenWeatherMapKey = (apiKey) => {
  const envFileExists = checkEnvFile();
  
  if (!envFileExists) {
    console.log('Creating new .env.local file...');
    const newEnvContent = `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=${apiKey}\n`;
    if (writeEnvFile(newEnvContent)) {
      console.log('Successfully created .env.local with OpenWeatherMap API key.');
    }
    return;
  }
  
  const envContent = readEnvFile();
  
  // Check if the OpenWeatherMap API key already exists
  if (envContent.includes('NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=')) {
    // Replace the existing key
    const updatedContent = envContent.replace(
      /NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=.*/,
      `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=${apiKey}`
    );
    
    if (writeEnvFile(updatedContent)) {
      console.log('Successfully updated OpenWeatherMap API key in .env.local.');
    }
  } else {
    // Add the key to the end of the file
    const updatedContent = envContent.trim() + `\nNEXT_PUBLIC_OPENWEATHERMAP_API_KEY=${apiKey}\n`;
    
    if (writeEnvFile(updatedContent)) {
      console.log('Successfully added OpenWeatherMap API key to .env.local.');
    }
  }
};

// Main function
const main = () => {
  console.log('===== Garden Buddy - OpenWeatherMap API Key Setup =====');
  console.log('This script will help you set up your OpenWeatherMap API key.');
  console.log('You can get a free API key from: https://openweathermap.org/api');
  console.log('');
  
  rl.question('Enter your OpenWeatherMap API key: ', (apiKey) => {
    if (!apiKey || apiKey.trim() === '') {
      console.log('Error: API key cannot be empty.');
      rl.close();
      return;
    }
    
    updateOpenWeatherMapKey(apiKey.trim());
    
    console.log('');
    console.log('Setup complete! You can now use the interactive weather map.');
    console.log('Remember to restart your development server for changes to take effect.');
    
    rl.close();
  });
};

// Run the main function
main();
