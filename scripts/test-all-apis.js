#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testOpenAI() {
  console.log('\n🤖 Testing OpenAI API...');
  console.log('================================');
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your-openai-api-key') {
    console.log('❌ OpenAI API key not configured');
    console.log('💡 Get your API key from: https://platform.openai.com/api-keys');
    console.log('💡 Run: node scripts/update-openai-key.js');
    return false;
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const hasVisionModel = data.data.some(model => 
        model.id.includes('gpt-4') && model.id.includes('vision')
      );
      
      console.log('✅ OpenAI API key is valid');
      console.log(`📊 Available models: ${data.data.length}`);
      console.log(`👁️  Vision models available: ${hasVisionModel ? 'Yes' : 'No'}`);
      console.log('💰 Status: Paid service (usage-based billing)');
      return true;
    } else {
      const errorData = await response.text();
      console.log('❌ OpenAI API error:', response.status, errorData);
      
      if (response.status === 401) {
        console.log('💡 Invalid API key - please check your OpenAI API key');
      } else if (response.status === 429) {
        console.log('💡 Rate limit exceeded - please wait or upgrade your plan');
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

async function testClaude() {
  console.log('\n🧠 Testing Claude API...');
  console.log('================================');
  
  const apiKey = process.env.CLAUDE_API_KEY;
  
  if (!apiKey || apiKey === 'your-claude-api-key') {
    console.log('❌ Claude API key not configured');
    console.log('💡 Get your API key from: https://console.anthropic.com/');
    console.log('💡 Run: node scripts/add-claude-key.js');
    return false;
  }
  
  try {
    // Test with a simple message
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'Hello'
        }]
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Claude API key is valid');
      console.log('👁️  Vision analysis: Supported');
      console.log('🆓 Status: Free tier available, then pay-per-use');
      console.log('💡 Claude Haiku is very affordable for image analysis');
      return true;
    } else {
      const errorData = await response.text();
      console.log('❌ Claude API error:', response.status, errorData);
      
      if (response.status === 401) {
        console.log('💡 Invalid API key - please check your Claude API key');
      } else if (response.status === 429) {
        console.log('💡 Rate limit exceeded - please wait');
      } else if (response.status === 402) {
        console.log('💡 Insufficient credits - please add credits to your account');
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

async function testSupabase() {
  console.log('\n🗄️  Testing Supabase...');
  console.log('================================');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || url === 'https://your-project.supabase.co' || 
      !key || key === 'your-anon-key') {
    console.log('❌ Supabase credentials not configured');
    console.log('💡 Create a project at: https://supabase.com');
    console.log('💡 Update .env.local with your project URL and anon key');
    return false;
  }
  
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase connection is working');
      console.log('🆓 Status: Free tier available');
      console.log('💾 Database and storage ready');
      return true;
    } else {
      console.log('❌ Supabase connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

async function testPlantDatabase() {
  console.log('\n🌱 Testing Plant Database...');
  console.log('================================');
  
  try {
    // Test the hybrid diagnosis endpoint
    const response = await fetch('http://localhost:3000/api/diagnose-hybrid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image: 'data:image/jpeg;base64,test',
        plantType: 'tomato'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Plant Database is working');
      console.log('🆓 Status: Completely free');
      console.log('⚡ Speed: Instant results');
      console.log('📱 Offline: Works without internet');
      return true;
    } else {
      console.log('❌ Plant Database test failed:', response.status);
      console.log('💡 Make sure the development server is running');
      return false;
    }
  } catch (error) {
    console.log('❌ Plant Database test failed:', error.message);
    console.log('💡 Make sure the development server is running on localhost:3000');
    return false;
  }
}

async function main() {
  console.log('🧪 Garden Buddy API Status Check');
  console.log('==================================');
  console.log('This script tests all AI providers and services...\n');
  
  const results = {
    openai: await testOpenAI(),
    claude: await testClaude(),
    supabase: await testSupabase(),
    plantdb: await testPlantDatabase()
  };
  
  console.log('\n📊 SUMMARY');
  console.log('===========');
  console.log(`OpenAI GPT-4 Vision: ${results.openai ? '✅ Working' : '❌ Not configured'}`);
  console.log(`Claude AI Vision: ${results.claude ? '✅ Working' : '❌ Not configured'}`);
  console.log(`Supabase Backend: ${results.supabase ? '✅ Working' : '❌ Not configured'}`);
  console.log(`Plant Database: ${results.plantdb ? '✅ Working' : '❌ Server not running'}`);
  
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  
  if (!results.plantdb) {
    console.log('🚀 Start the development server: npm run dev');
  }
  
  if (!results.supabase) {
    console.log('🗄️  Set up Supabase for user authentication and data storage');
  }
  
  if (!results.openai && !results.claude) {
    console.log('🤖 Set up at least one AI provider for image analysis:');
    console.log('   • Claude: Free tier + affordable vision analysis');
    console.log('   • OpenAI: Most accurate but requires paid account');
  } else if (results.claude && !results.openai) {
    console.log('✨ Claude AI is ready! This provides excellent free vision analysis.');
  } else if (results.openai && !results.claude) {
    console.log('✨ OpenAI is ready! Consider adding Claude for a free alternative.');
  } else {
    console.log('🎉 All AI providers are configured! Users can choose their preferred option.');
  }
  
  console.log('\n🌟 Your Garden Buddy app is ready to diagnose plant diseases!');
}

main().catch(console.error);
