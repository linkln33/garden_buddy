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
      
      // Use the browser's getUserMedia API to access the camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create a video element to display the camera feed
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Wait for the video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = () => {
          resolve(null);
        };
      });
      
      // Create a canvas to capture the image
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Stop the camera stream
      stream.getTracks().forEach(track => track.stop());
      
      // Convert the canvas to a base64 image
      const base64Image = canvas.toDataURL('image/jpeg');
      
      setImage(base64Image);
      
      // Handle both callback types
      if (onImageSelected) {
        onImageSelected(base64Image);
      } else if (onImageCaptured) {
        await onImageCaptured(base64Image);
      }
    } catch (err) {
      console.error('Camera capture error:', err);
      setError('Failed to capture image. Please try again or use the gallery option.');
    }
  };

  // Function to handle image selection from gallery
  const handleGalleryPick = async () => {
    try {
      setError(null);
      
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      // Handle file selection
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        
        if (!file) {
          setError('No image selected');
          return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image too large. Please select an image under 5MB.');
          return;
        }
        
        // Read the file as a data URL (base64)
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Image = e.target?.result as string;
          setImage(base64Image);
          
          // Handle both callback types
          if (onImageSelected) {
            onImageSelected(base64Image);
          } else if (onImageCaptured) {
            await onImageCaptured(base64Image);
          }
        };
        
        reader.readAsDataURL(file);
      };
      
      // Trigger the file input click
      input.click();
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
