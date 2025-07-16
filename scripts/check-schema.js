// Script to check the actual database schema in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    // Check if the diagnoses table exists and get its structure
    const { data, error } = await supabase
      .rpc('check_table_structure', { table_name: 'diagnoses' });
    
    if (error) {
      console.error('Error checking schema:', error);
      return;
    }
    
    console.log('Diagnoses table structure:');
    console.log(data);
  } catch (err) {
    console.error('Error:', err);
  }
}

checkSchema();
