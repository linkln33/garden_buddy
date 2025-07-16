"use client";

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useSearchParams } from 'next/navigation';
import RegisterForm from '../../components/auth/RegisterForm';
import Card from '../../components/ui/Card';
import Link from 'next/link';
import { FaLeaf } from 'react-icons/fa';

/**
 * Registration page for new users
 */
export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Handle successful registration
  const handleRegisterSuccess = () => {
    router.push(redirect);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <FaLeaf size={48} color="#4CAF50" />
          <Text style={styles.logoText}>Garden Buddy</Text>
        </View>
        
        <Text style={styles.title}>Create an Account</Text>
        <Text style={styles.subtitle}>
          Join Garden Buddy to identify plant diseases, get treatment recommendations, and track your plant health.
        </Text>
        
        <Card>
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        </Card>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} passHref>
            <Text style={styles.loginLink}>Log in</Text>
          </Link>
        </View>
        
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Link href="/terms" passHref>
              <Text style={styles.termsLink}>Terms of Service</Text>
            </Link>
            {' '}and{' '}
            <Link href="/privacy" passHref>
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Link>
          </Text>
        </View>
        
        <View style={styles.helpLinks}>
          <Link href="/about" passHref>
            <Text style={styles.helpLink}>About Garden Buddy</Text>
          </Link>
          <Link href="/contact" passHref>
            <Text style={styles.helpLink}>Need Help?</Text>
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  loginText: {
    fontSize: 16,
    color: '#666666',
    marginRight: 8,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    fontSize: 14,
    color: '#4CAF50',
    textDecorationLine: 'underline',
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
