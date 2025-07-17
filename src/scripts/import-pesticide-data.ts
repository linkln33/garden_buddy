// Data import script for real pesticide databases
// Run with: npx tsx src/scripts/import-pesticide-data.ts

import { searchAgris, searchPesticideTreatments, searchIPMRecommendations, extractPesticideInfo } from '../lib/agris-api';
import { supabase, storeAgrisRecord } from '../lib/supabase-pesticide';

interface ImportProgress {
  totalRecords: number;
  processedRecords: number;
  successfulImports: number;
  errors: string[];
}

/**
 * Import AGRIS data for specific disease-crop combinations
 */
export async function importAgrisData(): Promise<ImportProgress> {
  const progress: ImportProgress = {
    totalRecords: 0,
    processedRecords: 0,
    successfulImports: 0,
    errors: []
  };

  // Common disease-crop combinations to search for
  const searchCombinations = [
    { disease: 'late blight', crop: 'tomato', countries: ['Romania', 'Greece', 'Turkey'] },
    { disease: 'early blight', crop: 'tomato', countries: ['Romania', 'Greece', 'Turkey'] },
    { disease: 'powdery mildew', crop: 'grape', countries: ['Romania', 'Greece', 'Turkey'] },
    { disease: 'downy mildew', crop: 'grape', countries: ['Romania', 'Greece', 'Turkey'] },
    { disease: 'rust', crop: 'wheat', countries: ['Romania', 'Greece', 'Turkey'] },
    { disease: 'septoria', crop: 'wheat', countries: ['Romania', 'Greece', 'Turkey'] },
    { disease: 'late blight', crop: 'potato', countries: ['Romania', 'Greece', 'Turkey'] },
    { disease: 'apple scab', crop: 'apple', countries: ['Romania', 'Greece', 'Turkey'] }
  ];

  console.log('🚀 Starting AGRIS data import...');

  for (const combination of searchCombinations) {
    console.log(`\n📋 Processing: ${combination.disease} on ${combination.crop}`);
    
    for (const country of combination.countries) {
      try {
        console.log(`  🌍 Searching in ${country}...`);
        
        // Search for pesticide treatments
        const treatmentRecords = await searchPesticideTreatments(
          combination.disease,
          combination.crop,
          country
        );

        // Search for IPM recommendations
        const ipmRecords = await searchIPMRecommendations(
          combination.disease,
          combination.crop,
          country
        );

        const allRecords = [...treatmentRecords, ...ipmRecords];
        progress.totalRecords += allRecords.length;

        console.log(`    📊 Found ${allRecords.length} records`);

        for (const record of allRecords) {
          try {
            // Extract pesticide information
            const extractedInfo = extractPesticideInfo(record);
            
            // Calculate relevance score
            const relevanceScore = calculateRelevanceScore(
              record,
              combination.disease,
              combination.crop
            );

            // Store in database
            const storedRecord = await storeAgrisRecord({
              agris_id: record.id,
              title: record.title,
              abstract: record.abstract || '',
              authors: record.authors,
              subjects: record.subjects,
              keywords: record.keywords,
              language: record.language || 'en',
              country: country,
              publication_year: record.year,
              url: record.url,
              extracted_pesticides: extractedInfo.pesticides,
              extracted_dosages: extractedInfo.dosages,
              extracted_methods: extractedInfo.methods,
              relevance_score: relevanceScore,
              processed_at: new Date().toISOString()
            });

            if (storedRecord) {
              progress.successfulImports++;
              console.log(`    ✅ Stored: ${record.title.substring(0, 50)}...`);
            } else {
              progress.errors.push(`Failed to store record: ${record.id}`);
            }

            progress.processedRecords++;
          } catch (error) {
            const errorMsg = `Error processing record ${record.id}: ${error}`;
            progress.errors.push(errorMsg);
            console.error(`    ❌ ${errorMsg}`);
          }
        }

        // Add delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        const errorMsg = `Error searching ${combination.disease}/${combination.crop} in ${country}: ${error}`;
        progress.errors.push(errorMsg);
        console.error(`  ❌ ${errorMsg}`);
      }
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`  Total records found: ${progress.totalRecords}`);
  console.log(`  Records processed: ${progress.processedRecords}`);
  console.log(`  Successful imports: ${progress.successfulImports}`);
  console.log(`  Errors: ${progress.errors.length}`);

  if (progress.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    progress.errors.forEach(error => console.log(`  - ${error}`));
  }

  return progress;
}

/**
 * Calculate relevance score for an AGRIS record
 */
function calculateRelevanceScore(
  record: any,
  targetDisease: string,
  targetCrop: string
): number {
  const text = `${record.title} ${record.abstract || ''} ${record.keywords.join(' ')}`.toLowerCase();
  
  let score = 0;
  
  // Disease match (0-0.4)
  if (text.includes(targetDisease.toLowerCase())) score += 0.4;
  else if (text.includes(targetDisease.split(' ')[0].toLowerCase())) score += 0.2;
  
  // Crop match (0-0.3)
  if (text.includes(targetCrop.toLowerCase())) score += 0.3;
  
  // Treatment keywords (0-0.2)
  const treatmentKeywords = ['pesticide', 'fungicide', 'treatment', 'control', 'management'];
  const treatmentMatches = treatmentKeywords.filter(keyword => text.includes(keyword)).length;
  score += Math.min(treatmentMatches * 0.05, 0.2);
  
  // Dosage information (0-0.1)
  const dosagePattern = /\d+\.?\d*\s*(?:kg|g|ml|l)\/(?:ha|l|hectare)/gi;
  if (dosagePattern.test(text)) score += 0.1;
  
  return Math.min(score, 1.0);
}

/**
 * Process and normalize pesticide data from various sources
 */
export async function processPesticideData(): Promise<void> {
  console.log('🔄 Processing stored AGRIS records...');
  
  try {
    // Get all stored AGRIS records that haven't been processed into pesticide dosages
    const { data: records, error } = await supabase
      .from('agris_records')
      .select('*')
      .gt('relevance_score', 0.5)
      .not('extracted_pesticides', 'eq', '{}')
      .not('extracted_dosages', 'eq', '{}');

    if (error) {
      console.error('Error fetching AGRIS records:', error);
      return;
    }

    console.log(`📊 Found ${records?.length || 0} high-quality records to process`);

    for (const record of records || []) {
      try {
        await processRecordIntoPesticideData(record);
        console.log(`✅ Processed: ${record.title.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ Error processing record ${record.id}:`, error);
      }
    }
    
    console.log('✅ Pesticide data processing completed');
  } catch (error) {
    console.error('Error in processPesticideData:', error);
  }
}

/**
 * Process individual AGRIS record into structured pesticide data
 */
async function processRecordIntoPesticideData(record: any): Promise<void> {
  // This is a simplified version - in practice, you'd need more sophisticated
  // text processing and possibly AI/ML to extract structured data
  
  const { extracted_pesticides, extracted_dosages, extracted_methods } = record;
  
  // Try to match with existing crops and diseases
  const cropMatches = await findMatchingCrops(record.title + ' ' + (record.abstract || ''));
  const diseaseMatches = await findMatchingDiseases(record.title + ' ' + (record.abstract || ''));
  
  for (const crop of cropMatches) {
    for (const disease of diseaseMatches) {
      for (let i = 0; i < extracted_pesticides.length; i++) {
        const pesticide = extracted_pesticides[i];
        const dosage = extracted_dosages[i] || 'Not specified';
        const method = extracted_methods[i] || 'Not specified';
        
        // Check if we already have this combination
        const { data: existing } = await supabase
          .from('pesticide_dosages')
          .select('id')
          .eq('crop_id', crop.id)
          .eq('disease_id', disease.id)
          .ilike('dosage_rate', `%${dosage}%`)
          .limit(1);
        
        if (existing && existing.length > 0) {
          continue; // Skip if already exists
        }
        
        // Create or find pesticide product
        let pesticideProduct = await findOrCreatePesticideProduct(pesticide);
        
        if (pesticideProduct) {
          // Insert pesticide dosage
          const { error } = await supabase
            .from('pesticide_dosages')
            .insert({
              pesticide_id: pesticideProduct.id,
              disease_id: disease.id,
              crop_id: crop.id,
              dosage_rate: dosage,
              dosage_unit: extractUnit(dosage),
              application_method: method,
              region: record.country || 'Unknown',
              source: 'AGRIS',
              source_url: record.url,
              efficacy_rating: record.relevance_score * 5 // Convert to 0-5 scale
            });
          
          if (error) {
            console.error('Error inserting pesticide dosage:', error);
          }
        }
      }
    }
  }
}

/**
 * Find matching crops from text
 */
async function findMatchingCrops(text: string): Promise<any[]> {
  const cropKeywords = ['tomato', 'grape', 'wheat', 'potato', 'apple', 'cucumber'];
  const matches = [];
  
  for (const keyword of cropKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      const { data } = await supabase
        .from('crops')
        .select('*')
        .ilike('name', `%${keyword}%`)
        .limit(1);
      
      if (data && data.length > 0) {
        matches.push(data[0]);
      }
    }
  }
  
  return matches;
}

/**
 * Find matching diseases from text
 */
async function findMatchingDiseases(text: string): Promise<any[]> {
  const diseaseKeywords = ['blight', 'mildew', 'rust', 'scab', 'rot', 'wilt'];
  const matches = [];
  
  for (const keyword of diseaseKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      const { data } = await supabase
        .from('plant_diseases')
        .select('*')
        .ilike('name', `%${keyword}%`)
        .limit(1);
      
      if (data && data.length > 0) {
        matches.push(data[0]);
      }
    }
  }
  
  return matches;
}

/**
 * Find or create pesticide product
 */
async function findOrCreatePesticideProduct(pesticideName: string): Promise<any> {
  // First try to find existing
  const { data: existing } = await supabase
    .from('pesticide_products')
    .select('*')
    .or(`name.ilike.%${pesticideName}%,active_ingredient.ilike.%${pesticideName}%`)
    .limit(1);
  
  if (existing && existing.length > 0) {
    return existing[0];
  }
  
  // Create new pesticide product
  const { data: newProduct, error } = await supabase
    .from('pesticide_products')
    .insert({
      name: pesticideName,
      active_ingredient: pesticideName, // Simplified - would need better parsing
      product_type: guessPesticideType(pesticideName),
      brand_names: [pesticideName],
      eu_approved: false, // Would need to check against EU database
      countries_approved: [],
      toxicity_class: 'Unknown'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating pesticide product:', error);
    return null;
  }
  
  return newProduct;
}

/**
 * Guess pesticide type from name
 */
function guessPesticideType(name: string): 'fungicide' | 'insecticide' | 'herbicide' {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('fungi') || lowerName.includes('mancozeb') || 
      lowerName.includes('copper') || lowerName.includes('azoxy')) {
    return 'fungicide';
  } else if (lowerName.includes('insect') || lowerName.includes('pyrethrin') ||
             lowerName.includes('malathion')) {
    return 'insecticide';
  } else {
    return 'herbicide';
  }
}

/**
 * Extract unit from dosage string
 */
function extractUnit(dosage: string): string {
  const match = dosage.match(/([a-zA-Z]+\/[a-zA-Z]+)/);
  return match ? match[1] : 'unknown';
}

// Main execution
if (require.main === module) {
  console.log('🌱 Garden Buddy - Pesticide Data Import');
  console.log('=====================================\n');
  
  importAgrisData()
    .then(() => processPesticideData())
    .then(() => {
      console.log('\n🎉 Data import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Data import failed:', error);
      process.exit(1);
    });
}
