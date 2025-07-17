// Debug script to test Supabase connection and storage access
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugConnection() {
  console.log('🔍 Debugging Supabase Storage Connection...\n');
  
  // Check environment variables
  console.log('1. Environment Variables:');
  console.log(`   SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('\n❌ Missing environment variables. Check your .env.local file.');
    return;
  }
  
  // Create client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  console.log('\n2. Testing Supabase Connection:');
  
  try {
    // Test basic connection with a simple query
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log(`   Connection test: ⚠️  ${error.message}`);
    } else {
      console.log('   Connection test: ✅ Connected');
    }
    
    // Test storage access
    console.log('\n3. Testing Storage Access:');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.log(`   Storage access: ❌ ${storageError.message}`);
      
      if (storageError.message.includes('permission') || storageError.message.includes('policy')) {
        console.log('\n💡 This might be a permissions issue.');
        console.log('   Try using the service role key instead of anon key for testing.');
      }
    } else {
      console.log('   Storage access: ✅ Working');
      console.log(`   Found ${buckets.length} buckets:`, buckets.map(b => b.name));
      
      // Check for plant-images specifically
      const plantBucket = buckets.find(b => b.name === 'plant-images');
      if (plantBucket) {
        console.log('\n4. plant-images Bucket Details:');
        console.log(`   Name: ${plantBucket.name}`);
        console.log(`   Public: ${plantBucket.public}`);
        console.log(`   Created: ${plantBucket.created_at}`);
        console.log(`   Updated: ${plantBucket.updated_at}`);
      } else {
        console.log('\n4. plant-images bucket not found in API response');
      }
    }
    
    // Test a simple database query
    console.log('\n5. Testing Database Access:');
    const { data: dbTest, error: dbError } = await supabase
      .from('diagnoses')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.log(`   Database access: ⚠️  ${dbError.message}`);
    } else {
      console.log('   Database access: ✅ Working');
    }
    
  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Verify the bucket exists in Supabase Dashboard');
  console.log('2. Check if you need to use service role key for storage operations');
  console.log('3. Ensure storage policies are properly configured');
}

debugConnection();
