#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const deepseekKey = 'sk-b2da3620bc574e6898287264dd276b66';

try {
  let envContent = '';
  
  // Read existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Check if DeepSeek key already exists
  if (envContent.includes('DEEPSEEK_API_KEY=')) {
    // Replace existing key
    envContent = envContent.replace(/DEEPSEEK_API_KEY=.*/, `DEEPSEEK_API_KEY=${deepseekKey}`);
    console.log('✅ Updated existing DeepSeek API key');
  } else {
    // Add new key
    envContent += `\nDEEPSEEK_API_KEY=${deepseekKey}`;
    console.log('✅ Added new DeepSeek API key');
  }
  
  // Write back to file
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  
  console.log('🎉 DeepSeek API key configured successfully!');
  console.log('🔄 Please restart your development server to apply changes.');
  
} catch (error) {
  console.error('❌ Error updating .env.local:', error.message);
}
