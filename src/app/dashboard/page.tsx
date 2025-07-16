"use client";

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FaLeaf, FaSearch, FaCloudSun, FaUsers, FaBook, FaUser, FaChartBar } from 'react-icons/fa';
import type { Database } from '../../lib/supabase/types';

/**
 * Dashboard page for authenticated users
 */
export default function DashboardPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user is logged in
  useEffect(() => {
    async function checkUser() {
      try {
        console.log('Checking user session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        
        console.log('Session data:', session ? 'Session exists' : 'No session');
        
        if (!session?.user) {
          console.log('No user in session, redirecting to login');
          router.push('/login');
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
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.fullName || user?.email}</Text>
        </View>
        <Link href="/profile" passHref>
          <View style={styles.profileButton}>
            <FaUser size={24} color="#4CAF50" />
          </View>
        </Link>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <Link href="/diagnose" passHref style={styles.actionLink}>
          <Card style={styles.actionCard}>
            <FaSearch size={32} color="#4CAF50" />
            <Text style={styles.actionText}>Diagnose Plant</Text>
          </Card>
        </Link>
        <Link href="/weather" passHref style={styles.actionLink}>
          <Card style={styles.actionCard}>
            <FaCloudSun size={32} color="#4CAF50" />
            <Text style={styles.actionText}>Weather</Text>
          </Card>
        </Link>
        <Link href="/logbook" passHref style={styles.actionLink}>
          <Card style={styles.actionCard}>
            <FaBook size={32} color="#4CAF50" />
            <Text style={styles.actionText}>My Logbook</Text>
          </Card>
        </Link>
        <Link href="/community" passHref style={styles.actionLink}>
          <Card style={styles.actionCard}>
            <FaUsers size={32} color="#4CAF50" />
            <Text style={styles.actionText}>Community</Text>
          </Card>
        </Link>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <Card style={styles.activityCard}>
        <View style={styles.emptyState}>
          <FaLeaf size={48} color="#E0E0E0" />
          <Text style={styles.emptyStateTitle}>No recent activity</Text>
          <Text style={styles.emptyStateText}>
            Your plant diagnoses and treatments will appear here
          </Text>
          <Button
            title="Diagnose a Plant"
            onPress={() => router.push('/diagnose')}
            variant="primary"
            size="medium"
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Plant Health Overview</Text>
      <Card style={styles.statsCard}>
        <View style={styles.emptyState}>
          <FaChartBar size={48} color="#E0E0E0" />
          <Text style={styles.emptyStateTitle}>No plants tracked yet</Text>
          <Text style={styles.emptyStateText}>
            Start tracking plants to see health statistics
          </Text>
          <Button
            title="Add Plants to Logbook"
            onPress={() => router.push('/logbook')}
            variant="primary"
            size="medium"
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  actionLink: {
    width: '48%' as any,
    minWidth: 150,
    flex: 1,
  },
  actionCard: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 120,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  activityCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
  },
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
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
