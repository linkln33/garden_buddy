// Script to create the plant-images storage bucket
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createStorageBucket() {
  console.log('🪣 Creating plant-images storage bucket...\n');
  
  try {
    // Check current buckets
    console.log('1. Checking existing buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    console.log('Current buckets:', buckets.map(b => b.name));
    
    // Check if plant-images already exists
    const existingBucket = buckets.find(bucket => bucket.name === 'plant-images');
    if (existingBucket) {
      console.log('✅ plant-images bucket already exists');
      return;
    }
    
    // Create the bucket
    console.log('\n2. Creating plant-images bucket...');
    const { data, error } = await supabase.storage.createBucket('plant-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
      fileSizeLimit: 5242880 // 5MB in bytes
    });
    
    if (error) {
      console.error('❌ Error creating bucket:', error);
      
      // Check if it's a permission issue
      if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        console.log('\n💡 This requires admin permissions. Please create the bucket manually:');
        console.log('1. Go to Supabase Dashboard → Storage');
        console.log('2. Click "Create bucket"');
        console.log('3. Name: plant-images');
        console.log('4. Public access: ✅ Enabled');
        console.log('5. File size limit: 5MB');
        console.log('6. Allowed MIME types: image/jpeg,image/png,image/webp,image/jpg');
      }
      return;
    }
    
    console.log('✅ Bucket created successfully:', data);
    
    // Verify creation
    console.log('\n3. Verifying bucket creation...');
    const { data: updatedBuckets } = await supabase.storage.listBuckets();
    const newBucket = updatedBuckets.find(bucket => bucket.name === 'plant-images');
    
    if (newBucket) {
      console.log('✅ Verification successful');
      console.log(`   - Name: ${newBucket.name}`);
      console.log(`   - Public: ${newBucket.public}`);
      console.log(`   - Created: ${newBucket.created_at}`);
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

createStorageBucket();
