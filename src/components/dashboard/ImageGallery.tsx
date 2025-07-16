"use client";

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { createBrowserClient } from '@supabase/ssr';
import { FaTrash, FaSearch, FaDownload, FaTimes } from 'react-icons/fa';
import type { Database } from '../../lib/supabase/types';
import DiagnosisDetails from './DiagnosisDetails';

interface ImageGalleryProps {
  userId: string;
  onSelectImage?: (imageUrl: string, diagnosisId: string) => void;
  onRefresh?: () => void;
}

/**
 * Component to display a gallery of user's uploaded plant images
 * with detailed diagnosis information
 */
export default function ImageGallery({ userId, onSelectImage, onRefresh }: ImageGalleryProps) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<string | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch user's uploaded images
  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true);
        
        // Get diagnoses with images for this user
        const { data, error } = await supabase
          .from('diagnoses')
          .select('id, image_url, created_at, disease_name, confidence_score')
          .eq('user_id', userId)
          .order('created_at', { ascending: false});
        
        if (error) {
          throw error;
        }
        
        setImages(data || []);
      } catch (err: any) {
        console.error('Error fetching images:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchImages();
    }
  }, [userId]);

  // Handle image selection
  const handleImageSelect = (imageUrl: string, diagnosisId: string) => {
    setSelectedImage(imageUrl);
    setSelectedDiagnosisId(diagnosisId);
    setDetailsModalVisible(true);
    if (onSelectImage) {
      onSelectImage(imageUrl, diagnosisId);
    }
  };

  // Close details modal and refresh data if needed
  const handleCloseDetails = () => {
    setDetailsModalVisible(false);
    if (onRefresh) {
      onRefresh();
    }
    // Refetch images
    fetchImages();
  };

  // Function to fetch images
  const fetchImages = async () => {
    try {
      setLoading(true);
      
      // Get diagnoses with images for this user
      const { data, error } = await supabase
        .from('diagnoses')
        .select('id, image_url, created_at, disease_name, plant_type, confidence_score, ai_diagnosis')
        .eq('user_id', userId)
        .order('created_at', { ascending: false});
      
      if (error) {
        throw error;
      }
      
      // Map the data to ensure we have all required fields with fallbacks
      const processedData = (data || []).map(item => ({
        ...item,
        // Ensure confidence_score exists (might be in ai_diagnosis JSON)
        confidence_score: item.confidence_score !== null && item.confidence_score !== undefined ? 
          item.confidence_score : 
          (item.ai_diagnosis && typeof item.ai_diagnosis === 'object' ? 
            item.ai_diagnosis.confidence || 0.5 : 0.5)
      }));
      
      setImages(processedData);
    } catch (err: any) {
      console.error('Error fetching images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (diagnosisId: string) => {
    if (!confirm('Are you sure you want to delete this image and its diagnosis?')) {
      return;
    }
    
    try {
      // Delete the diagnosis record
      const { error } = await supabase
        .from('diagnoses')
        .delete()
        .eq('id', diagnosisId);
      
      if (error) {
        throw error;
      }
      
      // Update the UI by removing the deleted image
      setImages(images.filter(img => img.id !== diagnosisId));
      
      // If the deleted image was selected, clear the selection
      if (selectedImage && images.find(img => img.id === diagnosisId)?.image_url === selectedImage) {
        setSelectedImage(null);
      }
    } catch (err: any) {
      console.error('Error deleting image:', err);
      alert(`Failed to delete image: ${err.message}`);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your plant images...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : images.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No plant images yet</Text>
          <Text style={styles.emptySubtext}>Use the diagnosis tool to analyze your plants</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.galleryGrid}>
            {images.map((image) => (
              <TouchableOpacity
                key={image.id}
                style={[
                  styles.imageContainer,
                  selectedImage === image.image_url && styles.selectedImageContainer
                ]}
                onPress={() => handleImageSelect(image.image_url, image.id)}
              >
                <Image 
                  source={{ uri: image.image_url }} 
                  style={styles.image as any} 
                  onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                />
                <View style={styles.imageOverlay}>
                  <Text style={styles.diagnosisName} numberOfLines={1}>
                    {image.disease_name || 'Unknown'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Diagnosis Details Modal */}
          {detailsModalVisible && selectedDiagnosisId && (
            <Modal
              animationType="slide"
              transparent={false}
              visible={detailsModalVisible}
              onRequestClose={handleCloseDetails}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={handleCloseDetails} style={styles.closeButton}>
                    <FaTimes size={24} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Diagnosis Details</Text>
                </View>
                <DiagnosisDetails 
                  diagnosisId={selectedDiagnosisId} 
                  userId={userId}
                  onRetry={() => {
                    handleCloseDetails();
                    // Add navigation to diagnose page if needed
                  }}
                />
              </View>
            </Modal>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  imageContainer: {
    width: '30%',
    aspectRatio: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedImageContainer: {
    borderColor: '#4CAF50',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  diagnosisName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  }
});
