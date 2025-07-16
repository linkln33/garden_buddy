"use client";

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { FaCheck } from 'react-icons/fa';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface TreatmentFormProps {
  diagnosisId: string;
  onSubmit: (treatment: {
    diagnosisId: string;
    treatmentType: 'organic' | 'chemical';
    description: string;
    applicationDate: string | null;
  }) => Promise<void>;
  onCancel: () => void;
}

/**
 * TreatmentForm component for adding new treatments to the logbook
 */
export const TreatmentForm: React.FC<TreatmentFormProps> = ({
  diagnosisId,
  onSubmit,
  onCancel,
}) => {
  const [treatmentType, setTreatmentType] = useState<'organic' | 'chemical'>('organic');
  const [description, setDescription] = useState('');
  const [applicationDate, setApplicationDate] = useState<string | null>(
    new Date().toISOString().split('T')[0]
  );
  const [isApplied, setIsApplied] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!description.trim()) {
      setError('Please enter a treatment description');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        diagnosisId,
        treatmentType,
        description: description.trim(),
        applicationDate: isApplied ? applicationDate : null,
      });
    } catch (err) {
      console.error('Treatment submission error:', err);
      setError('Failed to save treatment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card title="Add Treatment">
      <ScrollView style={styles.container}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Treatment Type</Text>
          <View style={styles.segmentedControl}>
            <Pressable
              style={[
                styles.segmentButton,
                treatmentType === 'organic' && styles.segmentButtonActive,
              ]}
              onPress={() => setTreatmentType('organic')}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  treatmentType === 'organic' && styles.segmentButtonTextActive,
                ]}
              >
                Organic
              </Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.segmentButton,
                treatmentType === 'chemical' && styles.segmentButtonActive,
              ]}
              onPress={() => setTreatmentType('chemical')}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  treatmentType === 'chemical' && styles.segmentButtonTextActive,
                ]}
              >
                Chemical
              </Text>
            </Pressable>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter treatment details"
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.formGroup}>
          <View style={styles.checkboxContainer}>
            <Pressable
              style={styles.checkbox}
              onPress={() => setIsApplied(!isApplied)}
            >
              {isApplied && (
                <FaCheck size={14} color="#FFFFFF" />
              )}
            </Pressable>
            <Text style={styles.checkboxLabel}>
              I've already applied this treatment
            </Text>
          </View>
        </View>
        
        {isApplied && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Application Date</Text>
            <TextInput
              style={styles.textInput}
              value={applicationDate || ''}
              onChangeText={setApplicationDate}
              placeholder="YYYY-MM-DD"
            />
            <Text style={styles.helperText}>
              Enter date in YYYY-MM-DD format
            </Text>
          </View>
        )}
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="outline"
            size="medium"
          />
          <Button
            title="Save Treatment"
            onPress={handleSubmit}
            variant="primary"
            size="medium"
            loading={isSubmitting}
            disabled={isSubmitting || !description.trim()}
          />
        </View>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#4CAF50',
  },
  segmentButtonText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isApplied => (isApplied ? '#4CAF50' : 'transparent'),
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
  },
  helperText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default TreatmentForm;
