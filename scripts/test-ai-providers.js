#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testProviders() {
  console.log('🧪 Testing AI Providers\n');
  
  // Test 1: Plant Database (always works)
  console.log('1. 🌱 Plant Database Test:');
  try {
    const dbPath = path.join(__dirname, '..', 'src', 'lib', 'plantDatabase.ts');
    if (fs.existsSync(dbPath)) {
      console.log('   ✅ Plant database file exists');
      const content = fs.readFileSync(dbPath, 'utf8');
      const diseaseCount = (content.match(/id: '/g) || []).length;
      console.log(`   📋 Contains ${diseaseCount} diseases in database`);
    } else {
      console.log('   ❌ Plant database file not found');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 2: DeepSeek API
  console.log('\n2. 🤖 DeepSeek API Test:');
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekKey || deepseekKey === 'your-deepseek-api-key') {
    console.log('   ⚠️  No DeepSeek API key configured');
    console.log('   💡 Run: node scripts/setup-ai-providers.js');
  } else {
    console.log('   ✅ DeepSeek API key configured');
    console.log('   🔑 Key format: ' + deepseekKey.substring(0, 8) + '...');
  }
  
  // Test 3: OpenAI API
  console.log('\n3. 🧠 OpenAI API Test:');
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey || openaiKey === 'your-openai-api-key') {
    console.log('   ⚠️  No OpenAI API key configured');
    console.log('   💡 Run: node scripts/setup-ai-providers.js');
  } else if (!openaiKey.startsWith('sk-')) {
    console.log('   ❌ Invalid OpenAI API key format');
  } else {
    console.log('   ✅ OpenAI API key configured');
    console.log('   🔑 Key format: ' + openaiKey.substring(0, 8) + '...');
  }
  
  // Test 4: Supabase Configuration
  console.log('\n4. 🗄️  Supabase Configuration:');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    console.log('   ❌ Supabase URL not configured');
  } else {
    console.log('   ✅ Supabase URL configured');
  }
  
  if (!supabaseKey || supabaseKey.includes('your-anon-key')) {
    console.log('   ❌ Supabase anon key not configured');
  } else {
    console.log('   ✅ Supabase anon key configured');
  }
  
  console.log('\n📊 Summary:');
  console.log('• Plant Database: Always available (no setup required)');
  console.log('• DeepSeek AI: ' + (deepseekKey && deepseekKey !== 'your-deepseek-api-key' ? '✅ Ready' : '❌ Needs setup'));
  console.log('• OpenAI GPT-4: ' + (openaiKey && openaiKey.startsWith('sk-') ? '✅ Ready' : '❌ Needs setup'));
  console.log('• Supabase: ' + (supabaseUrl && !supabaseUrl.includes('your-project') ? '✅ Ready' : '❌ Needs setup'));
  
  console.log('\n💡 Recommendations:');
  if (!deepseekKey || deepseekKey === 'your-deepseek-api-key') {
    console.log('• Set up DeepSeek for free AI analysis: node scripts/setup-ai-providers.js');
  }
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    console.log('• Configure Supabase for data storage and authentication');
  }
  console.log('• Use Plant Database for immediate testing (no API keys required)');
}

testProviders().catch(console.error);
