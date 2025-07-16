#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function updateEnvFile(apiKey) {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  try {
    let envContent = '';
    
    // Read existing .env.local if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Check if CLAUDE_API_KEY already exists
    if (envContent.includes('CLAUDE_API_KEY=')) {
      // Replace existing key
      envContent = envContent.replace(/CLAUDE_API_KEY=.*$/m, `CLAUDE_API_KEY=${apiKey}`);
    } else {
      // Add new key
      if (envContent && !envContent.endsWith('\n')) {
        envContent += '\n';
      }
      envContent += `CLAUDE_API_KEY=${apiKey}\n`;
    }
    
    // Write back to file
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Claude API key has been added to .env.local');
    console.log('🔄 Please restart your development server to apply the changes');
    console.log('');
    console.log('To get a Claude API key:');
    console.log('1. Go to https://console.anthropic.com/');
    console.log('2. Sign up or log in');
    console.log('3. Go to API Keys section');
    console.log('4. Create a new API key');
    console.log('5. Claude Haiku model is very affordable for image analysis');
    
  } catch (error) {
    console.error('❌ Error updating .env.local:', error.message);
  }
}

console.log('🤖 Claude API Key Setup');
console.log('=======================');
console.log('');
console.log('This script will add your Claude API key to the .env.local file.');
console.log('');

// Auto-add the provided API key
const providedKey = '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';

console.log('Adding Claude API key automatically...');
updateEnvFile(providedKey);
rl.close();
