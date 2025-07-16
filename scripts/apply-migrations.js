#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration(filePath) {
  try {
    console.log(`Applying migration: ${path.basename(filePath)}`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}`);
      
      // Execute the SQL statement directly
      const { error } = await supabase.from('_dummy_').select().limit(0).then(
        async () => {
          // Use the internal fetch method to execute raw SQL
          return await supabase.rpc('_exec_sql', { query: statement }, { count: 'exact' });
        }
      );
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement);
        return false;
      }
    }
    
    console.log(`Successfully applied migration: ${path.basename(filePath)}`);
    return true;
  } catch (err) {
    console.error(`Error reading or executing migration ${path.basename(filePath)}:`, err);
    return false;
  }
}

async function main() {
  console.log('Starting database migrations...');
  
  // Apply the latest migration
  const latestMigration = path.join(__dirname, '../supabase/migrations/20250717_fix_rls_policies.sql');
  
  if (fs.existsSync(latestMigration)) {
    const success = await applyMigration(latestMigration);
    if (success) {
      console.log('Migration completed successfully!');
    } else {
      console.error('Migration failed. Please check the errors above.');
      process.exit(1);
    }
  } else {
    console.error(`Migration file not found: ${latestMigration}`);
    process.exit(1);
  }
}

// Execute the main function
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
