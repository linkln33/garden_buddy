// AGRIS FAO API Integration
// Documentation: https://agris.fao.org/api
// International database of agriculture studies and recommendations

export interface AgrisRecord {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  subjects: string[];
  language: string;
  country: string;
  year: number;
  url?: string;
  keywords: string[];
}

export interface AgrisSearchParams {
  query: string;
  country?: string;
  language?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

export interface AgrisResponse {
  records: AgrisRecord[];
  total: number;
  offset: number;
  limit: number;
}

// AGRIS doesn't have a public REST API, but we can use their search interface
// Alternative: Use OAI-PMH protocol or web scraping approach
const AGRIS_BASE_URL = 'https://agris.fao.org';
const AGRIS_SEARCH_URL = 'https://agris.fao.org/search.do';

// Alternative APIs for pesticide data
const ALTERNATIVE_APIS = {
  // EU Open Data Portal for pesticides
  EU_PESTICIDES: 'https://data.europa.eu/api/hub/search/datasets',
  // OECD Agriculture data
  OECD_AGRI: 'https://stats.oecd.org/restsdmx/sdmx.ashx/GetData',
  // World Bank Agriculture data
  WORLD_BANK: 'https://api.worldbank.org/v2/country/all/indicator'
};

/**
 * Search AGRIS database using OAI-PMH protocol
 * AGRIS supports OAI-PMH for metadata harvesting
 * @param params Search parameters
 * @returns Promise with search results
 */
export async function searchAgris(params: AgrisSearchParams): Promise<AgrisResponse> {
  try {
    // Use OAI-PMH ListRecords with search parameters
    const oaiParams = new URLSearchParams({
      'verb': 'ListRecords',
      'metadataPrefix': 'oai_dc',
      'set': 'agriculture' // AGRIS agriculture set
    });
    
    // Add search filters if available
    if (params.year) {
      oaiParams.append('from', `${params.year}-01-01`);
      oaiParams.append('until', `${params.year}-12-31`);
    }
    
    const oaiUrl = `${AGRIS_BASE_URL}/oai?${oaiParams.toString()}`;
    
    const response = await fetch(oaiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, text/xml',
        'User-Agent': 'Garden-Buddy-App/1.0 (mailto:support@garden-buddy.com)'
      }
    });

    if (!response.ok) {
      // Fallback to alternative approach using EU Open Data
      return await searchEUPesticides(params);
    }

    const xmlText = await response.text();
    const records = parseOAIResponse(xmlText, params);
    
    return {
      records,
      total: records.length,
      offset: params.offset || 0,
      limit: params.limit || 20
    };
  } catch (error) {
    console.error('Error fetching from AGRIS OAI-PMH:', error);
    // Fallback to EU Open Data Portal
    return await searchEUPesticides(params);
  }
}

/**
 * Parse OAI-PMH XML response and extract relevant records
 * @param xmlText XML response from OAI-PMH
 * @param params Original search parameters for filtering
 * @returns Array of parsed AGRIS records
 */
function parseOAIResponse(xmlText: string, params: AgrisSearchParams): AgrisRecord[] {
  const records: AgrisRecord[] = [];
  
  try {
    // Simple XML parsing for OAI-PMH Dublin Core records
    const recordMatches = xmlText.match(/<record[^>]*>([\s\S]*?)<\/record>/g) || [];
    
    for (const recordXml of recordMatches.slice(0, params.limit || 20)) {
      const titleMatch = recordXml.match(/<dc:title[^>]*>([\s\S]*?)<\/dc:title>/);
      const descMatch = recordXml.match(/<dc:description[^>]*>([\s\S]*?)<\/dc:description>/);
      const subjectMatches = recordXml.match(/<dc:subject[^>]*>([\s\S]*?)<\/dc:subject>/g) || [];
      const creatorMatches = recordXml.match(/<dc:creator[^>]*>([\s\S]*?)<\/dc:creator>/g) || [];
      const dateMatch = recordXml.match(/<dc:date[^>]*>(\d{4})<\/dc:date>/);
      const identifierMatch = recordXml.match(/<dc:identifier[^>]*>([\s\S]*?)<\/dc:identifier>/);
      
      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].trim();
        const description = descMatch ? descMatch[1].trim() : '';
        
        // Filter by query terms
        const searchText = `${title} ${description}`.toLowerCase();
        if (searchText.includes(params.query.toLowerCase())) {
          records.push({
            id: identifierMatch ? identifierMatch[1].trim() : `agris-${Date.now()}-${Math.random()}`,
            title,
            abstract: description,
            authors: creatorMatches.map(m => m.replace(/<[^>]*>/g, '').trim()),
            subjects: subjectMatches.map(m => m.replace(/<[^>]*>/g, '').trim()),
            language: params.language || 'en',
            country: params.country || 'Unknown',
            year: dateMatch ? parseInt(dateMatch[1]) : new Date().getFullYear(),
            url: identifierMatch ? identifierMatch[1].trim() : undefined,
            keywords: subjectMatches.map(m => m.replace(/<[^>]*>/g, '').trim())
          });
        }
      }
    }
  } catch (error) {
    console.error('Error parsing OAI-PMH response:', error);
  }
  
  return records;
}

/**
 * Search EU Open Data Portal for pesticide information as fallback
 * @param params Search parameters
 * @returns Promise with search results
 */
async function searchEUPesticides(params: AgrisSearchParams): Promise<AgrisResponse> {
  try {
    const searchParams = new URLSearchParams({
      'q': `pesticide ${params.query}`,
      'limit': (params.limit || 20).toString(),
      'offset': (params.offset || 0).toString(),
      'format': 'json'
    });
    
    const response = await fetch(`${ALTERNATIVE_APIS.EU_PESTICIDES}?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Garden-Buddy-App/1.0'
      }
    });
    
    if (!response.ok) {
      // Return mock data if all APIs fail
      return {
        records: [],
        total: 0,
        offset: params.offset || 0,
        limit: params.limit || 20
      };
    }
    
    const data = await response.json();
    const records: AgrisRecord[] = [];
    
    // Parse EU Open Data response
    if (data.result && data.result.results) {
      for (const item of data.result.results) {
        records.push({
          id: item.id || `eu-${Date.now()}-${Math.random()}`,
          title: item.title || 'EU Pesticide Data',
          abstract: item.notes || item.description || '',
          authors: [item.organization?.title || 'European Commission'],
          subjects: item.tags?.map((tag: any) => tag.name) || [],
          language: 'en',
          country: 'EU',
          year: new Date(item.metadata_created || Date.now()).getFullYear(),
          url: item.url,
          keywords: item.tags?.map((tag: any) => tag.name) || []
        });
      }
    }
    
    return {
      records,
      total: data.result?.count || records.length,
      offset: params.offset || 0,
      limit: params.limit || 20
    };
  } catch (error) {
    console.error('Error fetching from EU Open Data:', error);
    // Return empty results as final fallback
    return {
      records: [],
      total: 0,
      offset: params.offset || 0,
      limit: params.limit || 20
    };
  }
}

/**
 * Search for pesticide treatments for specific disease and crop
 * @param disease Disease name (e.g., "late blight", "powdery mildew")
 * @param crop Crop name (e.g., "tomato", "grape")
 * @param country Optional country filter (e.g., "Romania", "Greece")
 * @returns Promise with relevant treatment records
 */
export async function searchPesticideTreatments(
  disease: string, 
  crop: string, 
  country?: string
): Promise<AgrisRecord[]> {
  const query = `${disease} ${crop} pesticide treatment control`;
  
  try {
    const results = await searchAgris({
      query,
      country,
      language: 'en',
      limit: 50
    });

    // Filter results for more relevant records
    const relevantRecords = results.records.filter(record => {
      const text = `${record.title} ${record.abstract} ${record.keywords.join(' ')}`.toLowerCase();
      const diseaseMatch = text.includes(disease.toLowerCase());
      const cropMatch = text.includes(crop.toLowerCase());
      const treatmentMatch = text.includes('pesticide') || text.includes('fungicide') || 
                           text.includes('treatment') || text.includes('control');
      
      return diseaseMatch && cropMatch && treatmentMatch;
    });

    return relevantRecords;
  } catch (error) {
    console.error('Error searching pesticide treatments:', error);
    return [];
  }
}

/**
 * Search for IPM (Integrated Pest Management) recommendations
 * @param disease Disease name
 * @param crop Crop name
 * @param country Optional country filter
 * @returns Promise with IPM-related records
 */
export async function searchIPMRecommendations(
  disease: string, 
  crop: string, 
  country?: string
): Promise<AgrisRecord[]> {
  const query = `${disease} ${crop} IPM "integrated pest management" biological control`;
  
  try {
    const results = await searchAgris({
      query,
      country,
      language: 'en',
      limit: 30
    });

    // Filter for IPM-specific content
    const ipmRecords = results.records.filter(record => {
      const text = `${record.title} ${record.abstract} ${record.keywords.join(' ')}`.toLowerCase();
      const ipmMatch = text.includes('ipm') || text.includes('integrated pest management') ||
                      text.includes('biological control') || text.includes('sustainable');
      
      return ipmMatch;
    });

    return ipmRecords;
  } catch (error) {
    console.error('Error searching IPM recommendations:', error);
    return [];
  }
}

/**
 * Get country-specific agricultural recommendations
 * @param country Country name (e.g., "Romania", "Greece", "Turkey")
 * @param topic Topic (e.g., "plant protection", "crop diseases")
 * @returns Promise with country-specific records
 */
export async function getCountryRecommendations(
  country: string, 
  topic: string = 'plant protection'
): Promise<AgrisRecord[]> {
  try {
    const results = await searchAgris({
      query: `${topic} guidelines recommendations`,
      country,
      limit: 40
    });

    return results.records;
  } catch (error) {
    console.error('Error fetching country recommendations:', error);
    return [];
  }
}

/**
 * Extract pesticide information from AGRIS record text
 * This is a helper function to parse treatment information from abstracts
 * @param record AGRIS record
 * @returns Extracted pesticide information
 */
export function extractPesticideInfo(record: AgrisRecord): {
  pesticides: string[];
  dosages: string[];
  methods: string[];
} {
  const text = `${record.title} ${record.abstract}`.toLowerCase();
  
  // Common pesticide patterns
  const pesticidePatterns = [
    /mancozeb/gi,
    /copper\s+hydroxide/gi,
    /streptomycin/gi,
    /chlorothalonil/gi,
    /azoxystrobin/gi,
    /propiconazole/gi,
    /tebuconazole/gi,
    /difenoconazole/gi
  ];

  // Dosage patterns (e.g., "2.5 kg/ha", "3 g/L")
  const dosagePatterns = [
    /\d+\.?\d*\s*(?:kg|g|ml|l)\/(?:ha|l|hectare)/gi,
    /\d+\.?\d*\s*(?:kg|g|ml|l)\s*per\s*(?:hectare|liter|litre)/gi
  ];

  // Application method patterns
  const methodPatterns = [
    /foliar\s+spray/gi,
    /soil\s+application/gi,
    /seed\s+treatment/gi,
    /drench/gi
  ];

  const pesticides = pesticidePatterns
    .map(pattern => text.match(pattern))
    .filter(match => match)
    .flat()
    .map(match => match || '');

  const dosages = dosagePatterns
    .map(pattern => text.match(pattern))
    .filter(match => match)
    .flat()
    .map(match => match || '');

  const methods = methodPatterns
    .map(pattern => text.match(pattern))
    .filter(match => match)
    .flat()
    .map(match => match || '');

  return {
    pesticides: [...new Set(pesticides)], // Remove duplicates
    dosages: [...new Set(dosages)],
    methods: [...new Set(methods)]
  };
}

// Cache for API responses to avoid repeated calls
const agrisCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Cached version of AGRIS search to improve performance
 * @param params Search parameters
 * @returns Cached or fresh search results
 */
export async function searchAgrisCached(params: AgrisSearchParams): Promise<AgrisResponse> {
  const cacheKey = JSON.stringify(params);
  const cached = agrisCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await searchAgris(params);
  agrisCache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}
