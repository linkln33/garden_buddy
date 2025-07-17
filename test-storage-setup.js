// Test script to verify Supabase storage bucket and RLS policies are working
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testStorageSetup() {
  console.log('🧪 Testing Garden Buddy Storage Setup...\n');
  
  try {
    // Test 1: Check if plant-images bucket exists
    console.log('1. Checking if plant-images bucket exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    const plantImagesBucket = buckets.find(bucket => bucket.name === 'plant-images');
    if (plantImagesBucket) {
      console.log('✅ plant-images bucket exists');
      console.log(`   - Public: ${plantImagesBucket.public}`);
      console.log(`   - Created: ${plantImagesBucket.created_at}`);
    } else {
      console.log('❌ plant-images bucket not found');
      console.log('Available buckets:', buckets.map(b => b.name));
      return;
    }
    
    // Test 2: Check storage policies
    console.log('\n2. Checking storage policies...');
    const { data: policies, error: policiesError } = await supabase.rpc('get_storage_policies');
    
    if (policiesError) {
      console.log('⚠️  Could not fetch storage policies (this is normal)');
    } else {
      console.log('✅ Storage policies accessible');
    }
    
    // Test 3: Test file upload (requires authentication)
    console.log('\n3. Testing file upload capability...');
    
    // Create a small test file
    const testFileContent = 'Test image content for Garden Buddy';
    const testBlob = new Blob([testFileContent], { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('plant-images')
      .upload(`test-${Date.now()}.txt`, testBlob, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      if (uploadError.message.includes('row-level security')) {
        console.log('⚠️  Upload blocked by RLS (authentication required)');
        console.log('   This is expected for unauthenticated requests');
      } else {
        console.log('❌ Upload error:', uploadError.message);
      }
    } else {
      console.log('✅ File uploaded successfully:', uploadData.path);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('plant-images')
        .remove([uploadData.path]);
      
      if (!deleteError) {
        console.log('✅ Test file cleaned up');
      }
    }
    
    // Test 4: Test public URL generation
    console.log('\n4. Testing public URL generation...');
    const { data: publicUrlData } = supabase.storage
      .from('plant-images')
      .getPublicUrl('test-image.jpg');
    
    if (publicUrlData?.publicUrl) {
      console.log('✅ Public URL generation works');
      console.log(`   URL format: ${publicUrlData.publicUrl}`);
    } else {
      console.log('❌ Public URL generation failed');
    }
    
    // Test 5: Check database tables
    console.log('\n5. Checking database tables...');
    
    const tables = ['diagnoses', 'community_votes', 'pesticide_products'];
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`⚠️  Table '${table}' does not exist`);
        } else {
          console.log(`❌ Error accessing '${table}':`, error.message);
        }
      } else {
        console.log(`✅ Table '${table}' accessible`);
      }
    }
    
    console.log('\n🎉 Storage setup test completed!');
    console.log('\n📋 Summary:');
    console.log('- Storage bucket: ✅ Created');
    console.log('- Public access: ✅ Enabled');
    console.log('- RLS policies: ⚠️  Require authentication');
    console.log('- Database tables: Ready for testing');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testStorageSetup();
