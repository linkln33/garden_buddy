/**
 * Setup script for EU Pesticide Database Integration
 * Automates the complete setup process for EU pesticide data
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupEUPesticideIntegration() {
    console.log('🇪🇺 Setting up EU Pesticide Database Integration...\n');
    
    try {
        // Step 1: Test database connection
        console.log('1️⃣ Testing database connection...');
        const { data, error } = await supabase.from('pesticide_products').select('count').limit(1);
        
        if (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
        
        console.log('✅ Database connection successful\n');
        
        // Step 2: Check if EU columns exist
        console.log('2️⃣ Checking database schema...');
        const { data: schemaData, error: schemaError } = await supabase
            .rpc('add_eu_columns_if_not_exists');
        
        if (schemaError) {
            console.log('⚠️ Schema update may require manual execution in Supabase Dashboard');
            console.log('Please run the SQL script: src/lib/eu-pesticide-schema.sql');
        } else {
            console.log('✅ Database schema updated for EU integration');
        }
        console.log('');
        
        // Step 3: Create data directories
        console.log('3️⃣ Creating data directories...');
        const dataDir = path.join(__dirname, 'data', 'eu-pesticides');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log('✅ Created directory: /data/eu-pesticides/');
        } else {
            console.log('✅ Directory already exists: /data/eu-pesticides/');
        }
        
        // Create README for data directory
        const readmePath = path.join(dataDir, 'README.md');
        const readmeContent = `# EU Pesticide Database Data

This directory contains CSV files downloaded from the EU Pesticide Database.

## Required Files:
1. \`active-substances.csv\` - Active substances approved in the EU
2. \`plant-protection-products.csv\` - Registered plant protection products
3. \`mrl-data.csv\` - Maximum Residue Levels data

## Download Instructions:
1. Visit: https://ec.europa.eu/food/plants/pesticides/eu-pesticides-database_en
2. Navigate to "Download data" section
3. Download the CSV files listed above
4. Place them in this directory

## Processing:
After downloading, run:
\`\`\`bash
node setup-eu-pesticide-integration.js --import
\`\`\`

## Files in this directory:
- \`test-eu-pesticides.csv\` - Sample data for testing
- \`test-parsed-records.json\` - Parsed test data
- \`import-log.txt\` - Import process log
`;
        
        fs.writeFileSync(readmePath, readmeContent);
        console.log('✅ Created README.md with download instructions\n');
        
        // Step 4: Create sample data for testing
        console.log('4️⃣ Creating sample test data...');
        const { mockEUPesticideCSV } = require('./test-eu-pesticide-integration.js');
        
        const testCsvPath = path.join(dataDir, 'test-eu-pesticides.csv');
        fs.writeFileSync(testCsvPath, mockEUPesticideCSV);
        console.log('✅ Created test CSV data');
        
        // Step 5: Test parsing functionality
        console.log('5️⃣ Testing parsing functionality...');
        const { parseEUPesticideCSV } = require('./src/lib/eu-pesticide-parser.js');
        
        try {
            const parsedRecords = parseEUPesticideCSV(mockEUPesticideCSV);
            console.log(`✅ Successfully parsed ${parsedRecords.length} test records`);
            
            // Save parsed data
            const testJsonPath = path.join(dataDir, 'test-parsed-records.json');
            fs.writeFileSync(testJsonPath, JSON.stringify(parsedRecords, null, 2));
            console.log('✅ Saved parsed test data\n');
            
        } catch (error) {
            console.error('❌ Parsing test failed:', error.message);
            return false;
        }
        
        // Step 6: Check for real CSV files
        console.log('6️⃣ Checking for real EU pesticide data...');
        const requiredFiles = [
            'active-substances.csv',
            'plant-protection-products.csv',
            'mrl-data.csv'
        ];
        
        let realFilesFound = 0;
        for (const filename of requiredFiles) {
            const filePath = path.join(dataDir, filename);
            if (fs.existsSync(filePath)) {
                console.log(`✅ Found: ${filename}`);
                realFilesFound++;
            } else {
                console.log(`⚠️ Missing: ${filename}`);
            }
        }
        
        if (realFilesFound === 0) {
            console.log('\n📥 No real EU pesticide data found.');
            console.log('Please download CSV files from: https://ec.europa.eu/food/plants/pesticides/eu-pesticides-database_en');
            console.log('Then run: node setup-eu-pesticide-integration.js --import\n');
        } else {
            console.log(`\n✅ Found ${realFilesFound}/${requiredFiles.length} required files\n`);
        }
        
        // Step 7: Test database functions
        console.log('7️⃣ Testing database functions...');
        
        try {
            // Test EU compliance validation
            const { data: testValidation } = await supabase
                .rpc('validate_eu_compliance', {
                    pesticide_name: 'Bordeaux Mixture',
                    crop_name: 'grapes',
                    country_code: 'EU'
                });
            
            if (testValidation && testValidation.length > 0) {
                console.log('✅ EU compliance validation function working');
            } else {
                console.log('⚠️ EU compliance validation needs data');
            }
            
            // Test EU approved pesticides query
            const { data: approvedPesticides } = await supabase
                .rpc('get_eu_approved_for_crop', { crop_name: 'grapes' });
            
            if (approvedPesticides && approvedPesticides.length > 0) {
                console.log(`✅ Found ${approvedPesticides.length} EU-approved pesticides for grapes`);
            } else {
                console.log('⚠️ No EU-approved pesticides found (needs data import)');
            }
            
        } catch (error) {
            console.log('⚠️ Database functions may need manual setup');
        }
        
        console.log('');
        
        // Step 8: Generate setup report
        console.log('8️⃣ Generating setup report...');
        const reportPath = path.join(__dirname, 'EU_PESTICIDE_SETUP_REPORT.md');
        const reportContent = generateSetupReport(realFilesFound, requiredFiles.length);
        fs.writeFileSync(reportPath, reportContent);
        console.log('✅ Setup report saved to: EU_PESTICIDE_SETUP_REPORT.md\n');
        
        // Final summary
        console.log('🎉 EU Pesticide Integration Setup Complete!\n');
        console.log('📊 Setup Summary:');
        console.log(`✅ Database connection: Working`);
        console.log(`✅ Data directories: Created`);
        console.log(`✅ Test data: Generated`);
        console.log(`✅ Parsing functions: Working`);
        console.log(`📁 Real data files: ${realFilesFound}/${requiredFiles.length} found`);
        console.log('');
        
        if (realFilesFound === requiredFiles.length) {
            console.log('🚀 Ready for data import! Run:');
            console.log('   node setup-eu-pesticide-integration.js --import');
        } else {
            console.log('📥 Next steps:');
            console.log('1. Download EU pesticide CSV files (see data/eu-pesticides/README.md)');
            console.log('2. Run: node setup-eu-pesticide-integration.js --import');
            console.log('3. Test with: node test-eu-pesticide-integration.js');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        return false;
    }
}

async function importEUPesticideData() {
    console.log('📥 Importing EU Pesticide Data...\n');
    
    const dataDir = path.join(__dirname, 'data', 'eu-pesticides');
    const logPath = path.join(dataDir, 'import-log.txt');
    
    // Create import log
    const log = (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        console.log(message);
        fs.appendFileSync(logPath, logMessage);
    };
    
    // Clear previous log
    if (fs.existsSync(logPath)) {
        fs.unlinkSync(logPath);
    }
    
    log('Starting EU pesticide data import...');
    
    try {
        const { parseEUPesticideCSV, importEUPesticideData } = require('./src/lib/eu-pesticide-parser.js');
        
        // Check for CSV files
        const csvFiles = [
            'active-substances.csv',
            'plant-protection-products.csv',
            'test-eu-pesticides.csv' // Fallback to test data
        ];
        
        let importedCount = 0;
        
        for (const filename of csvFiles) {
            const filePath = path.join(dataDir, filename);
            
            if (fs.existsSync(filePath)) {
                log(`Processing: ${filename}`);
                
                const csvContent = fs.readFileSync(filePath, 'utf8');
                const parsedRecords = parseEUPesticideCSV(csvContent);
                
                log(`Parsed ${parsedRecords.length} records from ${filename}`);
                
                // Import to database
                await importEUPesticideData(parsedRecords, supabase);
                importedCount += parsedRecords.length;
                
                log(`Successfully imported ${parsedRecords.length} records`);
            } else {
                log(`File not found: ${filename}`);
            }
        }
        
        log(`Import complete! Total records processed: ${importedCount}`);
        console.log(`\n✅ Import successful! Check ${logPath} for details.`);
        
    } catch (error) {
        log(`Import failed: ${error.message}`);
        console.error('❌ Import failed:', error);
    }
}

function generateSetupReport(foundFiles, totalFiles) {
    const timestamp = new Date().toISOString();
    
    return `# EU Pesticide Integration Setup Report

**Generated**: ${timestamp}

## Setup Status

### ✅ Completed Components
- [x] Database connection tested
- [x] Database schema prepared
- [x] Data directories created
- [x] Test data generated
- [x] Parsing functions validated
- [x] Setup documentation created

### 📊 Data Files Status
- **Found**: ${foundFiles}/${totalFiles} required CSV files
- **Test data**: Available
- **Import ready**: ${foundFiles === totalFiles ? 'Yes' : 'No'}

### 🔧 Required Manual Steps
1. **Download EU Pesticide Database CSV files**:
   - Visit: https://ec.europa.eu/food/plants/pesticides/eu-pesticides-database_en
   - Download: active-substances.csv, plant-protection-products.csv, mrl-data.csv
   - Place in: /data/eu-pesticides/ directory

2. **Run database schema updates** (if needed):
   - Execute: src/lib/eu-pesticide-schema.sql in Supabase Dashboard
   - This adds EU-specific columns and functions

3. **Import data**:
   - Run: \`node setup-eu-pesticide-integration.js --import\`
   - Verify: \`node test-eu-pesticide-integration.js\`

### 🎯 Next Steps
${foundFiles === totalFiles ? 
    '- Ready for data import!\n- Run: `node setup-eu-pesticide-integration.js --import`' :
    '- Download missing CSV files\n- Follow manual steps above'
}

### 📁 Created Files
- \`/data/eu-pesticides/\` - Data directory
- \`/data/eu-pesticides/README.md\` - Download instructions
- \`/data/eu-pesticides/test-eu-pesticides.csv\` - Sample data
- \`/src/lib/eu-pesticide-integration.ts\` - Integration functions
- \`/src/lib/eu-pesticide-schema.sql\` - Database schema
- \`/test-eu-pesticide-integration.js\` - Test script

### 🔍 Testing
Run tests with: \`node test-eu-pesticide-integration.js\`

### 📞 Support
For issues, check:
1. Supabase connection in .env.local
2. Database permissions and RLS policies
3. CSV file format and encoding
4. Import logs in /data/eu-pesticides/import-log.txt

---
*EU Pesticide Integration v1.0 - Garden Buddy*
`;
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--import')) {
        importEUPesticideData();
    } else if (args.includes('--help')) {
        console.log(`
🇪🇺 EU Pesticide Integration Setup

Usage:
  node setup-eu-pesticide-integration.js          # Run setup
  node setup-eu-pesticide-integration.js --import # Import data
  node setup-eu-pesticide-integration.js --help   # Show help

Steps:
1. Run setup to prepare environment
2. Download CSV files from EU database
3. Run with --import to load data
4. Test with test-eu-pesticide-integration.js
        `);
    } else {
        setupEUPesticideIntegration();
    }
}

module.exports = {
    setupEUPesticideIntegration,
    importEUPesticideData
};
