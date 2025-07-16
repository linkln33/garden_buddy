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
  compact?: boolean; // New prop for compact mode in dashboard
  hidePreview?: boolean; // New prop to hide the image preview
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
  compact = false,
  hidePreview = false,
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
    <View style={[styles.container, compact && styles.compactContainer]}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {image && !hidePreview ? (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: image }} 
            style={styles.imagePreview} 
            resizeMode="cover"
          />
          <Pressable 
            style={styles.removeButton}
            onPress={handleClearImage}
          >
            <FaTimesCircle color="#ff4d4d" size={24} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <View style={styles.buttonContainer}>
            <Button 
              onPress={handleCameraCapture}
              title="Take Photo"
              icon={<FaCamera size={16} />}
              disabled={isUploading || isLoading}
              style={styles.uploadButton}
            />
            <Button 
              onPress={handleGalleryPick}
              title="Upload Image"
              icon={<FaImage size={16} />}
              disabled={isUploading || isLoading}
              style={styles.uploadButton}
            />
          </View>
          
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips for best results:</Text>
            <View style={styles.tipRow}>
              <FaLeaf color="#4CAF50" size={12} style={styles.tipIcon} />
              <Text style={styles.tipText}>Take a clear, well-lit photo</Text>
            </View>
            <View style={styles.tipRow}>
              <FaLeaf color="#4CAF50" size={12} style={styles.tipIcon} />
              <Text style={styles.tipText}>Focus on the affected area</Text>
            </View>
            <View style={styles.tipRow}>
              <FaLeaf color="#4CAF50" size={12} style={styles.tipIcon} />
              <Text style={styles.tipText}>Include some healthy parts for comparison</Text>
            </View>
            <View style={styles.tipRow}>
              <FaLeaf color="#4CAF50" size={12} style={styles.tipIcon} />
              <Text style={styles.tipText}>Avoid shadows and glare</Text>
            </View>
          </View>
        </View>
      )}
      
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Analyzing image...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  compactContainer: {
    padding: 8,
  },
  compactTipsContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  uploadContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  dottedBorder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  uploadText: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
    marginBottom: 8,
    fontSize: 14,
  },
  tipsContainer: {
    backgroundColor: '#f5f9f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 4,
  },
  uploadButton: {
    marginHorizontal: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipIcon: {
    marginRight: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#666',
  },
});

export default ImageUploader;
