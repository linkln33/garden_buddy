import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ConfidenceMeter } from '../ui/ConfidenceMeter';
import VotingSystem from '../community/VotingSystem';

interface Treatment {
  name: string;
  description: string;
  effectiveness: string;
  materials?: string[];
  activeIngredients?: string[];
  safetyPrecautions?: string;
}

interface DiagnosisResultProps {
  imageUrl: string;
  plantType?: string;
  diseaseName?: string;
  confidenceScore?: number;
  description?: string;
  organicTreatments?: Treatment[];
  chemicalTreatments?: Treatment[];
  preventiveMeasures?: string[];
  onSaveToLogbook?: () => Promise<void>;
  onShareToCommunity?: () => void;
  onCommunityVoting?: () => Promise<void>;
  onRetry?: () => void;
  isSaving?: boolean;
  isSharing?: boolean;
  isLoading?: boolean;
  result?: any;
  confidenceMeterSize?: 'small' | 'medium' | 'large';
}

/**
 * DiagnosisResult component displays the AI analysis results with confidence meter
 */
export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({
  imageUrl,
  plantType,
  diseaseName,
  confidenceScore,
  description,
  organicTreatments,
  chemicalTreatments,
  preventiveMeasures,
  onSaveToLogbook,
  onShareToCommunity,
  onCommunityVoting,
  onRetry,
  isSaving = false,
  isSharing = false,
  isLoading = false,
  result,
  confidenceMeterSize = 'medium',
}) => {
  // State for community-adjusted confidence score
  const [adjustedConfidenceScore, setAdjustedConfidenceScore] = useState<number | null>(null);
  // Extract data from result prop if provided
  const actualPlantType = plantType || (result?.plantType || result?.plant_type || '');
  const actualDiseaseName = diseaseName || (result?.diseaseName || result?.disease_name || '');
  
  // Ensure confidence score is properly normalized between 0 and 1
  let actualConfidenceScore = 0;
  if (confidenceScore !== undefined) {
    actualConfidenceScore = confidenceScore > 1 ? confidenceScore / 100 : confidenceScore;
  } else if (result?.confidenceScore !== undefined) {
    actualConfidenceScore = result.confidenceScore > 1 ? result.confidenceScore / 100 : result.confidenceScore;
  } else if (result?.confidence !== undefined) {
    actualConfidenceScore = result.confidence > 1 ? result.confidence / 100 : result.confidence;
  } else if (result?.confidence_score !== undefined) {
    actualConfidenceScore = result.confidence_score > 1 ? result.confidence_score / 100 : result.confidence_score;
  }
  
  console.log('=== CONFIDENCE SCORE DEBUG ===');
  console.log('Raw confidenceScore prop:', confidenceScore);
  console.log('result object:', result);
  console.log('result.confidenceScore:', result?.confidenceScore);
  console.log('result.confidence:', result?.confidence);
  console.log('result.confidence_score:', result?.confidence_score);
  console.log('Final actualConfidenceScore:', actualConfidenceScore);
  console.log('==============================');
  
  const actualDescription = description || (result?.description || '');
  const actualOrganicTreatments = organicTreatments || (result?.organic_treatments || []);
  const actualChemicalTreatments = chemicalTreatments || (result?.chemical_treatments || []);
  const actualPreventiveMeasures = preventiveMeasures || (result?.preventiveMeasures || result?.preventive_measures || []);
  
  // Determine if the diagnosis should be shared with the community based on confidence score
  const shouldShareWithCommunity = actualConfidenceScore < 0.8;

  return (
    <ScrollView style={styles.container}>
      <Card>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Analyzing your plant...</Text>
          </View>
        ) : (
          <>
            <View style={styles.resultHeader}>
              <View style={styles.plantInfo}>
                <Text style={styles.plantType}>{actualPlantType}</Text>
                <Text style={styles.diseaseName}>{actualDiseaseName}</Text>
              </View>
              
              <View style={styles.confidenceContainer}>
                <ConfidenceMeter 
                  score={adjustedConfidenceScore !== null ? adjustedConfidenceScore : actualConfidenceScore} 
                  size={confidenceMeterSize} 
                  showLabel={true} 
                  showPercentage={true} 
                />
                {adjustedConfidenceScore !== null && adjustedConfidenceScore !== actualConfidenceScore && (
                  <Text style={styles.communityAdjustedText}>
                    Community adjusted: {Math.round((adjustedConfidenceScore - actualConfidenceScore) * 100) > 0 ? '+' : ''}
                    {Math.round((adjustedConfidenceScore - actualConfidenceScore) * 100)}%
                  </Text>
                )}
                
                {/* Voting system directly below confidence meter */}
                <VotingSystem 
                  diagnosisId={result?.id || 'temp-id'} 
                  initialConfidence={actualConfidenceScore}
                  onConfidenceUpdate={setAdjustedConfidenceScore}
                />
              </View>
            </View>
            
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{actualDescription}</Text>
            </View>
          </>
        )}
        
        {!isLoading && (
          <View style={styles.treatmentsContainer}>
            <Text style={styles.sectionTitle}>Recommended Treatments</Text>
            
            {actualOrganicTreatments.length > 0 && (
              <View style={styles.treatmentSection}>
                <Text style={styles.treatmentTypeTitle}>Organic Options</Text>
                
                {actualOrganicTreatments.map((treatment: Treatment, index: number) => (
                  <View key={`organic-${index}`} style={styles.treatmentCard}>
                    <View style={styles.treatmentHeader}>
                      <Text style={styles.treatmentName}>{treatment.name}</Text>
                      <View style={[
                        styles.effectivenessBadge,
                        treatment.effectiveness === 'High' ? styles.highEffectiveness :
                        treatment.effectiveness === 'Medium' ? styles.mediumEffectiveness :
                        styles.lowEffectiveness
                      ]}>
                        <Text style={styles.effectivenessText}>{treatment.effectiveness}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.treatmentDescription}>{treatment.description}</Text>
                    
                    {treatment.materials && treatment.materials.length > 0 && (
                      <View style={styles.materialsContainer}>
                        <Text style={styles.materialsTitle}>Materials Needed:</Text>
                        {treatment.materials.map((material: string, idx: number) => (
                          <Text key={idx} style={styles.materialItem}>• {material}</Text>
                        ))}
                      </View>
                    )}
                  </View>
              ))}
            </View>
          )}
          
          {actualChemicalTreatments.length > 0 && (
            <View style={styles.treatmentSection}>
              <Text style={styles.treatmentTypeTitle}>Chemical Options</Text>
              
              {actualChemicalTreatments.map((treatment: Treatment, index: number) => (
                <View key={`chemical-${index}`} style={styles.treatmentCard}>
                  <View style={styles.treatmentHeader}>
                    <Text style={styles.treatmentName}>{treatment.name}</Text>
                    <View style={[
                      styles.effectivenessBadge,
                      treatment.effectiveness === 'High' ? styles.highEffectiveness :
                      treatment.effectiveness === 'Medium' ? styles.mediumEffectiveness :
                      styles.lowEffectiveness
                    ]}>
                      <Text style={styles.effectivenessText}>{treatment.effectiveness}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.treatmentDescription}>{treatment.description}</Text>
                  
                  {treatment.activeIngredients && treatment.activeIngredients.length > 0 && (
                    <View style={styles.materialsContainer}>
                      <Text style={styles.materialsTitle}>Active Ingredients:</Text>
                      {treatment.activeIngredients.map((ingredient: string, idx: number) => (
                        <Text key={idx} style={styles.materialItem}>• {ingredient}</Text>
                      ))}
                    </View>
                  )}
                  
                  {treatment.safetyPrecautions && (
                    <View style={styles.safetyContainer}>
                      <Text style={styles.safetyTitle}>Safety Precautions:</Text>
                      <Text style={styles.safetyText}>{treatment.safetyPrecautions}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
        )}
        
        {!isLoading && actualPreventiveMeasures.length > 0 && (
          <View style={styles.preventiveContainer}>
            <Text style={styles.sectionTitle}>Preventive Measures</Text>
            {actualPreventiveMeasures.map((measure: string, index: number) => (
              <Text key={index} style={styles.preventiveItem}>• {measure}</Text>
            ))}
          </View>
        )}
        
        {!isLoading && (
          <View style={styles.actionsContainer}>
            {onRetry && (
              <Button
                title="Try Again"
                onPress={onRetry}
                variant="secondary"
                fullWidth
                style={{marginBottom: 10}}
              />
            )}
            
            {onSaveToLogbook && (
              <Button
                title="Save to Logbook"
                onPress={() => onSaveToLogbook()}
                variant="primary"
                loading={isSaving}
                fullWidth
              />
            )}
            
            {/* Community voting system moved directly below confidence meter */}
            
            {shouldShareWithCommunity && onCommunityVoting && (
              <View style={styles.communityShareContainer}>
                <Text style={styles.communityShareText}>
                  This diagnosis has low confidence. Share with the community for help?
                </Text>
                <Button
                  title="Share with Community"
                  onPress={() => onCommunityVoting()}
                  variant="secondary"
                  loading={isSharing}
                  fullWidth
                />
              </View>
            )}
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  communityAdjustedText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
    color: '#666666',
  },
  communityVotingContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  imageContainer: {
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 'auto',
    aspectRatio: 16/9,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#f0f0f0',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  plantInfo: {
    flex: 1,
  },
  plantType: {
    fontSize: 14,
    color: '#666666',
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginTop: 4,
  },
  confidenceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
  },
  treatmentsContainer: {
    marginBottom: 24,
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
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  effectivenessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  highEffectiveness: {
    backgroundColor: '#E8F5E9',
  },
  mediumEffectiveness: {
    backgroundColor: '#FFF8E1',
  },
  lowEffectiveness: {
    backgroundColor: '#FFEBEE',
  },
  effectivenessText: {
    fontSize: 12,
    fontWeight: '500',
  },
  treatmentDescription: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 12,
  },
  materialsContainer: {
    marginTop: 8,
  },
  materialsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  materialItem: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    marginBottom: 2,
  },
  safetyContainer: {
    marginTop: 12,
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 4,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D32F2F',
    marginBottom: 4,
  },
  safetyText: {
    fontSize: 14,
    color: '#666666',
  },
  preventiveContainer: {
    marginBottom: 24,
  },
  preventiveItem: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 6,
  },
  actionsContainer: {
    gap: 16,
  },
  communityShareContainer: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  communityShareText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default DiagnosisResult;
