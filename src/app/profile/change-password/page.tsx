"use client";

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { FaLeaf, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { FaRegCircle } from 'react-icons/fa6';
import type { Database } from '../../../lib/supabase/types';

/**
 * Change Password page for updating user password
 */
export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Password validation
  const validatePassword = () => {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  // Handle password change
  const handleChangePassword = async () => {
    try {
      setError(null);
      setLoading(true);

      // Validate password
      if (!validatePassword()) {
        setLoading(false);
        return;
      }

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/login');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Show success message
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>
          Update your password to keep your account secure
        </Text>

        <Card>
          <View style={styles.form}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Enter your current password"
                  placeholderTextColor="#999999"
                />
                <Button
                  title=""
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  variant="text"
                  size="small"
                  icon={
                    showCurrentPassword ? 
                      <FaEyeSlash size={20} color="#666666" /> : 
                      <FaEye size={20} color="#666666" />
                  }
                  style={styles.visibilityButton}
                />
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  placeholder="Enter your new password"
                  placeholderTextColor="#999999"
                />
                <Button
                  title=""
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  variant="text"
                  size="small"
                  icon={
                    showNewPassword ? 
                      <FaEyeSlash size={20} color="#666666" /> : 
                      <FaEye size={20} color="#666666" />
                  }
                  style={styles.visibilityButton}
                />
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm your new password"
                  placeholderTextColor="#999999"
                />
                <Button
                  title=""
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  variant="text"
                  size="small"
                  icon={
                    showConfirmPassword ? 
                      <FaEyeSlash size={20} color="#666666" /> : 
                      <FaEye size={20} color="#666666" />
                  }
                  style={styles.visibilityButton}
                />
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <View style={styles.requirement}>
                {newPassword.length >= 8 ? 
                  <FaCheckCircle size={16} color="#4CAF50" /> : 
                  <FaRegCircle size={16} color="#999999" />
                }
                <Text style={styles.requirementText}>
                  At least 8 characters long
                </Text>
              </View>
              <View style={styles.requirement}>
                {/[A-Z]/.test(newPassword) ? 
                  <FaCheckCircle size={16} color="#4CAF50" /> : 
                  <FaRegCircle size={16} color="#999999" />
                }
                <Text style={styles.requirementText}>
                  At least one uppercase letter
                </Text>
              </View>
              <View style={styles.requirement}>
                {/[0-9]/.test(newPassword) ? 
                  <FaCheckCircle size={16} color="#4CAF50" /> : 
                  <FaRegCircle size={16} color="#999999" />
                }
                <Text style={styles.requirementText}>
                  At least one number
                </Text>
              </View>
              <View style={styles.requirement}>
                {newPassword === confirmPassword && newPassword !== '' ? 
                  <FaCheckCircle size={16} color="#4CAF50" /> : 
                  <FaRegCircle size={16} color="#999999" />
                }
                <Text style={styles.requirementText}>
                  Passwords match
                </Text>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Success Message */}
            {success && (
              <View style={styles.successContainer}>
                <FaCheckCircle size={20} color="#4CAF50" />
                <Text style={styles.successText}>
                  Password changed successfully! Redirecting...
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Button
                title="Cancel"
                onPress={() => router.push('/profile')}
                variant="outline"
                size="medium"
                disabled={loading}
              />
              <Button
                title={loading ? 'Changing Password...' : 'Change Password'}
                onPress={handleChangePassword}
                variant="primary"
                size="medium"
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                icon={loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
              />
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 48,
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
    marginBottom: 24,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  visibilityButton: {
    padding: 8,
  },
  requirementsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
});
