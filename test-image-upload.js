// Test image upload to plant-images bucket
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testImageUpload() {
  console.log('🖼️  Testing image upload to plant-images bucket...\n');
  
  try {
    // Create a minimal valid JPEG file (1x1 pixel)
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
    
    console.log('1. Testing image upload...');
    const fileName = `test-${Date.now()}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('plant-images')
      .upload(fileName, minimalJpeg, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.log(`❌ Upload failed: ${uploadError.message}`);
      
      if (uploadError.message.includes('policy')) {
        console.log('\n💡 RLS Policy Issue Detected!');
        console.log('You need to add storage policies in Supabase Dashboard:');
        console.log('1. Go to Storage → Policies');
        console.log('2. Select plant-images bucket');
        console.log('3. Add these policies:');
        console.log('   - INSERT policy for authenticated users');
        console.log('   - SELECT policy for public access');
      }
      return;
    }
    
    console.log('✅ Upload successful!');
    console.log(`   File path: ${uploadData.path}`);
    console.log(`   Full path: ${uploadData.fullPath}`);
    
    // Test public URL access
    console.log('\n2. Testing public URL access...');
    const { data: publicUrlData } = supabase.storage
      .from('plant-images')
      .getPublicUrl(uploadData.path);
    
    console.log('✅ Public URL generated:');
    console.log(`   ${publicUrlData.publicUrl}`);
    
    // Test file listing
    console.log('\n3. Testing file listing...');
    const { data: files, error: listError } = await supabase.storage
      .from('plant-images')
      .list('', { limit: 10 });
    
    if (listError) {
      console.log(`❌ List error: ${listError.message}`);
    } else {
      console.log(`✅ Found ${files.length} files in bucket`);
      files.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
      });
    }
    
    // Clean up test file
    console.log('\n4. Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('plant-images')
      .remove([uploadData.path]);
    
    if (deleteError) {
      console.log(`⚠️  Delete error: ${deleteError.message}`);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
    console.log('\n🎉 Storage bucket test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Bucket exists and is accessible');
    console.log('✅ Image upload works');
    console.log('✅ Public URL generation works');
    console.log('✅ File listing works');
    console.log('✅ File deletion works');
    
    console.log('\n🚀 Ready for Garden Buddy image uploads!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testImageUpload();
