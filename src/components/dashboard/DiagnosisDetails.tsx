import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { createBrowserClient } from '@supabase/ssr';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ConfidenceMeter } from '../ui/ConfidenceMeter';
import VotingSystem from '../community/VotingSystem';
import type { Database } from '../../lib/supabase/types';

interface Treatment {
  name: string;
  description: string;
  effectiveness: string;
  materials?: string[];
  activeIngredients?: string[];
  safetyPrecautions?: string;
}

interface DiagnosisDetailsProps {
  diagnosisId: string;
  userId: string;
  onRetry?: () => void;
}

/**
 * DiagnosisDetails component for the dashboard that shows full diagnosis information
 * including plant problem description, treatments, preventative measures, and voting
 */
export const DiagnosisDetails: React.FC<DiagnosisDetailsProps> = ({
  diagnosisId,
  userId,
  onRetry
}) => {
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adjustedConfidenceScore, setAdjustedConfidenceScore] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Fetch diagnosis details
  useEffect(() => {
    const fetchDiagnosis = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('diagnoses')
          .select('*')
          .eq('id', diagnosisId)
          .single();
          
        if (fetchError) {
          console.error('Error fetching diagnosis:', fetchError);
          setError('Failed to load diagnosis details');
          return;
        }
        
        setDiagnosis(data);
      } catch (err) {
        console.error('Error in diagnosis fetch:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (diagnosisId) {
      fetchDiagnosis();
    }
  }, [diagnosisId]);
  
  // Save diagnosis to logbook
  const handleSaveToLogbook = async () => {
    if (!diagnosis) return;
    
    setIsSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('diagnoses')
        .update({ saved_to_logbook: true })
        .eq('id', diagnosis.id);
        
      if (updateError) {
        console.error('Error saving to logbook:', updateError);
        throw updateError;
      }
      
      // Update local state
      setDiagnosis({
        ...diagnosis,
        saved_to_logbook: true
      });
    } catch (err) {
      console.error('Failed to save to logbook:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading diagnosis details...</Text>
      </View>
    );
  }
  
  if (error || !diagnosis) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Diagnosis not found'}</Text>
      </View>
    );
  }
  
  // Normalize confidence score to be between 0 and 1
  const confidenceScore = diagnosis.confidence_score > 1 
    ? diagnosis.confidence_score / 100 
    : diagnosis.confidence_score;
  
  // Get diagnosis data from ai_diagnosis field
  let aiDiagnosis = diagnosis.ai_diagnosis;
  
  // Parse ai_diagnosis if it's a string
  if (typeof aiDiagnosis === 'string') {
    try {
      aiDiagnosis = JSON.parse(aiDiagnosis);
    } catch (e) {
      console.error('Failed to parse ai_diagnosis JSON:', e);
    }
  }
  
  console.log('AI Diagnosis data:', aiDiagnosis);
  
  // Extract data from diagnosis and ai_diagnosis
  const plantType = diagnosis.plant_type || '';
  const diseaseName = diagnosis.disease_name || '';
  
  // Extract description from various possible locations
  const description = diagnosis.description || 
    aiDiagnosis?.description || 
    aiDiagnosis?.result?.description || 
    '';
  
  // Extract treatments from various possible locations
  let organicTreatments = [];
  let chemicalTreatments = [];
  let preventiveMeasures = [];
  
  // Try to get treatments from ai_diagnosis
  if (aiDiagnosis) {
    // Direct properties
    if (aiDiagnosis.organic_treatments) {
      organicTreatments = aiDiagnosis.organic_treatments;
    } else if (aiDiagnosis.result?.organic_treatments) {
      organicTreatments = aiDiagnosis.result.organic_treatments;
    } else if (aiDiagnosis.organic_treatment) {
      // Handle string format
      if (typeof aiDiagnosis.organic_treatment === 'string') {
        organicTreatments = [{ name: 'Organic Treatment', description: aiDiagnosis.organic_treatment }];
      }
    }
    
    // Chemical treatments
    if (aiDiagnosis.chemical_treatments) {
      chemicalTreatments = aiDiagnosis.chemical_treatments;
    } else if (aiDiagnosis.result?.chemical_treatments) {
      chemicalTreatments = aiDiagnosis.result.chemical_treatments;
    } else if (aiDiagnosis.chemical_treatment) {
      // Handle string format
      if (typeof aiDiagnosis.chemical_treatment === 'string') {
        chemicalTreatments = [{ name: 'Chemical Treatment', description: aiDiagnosis.chemical_treatment }];
      }
    }
    
    // Preventive measures
    if (aiDiagnosis.preventive_measures) {
      preventiveMeasures = aiDiagnosis.preventive_measures;
    } else if (aiDiagnosis.result?.preventive_measures) {
      preventiveMeasures = aiDiagnosis.result.preventive_measures;
    } else if (aiDiagnosis.prevention) {
      // Handle string format
      if (typeof aiDiagnosis.prevention === 'string') {
        preventiveMeasures = [aiDiagnosis.prevention];
      }
    }
  }
  
  // If treatments are still empty, try to parse from treatment JSON if it exists
  if (organicTreatments.length === 0 && chemicalTreatments.length === 0 && diagnosis.treatment) {
    try {
      const treatmentData = typeof diagnosis.treatment === 'string' ? 
        JSON.parse(diagnosis.treatment) : diagnosis.treatment;
      
      if (treatmentData.organic) {
        organicTreatments = [{ name: 'Organic Treatment', description: treatmentData.organic }];
      }
      
      if (treatmentData.chemical) {
        chemicalTreatments = [{ name: 'Chemical Treatment', description: treatmentData.chemical }];
      }
      
      if (treatmentData.prevention) {
        preventiveMeasures = [treatmentData.prevention];
      }
    } catch (e) {
      console.error('Failed to parse treatment JSON:', e);
    }
  }
  
  return (
    <ScrollView style={styles.container}>
      <Card>
        <View style={styles.imageContainer}>
          <Image source={{ uri: diagnosis.image_url }} style={styles.image} />
        </View>
        
        <View style={styles.resultHeader}>
          <View style={styles.plantInfo}>
            <Text style={styles.plantType}>{plantType}</Text>
            <Text style={styles.diseaseName}>{diseaseName}</Text>
          </View>
          
          <View style={styles.confidenceContainer}>
            <ConfidenceMeter 
              score={adjustedConfidenceScore !== null ? adjustedConfidenceScore : confidenceScore} 
              size="medium" 
              showLabel={true} 
              showPercentage={true} 
            />
            {adjustedConfidenceScore !== null && adjustedConfidenceScore !== confidenceScore && (
              <Text style={styles.communityAdjustedText}>
                Community adjusted: {Math.round((adjustedConfidenceScore - confidenceScore) * 100) > 0 ? '+' : ''}
                {Math.round((adjustedConfidenceScore - confidenceScore) * 100)}%
              </Text>
            )}
            
            {/* Voting system directly below confidence meter */}
            <VotingSystem 
              diagnosisId={diagnosis.id} 
              initialConfidence={confidenceScore}
              onConfidenceUpdate={setAdjustedConfidenceScore}
            />
          </View>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        
        <View style={styles.treatmentsContainer}>
          <Text style={styles.sectionTitle}>Recommended Treatments</Text>
          
          {organicTreatments.length > 0 && (
            <View style={styles.treatmentSection}>
              <Text style={styles.treatmentTypeTitle}>Organic Options</Text>
              
              {organicTreatments.map((treatment: Treatment, index: number) => (
                <View key={`organic-${index}`} style={styles.treatmentCard}>
                  <Text style={styles.treatmentName}>{treatment.name}</Text>
                  <Text style={styles.treatmentDescription}>{treatment.description}</Text>
                  {treatment.effectiveness && (
                    <Text style={styles.treatmentEffectiveness}>
                      Effectiveness: {treatment.effectiveness}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
          
          {chemicalTreatments.length > 0 && (
            <View style={styles.treatmentSection}>
              <Text style={styles.treatmentTypeTitle}>Chemical Options</Text>
              
              {chemicalTreatments.map((treatment: Treatment, index: number) => (
                <View key={`chemical-${index}`} style={styles.treatmentCard}>
                  <Text style={styles.treatmentName}>{treatment.name}</Text>
                  <Text style={styles.treatmentDescription}>{treatment.description}</Text>
                  {treatment.effectiveness && (
                    <Text style={styles.treatmentEffectiveness}>
                      Effectiveness: {treatment.effectiveness}
                    </Text>
                  )}
                  {treatment.safetyPrecautions && (
                    <Text style={styles.safetyPrecautions}>
                      Safety: {treatment.safetyPrecautions}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
        
        {preventiveMeasures.length > 0 && (
          <View style={styles.preventiveContainer}>
            <Text style={styles.sectionTitle}>Preventive Measures</Text>
            <View style={styles.preventiveList}>
              {preventiveMeasures.map((measure: string, index: number) => (
                <View key={`preventive-${index}`} style={styles.preventiveItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.preventiveText}>{measure}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          {!diagnosis.saved_to_logbook && (
            <Button
              title={isSaving ? "Saving..." : "Save to Logbook"}
              onPress={handleSaveToLogbook}
              variant="primary"
              disabled={isSaving}
              style={styles.actionButton}
            />
          )}
          
          {onRetry && (
            <Button
              title="Try Again"
              onPress={onRetry}
              variant="secondary"
              style={styles.actionButton}
            />
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  plantInfo: {
    flex: 1,
  },
  plantType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  communityAdjustedText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  treatmentsContainer: {
    marginBottom: 16,
  },
  treatmentSection: {
    marginBottom: 16,
  },
  treatmentTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  treatmentCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  treatmentDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  treatmentEffectiveness: {
    fontSize: 14,
    color: '#666',
  },
  safetyPrecautions: {
    fontSize: 14,
    color: '#D32F2F',
    marginTop: 4,
  },
  preventiveContainer: {
    marginBottom: 16,
  },
  preventiveList: {
    marginLeft: 8,
  },
  preventiveItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    lineHeight: 24,
  },
  preventiveText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default DiagnosisDetails;
