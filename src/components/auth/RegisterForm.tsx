"use client";

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaLeaf, FaGoogle, FaFacebook } from 'react-icons/fa';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import Link from 'next/link';
import type { Database } from '../../lib/supabase/types';

export interface RegisterFormProps {
  onRegisterSuccess?: () => void;
}

/**
 * RegisterForm component for user registration
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Register user with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Create user profile in the database
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id,
              email: email.trim(),
              created_at: new Date().toISOString(),
              organic_preference: false,
              notifications_enabled: true,
              weather_alerts_enabled: true,
              community_voting_enabled: true
            },
          ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      // Call success callback
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.message || 'Failed to register. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle social login/registration
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    setError(null);

    try {
      // Simple approach with minimal options
      const { data, error: socialError } = await supabase.auth.signInWithOAuth({
        provider,
      });

      if (socialError) {
        throw socialError;
      }

      // If we get here without a redirect, manually redirect to the URL
      if (data?.url) {
        console.log(`Redirecting to provider URL: ${data.url}`);
        window.location.href = data.url;
      } else {
        throw new Error(`No redirect URL provided by Supabase for ${provider} login`);
      }
    } catch (err: any) {
      console.error(`${provider} registration error:`, err);
      setError(err?.message || `Failed to register with ${provider}. Please try again.`);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 
                <FaEyeSlash size={20} color="#666666" /> : 
                <FaEye size={20} color="#666666" />
              }
            </Pressable>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? 
                <FaEyeSlash size={20} color="#666666" /> : 
                <FaEye size={20} color="#666666" />
              }
            </Pressable>
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementsTitle}>Password requirements:</Text>
          <Text style={styles.requirementItem}>• At least 8 characters</Text>
          <Text style={styles.requirementItem}>• At least one uppercase letter</Text>
          <Text style={styles.requirementItem}>• At least one number</Text>
          <Text style={styles.requirementItem}>• At least one special character</Text>
        </View>

        <Button
          title="Sign Up"
          onPress={handleSubmit}
          variant="primary"
          size="large"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        />

        {/* Social Login Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialButtonsContainer}>
          <Pressable
            style={[styles.socialButton, styles.googleButton]}
            onPress={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            <FaGoogle size={20} color="#FFFFFF" />
            <Text style={styles.socialButtonText}>Google</Text>
          </Pressable>

          <Pressable
            style={[styles.socialButton, styles.facebookButton]}
            onPress={() => handleSocialLogin('facebook')}
            disabled={isLoading}
          >
            <FaFacebook size={20} color="#FFFFFF" />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </Pressable>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
  },
  form: {
    marginBottom: 24,
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
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    paddingRight: 48,
    backgroundColor: '#FFFFFF',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 16,
  },
  passwordRequirements: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    color: '#666666',
    fontSize: 14,
    marginRight: 4,
  },
  loginText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
  },
  termsLink: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666666',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RegisterForm;
