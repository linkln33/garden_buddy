"use client";

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { createBrowserClient } from '@supabase/ssr';
import { FaLeaf, FaCalendarAlt } from 'react-icons/fa';
import Card from '../ui/Card';
import type { Database } from '../../lib/supabase/types';

interface RecentActivityFeedProps {
  userId: string;
}

/**
 * Component to display recent activity feed on the dashboard
 */
export default function RecentActivityFeed({ userId }: RecentActivityFeedProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setLoading(true);
        
        // Fetch recent diagnoses
        const { data: diagnoses, error: diagnosesError } = await supabase
          .from('diagnoses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (diagnosesError) {
          throw new Error(`Error fetching diagnoses: ${diagnosesError.message}`);
        }
        
        // Format the activities
        const formattedActivities = diagnoses?.map(diagnosis => ({
          id: diagnosis.id,
          type: 'diagnosis',
          title: `Diagnosed ${diagnosis.plant_type} with ${diagnosis.disease_name}`,
          date: new Date(diagnosis.created_at),
          confidence: diagnosis.confidence_score,
          imageUrl: diagnosis.image_url,
          severity: diagnosis.severity || 'medium'
        })) || [];
        
        setActivities(formattedActivities);
      } catch (err: any) {
        console.error('Error fetching recent activity:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchRecentActivity();
    }
  }, [userId]);

  // Format date to readable string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return '#4CAF50'; // Green
      case 'medium':
        return '#FF9800'; // Orange
      case 'high':
        return '#F44336'; // Red
      default:
        return '#FF9800'; // Default to orange
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View style={styles.emptyState}>
        <FaLeaf size={32} color="#E0E0E0" />
        <Text style={styles.emptyStateTitle}>No recent activity</Text>
        <Text style={styles.emptyStateText}>
          Your plant diagnoses will appear here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {activities.map((activity) => (
        <View key={activity.id} style={styles.activityItem}>
          <View style={[styles.activityIcon, { backgroundColor: getSeverityColor(activity.severity) }]}>
            <FaLeaf size={16} color="#FFFFFF" />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <View style={styles.activityMeta}>
              <FaCalendarAlt size={12} color="#666666" />
              <Text style={styles.activityDate}>{formatDate(activity.date)}</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {Math.round(activity.confidence * 100)}% confidence
                </Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDate: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    marginRight: 8,
  },
  confidenceBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
