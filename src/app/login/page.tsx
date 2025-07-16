"use client";

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '../../components/auth/LoginForm';
import Card from '../../components/ui/Card';
import Link from 'next/link';
import { FaLeaf } from 'react-icons/fa';

/**
 * Login page for user authentication
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const error = searchParams.get('error');
  const errorMessage = searchParams.get('message');
  const errorCode = searchParams.get('code');

  // Display error information in console for debugging
  React.useEffect(() => {
    if (error) {
      console.error('Login error detected:', { error, errorMessage, errorCode });
    }
  }, [error, errorMessage, errorCode]);

  // Handle successful login
  const handleLoginSuccess = () => {
    router.push(redirect);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <FaLeaf size={48} color="#4CAF50" />
          <Text style={styles.logoText}>Garden Buddy</Text>
        </View>
        
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Log in to your account to access your plant diagnoses, treatments, and more.
        </Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Authentication Error</Text>
            <Text style={styles.errorMessage}>
              {errorMessage || 'There was a problem with the login process. Please try again using email and password.'}
            </Text>
          </View>
        )}
        
        <Card>
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </Card>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} passHref>
            <Text style={styles.registerLink}>Sign up</Text>
          </Link>
        </View>
        
        <View style={styles.helpLinks}>
          <Link href="/about" passHref>
            <Text style={styles.helpLink}>About Garden Buddy</Text>
          </Link>
          <Link href="/contact" passHref>
            <Text style={styles.helpLink}>Need Help?</Text>
          </Link>
          <Link href="/privacy" passHref>
            <Text style={styles.helpLink}>Privacy Policy</Text>
          </Link>
        </View>
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  registerText: {
    fontSize: 16,
    color: '#666666',
    marginRight: 8,
  },
  registerLink: {
    marginTop: 16,
    textAlign: 'center',
    color: '#4CAF50',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
  },
  helpLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 24,
  },
  helpLink: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'underline',
  },
});
