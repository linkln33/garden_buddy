#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '..', '.env.local');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAIProviders() {
  console.log('🌱 Garden Buddy AI Provider Setup\n');
  
  // Read existing .env.local
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  console.log('Available AI providers:');
  console.log('1. 🌱 Plant Database (Free) - Uses our built-in disease database');
  console.log('2. 🤖 DeepSeek AI (Free) - Free AI vision analysis');
  console.log('3. 🧠 OpenAI GPT-4 (Paid) - Premium AI analysis\n');
  
  const setupDeepSeek = await question('Would you like to set up DeepSeek AI (free)? (y/n): ');
  
  if (setupDeepSeek.toLowerCase() === 'y') {
    console.log('\n📝 To get a free DeepSeek API key:');
    console.log('1. Visit: https://platform.deepseek.com/');
    console.log('2. Sign up for a free account');
    console.log('3. Go to API Keys section');
    console.log('4. Create a new API key\n');
    
    const deepseekKey = await question('Enter your DeepSeek API key (or press Enter to skip): ');
    
    if (deepseekKey.trim()) {
      // Update or add DeepSeek key
      if (envContent.includes('DEEPSEEK_API_KEY=')) {
        envContent = envContent.replace(/DEEPSEEK_API_KEY=.*/, `DEEPSEEK_API_KEY=${deepseekKey.trim()}`);
      } else {
        envContent += `\nDEEPSEEK_API_KEY=${deepseekKey.trim()}`;
      }
      console.log('✅ DeepSeek API key configured!');
    }
  }
  
  const setupOpenAI = await question('\nWould you like to set up OpenAI GPT-4 (paid)? (y/n): ');
  
  if (setupOpenAI.toLowerCase() === 'y') {
    console.log('\n📝 To get an OpenAI API key:');
    console.log('1. Visit: https://platform.openai.com/api-keys');
    console.log('2. Sign in to your OpenAI account');
    console.log('3. Create a new API key');
    console.log('4. Add billing information (required for GPT-4 Vision)\n');
    
    const openaiKey = await question('Enter your OpenAI API key (or press Enter to skip): ');
    
    if (openaiKey.trim() && openaiKey.startsWith('sk-')) {
      // Update or add OpenAI key
      if (envContent.includes('OPENAI_API_KEY=')) {
        envContent = envContent.replace(/OPENAI_API_KEY=.*/, `OPENAI_API_KEY=${openaiKey.trim()}`);
      } else {
        envContent += `\nOPENAI_API_KEY=${openaiKey.trim()}`;
      }
      console.log('✅ OpenAI API key configured!');
    } else if (openaiKey.trim()) {
      console.log('❌ Invalid OpenAI API key format. Keys should start with "sk-"');
    }
  }
  
  // Write updated .env.local
  if (envContent.trim()) {
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('\n✅ Environment variables updated in .env.local');
  }
  
  console.log('\n🎉 Setup complete!');
  console.log('\nRecommended usage:');
  console.log('• 🌱 Plant Database: Fast, works offline, good for common diseases');
  console.log('• 🤖 DeepSeek AI: Free, accurate, requires internet');
  console.log('• 🧠 OpenAI GPT-4: Most accurate, requires paid API key');
  console.log('\nRestart your development server to apply changes.');
  
  rl.close();
}

setupAIProviders().catch(console.error);
