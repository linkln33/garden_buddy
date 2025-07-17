// Test authenticated image upload to plant-images bucket
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Test email and password - replace with test credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'test_password';

async function testAuthenticatedUpload() {
  console.log('🔐 Testing authenticated image upload...\n');
  
  try {
    // Step 1: Check if we have service role key
    console.log('1. Checking if we can use service role key...');
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (hasServiceRole) {
      console.log('✅ Service role key found, using it for testing');
      
      // Create admin client with service role
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      await testUpload(adminSupabase, 'service role');
      return;
    } else {
      console.log('⚠️  No service role key found, will try to sign in');
    }
    
    // Step 2: Try to sign in
    console.log('\n2. Attempting to sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (signInError) {
      console.log(`❌ Sign in failed: ${signInError.message}`);
      console.log('\n💡 For testing purposes, try one of these alternatives:');
      console.log('1. Add service role key to .env.local as SUPABASE_SERVICE_ROLE_KEY');
      console.log('2. Create a test user in Supabase and update credentials in this script');
      console.log('3. Test directly in your Next.js app where auth is already set up');
      return;
    }
    
    console.log('✅ Sign in successful!');
    console.log(`   User: ${signInData.user.email}`);
    
    // Step 3: Test upload with authenticated client
    await testUpload(supabase, 'authenticated user');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testUpload(client, mode) {
  console.log(`\n3. Testing upload as ${mode}...`);
  
  // Create a minimal valid JPEG file
  const minimalJpeg = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
    0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
    0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
    0xFF, 0xD9
  ]);
  
  const fileName = `test-${Date.now()}.jpg`;
  
  const { data: uploadData, error: uploadError } = await client.storage
    .from('plant-images')
    .upload(fileName, minimalJpeg, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false
    });
  
  if (uploadError) {
    console.log(`❌ Upload failed: ${uploadError.message}`);
    
    if (uploadError.message.includes('policy')) {
      console.log('\n💡 RLS Policy Issue:');
      console.log('1. Verify policies in Supabase Dashboard → Storage → Policies');
      console.log('2. Make sure the INSERT policy allows authenticated users');
      console.log('3. Check if the bucket_id is correctly specified as plant-images');
    }
    return;
  }
  
  console.log('✅ Upload successful!');
  console.log(`   File path: ${uploadData.path}`);
  
  // Test public URL access
  console.log('\n4. Testing public URL access...');
  const { data: publicUrlData } = client.storage
    .from('plant-images')
    .getPublicUrl(uploadData.path);
  
  console.log('✅ Public URL generated:');
  console.log(`   ${publicUrlData.publicUrl}`);
  
  // Test file listing
  console.log('\n5. Testing file listing...');
  const { data: files, error: listError } = await client.storage
    .from('plant-images')
    .list('', { limit: 10 });
  
  if (listError) {
    console.log(`❌ List error: ${listError.message}`);
  } else {
    console.log(`✅ Found ${files.length} files in bucket`);
    files.forEach(file => {
      console.log(`   - ${file.name}`);
    });
  }
  
  // Clean up test file
  console.log('\n6. Cleaning up test file...');
  const { error: deleteError } = await client.storage
    .from('plant-images')
    .remove([uploadData.path]);
  
  if (deleteError) {
    console.log(`⚠️  Delete error: ${deleteError.message}`);
  } else {
    console.log('✅ Test file cleaned up');
  }
  
  console.log('\n🎉 Storage bucket test completed successfully!');
}

// Run the test
testAuthenticatedUpload();
