const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

async function testDeepSeekAPI() {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  
  console.log('DeepSeek API Key Status:');
  if (!DEEPSEEK_API_KEY) {
    console.log('❌ No DeepSeek API key found');
    return;
  }
  
  if (DEEPSEEK_API_KEY === 'your-deepseek-api-key') {
    console.log('❌ DeepSeek API key is placeholder value');
    console.log('To get a free DeepSeek API key:');
    console.log('1. Visit https://platform.deepseek.com/');
    console.log('2. Sign up for a free account');
    console.log('3. Go to API Keys section');
    console.log('4. Create a new API key');
    console.log('5. Update your .env.local file with: DEEPSEEK_API_KEY=your-actual-key');
    return;
  }
  
  console.log('✅ DeepSeek API key found (starts with:', DEEPSEEK_API_KEY.substring(0, 8) + '...)');
  
  // Test the API with a simple request
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: 'Hello, can you help with plant disease diagnosis?'
          }
        ],
        max_tokens: 50
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ DeepSeek API is working correctly');
      console.log('Response:', data.choices[0]?.message?.content || 'No content');
    } else {
      const errorText = await response.text();
      console.log('❌ DeepSeek API error:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Network error testing DeepSeek API:', error.message);
  }
}

testDeepSeekAPI();
