#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStoragePolicies() {
  console.log('🔧 Setting up storage bucket and policies...');
  
  try {
    // First, try to create the bucket
    console.log('📦 Creating plant-images bucket...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('plant-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    });
    
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('❌ Error creating bucket:', bucketError);
    } else {
      console.log('✅ Bucket created or already exists');
    }
    
    // Execute the storage policies SQL
    const storagePoliciesSQL = `
      -- Enable RLS on storage.objects if not already enabled
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Allow authenticated users to upload plant images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow authenticated users to view plant images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow authenticated users to update plant images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow authenticated users to delete plant images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow public access to view plant images" ON storage.objects;
      
      -- Create new policies
      CREATE POLICY "Allow authenticated users to upload plant images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'plant-images');
      
      CREATE POLICY "Allow authenticated users to view plant images"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (bucket_id = 'plant-images');
      
      CREATE POLICY "Allow authenticated users to update plant images"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'plant-images')
      WITH CHECK (bucket_id = 'plant-images');
      
      CREATE POLICY "Allow authenticated users to delete plant images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'plant-images');
      
      CREATE POLICY "Allow public access to view plant images"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'plant-images');
    `;
    
    console.log('🔐 Setting up RLS policies...');
    const { data: sqlData, error: sqlError } = await supabase.rpc('exec_sql', { 
      sql: storagePoliciesSQL 
    });
    
    if (sqlError) {
      console.error('❌ Error setting up policies:', sqlError);
      console.log('💡 You may need to run these SQL commands manually in your Supabase dashboard:');
      console.log(storagePoliciesSQL);
    } else {
      console.log('✅ Storage policies set up successfully!');
    }
    
    // Test the bucket
    console.log('🧪 Testing bucket access...');
    const { data: listData, error: listError } = await supabase.storage.from('plant-images').list();
    
    if (listError) {
      console.error('❌ Error accessing bucket:', listError);
    } else {
      console.log('✅ Bucket is accessible');
    }
    
    console.log('🎉 Storage setup complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setupStoragePolicies();
