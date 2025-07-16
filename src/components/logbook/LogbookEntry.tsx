"use client";

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { FaStar, FaRegStar, FaChevronUp, FaChevronDown, FaPlus, FaTrash } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ConfidenceMeter from '../ui/ConfidenceMeter';

interface Treatment {
  id: string;
  treatmentType: 'organic' | 'chemical';
  description: string;
  applicationDate: string | null;
  effectivenessRating: number | null;
}

interface LogbookEntryProps {
  id: string;
  imageUrl: string;
  plantType: string;
  diseaseName: string;
  confidenceScore: number;
  createdAt: string;
  treatments: Treatment[];
  communityDiagnosis?: string;
  status: 'pending' | 'confirmed' | 'disputed';
  onAddTreatment: (diagnosisId: string) => void;
  onRateTreatment: (treatmentId: string, rating: number) => void;
  onDelete: (id: string) => void;
}

/**
 * LogbookEntry component displays a single entry in the crop logbook
 */
export const LogbookEntry: React.FC<LogbookEntryProps> = ({
  id,
  imageUrl,
  plantType,
  diseaseName,
  confidenceScore,
  createdAt,
  treatments,
  communityDiagnosis,
  status,
  onAddTreatment,
  onRateTreatment,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Get status badge color
  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50'; // Green
      case 'disputed':
        return '#F44336'; // Red
      case 'pending':
        return '#FFC107'; // Yellow
      default:
        return '#FFC107';
    }
  };

  // Format treatment application date
  const formatTreatmentDate = (dateString: string | null) => {
    if (!dateString) return 'Not applied yet';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Render star rating for treatment effectiveness
  const renderStarRating = (rating: number | null, treatmentId: string) => {
    const stars = [];
    const currentRating = rating || 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Pressable
          key={i}
          onPress={() => onRateTreatment(treatmentId, i)}
          style={styles.starContainer}
        >
          {i <= currentRating ? 
            <FaStar size={18} color="#FFC107" /> : 
            <FaRegStar size={18} color="#CCCCCC" />
          }
        </Pressable>
      );
    }
    
    return <View style={styles.starRating}>{stars}</View>;
  };

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.plantType}>{plantType}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        
        <Pressable
          style={styles.expandButton}
          onPress={() => setExpanded(!expanded)}
        >
          {expanded ? 
            <FaChevronUp size={16} color="#666666" /> : 
            <FaChevronDown size={16} color="#666666" />
          }
        </Pressable>
      </View>
      
      <View style={styles.mainContent}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        
        <View style={styles.diagnosisContainer}>
          <View style={styles.diagnosisHeader}>
            <View>
              <Text style={styles.diagnosisLabel}>Diagnosis:</Text>
              <Text style={styles.diagnosisName}>{diseaseName}</Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          </View>
          
          <ConfidenceMeter score={confidenceScore} size="small" />
          
          {communityDiagnosis && status === 'disputed' && (
            <View style={styles.communityDiagnosis}>
              <Text style={styles.communityLabel}>Community Diagnosis:</Text>
              <Text style={styles.communityName}>{communityDiagnosis}</Text>
            </View>
          )}
        </View>
      </View>
      
      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.treatmentsTitle}>Treatments</Text>
          
          {treatments.length === 0 ? (
            <Text style={styles.noTreatments}>No treatments recorded yet.</Text>
          ) : (
            treatments.map((treatment) => (
              <View key={treatment.id} style={styles.treatmentItem}>
                <View style={styles.treatmentHeader}>
                  <View style={[
                    styles.treatmentTypeBadge,
                    treatment.treatmentType === 'organic'
                      ? styles.organicBadge
                      : styles.chemicalBadge
                  ]}>
                    <Text style={styles.treatmentTypeText}>
                      {treatment.treatmentType.charAt(0).toUpperCase() +
                        treatment.treatmentType.slice(1)}
                    </Text>
                  </View>
                  
                  <Text style={styles.treatmentDate}>
                    {formatTreatmentDate(treatment.applicationDate)}
                  </Text>
                </View>
                
                <Text style={styles.treatmentDescription}>
                  {treatment.description}
                </Text>
                
                <View style={styles.effectivenessContainer}>
                  <Text style={styles.effectivenessLabel}>Effectiveness:</Text>
                  {renderStarRating(treatment.effectivenessRating, treatment.id)}
                </View>
              </View>
            ))
          )}
          
          <Button
            title="Add Treatment"
            onPress={() => onAddTreatment(id)}
            variant="primary"
            size="small"
            icon={<FaPlus size={14} color="#FFFFFF" />}
          />
          
          <View style={styles.deleteContainer}>
            {!showDeleteConfirm ? (
              <Button
                title="Delete Entry"
                onPress={() => setShowDeleteConfirm(true)}
                variant="danger"
                size="small"
                icon={<FaTrash size={14} color="#FFFFFF" />}
              />
            ) : (
              <View style={styles.deleteConfirmContainer}>
                <Text style={styles.deleteConfirmText}>
                  Are you sure you want to delete this entry?
                </Text>
                <View style={styles.deleteConfirmButtons}>
                  <Button
                    title="Cancel"
                    onPress={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    size="small"
                  />
                  <Button
                    title="Delete"
                    onPress={() => onDelete(id)}
                    variant="danger"
                    size="small"
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerContent: {
    flex: 1,
  },
  plantType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  date: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  expandButton: {
    padding: 8,
  },
  mainContent: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  diagnosisContainer: {
    flex: 1,
  },
  diagnosisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  diagnosisLabel: {
    fontSize: 14,
    color: '#666666',
  },
  diagnosisName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  communityDiagnosis: {
    marginTop: 12,
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 4,
  },
  communityLabel: {
    fontSize: 12,
    color: '#666666',
  },
  communityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  expandedContent: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  treatmentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  noTreatments: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  treatmentItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  treatmentTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  organicBadge: {
    backgroundColor: '#E8F5E9',
  },
  chemicalBadge: {
    backgroundColor: '#FFF3E0',
  },
  treatmentTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  treatmentDate: {
    fontSize: 12,
    color: '#666666',
  },
  treatmentDescription: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 12,
  },
  effectivenessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  effectivenessLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  starRating: {
    flexDirection: 'row',
  },
  starContainer: {
    padding: 2,
  },
  deleteContainer: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  deleteConfirmContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  deleteConfirmText: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default LogbookEntry;
