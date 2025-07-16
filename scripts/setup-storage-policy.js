#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}
╔════════════════════════════════════════════════════╗
║                                                    ║
║    Garden Buddy - Supabase Storage Policy Setup    ║
║                                                    ║
╚════════════════════════════════════════════════════╝
${colors.reset}`);

console.log(`${colors.yellow}This script will help you set up the required storage policies for Garden Buddy.${colors.reset}\n`);
console.log(`${colors.yellow}You'll need to run these SQL commands in your Supabase SQL editor:${colors.reset}\n`);

const storagePolicy = `
-- Create the plant-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'plant-images', 'plant-images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'plant-images');

-- Allow authenticated users to upload images to their own folder
CREATE OR REPLACE POLICY "Users can upload to their own folder" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'plant-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to select their own images
CREATE OR REPLACE POLICY "Users can view their own images" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'plant-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to all images for viewing
CREATE OR REPLACE POLICY "Public can view all images" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'plant-images');

-- Allow authenticated users to delete their own images
CREATE OR REPLACE POLICY "Users can delete their own images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'plant-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
`;

console.log(`${colors.green}${storagePolicy}${colors.reset}\n`);

console.log(`${colors.yellow}Instructions:${colors.reset}`);
console.log(`1. Go to your Supabase dashboard: https://supabase.com/dashboard`);
console.log(`2. Select your project`);
console.log(`3. Go to SQL Editor`);
console.log(`4. Create a new query`);
console.log(`5. Paste the SQL commands above`);
console.log(`6. Run the query\n`);

console.log(`${colors.green}This will:${colors.reset}`);
console.log(`1. Create the 'plant-images' bucket if it doesn't exist`);
console.log(`2. Set up policies to allow users to upload to their own folders`);
console.log(`3. Allow users to view and delete their own images`);
console.log(`4. Allow public access to view all images\n`);

rl.question(`${colors.blue}Have you run these commands in your Supabase SQL editor? (yes/no): ${colors.reset}`, (answer) => {
  if (answer.toLowerCase() === 'yes') {
    console.log(`\n${colors.green}Great! Your storage policies should now be set up correctly.${colors.reset}`);
    console.log(`${colors.green}You can now upload images to the 'plant-images' bucket.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}Please run the SQL commands in your Supabase SQL editor to set up the storage policies.${colors.reset}`);
    console.log(`${colors.yellow}Without these policies, image uploads will fail with permission errors.${colors.reset}\n`);
  }
  rl.close();
});
