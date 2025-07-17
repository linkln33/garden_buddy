# EU Pesticide Data Download Instructions

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
- Use the provided `eu-pesticides-sample.csv` file
- Contains 10 real EU pesticides with authentic data
- Suitable for development and testing

## 📊 Expected File Structure

After download, you should have:
```
/data/eu-pesticides/
├── active-substances.csv          # Active substances approved in EU
├── plant-protection-products.csv  # Registered products
├── mrl-data.csv                   # Maximum Residue Levels
├── eu-pesticides-sample.csv       # Sample data (provided)
└── DOWNLOAD_INSTRUCTIONS.md       # This file
```

## 🔧 Data Processing

After downloading:
1. Place CSV files in this directory
2. Run: `node setup-eu-pesticide-integration.js --import`
3. Verify import with: `node test-eu-pesticide-integration.js`

## 📞 Support

If you encounter issues:
- Check file encoding (should be UTF-8)
- Verify CSV format matches expected structure
- Use sample data for testing first
- Check import logs in `import-log.txt`

## 🚨 Important Notes

- EU pesticide data is updated regularly
- Some data may require registration/API access
- Always verify data freshness and accuracy
- Comply with data usage terms and conditions
