#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuth() {
  console.log('🔐 Checking authentication...');
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ Authentication error:', error.message);
    return null;
  }
  
  if (!session) {
    console.log('⚠️ No active session found. You need to be logged in.');
    return null;
  }
  
  console.log('✅ Authenticated as:', session.user.email);
  return session.user;
}

async function checkStorageBucket() {
  console.log('\n📦 Checking plant-images bucket...');
  
  try {
    const { data, error } = await supabase.storage.getBucket('plant-images');
    
    if (error) {
      console.error('❌ Error accessing bucket:', error.message);
      return false;
    }
    
    console.log('✅ Bucket exists:', data);
    return true;
  } catch (err) {
    console.error('❌ Error checking bucket:', err.message);
    return false;
  }
}

async function testUpload(userId) {
  if (!userId) {
    console.log('⚠️ Cannot test upload without authentication');
    return;
  }
  
  console.log('\n🧪 Testing file upload to plant-images bucket...');
  
  // Create a simple text file for testing
  const testContent = 'This is a test file';
  const testBlob = new Blob([testContent], { type: 'text/plain' });
  const filePath = `${userId}/test-${Date.now()}.txt`;
  
  try {
    const { data, error } = await supabase.storage
      .from('plant-images')
      .upload(filePath, testBlob, {
        contentType: 'text/plain',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Upload test failed:', error.message);
      
      if (error.message.includes('row-level security policy')) {
        console.log('\n🔒 RLS POLICY ERROR DETECTED');
        console.log('This means the bucket exists but the RLS policies are not set correctly.');
        console.log('Please follow these steps:');
        console.log('1. Go to Supabase Dashboard > Storage > Policies');
        console.log('2. Click on the plant-images bucket');
        console.log('3. Add the following policies:');
        console.log('   - Policy for INSERT: Allow authenticated users to upload');
        console.log('   - Policy for SELECT: Allow authenticated users to view');
        console.log('   - Policy for SELECT: Allow public access to view');
      }
      
      return false;
    }
    
    console.log('✅ Upload test successful:', data);
    
    // Clean up the test file
    const { error: deleteError } = await supabase.storage
      .from('plant-images')
      .remove([filePath]);
    
    if (deleteError) {
      console.warn('⚠️ Could not clean up test file:', deleteError.message);
    } else {
      console.log('🧹 Test file cleaned up');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Upload test error:', err.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Garden Buddy Storage Policy Checker');
  console.log('=====================================');
  
  const user = await checkAuth();
  const bucketExists = await checkStorageBucket();
  
  if (bucketExists) {
    await testUpload(user?.id);
  }
  
  console.log('\n📋 Summary:');
  console.log('- Authentication:', user ? '✅ Logged in' : '❌ Not logged in');
  console.log('- plant-images bucket:', bucketExists ? '✅ Exists' : '❌ Missing');
  
  if (!user) {
    console.log('\n⚠️ ACTION NEEDED: Please log in to the app first');
  } else if (!bucketExists) {
    console.log('\n⚠️ ACTION NEEDED: Create the plant-images bucket in Supabase');
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
