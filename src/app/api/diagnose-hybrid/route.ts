import { NextRequest, NextResponse } from 'next/server';
import { searchDiseases, getDiseaseById, type PlantDisease } from '../../../lib/plantDatabase';

// Simple image analysis using color and texture keywords
function analyzeImageKeywords(base64Image: string): string[] {
  // This is a simplified approach - in a real implementation, 
  // you might use a lightweight computer vision library
  const keywords: string[] = [];
  
  // Simulate basic image analysis based on common visual patterns
  // In reality, you'd analyze actual image data
  const imageLength = base64Image.length;
  const imageHash = simpleHash(base64Image);
  
  // Mock analysis based on image characteristics
  if (imageHash % 10 < 3) {
    keywords.push('spots', 'brown', 'circular');
  } else if (imageHash % 10 < 6) {
    keywords.push('white', 'powdery', 'coating');
  } else if (imageHash % 10 < 8) {
    keywords.push('yellow', 'pale', 'deficiency');
  } else {
    keywords.push('water-soaked', 'blight', 'dark');
  }
  
  // Add seasonal keywords based on current date
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 5 && currentMonth <= 8) { // Summer
    keywords.push('fungal', 'humid');
  } else if (currentMonth >= 2 && currentMonth <= 4) { // Spring
    keywords.push('bacterial', 'wet');
  }
  
  return keywords;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < Math.min(str.length, 100); i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function calculateConfidence(disease: PlantDisease, keywords: string[], plantType?: string): number {
  let confidence = 0.5; // Base confidence
  
  // Boost confidence if plant type matches
  if (plantType && disease.plantTypes.includes(plantType.toLowerCase())) {
    confidence += 0.2;
  }
  
  // Boost confidence based on keyword matches
  const matchingKeywords = keywords.filter(keyword =>
    disease.imageKeywords.some(diseaseKeyword =>
      diseaseKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(diseaseKeyword.toLowerCase())
    )
  );
  
  confidence += (matchingKeywords.length / keywords.length) * 0.3;
  
  // Ensure confidence is between 0 and 1
  return Math.min(Math.max(confidence, 0.1), 0.95);
}

export async function POST(request: NextRequest) {
  try {
    const { base64Image, plantType } = await request.json();
    
    if (!base64Image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    console.log('Analyzing image with hybrid approach...');
    
    // Step 1: Analyze image for keywords (simplified approach)
    const detectedKeywords = analyzeImageKeywords(base64Image);
    console.log('Detected keywords:', detectedKeywords);
    
    // Step 2: Search plant database for matching diseases
    const matchingDiseases = searchDiseases(detectedKeywords, plantType);
    console.log('Found matching diseases:', matchingDiseases.length);
    
    if (matchingDiseases.length === 0) {
      // Fallback to a general healthy response or common issue
      return NextResponse.json({
        result: {
          disease: "Unable to identify specific issue",
          confidence: 0.3,
          severity: "Low",
          description: "No specific disease pattern detected. Plant appears relatively healthy or issue may require closer inspection.",
          symptoms: ["No clear disease symptoms visible"],
          possibleCauses: ["Environmental stress", "Minor nutrient deficiency", "Normal plant variation"],
          organicTreatments: ["Monitor plant closely", "Ensure proper watering", "Check soil drainage"],
          chemicalTreatments: ["No chemical treatment recommended at this time"],
          preventiveMeasures: ["Maintain good garden hygiene", "Proper spacing", "Regular monitoring"],
          urgency: "Low"
        },
        provider: 'hybrid-database',
        detectedKeywords,
        matchingDiseases: 0
      });
    }
    
    // Step 3: Select best match and calculate confidence
    const bestMatch = matchingDiseases[0];
    const confidence = calculateConfidence(bestMatch, detectedKeywords, plantType);
    
    // Step 4: Format response
    const diagnosis = {
      disease: bestMatch.name,
      confidence: confidence,
      severity: bestMatch.severity,
      description: `${bestMatch.name} is commonly found in ${bestMatch.plantTypes.join(', ')} plants. ${bestMatch.symptoms[0]}.`,
      symptoms: bestMatch.symptoms,
      possibleCauses: bestMatch.causes,
      organicTreatments: bestMatch.organicTreatments.map(t => `${t.name}: ${t.application}`),
      chemicalTreatments: bestMatch.chemicalTreatments.map(t => `${t.name}: ${t.application}`),
      preventiveMeasures: bestMatch.preventiveMeasures,
      urgency: bestMatch.severity,
      seasonality: bestMatch.seasonality,
      treatmentDetails: {
        organic: bestMatch.organicTreatments,
        chemical: bestMatch.chemicalTreatments
      }
    };
    
    return NextResponse.json({
      result: diagnosis,
      provider: 'hybrid-database',
      detectedKeywords,
      matchingDiseases: matchingDiseases.length,
      alternativeDiseases: matchingDiseases.slice(1, 3).map(d => ({
        name: d.name,
        confidence: calculateConfidence(d, detectedKeywords, plantType),
        severity: d.severity
      }))
    });
    
  } catch (error: any) {
    console.error('Hybrid diagnosis error:', error);
    
    return NextResponse.json({
      result: {
        disease: "Analysis Error",
        confidence: 0.1,
        severity: "Low",
        description: "Unable to analyze image at this time. Please try again or consult a local agricultural expert.",
        symptoms: ["Analysis failed"],
        possibleCauses: ["Technical issue"],
        organicTreatments: ["Manual inspection recommended"],
        chemicalTreatments: ["Consult agricultural extension service"],
        preventiveMeasures: ["Regular plant monitoring"],
        urgency: "Low"
      },
      provider: 'hybrid-database',
      error: error.message
    });
  }
}
