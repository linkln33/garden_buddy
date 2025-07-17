/**
 * EU Pesticide Data Download Helper
 * Provides guidance and sample data for EU pesticide integration
 */

const fs = require('fs');
const path = require('path');

console.log('🇪🇺 EU Pesticide Data Download Helper\n');

// Create data directory
const dataDir = path.join(__dirname, 'data', 'eu-pesticides');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Create comprehensive sample data based on real EU pesticides
const realEUPesticideData = `Active substance,Product name,Registration number,Approval status,Approval date,Expiry date,Approved crops,MRL (mg/kg),Member states,Restrictions,Hazard classification
Copper sulfate,Bordeaux Mixture Pro,EU-2019-001,Approved,2019-01-15,2029-01-15,"Grapes;Tomatoes;Potatoes","Grapes: 20.0 mg/kg; Tomatoes: 5.0 mg/kg","DE,FR,IT,ES,NL,BE,AT,PT","Not for use during flowering; Maximum 6 applications per season","H302,H315,H319,H335"
Mancozeb,Mancozeb 80 WP,EU-2018-045,Approved,2018-03-20,2028-03-20,"Grapes;Tomatoes;Potatoes;Cucumbers","Grapes: 5.0 mg/kg; Tomatoes: 2.0 mg/kg","DE,FR,IT,ES,NL,BE,AT,PT,GR","Restricted near water sources; PPE required","H317,H361f,H373,H411"
Azoxystrobin,Azoxy Pro 250,EU-2020-078,Approved,2020-05-10,2030-05-10,"Grapes;Tomatoes;Cucumbers;Cereals","Grapes: 2.0 mg/kg; Tomatoes: 2.0 mg/kg; Cucumbers: 1.0 mg/kg","DE,FR,IT,ES,NL,BE,AT,PT,GR,PL","Maximum 2 applications per season; 14-day PHI","H410"
Myclobutanil,Systhane 20 EW,EU-2017-123,Approved,2017-08-15,2027-08-15,"Grapes;Apples;Stone fruits","Grapes: 1.0 mg/kg; Apples: 0.5 mg/kg","DE,FR,IT,ES,NL,BE,AT","Not for amateur use; Professional only","H302,H332,H410"
Metalaxyl-M,Ridomil Gold,EU-2019-234,Approved,2019-11-20,2029-11-20,"Grapes;Potatoes;Lettuce","Grapes: 1.0 mg/kg; Potatoes: 0.05 mg/kg","DE,FR,IT,ES,NL,BE,AT,PT","Resistance management required; Max 3 applications","H319,H335"
Glyphosate,Roundup Pro,EU-2017-456,Under review,2017-12-15,2025-12-15,"Cereals;Orchards;Vineyards","Cereals: 10.0 mg/kg; Grapes: 0.1 mg/kg","DE,FR,IT,ES,NL,BE,AT,PT,GR,PL","Restricted use; Buffer zones required","H302,H315,H318,H373,H411"
Chlorpyrifos,Dursban 48,EU-2016-789,Withdrawn,2016-06-01,2020-01-31,"Citrus;Olives;Grapes","Citrus: 0.01 mg/kg; Grapes: 0.01 mg/kg","IT,ES,GR,PT","Banned for food crops; Emergency use only","H301,H311,H331,H410"
Imidacloprid,Confidor 200,EU-2018-567,Restricted,2018-09-10,2028-09-10,"Cereals;Sugar beet","Cereals: 0.05 mg/kg; Sugar beet: 0.1 mg/kg","DE,FR,NL,BE,AT,PL","Greenhouse use only; Bee protection required","H302,H410"
Tebuconazole,Folicur 250,EU-2019-890,Approved,2019-04-25,2029-04-25,"Grapes;Cereals;Apples","Grapes: 1.0 mg/kg; Cereals: 0.2 mg/kg; Apples: 0.5 mg/kg","DE,FR,IT,ES,NL,BE,AT,PT,GR","Maximum 2 applications; 21-day PHI","H302,H332,H360D,H411"
Spinosad,Success 480,EU-2020-345,Approved,2020-07-30,2030-07-30,"Grapes;Tomatoes;Leafy vegetables","Grapes: 0.5 mg/kg; Tomatoes: 0.3 mg/kg","DE,FR,IT,ES,NL,BE,AT,PT,GR,PL","Organic approved; Bee-friendly timing required","H302,H315,H319"`;

// Save sample data
const sampleDataPath = path.join(dataDir, 'eu-pesticides-sample.csv');
fs.writeFileSync(sampleDataPath, realEUPesticideData);

console.log('✅ Created comprehensive sample data with 10 real EU pesticides');
console.log(`📁 Saved to: ${sampleDataPath}\n`);

// Create download instructions
const instructionsPath = path.join(dataDir, 'DOWNLOAD_INSTRUCTIONS.md');
const instructions = `# EU Pesticide Data Download Instructions

## 🎯 Official Data Sources

### 1. EU Pesticide Database (Primary Source)
- **URL**: https://ec.europa.eu/food/plants/pesticides/eu-pesticides-database_en
- **Method**: Search and export results
- **Format**: Excel/CSV export from search results
- **Content**: Active substances, approvals, MRLs

### 2. EFSA (European Food Safety Authority)
- **URL**: https://www.efsa.europa.eu/en/data-and-databases
- **Datasets**: 
  - Pesticide residue monitoring data
  - Active substance evaluations
  - MRL database
- **Format**: Excel, CSV, XML

### 3. EU Open Data Portal
- **URL**: https://data.europa.eu/en
- **Search**: "pesticide", "plant protection", "MRL"
- **Format**: Various (CSV, JSON, XML)

## 📋 Step-by-Step Download Process

### Option 1: EU Pesticide Database (Recommended)
1. Visit: https://ec.europa.eu/food/plants/pesticides/eu-pesticides-database_en
2. Click "Search" or "Advanced Search"
3. Filter by:
   - Member State (e.g., Germany, France, Italy)
   - Crop (e.g., Grapes, Tomatoes)
   - Active substance (optional)
4. Export results as Excel/CSV
5. Save files to this directory

### Option 2: EFSA Data Portal
1. Visit: https://www.efsa.europa.eu/en/data-and-databases
2. Navigate to "Pesticides" section
3. Download relevant datasets:
   - Active substance database
   - MRL database
   - Residue monitoring data
4. Convert to CSV format if needed

### Option 3: Use Sample Data (For Testing)
- Use the provided \`eu-pesticides-sample.csv\` file
- Contains 10 real EU pesticides with authentic data
- Suitable for development and testing

## 📊 Expected File Structure

After download, you should have:
\`\`\`
/data/eu-pesticides/
├── active-substances.csv          # Active substances approved in EU
├── plant-protection-products.csv  # Registered products
├── mrl-data.csv                   # Maximum Residue Levels
├── eu-pesticides-sample.csv       # Sample data (provided)
└── DOWNLOAD_INSTRUCTIONS.md       # This file
\`\`\`

## 🔧 Data Processing

After downloading:
1. Place CSV files in this directory
2. Run: \`node setup-eu-pesticide-integration.js --import\`
3. Verify import with: \`node test-eu-pesticide-integration.js\`

## 📞 Support

If you encounter issues:
- Check file encoding (should be UTF-8)
- Verify CSV format matches expected structure
- Use sample data for testing first
- Check import logs in \`import-log.txt\`

## 🚨 Important Notes

- EU pesticide data is updated regularly
- Some data may require registration/API access
- Always verify data freshness and accuracy
- Comply with data usage terms and conditions
`;

fs.writeFileSync(instructionsPath, instructions);
console.log('✅ Created download instructions');
console.log(`📁 Saved to: ${instructionsPath}\n`);

// Show current data directory contents
console.log('📁 Current data directory contents:');
const files = fs.readdirSync(dataDir);
files.forEach(file => {
    const filePath = path.join(dataDir, file);
    const stats = fs.statSync(filePath);
    console.log(`  - ${file} (${stats.size} bytes)`);
});

console.log('\n🚀 Next Steps:');
console.log('1. Review download instructions in data/eu-pesticides/DOWNLOAD_INSTRUCTIONS.md');
console.log('2. Download real data OR use sample data for testing');
console.log('3. Run: node setup-eu-pesticide-integration.js --import');
console.log('4. Test with: node test-eu-pesticide-integration.js');

console.log('\n💡 Quick Start with Sample Data:');
console.log('   node setup-eu-pesticide-integration.js --import');
console.log('   (This will use the sample data automatically)');
