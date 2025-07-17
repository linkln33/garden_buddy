# EU Pesticide Database Data

This directory contains CSV files downloaded from the EU Pesticide Database.

## Required Files:
1. `active-substances.csv` - Active substances approved in the EU
2. `plant-protection-products.csv` - Registered plant protection products
3. `mrl-data.csv` - Maximum Residue Levels data

## Download Instructions:
1. Visit: https://ec.europa.eu/food/plants/pesticides/eu-pesticides-database_en
2. Navigate to "Download data" section
3. Download the CSV files listed above
4. Place them in this directory

## Processing:
After downloading, run:
```bash
node setup-eu-pesticide-integration.js --import
```

## Files in this directory:
- `test-eu-pesticides.csv` - Sample data for testing
- `test-parsed-records.json` - Parsed test data
- `import-log.txt` - Import process log
