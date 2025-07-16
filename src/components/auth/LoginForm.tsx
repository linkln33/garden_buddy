"use client";

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaLeaf, FaGoogle, FaFacebook } from 'react-icons/fa';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import Link from 'next/link';
import type { Database } from '../../lib/supabase/types';

export interface LoginFormProps {
  onLoginSuccess?: () => void;
}

/**
 * LoginForm component for user authentication
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log(`Attempting to log in with email: ${email.trim()}`);

    try {
      // Get session first to clear any existing session
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session state:', sessionData?.session ? 'Logged in' : 'No session');
      
      // Sign in with email and password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        console.error('Sign in error details:', signInError);
        throw signInError;
      }

      console.log('Login successful, user:', data?.user?.email);
      
      // Double-check that we have a session after login
      const { data: newSession } = await supabase.auth.getSession();
      console.log('New session established:', !!newSession?.session);
      
      if (onLoginSuccess) {
        console.log('Redirecting to:', window.location.origin + '/dashboard');
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Failed to log in. Please check your credentials and try again.');
      setIsLoading(false);
    }
  };

  // Handle social login
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
      console.error(`${provider} login error:`, err);
      setError(err?.message || `Failed to login with ${provider}. Please try again.`);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 
                <FaEyeSlash size={24} color="#666" /> : 
                <FaEye size={24} color="#666" />
              }
            </Pressable>
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          title="Log In"
          onPress={handleSubmit}
          variant="primary"
          size="large"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        />

        <Link href="/forgot-password" passHref>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </Link>

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
  container: {
    padding: 24,
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
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
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

export default LoginForm;
