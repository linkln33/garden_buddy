// AGRIS HTML Parser for Garden Buddy
// Since AGRIS returns HTML instead of JSON, we need to parse the HTML response

export interface AGRISRecord {
  title: string;
  authors: string[];
  abstract: string;
  year: string;
  source: string;
  url?: string;
  relevanceScore: number;
}

export interface ExtractedTreatment {
  pesticide: string;
  dosage: string;
  crop: string;
  disease: string;
  method: string;
  efficacy?: string;
  source: string;
}

/**
 * Parse AGRIS HTML response to extract research records
 */
export function parseAGRISHTML(htmlContent: string): AGRISRecord[] {
  const records: AGRISRecord[] = [];
  
  try {
    // Remove HTML tags and extract text content
    const textContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Look for common patterns in AGRIS search results
    const titlePatterns = [
      /title[:\s]*([^\.]+)/gi,
      /heading[:\s]*([^\.]+)/gi,
      /research[:\s]*([^\.]+)/gi
    ];

    const abstractPatterns = [
      /abstract[:\s]*([^\.]{50,500})/gi,
      /summary[:\s]*([^\.]{50,500})/gi,
      /description[:\s]*([^\.]{50,500})/gi
    ];

    // Extract potential research titles
    const titles = new Set<string>();
    for (const pattern of titlePatterns) {
      const matches = textContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const title = match.replace(/title[:\s]*/gi, '').trim();
          if (title.length > 10 && title.length < 200) {
            titles.add(title);
          }
        });
      }
    }

    // Extract abstracts/descriptions
    const abstracts = new Set<string>();
    for (const pattern of abstractPatterns) {
      const matches = textContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const abstract = match.replace(/abstract[:\s]*/gi, '').trim();
          if (abstract.length > 50) {
            abstracts.add(abstract);
          }
        });
      }
    }

    // Create records from extracted data
    const titlesArray = Array.from(titles);
    const abstractsArray = Array.from(abstracts);

    for (let i = 0; i < Math.min(titlesArray.length, 10); i++) {
      const title = titlesArray[i];
      const abstract = abstractsArray[i] || '';
      
      records.push({
        title,
        authors: extractAuthors(textContent, title),
        abstract,
        year: extractYear(title + ' ' + abstract),
        source: 'AGRIS FAO',
        relevanceScore: calculateRelevanceScore(title, abstract)
      });
    }

    // If no structured data found, extract from general content
    if (records.length === 0) {
      const sentences = textContent.split(/[.!?]+/).filter(s => s.length > 50);
      
      for (let i = 0; i < Math.min(sentences.length, 5); i++) {
        const sentence = sentences[i].trim();
        if (containsAgriculturalTerms(sentence)) {
          records.push({
            title: sentence.substring(0, 100) + '...',
            authors: [],
            abstract: sentence,
            year: extractYear(sentence),
            source: 'AGRIS FAO',
            relevanceScore: calculateRelevanceScore(sentence, '')
          });
        }
      }
    }

  } catch (error) {
    console.error('Error parsing AGRIS HTML:', error);
  }

  return records.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Extract treatment information from AGRIS records
 */
export function extractTreatments(records: AGRISRecord[]): ExtractedTreatment[] {
  const treatments: ExtractedTreatment[] = [];

  for (const record of records) {
    const text = (record.title + ' ' + record.abstract).toLowerCase();
    
    // Extract dosage patterns
    const dosagePatterns = [
      /(\d+(?:\.\d+)?)\s*(g|kg|ml|l)\/ha/gi,
      /(\d+(?:\.\d+)?)\s*(g|ml)\/l/gi,
      /(\d+(?:\.\d+)?)\s*ppm/gi,
      /(\d+(?:\.\d+)?)\s*(mg|g)\/kg/gi,
      /(\d+(?:\.\d+)?)\s*%/gi
    ];

    const dosages = [];
    for (const pattern of dosagePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        dosages.push(...matches);
      }
    }

    // Extract pesticide names
    const pesticides = extractPesticideNames(text);
    
    // Extract crops
    const crops = extractCropNames(text);
    
    // Extract diseases
    const diseases = extractDiseaseNames(text);

    // Create treatment combinations
    if (dosages.length > 0 && pesticides.length > 0) {
      for (const pesticide of pesticides) {
        for (const dosage of dosages) {
          treatments.push({
            pesticide,
            dosage,
            crop: crops[0] || 'Various crops',
            disease: diseases[0] || 'Various diseases',
            method: extractApplicationMethod(text),
            efficacy: extractEfficacy(text),
            source: record.title.substring(0, 50) + '...'
          });
        }
      }
    }
  }

  return treatments.slice(0, 20); // Limit results
}

/**
 * Helper functions for data extraction
 */
function extractAuthors(text: string, title: string): string[] {
  const authorPatterns = [
    /author[s]?[:\s]*([^\.]{10,100})/gi,
    /by[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+)/gi
  ];

  const authors = new Set<string>();
  for (const pattern of authorPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const author = match.replace(/author[s]?[:\s]*/gi, '').replace(/by[:\s]*/gi, '').trim();
        if (author.length > 5 && author.length < 50) {
          authors.add(author);
        }
      });
    }
  }

  return Array.from(authors).slice(0, 3);
}

function extractYear(text: string): string {
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
}

function calculateRelevanceScore(title: string, abstract: string): number {
  const text = (title + ' ' + abstract).toLowerCase();
  let score = 0;

  // Agricultural terms
  const agriTerms = ['pesticide', 'fungicide', 'herbicide', 'insecticide', 'treatment', 'control', 'disease', 'crop'];
  agriTerms.forEach(term => {
    if (text.includes(term)) score += 2;
  });

  // Dosage indicators
  const dosageTerms = ['dosage', 'rate', 'application', 'spray', 'g/ha', 'ml/l', 'ppm'];
  dosageTerms.forEach(term => {
    if (text.includes(term)) score += 3;
  });

  // Research quality indicators
  const qualityTerms = ['study', 'trial', 'experiment', 'research', 'field', 'greenhouse'];
  qualityTerms.forEach(term => {
    if (text.includes(term)) score += 1;
  });

  return score;
}

function containsAgriculturalTerms(text: string): boolean {
  const agriTerms = ['crop', 'plant', 'disease', 'pest', 'fungus', 'treatment', 'control', 'spray', 'application'];
  const lowerText = text.toLowerCase();
  return agriTerms.some(term => lowerText.includes(term));
}

function extractPesticideNames(text: string): string[] {
  const commonPesticides = [
    'mancozeb', 'azoxystrobin', 'tebuconazole', 'propiconazole', 'copper',
    'bordeaux', 'sulfur', 'bacillus', 'trichoderma', 'chlorothalonil',
    'metalaxyl', 'cymoxanil', 'fosetyl', 'phosphorous', 'streptomycin'
  ];

  const found = [];
  for (const pesticide of commonPesticides) {
    if (text.includes(pesticide)) {
      found.push(pesticide.charAt(0).toUpperCase() + pesticide.slice(1));
    }
  }

  return found;
}

function extractCropNames(text: string): string[] {
  const commonCrops = [
    'tomato', 'potato', 'grape', 'apple', 'corn', 'wheat', 'rice',
    'cucumber', 'pepper', 'lettuce', 'cabbage', 'onion', 'carrot'
  ];

  const found = [];
  for (const crop of commonCrops) {
    if (text.includes(crop)) {
      found.push(crop.charAt(0).toUpperCase() + crop.slice(1));
    }
  }

  return found;
}

function extractDiseaseNames(text: string): string[] {
  const commonDiseases = [
    'blight', 'mildew', 'rust', 'scab', 'rot', 'wilt', 'spot',
    'mosaic', 'canker', 'anthracnose', 'downy mildew', 'powdery mildew',
    'late blight', 'early blight', 'bacterial spot'
  ];

  const found = [];
  for (const disease of commonDiseases) {
    if (text.includes(disease)) {
      found.push(disease.charAt(0).toUpperCase() + disease.slice(1));
    }
  }

  return found;
}

function extractApplicationMethod(text: string): string {
  const methods = ['foliar spray', 'soil drench', 'seed treatment', 'fumigation', 'injection'];
  
  for (const method of methods) {
    if (text.includes(method)) {
      return method;
    }
  }
  
  if (text.includes('spray')) return 'Foliar spray';
  if (text.includes('soil')) return 'Soil application';
  
  return 'Foliar spray'; // Default
}

function extractEfficacy(text: string): string {
  const efficacyPatterns = [
    /(\d+)%\s*(control|reduction|efficacy)/gi,
    /(effective|good|excellent|poor)\s*control/gi
  ];

  for (const pattern of efficacyPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return 'Effective';
}
