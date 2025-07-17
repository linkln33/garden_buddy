#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runSeedData() {
  console.log('🌱 Garden Buddy - Seeding Pesticide Database');
  console.log('=============================================\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }

  if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
    console.error('❌ Placeholder Supabase credentials detected');
    console.log('Please replace with real Supabase project credentials in .env.local');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded');
  console.log(`📡 Connecting to Supabase: ${supabaseUrl.substring(0, 30)}...`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection
    const { data, error } = await supabase.from('pesticide_products').select('count').limit(1);
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
      console.log('💡 Make sure you have run the schema SQL in Supabase first');
      process.exit(1);
    }

    console.log('✅ Connected to Supabase successfully');
    console.log('🚀 Starting seed data import...\n');

    // Read and execute seed data
    const seedDataPath = path.join(__dirname, 'src/scripts/seed-pesticide-data.sql');
    const seedSQL = fs.readFileSync(seedDataPath, 'utf8');

    // Split SQL into individual statements
    const statements = seedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.toLowerCase().startsWith('insert')) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          
          // Use rpc to execute raw SQL
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
          
          if (error) {
            console.log(`⚠️  Statement ${i + 1} failed: ${error.message}`);
            errorCount++;
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            successCount++;
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} failed: ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log('\n📊 Seed Data Import Summary:');
    console.log(`  ✅ Successful statements: ${successCount}`);
    console.log(`  ⚠️  Failed statements: ${errorCount}`);
    console.log(`  📋 Total statements: ${statements.length}`);

    // Verify data was inserted
    console.log('\n🔍 Verifying inserted data...');
    
    const tables = ['pesticide_products', 'crops', 'plant_diseases', 'pesticide_dosages', 'ipm_recommendations'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (!error) {
          console.log(`  📋 ${table}: ${data?.length || 0} records`);
        }
      } catch (err) {
        console.log(`  ⚠️  ${table}: Could not verify`);
      }
    }

    console.log('\n🎉 Seed data import completed!');
    console.log('💡 You can now test the PesticideRecommendations component with real data');

  } catch (error) {
    console.error('❌ Seed data import failed:', error.message);
    process.exit(1);
  }
}

runSeedData();
