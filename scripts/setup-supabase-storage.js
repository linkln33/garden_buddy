// Script to check and create Supabase storage buckets
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  try {
    // Check if plant-images bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const plantImagesBucket = buckets.find(bucket => bucket.name === 'plant-images');
    
    if (!plantImagesBucket) {
      console.log('Creating plant-images bucket...');
      
      // Create the bucket with public access
      const { data, error } = await supabase.storage.createBucket('plant-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('plant-images bucket created successfully!');
      }
    } else {
      console.log('plant-images bucket already exists.');
    }
    
    // Set up bucket policies for public access
    const { error: policyError } = await supabase.storage.from('plant-images').createSignedUrl('test.jpg', 60);
    
    if (policyError && policyError.message.includes('You must be authenticated')) {
      console.log('Setting up public access policy for plant-images bucket...');
      // This would require admin privileges and would need to be done in the Supabase dashboard
      console.log('Please go to the Supabase dashboard > Storage > plant-images > Policies and add a policy to allow public access.');
    }
    
  } catch (err) {
    console.error('Error setting up storage:', err);
  }
}

setupStorage();
