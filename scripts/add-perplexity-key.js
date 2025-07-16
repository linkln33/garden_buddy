#!/usr/bin/env node

/**
 * Script to add or update the Perplexity API key in the .env.local file
 * This allows users to use Perplexity AI for plant disease diagnosis
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(process.cwd(), '.env.local');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.error('\x1b[31mError: .env.local file not found in the project root.\x1b[0m');
  console.log('Please create a .env.local file first by copying .env.example');
  rl.close();
  process.exit(1);
}

console.log('\x1b[32m=== Perplexity API Key Setup ===\x1b[0m');
console.log('\nThis script will update your Perplexity API key in the .env.local file.');
console.log('\x1b[33mNote: You need a Perplexity API key to use Perplexity AI for plant disease diagnosis.\x1b[0m');
console.log('You can get a free API key from: https://www.perplexity.ai/settings/api');

rl.question('\nEnter your Perplexity API key: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.log('\x1b[31mNo API key provided. Operation cancelled.\x1b[0m');
    rl.close();
    return;
  }

  try {
    // Read the current .env.local file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if PERPLEXITY_API_KEY already exists
    if (envContent.includes('PERPLEXITY_API_KEY=')) {
      // Replace existing key
      envContent = envContent.replace(
        /PERPLEXITY_API_KEY=.*/,
        `PERPLEXITY_API_KEY=${apiKey.trim()}`
      );
      console.log('\x1b[32mExisting Perplexity API key updated successfully!\x1b[0m');
    } else {
      // Add new key
      envContent += `\n# Perplexity AI API key for plant disease diagnosis\nPERPLEXITY_API_KEY=${apiKey.trim()}\n`;
      console.log('\x1b[32mPerplexity API key added successfully!\x1b[0m');
    }
    
    // Write back to .env.local
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n\x1b[33mImportant:\x1b[0m');
    console.log('1. Restart your development server for changes to take effect');
    console.log('2. You can now select "Perplexity AI" as a provider in the diagnose page');
    console.log('3. Perplexity offers up-to-date plant disease information with web search capability');
    
  } catch (error) {
    console.error('\x1b[31mError updating .env.local file:\x1b[0m', error.message);
  }
  
  rl.close();
});
