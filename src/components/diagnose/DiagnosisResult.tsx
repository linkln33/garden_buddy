import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ConfidenceMeter } from '../ui/ConfidenceMeter';
import VotingSystem from '../community/VotingSystem';
import PesticideRecommendations from '../PesticideRecommendations';

interface Treatment {
  name: string;
  description: string;
  type: 'organic' | 'chemical';
}

interface DiagnosisResultProps {
  result: {
    plant_type?: string;
    plantType?: string;
    disease?: string;
    disease_name?: string;
    diseaseName?: string;
    confidence?: number;
    confidence_score?: number;
    treatments?: Treatment[];
    treatment?: Treatment[];
    causes?: string[];
    cause?: string[];
    symptoms?: string[];
    symptom?: string[];
    preventiveMeasures?: string[];
    preventive_measures?: string[];
    severity?: string;
    recommendations?: string[];
    recommendation?: string[];
  };
  imageUrl: string;
  isLoading?: boolean;
  plantType?: string;
  diseaseName?: string;
  confidenceScore?: number;
  treatments?: Treatment[];
  causes?: string[];
  symptoms?: string[];
  preventiveMeasures?: string[];
  onReanalyze?: () => void;
}

export default function DiagnosisResult({
  result,
  imageUrl,
  isLoading = false,
  plantType,
  diseaseName,
  confidenceScore,
  treatments,
  causes,
  symptoms,
  preventiveMeasures,
  onReanalyze
}: DiagnosisResultProps) {
  const [showFullTreatments, setShowFullTreatments] = useState(false);
  const [adjustedConfidenceScore, setAdjustedConfidenceScore] = useState<number | null>(null);

  // Extract data with fallbacks
  const actualPlantType = plantType || result?.plant_type || result?.plantType || 'Unknown Plant';
  const actualDiseaseName = diseaseName || result?.disease || result?.disease_name || result?.diseaseName || 'Unknown Issue';
  const actualConfidenceScore = confidenceScore ?? result?.confidence ?? result?.confidence_score ?? 0;
  const actualTreatments = treatments || result?.treatments || result?.treatment || [];
  const actualCauses = causes || result?.causes || result?.cause || [];
  const actualSymptoms = symptoms || result?.symptoms || result?.symptom || [];
  const actualPreventiveMeasures = preventiveMeasures || result?.preventiveMeasures || result?.preventive_measures || [];
  
  // Determine if the diagnosis should be shared with the community based on confidence score
  const shouldShareWithCommunity = actualConfidenceScore < 0.8;

  const confidenceMeterSize = 80;

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4">
          <img 
            src={imageUrl} 
            alt="Plant diagnosis" 
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-3 text-gray-600">Analyzing your plant...</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{actualPlantType}</h2>
                <h3 className="text-lg text-red-600 font-medium">{actualDiseaseName}</h3>
              </div>
              
              <div className="flex flex-col items-center">
                <ConfidenceMeter 
                  score={adjustedConfidenceScore !== null ? adjustedConfidenceScore : actualConfidenceScore} 
                  size={confidenceMeterSize} 
                  showLabel={true} 
                  showPercentage={true} 
                />
              </div>
            </div>

            {/* Symptoms Section */}
            {actualSymptoms.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">🔍 Symptoms Identified</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-1">
                    {actualSymptoms.map((symptom, index) => (
                      <li key={index} className="text-yellow-800">{symptom}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Causes Section */}
            {actualCauses.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">🦠 Possible Causes</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-1">
                    {actualCauses.map((cause, index) => (
                      <li key={index} className="text-red-800">{cause}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Treatment Section */}
            {actualTreatments.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">💊 Treatment Options</h4>
                  {actualTreatments.length > 3 && (
                    <button
                      onClick={() => setShowFullTreatments(!showFullTreatments)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      {showFullTreatments ? 'Show Less' : `Show All (${actualTreatments.length})`}
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {(showFullTreatments ? actualTreatments : actualTreatments.slice(0, 3)).map((treatment, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-green-800">{treatment.name}</h5>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          treatment.type === 'organic' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {treatment.type === 'organic' ? '🌿 Organic' : '🧪 Chemical'}
                        </span>
                      </div>
                      <p className="text-green-700 text-sm">{treatment.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preventive Measures Section */}
            {actualPreventiveMeasures.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">🛡️ Prevention Tips</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-1">
                    {actualPreventiveMeasures.map((measure, index) => (
                      <li key={index} className="text-blue-800">{measure}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              {onReanalyze && (
                <Button
                  title="🔄 Re-analyze"
                  onPress={onReanalyze}
                  variant="outline"
                />
              )}
              
              <Button
                title="📱 Share Results"
                onPress={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Plant Diagnosis: ${actualDiseaseName}`,
                      text: `My ${actualPlantType} has been diagnosed with ${actualDiseaseName}. Confidence: ${Math.round(actualConfidenceScore * 100)}%`,
                    });
                  } else {
                    // Fallback for browsers that don't support Web Share API
                    const text = `My ${actualPlantType} has been diagnosed with ${actualDiseaseName}. Confidence: ${Math.round(actualConfidenceScore * 100)}%`;
                    navigator.clipboard.writeText(text);
                    alert('Results copied to clipboard!');
                  }
                }}
                variant="outline"
              />
            </div>

            {/* Community Voting Section */}
            {shouldShareWithCommunity && (
              <div className="mb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <h4 className="text-lg font-semibold text-amber-800 mb-2">🤝 Community Verification</h4>
                  <p className="text-amber-700 text-sm mb-3">
                    The AI confidence is below 80%. Would you like the community to help verify this diagnosis?
                  </p>
                </div>
                
                <VotingSystem
                  diagnosisId={`diagnosis-${Date.now()}`}
                  initialDiagnosis={{
                    plant_type: actualPlantType,
                    disease: actualDiseaseName,
                    confidence: actualConfidenceScore,
                    treatments: actualTreatments,
                    image_url: imageUrl
                  }}
                  onVoteComplete={(newConfidence) => {
                    setAdjustedConfidenceScore(newConfidence);
                  }}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Pesticide Recommendations */}
      {!isLoading && actualDiseaseName !== 'Unknown Issue' && (
        <PesticideRecommendations 
          diagnosis={actualDiseaseName}
          plantType={actualPlantType}
        />
      )}
    </div>
  );
}
