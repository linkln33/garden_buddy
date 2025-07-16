#!/usr/bin/env node

/**
 * Setup script for the Garden Buddy Interactive Weather Map feature
 * This script helps users set up all the necessary components for the weather map
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');
const LEAFLET_ASSETS_SCRIPT = path.join(process.cwd(), 'scripts', 'setup-leaflet-assets.sh');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

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
      console.log(`${colors.green}Successfully created .env.local with OpenWeatherMap API key.${colors.reset}`);
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
      console.log(`${colors.green}Successfully updated OpenWeatherMap API key in .env.local.${colors.reset}`);
    }
  } else {
    // Add the key to the end of the file
    const updatedContent = envContent.trim() + `\nNEXT_PUBLIC_OPENWEATHERMAP_API_KEY=${apiKey}\n`;
    
    if (writeEnvFile(updatedContent)) {
      console.log(`${colors.green}Successfully added OpenWeatherMap API key to .env.local.${colors.reset}`);
    }
  }
};

// Install required npm packages
const installPackages = () => {
  console.log(`\n${colors.cyan}Installing required npm packages...${colors.reset}`);
  try {
    execSync('npm install leaflet react-leaflet leaflet-draw react-leaflet-draw', { stdio: 'inherit' });
    console.log(`${colors.green}Successfully installed required packages.${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to install packages:${colors.reset}`, error.message);
    return false;
  }
};

// Setup Leaflet assets
const setupLeafletAssets = () => {
  console.log(`\n${colors.cyan}Setting up Leaflet marker icons...${colors.reset}`);
  try {
    // Make the script executable
    fs.chmodSync(LEAFLET_ASSETS_SCRIPT, '755');
    execSync(`bash ${LEAFLET_ASSETS_SCRIPT}`, { stdio: 'inherit' });
    console.log(`${colors.green}Successfully set up Leaflet assets.${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to set up Leaflet assets:${colors.reset}`, error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log(`${colors.bright}${colors.magenta}===== Garden Buddy - Interactive Weather Map Setup =====${colors.reset}`);
  console.log('This script will help you set up the interactive weather map feature.');
  console.log(`${colors.yellow}The following steps will be performed:${colors.reset}`);
  console.log('1. Install required npm packages (leaflet, react-leaflet, etc.)');
  console.log('2. Set up Leaflet marker icons');
  console.log('3. Configure OpenWeatherMap API key');
  console.log('');
  
  rl.question(`${colors.bright}Do you want to proceed with the setup? (y/n) ${colors.reset}`, (answer) => {
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
    
    // Step 1: Install required packages
    const packagesInstalled = installPackages();
    if (!packagesInstalled) {
      console.log(`${colors.yellow}Warning: Some packages may not have been installed correctly.${colors.reset}`);
    }
    
    // Step 2: Setup Leaflet assets
    const assetsSetup = setupLeafletAssets();
    if (!assetsSetup) {
      console.log(`${colors.yellow}Warning: Leaflet assets may not have been set up correctly.${colors.reset}`);
    }
    
    // Step 3: Configure OpenWeatherMap API key
    console.log(`\n${colors.cyan}Setting up OpenWeatherMap API key...${colors.reset}`);
    console.log('You can get a free API key from: https://openweathermap.org/api');
    
    rl.question(`${colors.bright}Enter your OpenWeatherMap API key: ${colors.reset}`, (apiKey) => {
      if (!apiKey || apiKey.trim() === '') {
        console.log(`${colors.red}Error: API key cannot be empty.${colors.reset}`);
        rl.close();
        return;
      }
      
      updateOpenWeatherMapKey(apiKey.trim());
      
      console.log(`\n${colors.green}${colors.bright}Setup complete!${colors.reset}`);
      console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
      console.log('1. Restart your development server for changes to take effect');
      console.log('2. Navigate to the Weather page and click "Interactive Map"');
      console.log('3. Create field polygons and explore weather data for your fields');
      console.log(`\n${colors.yellow}Note:${colors.reset} Make sure your Supabase database has the required tables.`);
      console.log('You can run the SQL migration script in migrations/20250717_add_weather_tables.sql');
      
      rl.close();
    });
  });
};

// Run the main function
main();
