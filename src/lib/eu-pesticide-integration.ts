/**
 * EU Pesticide Database Integration
 * Downloads and processes official EU pesticide approval data
 * Source: https://ec.europa.eu/food/plants/pesticides/eu-pesticides-database_en
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface EUPesticideRecord {
  activeSubstance: string;
  productName: string;
  registrationNumber: string;
  approvalStatus: 'approved' | 'pending' | 'withdrawn' | 'expired';
  approvalDate: string;
  expiryDate: string;
  approvedCrops: string[];
  mrlValues: {
    crop: string;
    mrl: number;
    unit: string;
  }[];
  memberStates: string[];
  restrictions: string[];
  hazardClassification: string[];
}

export interface EUPesticideCSVRow {
  'Active substance': string;
  'Product name': string;
  'Registration number': string;
  'Approval status': string;
  'Approval date': string;
  'Expiry date': string;
  'Approved crops': string;
  'MRL (mg/kg)': string;
  'Member states': string;
  'Restrictions': string;
  'Hazard classification': string;
}

/**
 * Downloads EU Pesticide Database CSV files
 * Note: This requires manual download from EU website as they don't provide direct API access
 */
export async function downloadEUPesticideCSV(): Promise<string> {
  console.log('📥 EU Pesticide Database CSV Download Instructions:');
  console.log('1. Visit: https://ec.europa.eu/food/plants/pesticides/eu-pesticides-database_en');
  console.log('2. Click "Download data" section');
  console.log('3. Download "Active substances" CSV file');
  console.log('4. Download "Plant protection products" CSV file');
  console.log('5. Place files in /data/eu-pesticides/ directory');
  
  // For now, return instruction message
  // In production, this could be automated with web scraping
  return 'Manual download required - see console instructions';
}

/**
 * Parses EU Pesticide CSV data into structured format
 */
export function parseEUPesticideCSV(csvContent: string): EUPesticideRecord[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const records: EUPesticideRecord[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.replace(/"/g, '') || '';
    });
    
    try {
      const record: EUPesticideRecord = {
        activeSubstance: row['Active substance'] || '',
        productName: row['Product name'] || '',
        registrationNumber: row['Registration number'] || '',
        approvalStatus: normalizeApprovalStatus(row['Approval status']),
        approvalDate: row['Approval date'] || '',
        expiryDate: row['Expiry date'] || '',
        approvedCrops: parseApprovedCrops(row['Approved crops']),
        mrlValues: parseMRLValues(row['MRL (mg/kg)']),
        memberStates: parseMemberStates(row['Member states']),
        restrictions: parseRestrictions(row['Restrictions']),
        hazardClassification: parseHazardClassification(row['Hazard classification'])
      };
      
      records.push(record);
    } catch (error) {
      console.warn(`Failed to parse row ${i}:`, error);
    }
  }
  
  return records;
}

/**
 * Helper function to parse CSV line with proper quote handling
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Normalizes approval status to standard values
 */
function normalizeApprovalStatus(status: string): 'approved' | 'pending' | 'withdrawn' | 'expired' {
  const normalized = status.toLowerCase().trim();
  
  if (normalized.includes('approved') || normalized.includes('authorised')) {
    return 'approved';
  } else if (normalized.includes('pending') || normalized.includes('under review')) {
    return 'pending';
  } else if (normalized.includes('withdrawn') || normalized.includes('cancelled')) {
    return 'withdrawn';
  } else if (normalized.includes('expired') || normalized.includes('not renewed')) {
    return 'expired';
  }
  
  return 'approved'; // Default assumption
}

/**
 * Parses approved crops from semicolon-separated string
 */
function parseApprovedCrops(cropsString: string): string[] {
  if (!cropsString) return [];
  
  return cropsString
    .split(';')
    .map(crop => crop.trim())
    .filter(crop => crop.length > 0)
    .map(crop => standardizeCropName(crop));
}

/**
 * Parses MRL values from formatted string
 */
function parseMRLValues(mrlString: string): { crop: string; mrl: number; unit: string }[] {
  if (!mrlString) return [];
  
  const mrlValues: { crop: string; mrl: number; unit: string }[] = [];
  
  // Example format: "Apples: 0.5 mg/kg; Grapes: 1.0 mg/kg"
  const entries = mrlString.split(';');
  
  for (const entry of entries) {
    const match = entry.match(/(.+?):\s*([0-9.]+)\s*(mg\/kg|ppm)/i);
    if (match) {
      mrlValues.push({
        crop: standardizeCropName(match[1].trim()),
        mrl: parseFloat(match[2]),
        unit: match[3].toLowerCase()
      });
    }
  }
  
  return mrlValues;
}

/**
 * Parses member states from comma-separated string
 */
function parseMemberStates(statesString: string): string[] {
  if (!statesString) return [];
  
  return statesString
    .split(',')
    .map(state => state.trim().toUpperCase())
    .filter(state => state.length > 0);
}

/**
 * Parses restrictions from formatted string
 */
function parseRestrictions(restrictionsString: string): string[] {
  if (!restrictionsString) return [];
  
  return restrictionsString
    .split(';')
    .map(restriction => restriction.trim())
    .filter(restriction => restriction.length > 0);
}

/**
 * Parses hazard classification codes
 */
function parseHazardClassification(hazardString: string): string[] {
  if (!hazardString) return [];
  
  return hazardString
    .split(',')
    .map(hazard => hazard.trim())
    .filter(hazard => hazard.length > 0);
}

/**
 * Standardizes crop names to match our database
 */
function standardizeCropName(cropName: string): string {
  const standardNames: { [key: string]: string } = {
    'grape': 'grapes',
    'vine': 'grapes',
    'vitis vinifera': 'grapes',
    'tomato': 'tomatoes',
    'solanum lycopersicum': 'tomatoes',
    'cucumber': 'cucumbers',
    'cucumis sativus': 'cucumbers',
    'apple': 'apples',
    'malus domestica': 'apples',
    'wheat': 'wheat',
    'triticum aestivum': 'wheat',
    'maize': 'corn',
    'zea mays': 'corn',
    'potato': 'potatoes',
    'solanum tuberosum': 'potatoes'
  };
  
  const normalized = cropName.toLowerCase().trim();
  return standardNames[normalized] || cropName;
}

/**
 * Imports EU pesticide data into Supabase
 */
export async function importEUPesticideData(records: EUPesticideRecord[]): Promise<void> {
  console.log(`📊 Importing ${records.length} EU pesticide records...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const record of records) {
    try {
      // Check if pesticide product already exists
      const { data: existingProduct } = await supabase
        .from('pesticide_products')
        .select('id')
        .eq('name', record.productName)
        .single();
      
      if (existingProduct) {
        // Update existing product with EU data
        await supabase
          .from('pesticide_products')
          .update({
            eu_approved: record.approvalStatus === 'approved',
            eu_approval_date: record.approvalDate || null,
            eu_expiry_date: record.expiryDate || null,
            eu_registration_number: record.registrationNumber,
            eu_member_states: record.memberStates,
            eu_restrictions: record.restrictions,
            eu_hazard_classification: record.hazardClassification,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProduct.id);
      } else {
        // Create new pesticide product
        const { data: newProduct } = await supabase
          .from('pesticide_products')
          .insert({
            name: record.productName,
            active_ingredient: record.activeSubstance,
            type: 'chemical', // Default type
            eu_approved: record.approvalStatus === 'approved',
            eu_approval_date: record.approvalDate || null,
            eu_expiry_date: record.expiryDate || null,
            eu_registration_number: record.registrationNumber,
            eu_member_states: record.memberStates,
            eu_restrictions: record.restrictions,
            eu_hazard_classification: record.hazardClassification,
            description: `EU registered pesticide containing ${record.activeSubstance}`,
            manufacturer: 'EU Registered',
            safety_rating: calculateSafetyRating(record.hazardClassification)
          })
          .select()
          .single();
        
        // Add MRL data
        if (newProduct && record.mrlValues.length > 0) {
          for (const mrl of record.mrlValues) {
            await supabase
              .from('pesticide_dosages')
              .insert({
                pesticide_id: newProduct.id,
                crop: mrl.crop,
                mrl_value: mrl.mrl,
                mrl_unit: mrl.unit,
                eu_compliant: true,
                notes: `EU MRL: ${mrl.mrl} ${mrl.unit}`
              });
          }
        }
      }
      
      successCount++;
    } catch (error) {
      console.error(`Failed to import record: ${record.productName}`, error);
      errorCount++;
    }
  }
  
  console.log(`✅ Import complete: ${successCount} successful, ${errorCount} errors`);
}

/**
 * Calculates safety rating based on hazard classification
 */
function calculateSafetyRating(hazardCodes: string[]): number {
  if (hazardCodes.length === 0) return 3; // Neutral rating
  
  let riskScore = 0;
  
  for (const code of hazardCodes) {
    const upperCode = code.toUpperCase();
    
    // High risk codes
    if (upperCode.includes('H300') || upperCode.includes('H310') || upperCode.includes('H330')) {
      riskScore += 3; // Fatal if swallowed/skin contact/inhaled
    } else if (upperCode.includes('H301') || upperCode.includes('H311') || upperCode.includes('H331')) {
      riskScore += 2; // Toxic if swallowed/skin contact/inhaled
    } else if (upperCode.includes('H302') || upperCode.includes('H312') || upperCode.includes('H332')) {
      riskScore += 1; // Harmful if swallowed/skin contact/inhaled
    }
    
    // Environmental risk
    if (upperCode.includes('H400') || upperCode.includes('H410')) {
      riskScore += 2; // Very toxic to aquatic life
    } else if (upperCode.includes('H401') || upperCode.includes('H411')) {
      riskScore += 1; // Toxic to aquatic life
    }
  }
  
  // Convert to 1-5 scale (1 = high risk, 5 = low risk)
  if (riskScore >= 6) return 1;
  if (riskScore >= 4) return 2;
  if (riskScore >= 2) return 3;
  if (riskScore >= 1) return 4;
  return 5;
}

/**
 * Validates EU pesticide approval for specific crop
 */
export async function validateEUApproval(
  pesticideName: string, 
  crop: string, 
  country: string = 'EU'
): Promise<{
  approved: boolean;
  mrlCompliant: boolean;
  restrictions: string[];
  expiryDate?: string;
}> {
  const { data: product } = await supabase
    .from('pesticide_products')
    .select('*')
    .eq('name', pesticideName)
    .single();
  
  if (!product) {
    return {
      approved: false,
      mrlCompliant: false,
      restrictions: ['Product not found in EU database']
    };
  }
  
  const isApproved = product.eu_approved && 
    (!product.eu_expiry_date || new Date(product.eu_expiry_date) > new Date());
  
  // Check MRL compliance
  const { data: dosageData } = await supabase
    .from('pesticide_dosages')
    .select('*')
    .eq('pesticide_id', product.id)
    .eq('crop', crop)
    .single();
  
  const mrlCompliant = dosageData?.eu_compliant || false;
  
  return {
    approved: isApproved,
    mrlCompliant,
    restrictions: product.eu_restrictions || [],
    expiryDate: product.eu_expiry_date
  };
}

/**
 * Gets EU-approved pesticides for specific crop
 */
export async function getEUApprovedPesticides(crop: string): Promise<any[]> {
  const { data: approvedProducts } = await supabase
    .from('pesticide_products')
    .select(`
      *,
      pesticide_dosages!inner(*)
    `)
    .eq('eu_approved', true)
    .eq('pesticide_dosages.crop', crop)
    .gte('eu_expiry_date', new Date().toISOString());
  
  return approvedProducts || [];
}

/**
 * Main function to setup EU pesticide integration
 */
export async function setupEUPesticideIntegration(): Promise<void> {
  console.log('🇪🇺 Setting up EU Pesticide Database integration...');
  
  // Add EU-specific columns to existing tables if they don't exist
  try {
    await supabase.rpc('add_eu_columns_if_not_exists');
    console.log('✅ Database schema updated for EU integration');
  } catch (error) {
    console.log('ℹ️ EU columns may already exist:', error);
  }
  
  console.log('📋 Next steps:');
  console.log('1. Download CSV files from EU Pesticide Database');
  console.log('2. Run parseEUPesticideCSV() with CSV content');
  console.log('3. Run importEUPesticideData() with parsed records');
  console.log('4. Test with validateEUApproval() function');
}
