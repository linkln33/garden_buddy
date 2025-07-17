#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Check if environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('🚀 Starting pesticide data import...');

// Import and run the script
const { spawn } = require('child_process');

const importProcess = spawn('npx', ['tsx', 'src/scripts/import-pesticide-data.ts'], {
  stdio: 'inherit',
  env: { ...process.env }
});

importProcess.on('close', (code) => {
  console.log(`Import process exited with code ${code}`);
});
