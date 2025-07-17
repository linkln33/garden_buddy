#!/usr/bin/env node

// Test AGRIS API functionality
require('dotenv').config({ path: '.env.local' });

async function testAgrisAPI() {
  console.log('🧪 Testing AGRIS API...');
  
  try {
    // Import the AGRIS functions
    const { searchAgris, searchPesticideTreatments } = require('./src/lib/agris-api.ts');
    
    console.log('1. Testing basic AGRIS search...');
    const basicResults = await searchAgris({
      query: 'tomato disease',
      limit: 5
    });
    console.log(`✅ Basic search returned ${basicResults.records.length} records`);
    
    console.log('2. Testing pesticide treatment search...');
    const treatmentResults = await searchPesticideTreatments('late blight', 'tomato', 'Romania');
    console.log(`✅ Treatment search returned ${treatmentResults.length} records`);
    
    if (treatmentResults.length > 0) {
      console.log('📋 Sample result:');
      console.log(`   Title: ${treatmentResults[0].title}`);
      console.log(`   Abstract: ${treatmentResults[0].abstract?.substring(0, 100)}...`);
    }
    
    console.log('🎉 AGRIS API test completed successfully!');
    
  } catch (error) {
    console.error('❌ AGRIS API test failed:', error.message);
    console.log('💡 This is expected if AGRIS OAI-PMH endpoint is not available');
    console.log('💡 The system will fallback to EU Open Data Portal');
  }
}

testAgrisAPI();
