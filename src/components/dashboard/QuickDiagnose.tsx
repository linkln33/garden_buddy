"use client";

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { createBrowserClient } from '@supabase/ssr';
import ImageUploader from '../diagnose/ImageUploader';
import DiagnosisResult from '../diagnose/DiagnosisResult';
import type { Database } from '../../lib/supabase/types';

interface QuickDiagnoseProps {
  userId: string;
  onDiagnosisComplete?: (imageUrl: string, diagnosisId: string) => void;
  showFullOptions?: boolean;
}

/**
 * Dashboard component that uses the same functionality as the diagnose page
 * Shows results inline instead of in a modal
 */
export default function QuickDiagnose({ userId, onDiagnosisComplete, showFullOptions = true }: QuickDiagnoseProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<'hybrid' | 'claude' | 'openai' | 'perplexity'>('hybrid');
  const [plantType, setPlantType] = useState<string>('');
  const [currentDiagnosisId, setCurrentDiagnosisId] = useState<string | null>(null);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Handle image capture from the ImageUploader component
  const handleImageCaptured = async (base64Image: string) => {
    setImageBase64(base64Image);
    setIsAnalyzing(true);
    setError(null);

    try {
      // Ensure the image is properly formatted
      const formattedBase64 = base64Image.startsWith('data:') 
        ? base64Image 
        : `data:image/jpeg;base64,${base64Image}`;
      
      // Determine API endpoint based on selected provider
      let apiEndpoint = aiProvider === 'openai' ? '/api/openai' : 
                       aiProvider === 'claude' ? '/api/claude' : 
                       aiProvider === 'perplexity' ? '/api/perplexity' :
                       '/api/diagnose-hybrid';
      
      console.log('Using AI provider:', aiProvider);
      
      // Call our server-side API route to analyze the image
      let response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          base64Image: formattedBase64,
          plantType: plantType || undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to analyze image: ${response.statusText}`);
      }
      
      let data = await response.json();
      
      if (data.error) {
        let errorMessage = 'API error occurred';
        if (data.error === 'INSUFFICIENT_BALANCE') {
          errorMessage = 'Claude account has insufficient balance. Please add credits or try another provider.';
        } else if (data.error === 'INVALID_API_KEY') {
          errorMessage = 'Invalid Claude API key. Please check your configuration.';
        } else if (data.errorDetails) {
          errorMessage = data.errorDetails;
        }
        
        // Fallback to Plant Database if AI API fails
        console.log('AI API failed, falling back to Plant Database');
        setAiProvider('hybrid');
        
        // Try with Plant Database API instead
        apiEndpoint = '/api/diagnose-hybrid';
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            base64Image: formattedBase64,
            plantType: plantType || undefined
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to analyze image: ${response.statusText}`);
        }
        
        data = await response.json();
      }
      
      const result = data.result;
      console.log('AI analysis result:', result);
      console.log('Is mock response:', data.mockResponse ? 'YES' : 'NO');
      setDiagnosisResult(result);
      
      // Save diagnosis to database if user is logged in
      if (userId) {
        await saveDiagnosisToDatabase(result, base64Image, userId);
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(`Failed to analyze image: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save diagnosis to Supabase database
  const saveDiagnosisToDatabase = async (
    diagnosis: any,
    imageBase64: string,
    userId: string
  ) => {
    try {
      // Extract the base64 data from the data URL
      const base64Data = imageBase64.includes('base64,') 
        ? imageBase64.split(',')[1] 
        : imageBase64;
      
      // Create a Blob from the base64 data
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'image/jpeg' });

      // Upload image to Supabase storage - use the 12ncbh6_1 folder which has proper RLS permissions
      const { data: imageData, error: imageError } = await supabase.storage
        .from('plant-images')
        .upload(`12ncbh6_1/${Date.now()}.jpg`, blob, {
          contentType: 'image/jpeg',
        });

      if (imageError) {
        throw imageError;
      }

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('plant-images')
        .getPublicUrl(imageData.path);
        
      setSavedImageUrl(publicUrl);

      // Insert diagnosis into database
      const { data: diagnosisData, error: insertError } = await supabase.from('diagnoses').insert({
        user_id: userId,
        plant_type: diagnosis.plantType || plantType,
        disease_name: diagnosis.diseaseName,
        confidence_score: diagnosis.confidenceScore,
        description: diagnosis.description,
        image_url: publicUrl,
        ai_diagnosis: diagnosis, // Store the full diagnosis result as JSONB
        status: diagnosis.confidenceScore >= 0.8 ? 'confirmed' : 'pending',
        shared_with_community: false,
      }).select().single();

      if (insertError) {
        throw insertError;
      }
      
      // Set the current diagnosis ID for the modal
      if (diagnosisData) {
        setCurrentDiagnosisId(diagnosisData.id);
        
        // Notify parent component if callback exists
        if (onDiagnosisComplete) {
          onDiagnosisComplete(publicUrl, diagnosisData.id);
        }
      }
    } catch (err) {
      console.error('Error saving diagnosis:', err);
      setError(`Failed to save diagnosis: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Handle retry button click
  const handleRetry = () => {
    setImageBase64(null);
    setDiagnosisResult(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      {/* Main content - Upload on left, results on right */}
      <View style={styles.mainContent}>
        {/* Left side - Image upload and options */}
        <View style={styles.leftColumn}>
          <Text style={styles.title}>Quick Plant Diagnosis</Text>
          
          {showFullOptions && (
            <View style={styles.optionsContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Plant Type (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter plant type (e.g., tomato, rose)"
                  value={plantType}
                  onChangeText={setPlantType}
                />
              </View>

              {/* AI Provider Selection */}
              <View style={styles.providerSection}>
                <Text style={styles.label}>Select AI Provider</Text>
                <View style={styles.providerContainer}>
                  <TouchableOpacity 
                    style={[styles.providerButton, 
                      aiProvider === 'hybrid' && styles.selectedProvider,
                      aiProvider === 'hybrid' && styles.recommendedProvider]}
                    onPress={() => setAiProvider('hybrid')}
                  >
                    <Text style={styles.providerButtonText}>Plant Database</Text>
                    {aiProvider === 'hybrid' && <Text style={styles.recommendedText}>Recommended</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.providerButton, aiProvider === 'claude' && styles.selectedProvider]}
                    onPress={() => setAiProvider('claude')}
                  >
                    <Text style={styles.providerButtonText}>Claude AI</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.providerButton, aiProvider === 'perplexity' && styles.selectedProvider]}
                    onPress={() => setAiProvider('perplexity')}
                  >
                    <Text style={styles.providerButtonText}>Perplexity AI</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.providerButton, aiProvider === 'openai' && styles.selectedProvider]}
                    onPress={() => setAiProvider('openai')}
                  >
                    <Text style={styles.providerButtonText}>OpenAI</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.providerDescriptionContainer}>
                  {aiProvider === 'hybrid' && <Text style={styles.providerDescriptionText}>🆓 Uses our plant disease database - works offline, instant results</Text>}
                  {aiProvider === 'claude' && <Text style={styles.providerDescriptionText}>🆓 Claude AI vision analysis - requires API key, very accurate</Text>}
                  {aiProvider === 'perplexity' && <Text style={styles.providerDescriptionText}>🆓 Up-to-date plant information - uses web search, most current data</Text>}
                  {aiProvider === 'openai' && <Text style={styles.providerDescriptionText}>💰 Premium AI vision analysis - requires OpenAI API key, most accurate</Text>}
                </View>
              </View>
            </View>
          )}
          
          {/* Upload options only, no image preview */}
          <View style={styles.uploadSection}>
            <Text style={styles.uploadTitle}>Upload Plant Image</Text>
            <Text style={styles.uploadSubtitle}>Take a clear photo of the plant leaf to diagnose any diseases</Text>
            <View style={styles.imageUploaderContainer}>
              <ImageUploader 
                onImageCaptured={handleImageCaptured} 
                isUploading={isAnalyzing}
                error={error}
                compact={true}
                hidePreview={true}
              />
            </View>
          </View>
        </View>
        
        {/* Right side - Diagnosis results */}
        <View style={styles.rightColumn}>
          {diagnosisResult ? (
            <ScrollView style={styles.resultsContainer}>
              <DiagnosisResult
                imageUrl={savedImageUrl || imageBase64 || ''}
                plantType={diagnosisResult.plantType || plantType}
                diseaseName={diagnosisResult.diseaseName}
                confidenceScore={diagnosisResult.confidenceScore}
                description={diagnosisResult.description}
                organicTreatments={diagnosisResult.organic_treatments}
                chemicalTreatments={diagnosisResult.chemical_treatments}
                preventiveMeasures={diagnosisResult.preventive_measures}
                result={diagnosisResult}
                onRetry={handleRetry}
                confidenceMeterSize="large"
              />
            </ScrollView>
          ) : (
            <View style={styles.emptyResultsContainer}>
              <Text style={styles.emptyResultsText}>Upload a plant image to get a diagnosis</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  mainContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  leftColumn: {
    flex: 1,
    minWidth: 300,
    marginRight: 16,
  },
  rightColumn: {
    flex: 1,
    minWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
  },
  providerSection: {
    marginBottom: 16,
  },
  providerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerButton: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    padding: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedProvider: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  recommendedProvider: {
    borderWidth: 2,
  },
  providerButtonText: {
    fontSize: 14,
    color: '#333333',
  },
  recommendedText: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 4,
  },
  imageUploaderContainer: {
    marginTop: 16,
  },
  resultsContainer: {
    maxHeight: 600,
  },
  emptyResultsContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    height: 400,
  },
  emptyResultsText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  // New styles for upload section
  uploadSection: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  providerDescriptionContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  providerDescriptionText: {
    fontSize: 12,
    color: '#666666',
  },
});
