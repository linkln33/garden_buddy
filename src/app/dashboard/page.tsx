"use client";

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FaUser } from 'react-icons/fa';
import QuickDiagnose from '../../components/dashboard/QuickDiagnose';
import ImageGallery from '../../components/dashboard/ImageGallery';
import RecentActivityFeed from '../../components/dashboard/RecentActivityFeed';
import type { Database } from '../../lib/supabase/types';
import Link from 'next/link';

/**
 * Dashboard page for authenticated users
 */
export default function DashboardPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user is logged in
  const checkSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Checking user session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('Failed to check authentication status');
        return;
      }
      
      console.log('Session data:', session ? 'Session exists' : 'No session');
      
      if (!session?.user) {
        console.log('No user in session');
        setUser(null);
        return;
      }
      
      console.log('User authenticated:', session.user.email);
      
      try {
        // Try to fetch user profile if the table exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'relation does not exist'
          console.error('Error fetching profile:', profileError);
        }
        
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: profile?.full_name || session.user.email?.split('@')[0] || 'Garden Buddy User',
          avatarUrl: profile?.avatar_url,
        });
      } catch (profileErr) {
        console.error('Profile fetch error:', profileErr);
        // Still set the user with basic info from auth
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.email?.split('@')[0] || 'Garden Buddy User',
        });
      }
    } catch (err) {
      console.error('Error checking user session:', err);
      setError('Failed to check authentication status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || "Please log in to view your dashboard"}
          </Text>
          <Button 
            title="Go to Login" 
            onPress={() => router.push('/login')} 
            variant="primary" 
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Dashboard header */}
      <View style={styles.header}>
      </View>
      
      {/* Main dashboard content */}
      <View style={styles.dashboardContent}>
        {/* Plant Diagnosis Tool - Full Width */}
        <View style={styles.fullWidthSection}>
          <Text style={styles.sectionTitle}>Plant Diagnosis Tool</Text>
          <Card style={styles.diagnosisCard}>
            <QuickDiagnose 
              userId={user.id} 
              onDiagnosisComplete={(imageUrl: string, diagnosisId: string) => {
                // Refresh gallery when a new diagnosis is added
                console.log('New diagnosis added:', diagnosisId);
              }}
              showFullOptions={true}
            />
          </Card>
        </View>
        
        {/* Gallery Section - Below Diagnosis */}
        <View style={styles.fullWidthSection}>
          <Text style={styles.sectionTitle}>My Plant Gallery</Text>
          <Card style={styles.galleryCard}>
            <ImageGallery userId={user.id} />
          </Card>
        </View>
        
        {/* Activity Section - At Bottom */}
        <View style={styles.fullWidthSection}>
          <Text style={[styles.sectionTitle, styles.activityTitle]}>Recent Activity</Text>
          <Card style={styles.activityCard}>
            <RecentActivityFeed userId={user.id} />
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  fullWidthSection: {
    width: '100%',
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 500,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 500,
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    marginBottom: 24,
    textAlign: 'center',
  },
  dashboardContent: {
    flexDirection: 'row',
    padding: 16,
    flexWrap: 'wrap',
  },
  leftColumn: {
    flex: 1,
    minWidth: 300,
    marginRight: 8,
    marginBottom: 16,
  },
  rightColumn: {
    flex: 1,
    minWidth: 300,
    marginLeft: 8,
    marginBottom: 16,
  },
  diagnosisCard: {
    padding: 0,
    overflow: 'hidden',
    minHeight: 500,
  },
  galleryCard: {
    padding: 0,
    overflow: 'hidden',
    height: 300,
  },
  activityTitle: {
    marginTop: 16,
  },
  activityCard: {
    padding: 0,
    overflow: 'hidden',
    height: 300,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666666',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginTop: 4,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});
