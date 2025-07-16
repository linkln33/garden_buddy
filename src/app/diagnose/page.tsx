"use client";

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
  const router = useRouter();
  const supabase = createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  // Handle image capture/selection
  const handleImageCaptured = async (base64Image: string) => {
    setImageBase64(base64Image);
    setIsAnalyzing(true);
    setError(null);

    try {
      // Call OpenAI API to analyze the image
      const result = await detectPlantDisease(base64Image);
      
      if (!result) {
        throw new Error('Failed to analyze image. Please try again.');
      }
      
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
        status: diagnosis.confidenceScore >= 80 ? 'confirmed' : 'pending',
      });

      if (insertError) {
        throw insertError;
      }
    } catch (err) {
      console.error('Error saving diagnosis to database:', err);
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

      {!imageBase64 || error ? (
        <ImageUploader
          onImageCaptured={handleImageCaptured}
          isLoading={isAnalyzing}
          error={error}
        />
      ) : (
        <DiagnosisResult
          imageUrl={imageBase64}
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
});
