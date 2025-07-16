"use client";

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Link from 'next/link';
import { FaLeaf, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import type { Database } from '../../lib/supabase/types';

/**
 * Forgot Password page for password reset
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Handle password reset request
  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err?.message || 'Failed to send password reset email. Please try again.');
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

        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <Card>
          <View style={styles.form}>
            {success ? (
              <View style={styles.successContainer}>
                <FaCheckCircle size={48} color="#4CAF50" />
                <Text style={styles.successTitle}>Check Your Email</Text>
                <Text style={styles.successText}>
                  We've sent a password reset link to {email}. Please check your inbox and follow the instructions to reset your password.
                </Text>
                <Text style={styles.successNote}>
                  If you don't see the email, check your spam folder or try again.
                </Text>
                <Button
                  title="Back to Login"
                  onPress={() => router.push('/login')}
                  variant="primary"
                  size="medium"
                  style={styles.backButton}
                />
              </View>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Button
                  title={loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                  onPress={handleResetPassword}
                  variant="primary"
                  size="large"
                  disabled={loading || !email.trim()}
                  icon={loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
                  style={styles.resetButton}
                />
              </>
            )}
          </View>
        </Card>

        <View style={styles.links}>
          <Link href="/login" passHref>
            <Text style={styles.link}>Back to Login</Text>
          </Link>
          <Text style={styles.separator}>•</Text>
          <Link href="/register" passHref>
            <Text style={styles.link}>Create Account</Text>
          </Link>
        </View>
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
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  resetButton: {
    marginTop: 8,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  link: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    color: '#666666',
    marginHorizontal: 8,
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
    marginBottom: 8,
    lineHeight: 24,
  },
  successNote: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginTop: 8,
  },
});
