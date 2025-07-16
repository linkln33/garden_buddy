"use client";

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import UserProfile from '../../components/profile/UserProfile';
import Card from '../../components/ui/Card';
import type { Database } from '../../lib/supabase/types';

/**
 * Profile page for managing user account settings
 */
export default function ProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch user profile data
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login');
          return;
        }
        
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        // Combine auth user and profile data
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: profile?.full_name,
          avatarUrl: profile?.avatar_url,
          location: profile?.location,
          preferOrganicTreatments: profile?.prefer_organic_treatments || false,
          notificationsEnabled: profile?.notifications_enabled || false,
          weatherAlertsEnabled: profile?.weather_alerts_enabled || false,
          communityVotingEnabled: profile?.community_voting_enabled || false,
        });
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load your profile information');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [router]);

  // Update user profile
  const handleUpdateProfile = async (userData: Partial<typeof user>) => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('You must be logged in to update your profile');
      }
      
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: userData.fullName,
          location: userData.location,
          prefer_organic_treatments: userData.preferOrganicTreatments,
          notifications_enabled: userData.notificationsEnabled,
          weather_alerts_enabled: userData.weatherAlertsEnabled,
          community_voting_enabled: userData.communityVotingEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setUser((prev: any) => ({
        ...prev,
        ...userData,
      }));
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  // Change password
  const handleChangePassword = async () => {
    try {
      // Navigate to change password page
      router.push('/profile/change-password');
    } catch (err) {
      console.error('Error navigating to change password:', err);
    }
  };

  // Log out
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('You must be logged in to delete your account');
      }
      
      // Delete user data
      await supabase.rpc('delete_user_data', {
        user_id: session.user.id,
      });
      
      // Sign out
      await supabase.auth.signOut();
      
      // Navigate to login page
      router.push('/login');
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>
          Manage your account settings and preferences
        </Text>
      </View>

      {user && (
        <UserProfile
          user={user}
          onUpdateProfile={handleUpdateProfile}
          onChangePassword={handleChangePassword}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      )}
    </ScrollView>
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
