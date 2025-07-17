// Supabase integration for real pesticide database
import { createClient } from '@supabase/supabase-js';

// Database types based on our schema
export interface PesticideProduct {
  id: string;
  name: string;
  active_ingredient: string;
  brand_names: string[];
  product_type: 'fungicide' | 'insecticide' | 'herbicide';
  manufacturer?: string;
  registration_number?: string;
  eu_approved: boolean;
  countries_approved: string[];
  toxicity_class?: string;
  environmental_impact?: {
    water_toxicity?: string;
    soil_persistence?: string;
    bee_toxicity?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Crop {
  id: string;
  name: string;
  scientific_name?: string;
  category: string;
  growth_stages: string[];
  common_diseases: string[];
  created_at: string;
}

export interface PlantDisease {
  id: string;
  name: string;
  scientific_name?: string;
  disease_type: 'fungal' | 'bacterial' | 'viral' | 'pest';
  affected_crops: string[];
  symptoms: string;
  causes?: string;
  conditions?: {
    temperature?: string;
    humidity?: string;
    season?: string;
  };
  severity_levels: string[];
  created_at: string;
}

export interface PesticideDosage {
  id: string;
  pesticide_id: string;
  disease_id: string;
  crop_id: string;
  dosage_rate: string;
  dosage_unit: string;
  application_method?: string;
  application_timing?: string;
  frequency?: string;
  max_applications?: number;
  preharvest_interval?: number;
  reentry_period?: number;
  water_volume?: string;
  efficacy_rating?: number;
  cost_per_hectare?: number;
  region: string;
  source: string;
  source_url?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  pesticide?: PesticideProduct;
  disease?: PlantDisease;
  crop?: Crop;
}

export interface IPMRecommendation {
  id: string;
  disease_id: string;
  crop_id: string;
  prevention_methods: string[];
  biological_controls: string[];
  cultural_practices: string[];
  monitoring_methods: string[];
  threshold_levels?: any;
  seasonal_timing: string[];
  effectiveness_rating?: number;
  cost_effectiveness?: 'low' | 'medium' | 'high';
  region: string;
  source: string;
  source_url?: string;
  created_at: string;
  
  // Joined data
  disease?: PlantDisease;
  crop?: Crop;
}

export interface AgrisRecord {
  id: string;
  agris_id: string;
  title: string;
  abstract?: string;
  authors: string[];
  subjects: string[];
  keywords: string[];
  language?: string;
  country?: string;
  publication_year?: number;
  url?: string;
  extracted_pesticides: string[];
  extracted_dosages: string[];
  extracted_methods: string[];
  relevance_score?: number;
  processed_at: string;
  created_at: string;
}

// Initialize Supabase client (you should have this configured already)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get pesticide dosages for a specific disease and crop
 * @param diseaseId Disease ID
 * @param cropId Crop ID
 * @param region Optional region filter
 * @returns Promise with pesticide dosages
 */
export async function getPesticideDosages(
  diseaseId: string,
  cropId: string,
  region?: string
): Promise<PesticideDosage[]> {
  try {
    let query = supabase
      .from('pesticide_dosages')
      .select(`
        *,
        pesticide:pesticide_products(*),
        disease:plant_diseases(*),
        crop:crops(*)
      `)
      .eq('disease_id', diseaseId)
      .eq('crop_id', cropId);

    if (region) {
      query = query.eq('region', region);
    }

    const { data, error } = await query.order('efficacy_rating', { ascending: false });

    if (error) {
      console.error('Error fetching pesticide dosages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPesticideDosages:', error);
    return [];
  }
}

/**
 * Get IPM recommendations for a specific disease and crop
 * @param diseaseId Disease ID
 * @param cropId Crop ID
 * @param region Optional region filter
 * @returns Promise with IPM recommendations
 */
export async function getIPMRecommendations(
  diseaseId: string,
  cropId: string,
  region?: string
): Promise<IPMRecommendation[]> {
  try {
    let query = supabase
      .from('ipm_recommendations')
      .select(`
        *,
        disease:plant_diseases(*),
        crop:crops(*)
      `)
      .eq('disease_id', diseaseId)
      .eq('crop_id', cropId);

    if (region) {
      query = query.eq('region', region);
    }

    const { data, error } = await query.order('effectiveness_rating', { ascending: false });

    if (error) {
      console.error('Error fetching IPM recommendations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getIPMRecommendations:', error);
    return [];
  }
}

/**
 * Search for crops by name
 * @param searchTerm Search term
 * @returns Promise with matching crops
 */
export async function searchCrops(searchTerm: string): Promise<Crop[]> {
  try {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,scientific_name.ilike.%${searchTerm}%`)
      .order('name');

    if (error) {
      console.error('Error searching crops:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchCrops:', error);
    return [];
  }
}

/**
 * Search for plant diseases by name or symptoms
 * @param searchTerm Search term
 * @param cropName Optional crop filter
 * @returns Promise with matching diseases
 */
export async function searchPlantDiseases(
  searchTerm: string,
  cropName?: string
): Promise<PlantDisease[]> {
  try {
    let query = supabase
      .from('plant_diseases')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,symptoms.ilike.%${searchTerm}%`);

    if (cropName) {
      query = query.contains('affected_crops', [cropName]);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error searching plant diseases:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchPlantDiseases:', error);
    return [];
  }
}

/**
 * Get all available regions from pesticide dosages
 * @returns Promise with list of regions
 */
export async function getAvailableRegions(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('pesticide_dosages')
      .select('region')
      .not('region', 'is', null);

    if (error) {
      console.error('Error fetching regions:', error);
      return [];
    }

    const regions = [...new Set(data?.map(item => item.region) || [])];
    return regions.sort();
  } catch (error) {
    console.error('Error in getAvailableRegions:', error);
    return [];
  }
}

/**
 * Store AGRIS record in database
 * @param record AGRIS record to store
 * @returns Promise with stored record
 */
export async function storeAgrisRecord(record: Omit<AgrisRecord, 'id' | 'created_at'>): Promise<AgrisRecord | null> {
  try {
    const { data, error } = await supabase
      .from('agris_records')
      .upsert([record], { onConflict: 'agris_id' })
      .select()
      .single();

    if (error) {
      console.error('Error storing AGRIS record:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in storeAgrisRecord:', error);
    return null;
  }
}

/**
 * Search stored AGRIS records
 * @param searchTerm Search term
 * @param country Optional country filter
 * @returns Promise with matching records
 */
export async function searchStoredAgrisRecords(
  searchTerm: string,
  country?: string
): Promise<AgrisRecord[]> {
  try {
    let query = supabase
      .from('agris_records')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,abstract.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`);

    if (country) {
      query = query.eq('country', country);
    }

    const { data, error } = await query
      .order('relevance_score', { ascending: false })
      .order('publication_year', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error searching AGRIS records:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchStoredAgrisRecords:', error);
    return [];
  }
}

/**
 * Get pesticide recommendations by disease name and crop name (for backward compatibility)
 * @param diseaseName Disease name
 * @param cropName Crop name
 * @param region Optional region
 * @returns Promise with recommendations
 */
export async function getPesticideRecommendationsByName(
  diseaseName: string,
  cropName: string,
  region?: string
): Promise<{
  dosages: PesticideDosage[];
  ipmRecommendations: IPMRecommendation[];
}> {
  try {
    // First find the disease and crop IDs
    const [diseases, crops] = await Promise.all([
      searchPlantDiseases(diseaseName, cropName),
      searchCrops(cropName)
    ]);

    const disease = diseases.find(d => 
      d.name.toLowerCase().includes(diseaseName.toLowerCase()) ||
      d.affected_crops.some(crop => crop.toLowerCase().includes(cropName.toLowerCase()))
    );

    const crop = crops.find(c => 
      c.name.toLowerCase().includes(cropName.toLowerCase())
    );

    if (!disease || !crop) {
      console.warn(`Disease "${diseaseName}" or crop "${cropName}" not found in database`);
      return { dosages: [], ipmRecommendations: [] };
    }

    // Get recommendations using IDs
    const [dosages, ipmRecommendations] = await Promise.all([
      getPesticideDosages(disease.id, crop.id, region),
      getIPMRecommendations(disease.id, crop.id, region)
    ]);

    return { dosages, ipmRecommendations };
  } catch (error) {
    console.error('Error in getPesticideRecommendationsByName:', error);
    return { dosages: [], ipmRecommendations: [] };
  }
}

/**
 * Calculate spray volume and dosage
 * @param dosageRate Dosage rate (e.g., "2.5 kg/ha")
 * @param fieldSizeHa Field size in hectares
 * @param sprayVolumePerHa Spray volume per hectare (default 300L/ha)
 * @returns Calculated amounts
 */
export function calculateSprayAmount(
  dosageRate: string,
  fieldSizeHa: number,
  sprayVolumePerHa: number = 300
): {
  totalSprayVolume: number;
  pesticideAmount: number;
  pesticideUnit: string;
  concentration: string;
} {
  // Parse dosage rate (e.g., "2.5 kg/ha" or "3 ml/L")
  const dosageMatch = dosageRate.match(/(\d+\.?\d*)\s*([a-zA-Z]+)\/([a-zA-Z]+)/);
  
  if (!dosageMatch) {
    return {
      totalSprayVolume: fieldSizeHa * sprayVolumePerHa,
      pesticideAmount: 0,
      pesticideUnit: '',
      concentration: 'Invalid dosage format'
    };
  }

  const [, amount, unit, per] = dosageMatch;
  const dosageAmount = parseFloat(amount);
  
  const totalSprayVolume = fieldSizeHa * sprayVolumePerHa;
  
  if (per.toLowerCase() === 'ha') {
    // Dosage per hectare (e.g., "2.5 kg/ha")
    const pesticideAmount = dosageAmount * fieldSizeHa;
    const concentration = `${(pesticideAmount / totalSprayVolume * 1000).toFixed(2)} ${unit}/L`;
    
    return {
      totalSprayVolume,
      pesticideAmount,
      pesticideUnit: unit,
      concentration
    };
  } else if (per.toLowerCase() === 'l') {
    // Dosage per liter (e.g., "3 ml/L")
    const pesticideAmount = (dosageAmount * totalSprayVolume) / 1000; // Convert to main unit
    const concentration = `${dosageAmount} ${unit}/L`;
    
    return {
      totalSprayVolume,
      pesticideAmount,
      pesticideUnit: unit,
      concentration
    };
  }
  
  return {
    totalSprayVolume,
    pesticideAmount: 0,
    pesticideUnit: unit,
    concentration: 'Unknown dosage format'
  };
}
