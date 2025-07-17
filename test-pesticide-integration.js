#!/usr/bin/env node

// Test Real Pesticide API Integration
// Tests the complete flow: AGRIS search -> HTML parsing -> treatment extraction

const https = require('https');

console.log('🧪 Testing Real Pesticide API Integration');
console.log('=========================================\n');

/**
 * Make HTTPS request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Garden-Buddy-Test/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Simple HTML parser for testing (Node.js compatible)
 */
function parseAGRISHTML(htmlContent) {
  const records = [];
  
  try {
    // Remove HTML tags and extract text content
    const textContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log(`📄 Extracted ${textContent.length} characters of text content`);
    
    // Look for agricultural terms
    const agriTerms = ['pesticide', 'fungicide', 'treatment', 'control', 'disease', 'crop', 'dosage', 'application'];
    const foundTerms = agriTerms.filter(term => textContent.toLowerCase().includes(term));
    
    console.log(`🎯 Found agricultural terms: ${foundTerms.join(', ')}`);
    
    // Extract potential dosage patterns
    const dosagePatterns = [
      /(\d+(?:\.\d+)?)\s*(g|kg|ml|l)\/ha/gi,
      /(\d+(?:\.\d+)?)\s*(g|ml)\/l/gi,
      /(\d+(?:\.\d+)?)\s*ppm/gi,
      /(\d+(?:\.\d+)?)\s*(mg|g)\/kg/gi
    ];

    const dosages = [];
    for (const pattern of dosagePatterns) {
      const matches = textContent.match(pattern);
      if (matches) {
        dosages.push(...matches);
      }
    }
    
    console.log(`💊 Found dosage patterns: ${dosages.slice(0, 5).join(', ')}`);
    
    // Extract pesticide names
    const commonPesticides = [
      'mancozeb', 'azoxystrobin', 'tebuconazole', 'propiconazole', 'copper',
      'bordeaux', 'sulfur', 'bacillus', 'trichoderma', 'chlorothalonil'
    ];
    
    const foundPesticides = commonPesticides.filter(pesticide => 
      textContent.toLowerCase().includes(pesticide)
    );
    
    console.log(`🧪 Found pesticides: ${foundPesticides.join(', ')}`);
    
    // Create sample records
    if (foundTerms.length > 0) {
      records.push({
        title: 'AGRIS Research Result',
        abstract: textContent.substring(0, 200) + '...',
        foundTerms,
        dosages: dosages.slice(0, 3),
        pesticides: foundPesticides,
        relevanceScore: foundTerms.length + dosages.length + foundPesticides.length
      });
    }
    
  } catch (error) {
    console.error('❌ Error parsing HTML:', error.message);
  }
  
  return records;
}

/**
 * Test AGRIS search for specific crop/disease combination
 */
async function testAGRISSearch(crop, disease) {
  console.log(`🔍 Testing AGRIS search: ${crop} + ${disease}`);
  console.log('─'.repeat(50));
  
  try {
    const searchQuery = `${crop}+${disease}+pesticide+treatment+dosage`;
    const url = `https://agris.fao.org/search?source=AGRIS&q=${encodeURIComponent(searchQuery)}`;
    
    console.log(`📡 Request URL: ${url}`);
    
    const response = await makeRequest(url);
    
    console.log(`✅ Response Status: ${response.statusCode}`);
    console.log(`📊 Response Size: ${response.data.length} bytes`);
    
    if (response.statusCode === 200) {
      const records = parseAGRISHTML(response.data);
      
      console.log(`📋 Parsed Records: ${records.length}`);
      
      if (records.length > 0) {
        const record = records[0];
        console.log(`🎯 Relevance Score: ${record.relevanceScore}`);
        console.log(`📝 Sample Abstract: ${record.abstract}`);
        
        return {
          success: true,
          records: records.length,
          relevanceScore: record.relevanceScore,
          foundData: {
            terms: record.foundTerms.length,
            dosages: record.dosages.length,
            pesticides: record.pesticides.length
          }
        };
      }
    }
    
    return { success: false, error: `HTTP ${response.statusCode}` };
    
  } catch (error) {
    console.log(`❌ Search failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test multiple crop/disease combinations
 */
async function runComprehensiveTests() {
  console.log('🚀 Running comprehensive pesticide API tests...\n');
  
  const testCases = [
    { crop: 'tomato', disease: 'blight' },
    { crop: 'grape', disease: 'powdery mildew' },
    { crop: 'apple', disease: 'scab' },
    { crop: 'potato', disease: 'late blight' },
    { crop: 'cucumber', disease: 'downy mildew' }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testAGRISSearch(testCase.crop, testCase.disease);
    results.push({
      ...testCase,
      ...result
    });
    
    console.log(''); // Add spacing between tests
    
    // Add delay to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Generate summary report
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('============================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful tests: ${successful.length}/${results.length}`);
  console.log(`❌ Failed tests: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    const avgRelevance = successful.reduce((sum, r) => sum + (r.relevanceScore || 0), 0) / successful.length;
    console.log(`🎯 Average relevance score: ${avgRelevance.toFixed(1)}`);
    
    console.log('\n🏆 BEST PERFORMING SEARCHES:');
    successful
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 3)
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.crop} + ${result.disease} (Score: ${result.relevanceScore})`);
        if (result.foundData) {
          console.log(`   Terms: ${result.foundData.terms}, Dosages: ${result.foundData.dosages}, Pesticides: ${result.foundData.pesticides}`);
        }
      });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED SEARCHES:');
    failed.forEach(result => {
      console.log(`• ${result.crop} + ${result.disease}: ${result.error}`);
    });
  }
  
  console.log('\n💡 INTEGRATION RECOMMENDATIONS:');
  if (successful.length >= 3) {
    console.log('✅ AGRIS integration is viable - good data availability');
    console.log('✅ HTML parsing successfully extracts agricultural data');
    console.log('✅ Dosage patterns and pesticide names are detectable');
    console.log('🔧 Implement caching to reduce API calls');
    console.log('🔧 Add error handling for failed searches');
    console.log('🔧 Consider rate limiting (2-3 seconds between requests)');
  } else {
    console.log('⚠️ AGRIS integration may be challenging - limited data availability');
    console.log('🔧 Consider using curated database as primary source');
    console.log('🔧 Use AGRIS as supplementary research data only');
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Implement the real API integration in pesticideDatabase.ts');
  console.log('2. Add the HTML parser to the Garden Buddy app');
  console.log('3. Test with the existing pesticide recommendation UI');
  console.log('4. Add caching and error handling');
  console.log('5. Populate Supabase with curated data as fallback');
}

// Run the comprehensive tests
runComprehensiveTests().catch(console.error);
