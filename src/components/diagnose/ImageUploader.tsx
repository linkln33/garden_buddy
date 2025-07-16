"use client";

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { FaLeaf, FaCamera, FaImage, FaTimesCircle } from 'react-icons/fa';
import Button from '../ui/Button';

interface ImageUploaderProps {
  onImageSelected?: (base64Image: string) => void;
  onImageCaptured?: (base64Image: string) => Promise<void>;
  isUploading?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * ImageUploader component for capturing or selecting plant images for diagnosis
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onImageCaptured,
  isUploading = false,
  isLoading = false,
  error: propError = null,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(propError);

  // Function to handle image selection from camera
  const handleCameraCapture = async () => {
    try {
      setError(null);
      
      // In a real implementation, we would use react-native-image-picker or expo-image-picker
      // For this demo, we'll simulate image selection with a placeholder
      
      // Simulate camera capture delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This would be the base64 string from the camera
      const mockBase64Image = 'mockBase64StringFromCamera';
      
      setImage('https://placehold.co/400x300/4CAF50/FFFFFF?text=Plant+Image');
      
      // Handle both callback types
      if (onImageSelected) {
        onImageSelected(mockBase64Image);
      } else if (onImageCaptured) {
        await onImageCaptured(mockBase64Image);
      }
    } catch (err) {
      console.error('Camera capture error:', err);
      setError('Failed to capture image. Please try again.');
    }
  };

  // Function to handle image selection from gallery
  const handleGalleryPick = async () => {
    try {
      setError(null);
      
      // In a real implementation, we would use react-native-image-picker or expo-image-picker
      // For this demo, we'll simulate image selection with a placeholder
      
      // Simulate gallery selection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This would be the base64 string from the gallery
      const mockBase64Image = 'mockBase64StringFromGallery';
      
      setImage('https://placehold.co/400x300/4CAF50/FFFFFF?text=Plant+Image');
      
      // Handle both callback types
      if (onImageSelected) {
        onImageSelected(mockBase64Image);
      } else if (onImageCaptured) {
        await onImageCaptured(mockBase64Image);
      }
    } catch (err) {
      console.error('Gallery pick error:', err);
      setError('Failed to select image. Please try again.');
    }
  };

  // Function to clear selected image
  const handleClearImage = () => {
    setImage(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Plant Image</Text>
      <Text style={styles.subtitle}>
        Take a clear photo of the plant leaf to diagnose any diseases
      </Text>

      {!image ? (
        <View style={styles.uploadContainer}>
          <View style={styles.dottedBorder}>
            <FaLeaf size={48} color="#4CAF50" />
            <Text style={styles.uploadText}>
              Take a photo or select from gallery
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Camera"
                onPress={handleCameraCapture}
                variant="primary"
                size="medium"
                icon={<FaCamera size={16} color="#FFFFFF" />}
              />
              <Button
                title="Gallery"
                onPress={handleGalleryPick}
                variant="outline"
                size="medium"
                icon={<FaImage size={16} color="#4CAF50" />}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          
          {isUploading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Analyzing image...</Text>
            </View>
          ) : (
            <Pressable style={styles.clearButton} onPress={handleClearImage}>
              <FaTimesCircle size={24} color="#F44336" />
            </Pressable>
          )}
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips for best results:</Text>
        <Text style={styles.tipItem}>• Take a clear, well-lit photo</Text>
        <Text style={styles.tipItem}>• Focus on the affected area</Text>
        <Text style={styles.tipItem}>• Include some healthy parts for comparison</Text>
        <Text style={styles.tipItem}>• Avoid shadows and glare</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  uploadContainer: {
    marginVertical: 16,
  },
  dottedBorder: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  imagePreviewContainer: {
    marginVertical: 16,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 8,
  },
  tipsContainer: {
    backgroundColor: '#F1F8E9',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
});

export default ImageUploader;
