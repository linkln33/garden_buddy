// Test specific bucket access
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSpecificBucket() {
  console.log('🎯 Testing plant-images bucket directly...\n');
  
  try {
    // Try to list files in the bucket
    console.log('1. Attempting to list files in plant-images bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from('plant-images')
      .list('', { limit: 1 });
    
    if (listError) {
      console.log(`❌ List files error: ${listError.message}`);
      
      if (listError.message.includes('not found') || listError.message.includes('does not exist')) {
        console.log('💡 The bucket does not exist or is not accessible.');
        console.log('   Please create it manually in the Supabase Dashboard.');
      }
    } else {
      console.log('✅ Bucket accessible!');
      console.log(`   Found ${files.length} files`);
    }
    
    // Try to get public URL
    console.log('\n2. Testing public URL generation...');
    const { data: urlData } = supabase.storage
      .from('plant-images')
      .getPublicUrl('test.jpg');
    
    if (urlData?.publicUrl) {
      console.log('✅ Public URL generation works');
      console.log(`   URL: ${urlData.publicUrl}`);
    } else {
      console.log('❌ Public URL generation failed');
    }
    
    // Try to upload a test file
    console.log('\n3. Testing file upload...');
    const testContent = 'Test file for Garden Buddy';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('plant-images')
      .upload(`test-${Date.now()}.txt`, testFile);
    
    if (uploadError) {
      console.log(`❌ Upload error: ${uploadError.message}`);
      
      if (uploadError.message.includes('not found')) {
        console.log('💡 Bucket not found - needs to be created');
      } else if (uploadError.message.includes('policy')) {
        console.log('💡 RLS policy issue - check storage policies');
      }
    } else {
      console.log('✅ Upload successful!');
      console.log(`   File path: ${uploadData.path}`);
      
      // Clean up
      await supabase.storage.from('plant-images').remove([uploadData.path]);
      console.log('✅ Test file cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSpecificBucket();
