#!/usr/bin/env node

// Test Real Pesticide APIs - AGRIS FAO and EU Agri-Food Data Portal
// Based on discovered endpoints from user research

const https = require('https');
const http = require('http');

console.log('🧪 Testing Real Pesticide APIs');
console.log('================================\n');

/**
 * Make HTTP request with proper error handling
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Garden-Buddy-Test/1.0',
        'Accept': 'application/json, text/html, */*',
        ...options.headers
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          contentType: res.headers['content-type'] || 'unknown'
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Test AGRIS FAO Search API
 */
async function testAGRIS() {
  console.log('1️⃣ Testing AGRIS FAO Search API');
  console.log('   URL: https://agris.fao.org/search');
  
  try {
    // Test basic search endpoint
    const searchQuery = 'tomato+powdery+mildew+pesticide';
    const testUrls = [
      `https://agris.fao.org/search?source=AGRIS&q=${searchQuery}`,
      `https://agris.fao.org/search?q=${searchQuery}&format=json`,
      `https://agris.fao.org/search?q=${searchQuery}`,
      'https://agris.fao.org/api/search', // Alternative endpoint
      'https://agris.fao.org/' // Base URL check
    ];
    
    for (const url of testUrls) {
      try {
        console.log(`   Testing: ${url}`);
        const response = await makeRequest(url);
        
        console.log(`   ✅ Status: ${response.statusCode}`);
        console.log(`   📄 Content-Type: ${response.contentType}`);
        console.log(`   📊 Response Size: ${response.data.length} bytes`);
        
        // Check if response contains useful data
        if (response.data.includes('agris') || response.data.includes('search') || response.data.includes('records')) {
          console.log('   🎯 Response contains relevant data');
          
          // Try to parse as JSON
          try {
            const jsonData = JSON.parse(response.data);
            console.log('   📋 JSON Response Keys:', Object.keys(jsonData));
          } catch (e) {
            console.log('   📄 HTML/XML Response (not JSON)');
          }
        }
        
        console.log('   ✅ AGRIS endpoint accessible\n');
        break; // Success, no need to test other URLs
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ AGRIS Test Failed: ${error.message}\n`);
  }
}

/**
 * Test EU Agri-Food Data Portal API
 */
async function testEUAgriData() {
  console.log('2️⃣ Testing EU Agri-Food Data Portal API');
  console.log('   URL: https://agridata.ec.europa.eu/api/farmers');
  
  try {
    const testUrls = [
      'https://agridata.ec.europa.eu/api/farmers?crop=tomato',
      'https://agridata.ec.europa.eu/api/farmers',
      'https://agridata.ec.europa.eu/api/',
      'https://agridata.ec.europa.eu/', // Base URL check
      'https://ec.europa.eu/food/plant/pesticides/eu-pesticides-database/' // Alternative
    ];
    
    for (const url of testUrls) {
      try {
        console.log(`   Testing: ${url}`);
        const response = await makeRequest(url);
        
        console.log(`   ✅ Status: ${response.statusCode}`);
        console.log(`   📄 Content-Type: ${response.contentType}`);
        console.log(`   📊 Response Size: ${response.data.length} bytes`);
        
        // Check if response contains useful data
        if (response.data.includes('api') || response.data.includes('data') || response.data.includes('crop')) {
          console.log('   🎯 Response contains relevant data');
          
          // Try to parse as JSON
          try {
            const jsonData = JSON.parse(response.data);
            console.log('   📋 JSON Response Keys:', Object.keys(jsonData));
          } catch (e) {
            console.log('   📄 HTML/XML Response (not JSON)');
          }
        }
        
        console.log('   ✅ EU Agri-Data endpoint accessible\n');
        break; // Success, no need to test other URLs
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ EU Agri-Data Test Failed: ${error.message}\n`);
  }
}

/**
 * Test EFSA OpenFoodTox API
 */
async function testEFSA() {
  console.log('3️⃣ Testing EFSA OpenFoodTox');
  console.log('   URL: https://www.efsa.europa.eu/');
  
  try {
    const testUrls = [
      'https://www.efsa.europa.eu/en/data-report/chemical-hazards-database',
      'https://www.efsa.europa.eu/api/', // Potential API endpoint
      'https://www.efsa.europa.eu/'
    ];
    
    for (const url of testUrls) {
      try {
        console.log(`   Testing: ${url}`);
        const response = await makeRequest(url);
        
        console.log(`   ✅ Status: ${response.statusCode}`);
        console.log(`   📄 Content-Type: ${response.contentType}`);
        console.log(`   📊 Response Size: ${response.data.length} bytes`);
        
        if (response.statusCode === 200) {
          console.log('   ✅ EFSA endpoint accessible\n');
          break;
        }
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ EFSA Test Failed: ${error.message}\n`);
  }
}

/**
 * Test PPDB Database
 */
async function testPPDB() {
  console.log('4️⃣ Testing PPDB Database (University of Hertfordshire)');
  console.log('   URL: https://sitem.herts.ac.uk/aeru/ppdb/');
  
  try {
    const response = await makeRequest('https://sitem.herts.ac.uk/aeru/ppdb/');
    
    console.log(`   ✅ Status: ${response.statusCode}`);
    console.log(`   📄 Content-Type: ${response.contentType}`);
    console.log(`   📊 Response Size: ${response.data.length} bytes`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ PPDB endpoint accessible\n');
    }
    
  } catch (error) {
    console.log(`   ❌ PPDB Test Failed: ${error.message}\n`);
  }
}

/**
 * Generate API Integration Report
 */
function generateReport() {
  console.log('📊 API Integration Report');
  console.log('========================');
  console.log('');
  console.log('🔍 DISCOVERED ENDPOINTS:');
  console.log('1. AGRIS FAO Search: https://agris.fao.org/search?q=QUERY');
  console.log('2. EU Agri-Food Portal: https://agridata.ec.europa.eu/api/farmers?crop=CROP');
  console.log('3. EFSA OpenFoodTox: https://www.efsa.europa.eu/en/data-report/chemical-hazards-database');
  console.log('4. PPDB Database: https://sitem.herts.ac.uk/aeru/ppdb/');
  console.log('');
  console.log('💡 INTEGRATION STRATEGY:');
  console.log('• Use AGRIS for bibliographic research data (dosages from papers)');
  console.log('• Use EU Agri-Food for real farm application data');
  console.log('• Use EFSA for toxicological safety data');
  console.log('• Use PPDB for pesticide properties');
  console.log('');
  console.log('🛠️ IMPLEMENTATION APPROACH:');
  console.log('• Parse HTML/XML responses if JSON not available');
  console.log('• Implement fallback mechanisms for API failures');
  console.log('• Cache responses to reduce API calls');
  console.log('• Extract dosage patterns using regex');
  console.log('• Combine multiple sources for comprehensive recommendations');
  console.log('');
  console.log('🎯 NEXT STEPS:');
  console.log('1. Implement HTML/XML parsers for each API');
  console.log('2. Create data extraction functions');
  console.log('3. Build caching layer in Supabase');
  console.log('4. Test with real crop/disease combinations');
  console.log('5. Integrate with existing pesticide recommendation system');
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting API connectivity tests...\n');
  
  await testAGRIS();
  await testEUAgriData();
  await testEFSA();
  await testPPDB();
  
  generateReport();
  
  console.log('\n✅ API testing completed!');
  console.log('📋 Check the results above to plan your integration strategy.');
}

// Run the tests
runTests().catch(console.error);
