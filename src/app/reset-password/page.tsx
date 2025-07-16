"use client";

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FaLeaf, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { FaRegCircle } from 'react-icons/fa6';
import type { Database } from '../../lib/supabase/types';

/**
 * Reset Password page for setting a new password
 */
export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
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

  // Handle password reset
  const handleResetPassword = async () => {
    try {
      setError(null);
      setLoading(true);

      // Validate password
      if (!validatePassword()) {
        setLoading(false);
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
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <FaLeaf size={48} color="#4CAF50" />
          <Text style={styles.logoText}>Garden Buddy</Text>
        </View>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Create a new password for your account
        </Text>

        <Card>
          <View style={styles.form}>
            {success ? (
              <View style={styles.successContainer}>
                <FaCheckCircle size={48} color="#4CAF50" />
                <Text style={styles.successTitle}>Password Reset Successful</Text>
                <Text style={styles.successText}>
                  Your password has been reset successfully. You will be redirected to the login page in a few seconds.
                </Text>
                <Button
                  title="Login Now"
                  onPress={() => router.push('/login')}
                  variant="primary"
                  size="medium"
                  style={styles.loginButton}
                />
              </View>
            ) : (
              <>
                {/* New Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      placeholder="Enter your new password"
                      placeholderTextColor="#999999"
                      autoCapitalize="none"
                    />
                    <Button
                      title=""
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      variant="outline"
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
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      placeholder="Confirm your new password"
                      placeholderTextColor="#999999"
                      autoCapitalize="none"
                    />
                    <Button
                      title=""
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      variant="outline"
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

                <Button
                  title={loading ? 'Resetting Password...' : 'Reset Password'}
                  onPress={handleResetPassword}
                  variant="primary"
                  size="large"
                  disabled={loading || !newPassword || !confirmPassword}
                  icon={loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
                  style={styles.resetButton}
                />
              </>
            )}
          </View>
        </Card>
      </View>
    </View>
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
    marginTop: 48,
    marginBottom: 48,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
    marginLeft: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    padding: 24,
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
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  visibilityButton: {
    padding: 8,
    marginRight: 8,
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
  resetButton: {
    marginTop: 8,
  },
  successContainer: {
    alignItems: 'center',
    padding: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loginButton: {
    marginTop: 8,
  },
});
