"use client";

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import ImageUploader from '../../components/diagnose/ImageUploader';
import DiagnosisResult from '../../components/diagnose/DiagnosisResult';
import { detectPlantDisease } from '../../lib/openai';
import type { Database } from '../../lib/supabase/types';

/**
 * Diagnose page for capturing plant images and getting AI diagnosis
 */
export default function DiagnosePage() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<'hybrid' | 'claude' | 'openai' | 'perplexity'>('hybrid');
  const [plantType, setPlantType] = useState<string>('');
  const router = useRouter();
  const supabase = createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  // Handle image capture/selection
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await saveDiagnosisToDatabase(result, base64Image, session.user.id);
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again.');
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
      // Upload image to Supabase storage
      const { data: imageData, error: imageError } = await supabase.storage
        .from('plant-images')
        .upload(`${userId}/${Date.now()}.jpg`, base64ToBlob(imageBase64), {
          contentType: 'image/jpeg',
        });

      if (imageError) {
        throw imageError;
      }

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('plant-images')
        .getPublicUrl(imageData.path);

      // Insert diagnosis into database
      const { error: insertError } = await supabase.from('diagnoses').insert({
        user_id: userId,
        plant_type: diagnosis.plantType,
        disease_name: diagnosis.diseaseName,
        confidence_score: diagnosis.confidenceScore,
        description: diagnosis.description,
        image_url: publicUrl,
        ai_diagnosis: diagnosis, // Store the full diagnosis result as JSONB
        status: diagnosis.confidenceScore >= 80 ? 'confirmed' : 'pending',
      });

      if (insertError) {
        throw insertError;
      }
    } catch (err) {
      console.error('Error saving diagnosis to database:', err);
      // Log detailed error information
      if (err && typeof err === 'object') {
        if ('code' in err) console.error('Error code:', err.code);
        if ('message' in err) console.error('Error message:', err.message);
        if ('details' in err) console.error('Error details:', err.details);
      }
      // We don't set UI error here since the diagnosis was successful
      // and only the saving failed
    }
  };

  // Convert base64 to Blob for storage upload
  const base64ToBlob = (base64: string) => {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  };

  // Handle retry button click
  const handleRetry = () => {
    setImageBase64(null);
    setDiagnosisResult(null);
    setError(null);
  };

  // Handle re-analyze with different AI provider
  const handleReanalyze = async () => {
    if (!imageBase64) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Re-analyze the existing image
      const formattedBase64 = imageBase64.startsWith('data:') 
        ? imageBase64 
        : `data:image/jpeg;base64,${imageBase64}`;
      
      // Determine API endpoint based on selected provider
      let apiEndpoint = aiProvider === 'openai' ? '/api/openai' : 
                       aiProvider === 'claude' ? '/api/claude' : 
                       aiProvider === 'perplexity' ? '/api/perplexity' :
                       '/api/diagnose-hybrid';
      
      console.log('Retrying with AI provider:', aiProvider);
      
      // Call our server-side API route to analyze the image again
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
      console.log('AI re-analysis result:', result);
      console.log('Is mock response:', data.mockResponse ? 'YES' : 'NO');
      setDiagnosisResult(result);
    } catch (err: any) {
      console.error('Error re-analyzing image:', err);
      setError(`Failed to re-analyze image: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle save to logbook
  const handleSaveToLogbook = async () => {
    // Navigate to logbook page
    router.push('/logbook');
  };

  // Handle community voting
  const handleCommunityVoting = async () => {
    // Navigate to community page
    router.push('/community');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diagnose Plant</Text>
        <Text style={styles.subtitle}>
          Take or upload a photo of your plant to identify diseases
        </Text>
      </View>

      {!diagnosisResult ? (
        <>
          {/* Plant Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plant Type (Optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter plant type (e.g., tomato, rose)"
                value={plantType}
                onChangeText={setPlantType}
              />
            </View>
          </View>

          {/* AI Provider Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select AI Provider</Text>
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
            <Text style={styles.providerDescription}>
              {aiProvider === 'hybrid' && '🆓 Uses our plant disease database - works offline, instant results'}
              {aiProvider === 'claude' && '🆓 Claude AI vision analysis - requires API key, very accurate'}
              {aiProvider === 'perplexity' && '🆓 Up-to-date plant information - uses web search, most current data'}
              {aiProvider === 'openai' && '💰 Premium AI vision analysis - requires OpenAI API key, most accurate'}
            </Text>
          </View>

          <ImageUploader 
            onImageCaptured={handleImageCaptured} 
            isLoading={isAnalyzing}
            error={error}
          />
        </>
      ) : (
        <DiagnosisResult
          imageUrl={imageBase64 || ''}
          isLoading={isAnalyzing}
          result={diagnosisResult}
          onRetry={handleRetry}
          onSaveToLogbook={handleSaveToLogbook}
          onCommunityVoting={
            diagnosisResult?.confidenceScore < 80 ? handleCommunityVoting : undefined
          }
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  providerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  providerButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    backgroundColor: '#F5F5F5',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedProvider: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#E8F5E9',
  },
  recommendedProvider: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  providerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  recommendedText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
    marginTop: 4,
  },
  providerDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    marginBottom: 16,
  },
});
