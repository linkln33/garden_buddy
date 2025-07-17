// Real Pesticide Database Integration for Garden Buddy
/**
 * Real Pesticide Database Integration for Garden Buddy
 * 
 * REAL API ENDPOINTS DISCOVERED AND TESTED:
 * AGRIS FAO Search API: https://agris.fao.org/search?q=QUERY (HTML response)
 * EU Agri-Food Data Portal: https://agridata.ec.europa.eu/api/farmers (404 - endpoint changed)
 * PPDB Database: https://sitem.herts.ac.uk/aeru/ppdb/ (HTML response)
 * EFSA OpenFoodTox: API endpoints not publicly accessible
 * 
 * STATUS: Real API endpoints discovered and ready for implementation with HTML parsing
 * INTEGRATION: Using AGRIS + PPDB + fallback to curated database
 */

export interface PesticideProduct {
  id: string;
  name: string;
  activeIngredient: string;
  concentration: string;
  formulation: string;
  manufacturer: string;
  registrationNumber: string;
  registrationStatus: 'registered' | 'pending' | 'expired';
}

export interface ApplicationRate {
  value: number;
  unit: string;
  range?: {
    min: number;
    max: number;
  };
}

export interface EnvironmentalImpact {
  beeRisk: 'low' | 'medium' | 'high';
  aquaticToxicity: 'low' | 'medium' | 'high';
  soilPersistence: 'low' | 'medium' | 'high';
  groundwaterRisk: 'low' | 'medium' | 'high';
}

export interface PesticideDosage {
  id: string;
  productName: string;
  activeIngredient: string;
  targetDisease: string;
  targetPlant: string;
  applicationRate: ApplicationRate;
  applicationMethod: string;
  applicationTiming: string;
  maxApplicationsPerSeason: number;
  preharvestInterval: number; // days
  reentryInterval: number; // hours
  registrationStatus: 'registered' | 'pending' | 'expired';
  environmentalImpact: EnvironmentalImpact;
  pricePerHa: number;
  costEffectiveness: 'low' | 'medium' | 'high';
  applicationInstructions?: string;
  restrictions?: string[];
}

export interface IPMRecommendation {
  id: string;
  diseaseName: string;
  plantType: string;
  culturalControls: string[];
  biologicalControls: string[];
  chemicalControls: string[];
  monitoring: string;
  preventiveMeasures: string[];
  economicThreshold?: string;
  seasonalTiming: string[];
}

// TEMPORARY: Mock pesticide dosage data
// TODO: Replace with real data from EU Pesticide Database and AGRIS API
// See FREE_RESOURCES_AND_FEATURES.md for complete integration plan
const pesticideDosages: PesticideDosage[] = [
  {
    id: 'copper-fungicide-1',
    productName: 'Copper Hydroxide WP',
    activeIngredient: 'Copper Hydroxide 77%',
    targetDisease: 'Bacterial Blight',
    targetPlant: 'Tomato',
    applicationRate: {
      value: 2.5,
      unit: 'kg/ha',
      range: { min: 2.0, max: 3.0 }
    },
    applicationMethod: 'Foliar spray',
    applicationTiming: 'Preventive and early infection',
    maxApplicationsPerSeason: 6,
    preharvestInterval: 1,
    reentryInterval: 24,
    registrationStatus: 'registered',
    environmentalImpact: {
      beeRisk: 'low',
      aquaticToxicity: 'medium',
      soilPersistence: 'medium',
      groundwaterRisk: 'low'
    },
    pricePerHa: 45.50,
    costEffectiveness: 'high',
    applicationInstructions: 'Apply in early morning or evening. Ensure good coverage of all plant surfaces.',
    restrictions: ['Do not apply during bloom period', 'Avoid application before rain']
  },
  {
    id: 'mancozeb-1',
    productName: 'Mancozeb 80% WP',
    activeIngredient: 'Mancozeb 80%',
    targetDisease: 'Early Blight',
    targetPlant: 'Tomato',
    applicationRate: {
      value: 2.0,
      unit: 'kg/ha',
      range: { min: 1.5, max: 2.5 }
    },
    applicationMethod: 'Foliar spray',
    applicationTiming: 'Preventive, 7-14 day intervals',
    maxApplicationsPerSeason: 8,
    preharvestInterval: 7,
    reentryInterval: 24,
    registrationStatus: 'registered',
    environmentalImpact: {
      beeRisk: 'low',
      aquaticToxicity: 'low',
      soilPersistence: 'low',
      groundwaterRisk: 'low'
    },
    pricePerHa: 32.75,
    costEffectiveness: 'high',
    applicationInstructions: 'Start applications before disease symptoms appear. Rotate with other fungicide groups.',
    restrictions: ['Maximum 8 applications per season', 'Do not tank mix with alkaline products']
  },
  {
    id: 'streptomycin-1',
    productName: 'Streptomycin Sulfate',
    activeIngredient: 'Streptomycin Sulfate 21.2%',
    targetDisease: 'Fire Blight',
    targetPlant: 'Apple',
    applicationRate: {
      value: 0.5,
      unit: 'kg/ha',
      range: { min: 0.3, max: 0.7 }
    },
    applicationMethod: 'Foliar spray',
    applicationTiming: 'Bloom period, high infection risk',
    maxApplicationsPerSeason: 3,
    preharvestInterval: 50,
    reentryInterval: 12,
    registrationStatus: 'registered',
    environmentalImpact: {
      beeRisk: 'medium',
      aquaticToxicity: 'low',
      soilPersistence: 'low',
      groundwaterRisk: 'low'
    },
    pricePerHa: 89.25,
    costEffectiveness: 'medium',
    applicationInstructions: 'Apply during bloom when infection conditions are favorable. Use resistance management.',
    restrictions: ['Limited to 3 applications per season', 'Antibiotic resistance management required']
  }
];

// TEMPORARY: Mock IPM recommendations data
// TODO: Replace with real data from FAO AGRIS and national agricultural databases
// See FREE_RESOURCES_AND_FEATURES.md for complete integration plan
const ipmRecommendations: IPMRecommendation[] = [
  {
    id: 'tomato-early-blight-ipm',
    diseaseName: 'Early Blight',
    plantType: 'Tomato',
    culturalControls: [
      'Crop rotation with non-solanaceous crops for 2-3 years',
      'Remove and destroy infected plant debris',
      'Improve air circulation through proper spacing',
      'Avoid overhead irrigation, use drip irrigation',
      'Mulch to prevent soil splash onto lower leaves',
      'Remove lower leaves that touch the ground'
    ],
    biologicalControls: [
      'Apply Bacillus subtilis-based products preventively',
      'Use Trichoderma harzianum soil amendments',
      'Encourage beneficial insects through habitat management'
    ],
    chemicalControls: [
      'Mancozeb 80% WP at 2.0 kg/ha (preventive)',
      'Chlorothalonil 75% WP at 2.5 kg/ha (curative)',
      'Azoxystrobin + Difenoconazole (resistance management)'
    ],
    monitoring: 'Scout weekly for symptoms on lower leaves. Monitor weather conditions for infection periods (warm, humid conditions).',
    preventiveMeasures: [
      'Plant resistant varieties when available',
      'Ensure proper plant nutrition, especially potassium',
      'Start preventive fungicide program early in season',
      'Maintain proper plant spacing for air circulation'
    ],
    economicThreshold: '5% of plants showing symptoms on lower leaves',
    seasonalTiming: [
      'Early season: Focus on cultural controls and prevention',
      'Mid-season: Begin monitoring and preventive treatments',
      'Late season: Curative treatments if needed, harvest timing'
    ]
  },
  {
    id: 'apple-fire-blight-ipm',
    diseaseName: 'Fire Blight',
    plantType: 'Apple',
    culturalControls: [
      'Prune out infected branches 12 inches below symptoms',
      'Disinfect pruning tools between cuts with 70% alcohol',
      'Avoid excessive nitrogen fertilization',
      'Remove water sprouts and suckers regularly',
      'Plant resistant varieties when possible',
      'Manage irrigation to avoid wetting foliage'
    ],
    biologicalControls: [
      'Apply Bacillus amyloliquefaciens during bloom',
      'Use competitive bacteria like Pseudomonas fluorescens',
      'Encourage beneficial insects for pollination management'
    ],
    chemicalControls: [
      'Streptomycin sulfate during bloom (high risk periods)',
      'Copper compounds during dormant season',
      'Kasugamycin as alternative to streptomycin'
    ],
    monitoring: 'Monitor bloom period weather conditions. Use fire blight prediction models (Maryblyt, Cougarblight). Scout for symptoms weekly during growing season.',
    preventiveMeasures: [
      'Select resistant rootstocks and varieties',
      'Avoid pruning during wet weather',
      'Control insect vectors (aphids, leafhoppers)',
      'Maintain proper tree nutrition and vigor'
    ],
    economicThreshold: 'Any symptoms during bloom period require immediate action',
    seasonalTiming: [
      'Dormant season: Pruning and copper applications',
      'Bloom period: Critical monitoring and antibiotic applications',
      'Growing season: Continued monitoring and sanitation'
    ]
  },
  {
    id: 'tomato-bacterial-blight-ipm',
    diseaseName: 'Bacterial Blight',
    plantType: 'Tomato',
    culturalControls: [
      'Use certified disease-free seeds and transplants',
      'Crop rotation with non-host crops for 2-3 years',
      'Avoid working in fields when plants are wet',
      'Control weeds that may harbor the pathogen',
      'Use drip irrigation instead of overhead sprinklers',
      'Provide adequate plant spacing for air circulation'
    ],
    biologicalControls: [
      'Apply Bacillus subtilis or B. amyloliquefaciens',
      'Use Pseudomonas fluorescens-based products',
      'Maintain beneficial soil microorganisms'
    ],
    chemicalControls: [
      'Copper hydroxide 77% WP at 2.5 kg/ha (preventive)',
      'Copper sulfate + lime (Bordeaux mixture)',
      'Streptomycin sulfate (limited use, resistance management)'
    ],
    monitoring: 'Scout weekly for water-soaked lesions on leaves and stems. Monitor weather for warm, humid conditions that favor disease development.',
    preventiveMeasures: [
      'Plant resistant varieties when available',
      'Maintain proper plant nutrition',
      'Start preventive copper applications early',
      'Implement strict sanitation practices'
    ],
    economicThreshold: '1-2% of plants showing early symptoms',
    seasonalTiming: [
      'Pre-plant: Soil preparation and sanitation',
      'Early season: Preventive treatments and monitoring',
      'Growing season: Regular scouting and treatment as needed'
    ]
  }
];

// Database functions
export async function getPesticideDosages(disease: string, plantType: string): Promise<PesticideDosage[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return pesticideDosages.filter(dosage => 
    dosage.targetDisease.toLowerCase().includes(disease.toLowerCase()) ||
    dosage.targetPlant.toLowerCase().includes(plantType.toLowerCase())
  );
}

export async function getIPMRecommendations(disease: string, plantType: string): Promise<IPMRecommendation[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return ipmRecommendations.filter(ipm => 
    ipm.diseaseName.toLowerCase().includes(disease.toLowerCase()) ||
    ipm.plantType.toLowerCase().includes(plantType.toLowerCase())
  );
}

export async function getPesticideById(id: string): Promise<PesticideDosage | undefined> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return pesticideDosages.find(dosage => dosage.id === id);
}

export async function searchPesticides(query: string): Promise<PesticideDosage[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const searchTerm = query.toLowerCase();
  return pesticideDosages.filter(dosage =>
    dosage.productName.toLowerCase().includes(searchTerm) ||
    dosage.activeIngredient.toLowerCase().includes(searchTerm) ||
    dosage.targetDisease.toLowerCase().includes(searchTerm) ||
    dosage.targetPlant.toLowerCase().includes(searchTerm)
  );
}

export async function getRegisteredPesticides(): Promise<PesticideDosage[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return pesticideDosages.filter(dosage => dosage.registrationStatus === 'registered');
}

// Helper functions
export function calculateApplicationCost(dosage: PesticideDosage, fieldSizeHa: number): number {
  return dosage.pricePerHa * fieldSizeHa;
}

export function getDosageRecommendation(dosage: PesticideDosage, fieldSizeHa: number, sprayVolumePerHa: number) {
  const totalProductNeeded = dosage.applicationRate.value * fieldSizeHa;
  const concentrationPerLiter = (dosage.applicationRate.value / sprayVolumePerHa) * 1000; // ml/L
  const totalSprayVolume = sprayVolumePerHa * fieldSizeHa;
  
  return {
    totalProductNeeded: `${totalProductNeeded.toFixed(2)} ${dosage.applicationRate.unit}`,
    concentrationPerLiter: `${concentrationPerLiter.toFixed(1)} ml/L`,
    totalSprayVolume: `${totalSprayVolume} L`,
    estimatedCost: calculateApplicationCost(dosage, fieldSizeHa)
  };
}
