// Script to fix the database schema by adding the missing confidence column
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseSchema() {
  try {
    console.log('Attempting to fix database schema...');
    
    // Run a raw SQL query to add the confidence column if it doesn't exist
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: `
        DO $$
        BEGIN
          -- Add confidence column if it doesn't exist
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'diagnoses' 
            AND column_name = 'confidence'
          ) THEN
            ALTER TABLE public.diagnoses ADD COLUMN confidence FLOAT;
            
            -- Copy data from confidence_score to confidence if confidence_score exists
            IF EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'diagnoses' 
              AND column_name = 'confidence_score'
            ) THEN
              UPDATE public.diagnoses SET confidence = confidence_score;
            END IF;
          END IF;
        END $$;
      `
    });
    
    if (error) {
      console.error('Error fixing schema:', error);
      return;
    }
    
    console.log('Database schema fixed successfully!');
    console.log('Added confidence column to diagnoses table if it was missing.');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

fixDatabaseSchema();
