// Comprehensive Plant Disease Database
export interface PlantDisease {
  id: string;
  name: string;
  commonNames: string[];
  plantTypes: string[];
  symptoms: string[];
  causes: string[];
  severity: 'Low' | 'Medium' | 'High';
  seasonality: string[];
  organicTreatments: Treatment[];
  chemicalTreatments: Treatment[];
  preventiveMeasures: string[];
  imageKeywords: string[]; // Keywords to match against image analysis
}

export interface Treatment {
  name: string;
  application: string;
  timing: string;
  frequency: string;
  notes?: string;
}

export const PLANT_DISEASES: PlantDisease[] = [
  // Fungal Diseases
  {
    id: 'powdery-mildew',
    name: 'Powdery Mildew',
    commonNames: ['White Mold', 'Powdery Fungus'],
    plantTypes: ['tomato', 'grape', 'cucumber', 'zucchini', 'pepper', 'eggplant'],
    symptoms: [
      'White powdery coating on leaves',
      'Yellowing of affected leaves',
      'Stunted plant growth',
      'Distorted leaf shape',
      'Premature leaf drop'
    ],
    causes: [
      'High humidity (60-80%)',
      'Poor air circulation',
      'Overcrowded plants',
      'Moderate temperatures (68-78°F)',
      'Shaded conditions'
    ],
    severity: 'Medium',
    seasonality: ['spring', 'summer', 'fall'],
    organicTreatments: [
      {
        name: 'Baking Soda Spray',
        application: '1 tsp baking soda + 1 quart water + few drops dish soap',
        timing: 'Early morning or evening',
        frequency: 'Every 7-10 days'
      },
      {
        name: 'Neem Oil',
        application: 'Spray all plant surfaces',
        timing: 'Evening to avoid leaf burn',
        frequency: 'Every 7-14 days'
      },
      {
        name: 'Milk Spray',
        application: '1 part milk to 10 parts water',
        timing: 'Morning application',
        frequency: 'Weekly'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Myclobutanil Fungicide',
        application: 'Follow label instructions',
        timing: 'At first sign of disease',
        frequency: 'Every 14 days'
      },
      {
        name: 'Sulfur Fungicide',
        application: 'Dust or spray application',
        timing: 'Before temperature exceeds 85°F',
        frequency: 'Every 10-14 days'
      }
    ],
    preventiveMeasures: [
      'Improve air circulation between plants',
      'Avoid overhead watering',
      'Space plants properly',
      'Remove affected plant debris',
      'Choose resistant varieties'
    ],
    imageKeywords: ['white', 'powdery', 'coating', 'mildew', 'fungus', 'dusty']
  },
  
  {
    id: 'early-blight',
    name: 'Early Blight',
    commonNames: ['Target Spot', 'Alternaria Blight'],
    plantTypes: ['tomato', 'potato', 'pepper', 'eggplant'],
    symptoms: [
      'Dark brown spots with concentric rings',
      'Target-like lesions on leaves',
      'Yellowing around spots',
      'Lower leaves affected first',
      'Stem cankers near soil line'
    ],
    causes: [
      'Alternaria solani fungus',
      'Warm, humid weather',
      'Water stress',
      'Poor nutrition',
      'Overhead irrigation'
    ],
    severity: 'High',
    seasonality: ['summer', 'fall'],
    organicTreatments: [
      {
        name: 'Copper Fungicide',
        application: 'Spray all plant surfaces',
        timing: 'At first sign of disease',
        frequency: 'Every 7-10 days'
      },
      {
        name: 'Compost Tea',
        application: 'Foliar spray and soil drench',
        timing: 'Weekly preventive',
        frequency: 'Weekly'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Chlorothalonil',
        application: 'Thorough coverage of foliage',
        timing: 'Preventive or at first symptoms',
        frequency: 'Every 7-14 days'
      },
      {
        name: 'Mancozeb',
        application: 'Spray to runoff',
        timing: 'Before disease establishment',
        frequency: 'Every 10-14 days'
      }
    ],
    preventiveMeasures: [
      'Rotate crops annually',
      'Remove plant debris',
      'Mulch around plants',
      'Water at soil level',
      'Maintain proper plant nutrition'
    ],
    imageKeywords: ['brown', 'spots', 'rings', 'target', 'concentric', 'blight']
  },

  {
    id: 'late-blight',
    name: 'Late Blight',
    commonNames: ['Potato Blight', 'Tomato Blight'],
    plantTypes: ['tomato', 'potato'],
    symptoms: [
      'Water-soaked lesions on leaves',
      'White fuzzy growth on leaf undersides',
      'Brown to black lesions',
      'Rapid plant collapse',
      'Fruit rot with firm, brown areas'
    ],
    causes: [
      'Phytophthora infestans',
      'Cool, wet weather',
      'High humidity',
      'Temperature 60-70°F',
      'Poor air circulation'
    ],
    severity: 'High',
    seasonality: ['late summer', 'fall'],
    organicTreatments: [
      {
        name: 'Copper Sulfate',
        application: 'Preventive spray program',
        timing: 'Before symptoms appear',
        frequency: 'Every 5-7 days in wet weather'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Metalaxyl + Mancozeb',
        application: 'Systemic and contact protection',
        timing: 'Preventive application',
        frequency: 'Every 7-10 days'
      },
      {
        name: 'Cymoxanil + Famoxadone',
        application: 'Curative and preventive',
        timing: 'At first symptoms',
        frequency: 'Every 7-14 days'
      }
    ],
    preventiveMeasures: [
      'Choose resistant varieties',
      'Improve air circulation',
      'Avoid overhead irrigation',
      'Remove volunteer plants',
      'Monitor weather conditions'
    ],
    imageKeywords: ['water-soaked', 'fuzzy', 'white', 'collapse', 'blight', 'rot']
  },

  // Bacterial Diseases
  {
    id: 'bacterial-spot',
    name: 'Bacterial Spot',
    commonNames: ['Bacterial Speck', 'Leaf Spot'],
    plantTypes: ['tomato', 'pepper'],
    symptoms: [
      'Small, dark brown spots on leaves',
      'Yellow halos around spots',
      'Spots on fruit',
      'Leaf yellowing and drop',
      'Raised, scab-like fruit lesions'
    ],
    causes: [
      'Xanthomonas bacteria',
      'Warm, humid conditions',
      'Overhead watering',
      'Contaminated seeds',
      'Splashing water'
    ],
    severity: 'Medium',
    seasonality: ['summer'],
    organicTreatments: [
      {
        name: 'Copper Hydroxide',
        application: 'Spray to coverage',
        timing: 'Preventive or early symptoms',
        frequency: 'Every 7-10 days'
      },
      {
        name: 'Streptomycin',
        application: 'Antibiotic spray (where legal)',
        timing: 'At first symptoms',
        frequency: 'Every 5-7 days'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Copper + Mancozeb',
        application: 'Tank mix for broad protection',
        timing: 'Preventive program',
        frequency: 'Every 7-14 days'
      }
    ],
    preventiveMeasures: [
      'Use certified disease-free seeds',
      'Avoid overhead irrigation',
      'Sanitize tools between plants',
      'Remove infected plant debris',
      'Rotate crops'
    ],
    imageKeywords: ['bacterial', 'spots', 'brown', 'halos', 'yellow', 'scab']
  },

  // Viral Diseases
  {
    id: 'mosaic-virus',
    name: 'Mosaic Virus',
    commonNames: ['Tobacco Mosaic', 'Cucumber Mosaic'],
    plantTypes: ['tomato', 'pepper', 'cucumber', 'tobacco'],
    symptoms: [
      'Mottled yellow and green leaves',
      'Distorted leaf growth',
      'Stunted plant development',
      'Reduced fruit production',
      'Mosaic pattern on leaves'
    ],
    causes: [
      'Viral infection',
      'Aphid transmission',
      'Contaminated tools',
      'Infected plant material',
      'Mechanical transmission'
    ],
    severity: 'High',
    seasonality: ['spring', 'summer'],
    organicTreatments: [
      {
        name: 'Remove Infected Plants',
        application: 'Complete plant removal',
        timing: 'Immediately upon detection',
        frequency: 'As needed'
      },
      {
        name: 'Insecticidal Soap',
        application: 'Control aphid vectors',
        timing: 'Weekly during aphid season',
        frequency: 'Weekly'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Systemic Insecticides',
        application: 'Control aphid vectors',
        timing: 'Preventive application',
        frequency: 'As per label'
      }
    ],
    preventiveMeasures: [
      'Use virus-free transplants',
      'Control aphid populations',
      'Sanitize tools with bleach',
      'Remove weeds that harbor virus',
      'Choose resistant varieties'
    ],
    imageKeywords: ['mosaic', 'mottled', 'yellow', 'green', 'distorted', 'virus']
  },

  // Nutrient Deficiencies
  {
    id: 'nitrogen-deficiency',
    name: 'Nitrogen Deficiency',
    commonNames: ['N Deficiency', 'Yellowing'],
    plantTypes: ['tomato', 'pepper', 'cucumber', 'grape', 'all vegetables'],
    symptoms: [
      'Yellowing of older leaves first',
      'Stunted growth',
      'Pale green coloration',
      'Reduced fruit production',
      'Premature leaf drop'
    ],
    causes: [
      'Insufficient nitrogen in soil',
      'Leaching from heavy rains',
      'Poor soil organic matter',
      'High carbon materials',
      'Cold soil temperatures'
    ],
    severity: 'Medium',
    seasonality: ['spring', 'summer'],
    organicTreatments: [
      {
        name: 'Compost Application',
        application: '2-4 inches around plants',
        timing: 'Early season and mid-season',
        frequency: 'Twice per season'
      },
      {
        name: 'Fish Emulsion',
        application: 'Dilute according to label',
        timing: 'Every 2-3 weeks',
        frequency: 'Bi-weekly'
      },
      {
        name: 'Blood Meal',
        application: 'Work into soil around plants',
        timing: 'Early season',
        frequency: 'Once per season'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Balanced Fertilizer (10-10-10)',
        application: 'Side-dress around plants',
        timing: 'Early season and mid-season',
        frequency: 'Monthly'
      },
      {
        name: 'Urea (46-0-0)',
        application: 'Dissolve in water for quick uptake',
        timing: 'When deficiency appears',
        frequency: 'As needed'
      }
    ],
    preventiveMeasures: [
      'Regular soil testing',
      'Add organic matter annually',
      'Use slow-release fertilizers',
      'Maintain proper soil pH',
      'Avoid over-watering'
    ],
    imageKeywords: ['yellow', 'pale', 'stunted', 'deficiency', 'chlorosis']
  }
];

// Function to search diseases by symptoms or keywords
export function searchDiseases(keywords: string[], plantType?: string): PlantDisease[] {
  const searchTerms = keywords.map(k => k.toLowerCase());
  
  return PLANT_DISEASES.filter(disease => {
    // Filter by plant type if specified
    if (plantType && !disease.plantTypes.includes(plantType.toLowerCase())) {
      return false;
    }
    
    // Check if any search terms match disease keywords, symptoms, or name
    const allText = [
      ...disease.imageKeywords,
      ...disease.symptoms,
      disease.name,
      ...disease.commonNames
    ].map(text => text.toLowerCase());
    
    return searchTerms.some(term => 
      allText.some(text => text.includes(term))
    );
  }).sort((a, b) => {
    // Sort by severity (High first) and then by match relevance
    const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

// Function to get disease by ID
export function getDiseaseById(id: string): PlantDisease | undefined {
  return PLANT_DISEASES.find(disease => disease.id === id);
}

// Function to get all diseases for a specific plant type
export function getDiseasesForPlant(plantType: string): PlantDisease[] {
  return PLANT_DISEASES.filter(disease => 
    disease.plantTypes.includes(plantType.toLowerCase())
  );
}
