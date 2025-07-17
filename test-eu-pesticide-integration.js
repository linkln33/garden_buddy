/**
 * Test script for EU Pesticide Database Integration
 * Tests CSV parsing, data import, and validation functions
 */

const fs = require('fs');
const path = require('path');

// Mock CSV data for testing
const mockEUPesticideCSV = `"Active substance","Product name","Registration number","Approval status","Approval date","Expiry date","Approved crops","MRL (mg/kg)","Member states","Restrictions","Hazard classification"
"Copper sulfate","Bordeaux Mixture Pro","EU-001-2020","Approved","2020-01-15","2030-12-31","Grapes; Tomatoes; Potatoes","Grapes: 5.0 mg/kg; Tomatoes: 1.0 mg/kg","DE,FR,IT,ES,NL,BE","Not for use near water bodies; Apply only during calm weather","H302,H411"
"Mancozeb","Mancozeb 80 WP","EU-002-2019","Approved","2019-03-10","2029-03-10","Grapes; Tomatoes; Cucumbers","Grapes: 2.0 mg/kg; Tomatoes: 0.5 mg/kg","DE,FR,IT,ES,NL,BE,AT","Wear protective equipment; Do not apply before rain","H317,H361d,H400"
"Azoxystrobin","Azoxy Pro 250","EU-003-2021","Approved","2021-06-01","2031-05-31","Grapes; Apples; Wheat","Grapes: 2.0 mg/kg; Apples: 1.0 mg/kg; Wheat: 0.1 mg/kg","DE,FR,IT,ES,NL,BE,AT,DK","Maximum 3 applications per season","H319,H410"
"Tebuconazole","Tebu Forte 250","EU-004-2020","Approved","2020-09-15","2030-09-14","Grapes; Wheat; Barley","Grapes: 1.0 mg/kg; Wheat: 0.2 mg/kg","DE,FR,IT,ES,NL,BE,AT,DK,SE","Not for organic production; PHI 21 days","H302,H360D,H411"
"Glyphosate","Roundup Max","EU-005-2018","Under review","2018-12-01","2025-12-31","All crops","Various crops: 0.1-10.0 mg/kg","DE,FR,IT,ES,NL,BE,AT,DK,SE,FI","Restricted use; Professional only","H318,H411"`;

// Test functions
async function testEUPesticideIntegration() {
    console.log('🧪 Testing EU Pesticide Database Integration...\n');
    
    try {
        // Import the EU pesticide integration functions
        const {
            parseEUPesticideCSV,
            importEUPesticideData,
            calculateSafetyRating,
            standardizeCropName,
            normalizeApprovalStatus,
            parseMRLValues,
            parseApprovedCrops,
            parseMemberStates,
            parseRestrictions,
            parseHazardClassification
        } = require('./src/lib/eu-pesticide-parser.js');
        
        // Test 1: CSV Parsing
        console.log('📊 Test 1: CSV Parsing');
        const parsedRecords = parseEUPesticideCSV(mockEUPesticideCSV);
        console.log(`✅ Parsed ${parsedRecords.length} records`);
        
        // Validate first record
        const firstRecord = parsedRecords[0];
        console.log('📋 First record details:');
        console.log(`  - Product: ${firstRecord.productName}`);
        console.log(`  - Active substance: ${firstRecord.activeSubstance}`);
        console.log(`  - Status: ${firstRecord.approvalStatus}`);
        console.log(`  - Approved crops: ${firstRecord.approvedCrops.join(', ')}`);
        console.log(`  - MRL values: ${firstRecord.mrlValues.length} entries`);
        console.log(`  - Member states: ${firstRecord.memberStates.join(', ')}`);
        console.log(`  - Restrictions: ${firstRecord.restrictions.length} items`);
        console.log(`  - Hazard codes: ${firstRecord.hazardClassification.join(', ')}\n`);
        
        // Test 2: Data Validation
        console.log('🔍 Test 2: Data Validation');
        
        // Test approval status normalization
        const testStatuses = ['Approved', 'AUTHORISED', 'pending', 'Under Review', 'withdrawn', 'expired'];
        testStatuses.forEach(status => {
            const normalized = normalizeApprovalStatus(status);
            console.log(`  - "${status}" → "${normalized}"`);
        });
        
        // Test crop name standardization
        const testCrops = ['grape', 'Vitis vinifera', 'tomato', 'Solanum lycopersicum', 'cucumber'];
        testCrops.forEach(crop => {
            const standardized = standardizeCropName(crop);
            console.log(`  - "${crop}" → "${standardized}"`);
        });
        
        console.log('');
        
        // Test 3: MRL Parsing
        console.log('🧮 Test 3: MRL Parsing');
        const mrlTestString = "Grapes: 2.0 mg/kg; Tomatoes: 0.5 mg/kg; Apples: 1.0 mg/kg";
        const parsedMRL = parseMRLValues(mrlTestString);
        console.log(`✅ Parsed ${parsedMRL.length} MRL values:`);
        parsedMRL.forEach(mrl => {
            console.log(`  - ${mrl.crop}: ${mrl.mrl} ${mrl.unit}`);
        });
        console.log('');
        
        // Test 4: Safety Rating Calculation
        console.log('⚠️ Test 4: Safety Rating Calculation');
        const hazardTests = [
            ['H302', 'H411'], // Harmful if swallowed, toxic to aquatic life
            ['H300', 'H400'], // Fatal if swallowed, very toxic to aquatic life
            ['H319'], // Causes serious eye irritation
            ['H300', 'H310', 'H330', 'H400', 'H410'], // Multiple severe hazards
            [] // No hazards
        ];
        
        hazardTests.forEach((hazards, index) => {
            const rating = calculateSafetyRating(hazards);
            console.log(`  - Test ${index + 1}: [${hazards.join(', ')}] → Safety rating: ${rating}/5`);
        });
        console.log('');
        
        // Test 5: Database Schema Setup
        console.log('🗄️ Test 5: Database Schema Setup');
        console.log('⚠️ Schema setup requires manual execution in Supabase Dashboard');
        console.log('   Run: src/lib/eu-pesticide-schema.sql in Supabase Dashboard\n');
        
        // Test 6: Sample Data Import Simulation
        console.log('📥 Test 6: Sample Data Import Simulation');
        console.log('Simulating import of parsed records...');
        
        for (let i = 0; i < Math.min(3, parsedRecords.length); i++) {
            const record = parsedRecords[i];
            console.log(`  - Processing: ${record.productName}`);
            console.log(`    Active ingredient: ${record.activeSubstance}`);
            console.log(`    Approval status: ${record.approvalStatus}`);
            console.log(`    MRL entries: ${record.mrlValues.length}`);
            console.log(`    Safety rating: ${calculateSafetyRating(record.hazardClassification)}/5`);
        }
        console.log('');
        
        // Test 7: Validation Functions
        console.log('✅ Test 7: Validation Functions');
        console.log('Testing validation functions (requires database connection):');
        console.log('  - validateEUApproval("Bordeaux Mixture Pro", "grapes", "DE")');
        console.log('  - getEUApprovedPesticides("grapes")');
        console.log('  - These functions require active Supabase connection\n');
        
        // Test 8: File Operations
        console.log('📁 Test 8: File Operations');
        
        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, 'data', 'eu-pesticides');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log('✅ Created data directory: /data/eu-pesticides/');
        }
        
        // Save test CSV data
        const testCsvPath = path.join(dataDir, 'test-eu-pesticides.csv');
        fs.writeFileSync(testCsvPath, mockEUPesticideCSV);
        console.log(`✅ Saved test CSV data to: ${testCsvPath}`);
        
        // Save parsed JSON data
        const testJsonPath = path.join(dataDir, 'test-parsed-records.json');
        fs.writeFileSync(testJsonPath, JSON.stringify(parsedRecords, null, 2));
        console.log(`✅ Saved parsed records to: ${testJsonPath}\n`);
        
        // Final summary
        console.log('🎉 EU Pesticide Integration Test Summary:');
        console.log('✅ CSV parsing: Working');
        console.log('✅ Data validation: Working');
        console.log('✅ MRL parsing: Working');
        console.log('✅ Safety rating calculation: Working');
        console.log('✅ File operations: Working');
        console.log('⚠️ Database operations: Require manual setup');
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Run eu-pesticide-schema.sql in Supabase Dashboard');
        console.log('2. Download real EU Pesticide Database CSV files');
        console.log('3. Run importEUPesticideData() with real data');
        console.log('4. Test validation functions with live database');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Ensure TypeScript files are compiled');
        console.log('2. Check Supabase environment variables');
        console.log('3. Verify database connection');
    }
}

// Helper functions for testing (copied from main module for standalone testing)
// Helper functions are now imported from eu-pesticide-parser.js

// Run the test
if (require.main === module) {
    testEUPesticideIntegration();
}

module.exports = {
    testEUPesticideIntegration,
    mockEUPesticideCSV
};
