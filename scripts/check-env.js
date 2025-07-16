// Script to check environment variables without exposing sensitive values
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Check OpenAI API key
const openaiKey = envConfig.OPENAI_API_KEY;
console.log('OpenAI API Key:', openaiKey ? 
  (openaiKey === 'your-openai-api-key' || openaiKey.startsWith('sk-') === false ? 
    'INVALID (placeholder value)' : 
    'VALID (starts with sk-...)') : 
  'MISSING');

// Check Supabase credentials
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
console.log('Supabase URL:', supabaseUrl ? 
  (supabaseUrl === 'https://your-project.supabase.co' ? 
    'INVALID (placeholder value)' : 
    'VALID') : 
  'MISSING');

const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('Supabase Anon Key:', supabaseKey ? 
  (supabaseKey === 'your-anon-key' ? 
    'INVALID (placeholder value)' : 
    'VALID') : 
  'MISSING');

// Check OpenWeatherMap API key
const weatherKey = envConfig.OPENWEATHERMAP_API_KEY;
console.log('OpenWeatherMap API Key:', weatherKey ? 
  (weatherKey === 'your-openweathermap-api-key' ? 
    'INVALID (placeholder value)' : 
    'VALID') : 
  'MISSING');
