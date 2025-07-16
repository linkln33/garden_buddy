"use client";

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { createBrowserClient } from '@supabase/ssr';
import LogbookEntry from '../../components/logbook/LogbookEntry';
import TreatmentForm from '../../components/logbook/TreatmentForm';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FaBook } from 'react-icons/fa';
import type { Database } from '../../lib/supabase/types';

/**
 * Logbook page for tracking plant diagnoses and treatments
 */
export default function LogbookPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'confirmed' | 'pending' | 'disputed'>('all');
  const supabase = createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  // Fetch logbook entries from database
  useEffect(() => {
    async function fetchLogbookEntries() {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setError('You must be logged in to view your logbook');
          setLoading(false);
          return;
        }
        
        // Fetch diagnoses with treatments
        const { data: diagnosesData, error: diagnosesError } = await supabase
          .from('diagnoses')
          .select(`
            id,
            plant_type,
            disease_name,
            confidence_score,
            description,
            image_url,
            created_at,
            status,
            community_diagnosis,
            treatments:treatments(
              id,
              treatment_type,
              description,
              application_date,
              effectiveness_rating
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (diagnosesError) {
          throw diagnosesError;
        }
        
        setEntries(diagnosesData || []);
      } catch (err) {
        console.error('Error fetching logbook entries:', err);
        setError('Failed to load your logbook entries');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLogbookEntries();
  }, []);

  // Add a treatment to a diagnosis
  const handleAddTreatment = (diagnosisId: string) => {
    setSelectedDiagnosisId(diagnosisId);
    setShowTreatmentForm(true);
  };

  // Submit a new treatment
  const handleSubmitTreatment = async (treatmentData: {
    diagnosisId: string;
    treatmentType: 'organic' | 'chemical';
    description: string;
    applicationDate: string | null;
  }) => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('You must be logged in to add treatments');
      }
      
      // Insert treatment into database
      const { data: newTreatment, error: insertError } = await supabase
        .from('treatments')
        .insert({
          diagnosis_id: treatmentData.diagnosisId,
          user_id: session.user.id,
          treatment_type: treatmentData.treatmentType,
          description: treatmentData.description,
          application_date: treatmentData.applicationDate,
        })
        .select()
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      // Update local state
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.id === treatmentData.diagnosisId) {
            return {
              ...entry,
              treatments: [...entry.treatments, newTreatment],
            };
          }
          return entry;
        })
      );
      
      // Close treatment form
      setShowTreatmentForm(false);
      setSelectedDiagnosisId(null);
    } catch (err) {
      console.error('Error adding treatment:', err);
      throw err;
    }
  };

  // Rate a treatment's effectiveness
  const handleRateTreatment = async (treatmentId: string, rating: number) => {
    try {
      // Update treatment in database
      const { error: updateError } = await supabase
        .from('treatments')
        .update({ effectiveness_rating: rating })
        .eq('id', treatmentId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setEntries((prev) =>
        prev.map((entry) => ({
          ...entry,
          treatments: entry.treatments.map((treatment: any) => {
            if (treatment.id === treatmentId) {
              return {
                ...treatment,
                effectiveness_rating: rating,
              };
            }
            return treatment;
          }),
        }))
      );
    } catch (err) {
      console.error('Error rating treatment:', err);
    }
  };

  // Delete a logbook entry
  const handleDeleteEntry = async (entryId: string) => {
    try {
      // Delete entry from database
      const { error: deleteError } = await supabase
        .from('diagnoses')
        .delete()
        .eq('id', entryId);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Update local state
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  // Filter entries based on selected filter
  const filteredEntries = entries.filter((entry) => {
    if (filterType === 'all') return true;
    return entry.status === filterType;
  });

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your logbook...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.container}>
        <Card>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plant Logbook</Text>
        <Text style={styles.subtitle}>
          Track your plant health and treatments over time
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by:</Text>
        <View style={styles.filterButtons}>
          <Button
            title="All"
            onPress={() => setFilterType('all')}
            variant={filterType === 'all' ? 'primary' : 'outline'}
            size="small"
          />
          <Button
            title="Confirmed"
            onPress={() => setFilterType('confirmed')}
            variant={filterType === 'confirmed' ? 'primary' : 'outline'}
            size="small"
          />
          <Button
            title="Pending"
            onPress={() => setFilterType('pending')}
            variant={filterType === 'pending' ? 'primary' : 'outline'}
            size="small"
          />
          <Button
            title="Disputed"
            onPress={() => setFilterType('disputed')}
            variant={filterType === 'disputed' ? 'primary' : 'outline'}
            size="small"
          />
        </View>
      </View>

      {showTreatmentForm && selectedDiagnosisId ? (
        <TreatmentForm
          diagnosisId={selectedDiagnosisId}
          onSubmit={handleSubmitTreatment}
          onCancel={() => {
            setShowTreatmentForm(false);
            setSelectedDiagnosisId(null);
          }}
        />
      ) : filteredEntries.length > 0 ? (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LogbookEntry
              id={item.id}
              imageUrl={item.image_url}
              plantType={item.plant_type}
              diseaseName={item.disease_name}
              confidenceScore={item.confidence_score}
              createdAt={item.created_at}
              treatments={item.treatments}
              communityDiagnosis={item.community_diagnosis}
              status={item.status}
              onAddTreatment={handleAddTreatment}
              onRateTreatment={handleRateTreatment}
              onDelete={handleDeleteEntry}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Card>
          <View style={styles.emptyContainer}>
            <FaBook size={48} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No entries found</Text>
            <Text style={styles.emptyText}>
              {filterType === 'all'
                ? "You haven't added any plant diagnoses yet. Use the Diagnose feature to get started!"
                : `No ${filterType} diagnoses found. Try a different filter.`}
            </Text>
            {filterType !== 'all' && (
              <Button
                title="Show All Entries"
                onPress={() => setFilterType('all')}
                variant="outline"
                size="medium"
                style={styles.showAllButton}
              />
            )}
          </View>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
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
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  showAllButton: {
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
});
