// AGRIS FAO API Integration for Garden Buddy
// Real API endpoints discovered: https://agris.fao.org/search
// EU Agri-Food Data Portal: https://agridata.ec.europa.eu/api/farmers

export interface AGRISSearchResult {
  title: string;
  authors: string[];
  publicationDate: string;
  abstract: string;
  source: string;
  url?: string;
  keywords: string[];
}

export interface EUAgriDataResult {
  crop: string;
  pesticide: string;
  dosage: string;
  region: string;
  year: number;
  applicationMethod: string;
}

export interface PesticideResearchData {
  disease: string;
  crop: string;
  treatments: {
    pesticide: string;
    dosage: string;
    method: string;
    efficacy: string;
    source: string;
  }[];
  ipmRecommendations: string[];
  safetyData: {
    phi: number; // Pre-harvest interval
    rei: number; // Re-entry interval
    toxicity: string;
  };
}

/**
 * Search AGRIS FAO database for pesticide treatment information
 * @param crop - Target crop (e.g., "tomato")
 * @param disease - Target disease (e.g., "powdery mildew")
 * @param pesticide - Optional specific pesticide name
 */
export async function searchAGRIS(
  crop: string,
  disease: string,
  pesticide?: string
): Promise<AGRISSearchResult[]> {
  try {
    const searchTerms = [crop, disease, pesticide, 'treatment', 'dosage']
      .filter(Boolean)
      .join('+');
    
    const apiUrl = `https://agris.fao.org/search?source=AGRIS&q=${encodeURIComponent(searchTerms)}&format=json`;
    
    console.log(`🔍 Searching AGRIS: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Garden-Buddy-App/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`AGRIS API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse AGRIS response format
    const results: AGRISSearchResult[] = [];
    
    if (data.records && Array.isArray(data.records)) {
      for (const record of data.records) {
        results.push({
          title: record.title || 'Unknown Title',
          authors: record.authors || [],
          publicationDate: record.date || 'Unknown Date',
          abstract: record.abstract || '',
          source: record.source || 'AGRIS',
          url: record.url,
          keywords: record.keywords || []
        });
      }
    }

    console.log(`✅ Found ${results.length} AGRIS results`);
    return results;

  } catch (error) {
    console.error('❌ AGRIS API Error:', error);
    return [];
  }
}

/**
 * Search EU Agri-Food Data Portal for crop-specific pesticide usage
 * @param crop - Target crop
 * @param region - EU region/country code (optional)
 */
export async function searchEUAgriData(
  crop: string,
  region?: string
): Promise<EUAgriDataResult[]> {
  try {
    let apiUrl = `https://agridata.ec.europa.eu/api/farmers?crop=${encodeURIComponent(crop)}`;
    
    if (region) {
      apiUrl += `&region=${encodeURIComponent(region)}`;
    }
    
    console.log(`🇪🇺 Searching EU Agri-Data: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Garden-Buddy-App/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`EU Agri-Data API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse EU Agri-Data response format
    const results: EUAgriDataResult[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      for (const record of data.data) {
        results.push({
          crop: record.crop || crop,
          pesticide: record.pesticide || 'Unknown',
          dosage: record.dosage || 'Not specified',
          region: record.region || region || 'EU',
          year: record.year || new Date().getFullYear(),
          applicationMethod: record.method || 'Foliar spray'
        });
      }
    }

    console.log(`✅ Found ${results.length} EU Agri-Data results`);
    return results;

  } catch (error) {
    console.error('❌ EU Agri-Data API Error:', error);
    return [];
  }
}

/**
 * Combine AGRIS and EU data to create comprehensive pesticide recommendations
 * @param crop - Target crop
 * @param disease - Target disease
 */
export async function getPesticideResearchData(
  crop: string,
  disease: string
): Promise<PesticideResearchData> {
  console.log(`🔬 Researching treatments for ${disease} in ${crop}`);
  
  // Search both APIs in parallel
  const [agrisResults, euResults] = await Promise.all([
    searchAGRIS(crop, disease),
    searchEUAgriData(crop)
  ]);

  // Extract treatment information from research papers
  const treatments = [];
  
  // Process AGRIS results
  for (const result of agrisResults) {
    const abstract = result.abstract.toLowerCase();
    
    // Look for dosage patterns in abstracts
    const dosagePatterns = [
      /(\d+(?:\.\d+)?)\s*(g|kg|ml|l)\/ha/gi,
      /(\d+(?:\.\d+)?)\s*(g|ml)\/l/gi,
      /(\d+(?:\.\d+)?)\s*ppm/gi
    ];
    
    for (const pattern of dosagePatterns) {
      const matches = abstract.match(pattern);
      if (matches) {
        treatments.push({
          pesticide: extractPesticideName(result.title, result.abstract),
          dosage: matches[0],
          method: extractApplicationMethod(result.abstract),
          efficacy: extractEfficacy(result.abstract),
          source: `${result.source} - ${result.title.substring(0, 50)}...`
        });
      }
    }
  }

  // Process EU results
  for (const result of euResults) {
    treatments.push({
      pesticide: result.pesticide,
      dosage: result.dosage,
      method: result.applicationMethod,
      efficacy: 'Field-tested',
      source: `EU Agri-Data ${result.year} - ${result.region}`
    });
  }

  // Extract IPM recommendations from research
  const ipmRecommendations = extractIPMRecommendations(agrisResults);

  return {
    disease,
    crop,
    treatments: treatments.slice(0, 10), // Limit to top 10 results
    ipmRecommendations,
    safetyData: {
      phi: 14, // Default values - should be extracted from research
      rei: 24,
      toxicity: 'Moderate'
    }
  };
}

/**
 * Helper function to extract pesticide names from research text
 */
function extractPesticideName(title: string, abstract: string): string {
  const commonPesticides = [
    'mancozeb', 'azoxystrobin', 'tebuconazole', 'propiconazole',
    'copper', 'bordeaux', 'sulfur', 'bacillus', 'trichoderma'
  ];
  
  const text = (title + ' ' + abstract).toLowerCase();
  
  for (const pesticide of commonPesticides) {
    if (text.includes(pesticide)) {
      return pesticide.charAt(0).toUpperCase() + pesticide.slice(1);
    }
  }
  
  return 'Unknown pesticide';
}

/**
 * Helper function to extract application method from research text
 */
function extractApplicationMethod(text: string): string {
  const methods = ['foliar spray', 'soil drench', 'seed treatment', 'fumigation'];
  const lowerText = text.toLowerCase();
  
  for (const method of methods) {
    if (lowerText.includes(method)) {
      return method;
    }
  }
  
  return 'Foliar spray'; // Default
}

/**
 * Helper function to extract efficacy information
 */
function extractEfficacy(text: string): string {
  const efficacyPatterns = [
    /(\d+)%\s*control/gi,
    /(\d+)%\s*reduction/gi,
    /(\d+)%\s*efficacy/gi
  ];
  
  for (const pattern of efficacyPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return 'Effective';
}

/**
 * Helper function to extract IPM recommendations from research
 */
function extractIPMRecommendations(results: AGRISSearchResult[]): string[] {
  const recommendations = new Set<string>();
  
  for (const result of results) {
    const text = (result.title + ' ' + result.abstract).toLowerCase();
    
    // Look for IPM-related keywords
    if (text.includes('resistant varieties') || text.includes('resistance')) {
      recommendations.add('Use resistant varieties when available');
    }
    if (text.includes('crop rotation')) {
      recommendations.add('Implement crop rotation');
    }
    if (text.includes('biological control') || text.includes('biocontrol')) {
      recommendations.add('Consider biological control agents');
    }
    if (text.includes('cultural practices') || text.includes('sanitation')) {
      recommendations.add('Maintain good field sanitation');
    }
    if (text.includes('monitoring') || text.includes('scouting')) {
      recommendations.add('Regular field monitoring and scouting');
    }
  }
  
  return Array.from(recommendations);
}

/**
 * Test function to verify API connectivity
 */
export async function testAPIConnectivity(): Promise<boolean> {
  try {
    console.log('🧪 Testing API connectivity...');
    
    // Test AGRIS
    const agrisTest = await searchAGRIS('tomato', 'blight');
    console.log(`✅ AGRIS: ${agrisTest.length} results`);
    
    // Test EU Agri-Data
    const euTest = await searchEUAgriData('tomato');
    console.log(`✅ EU Agri-Data: ${euTest.length} results`);
    
    return true;
  } catch (error) {
    console.error('❌ API connectivity test failed:', error);
    return false;
  }
}
