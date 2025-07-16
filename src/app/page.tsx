"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useIsDesktop } from '../utils/responsive';
import ResponsiveContainer from '../components/layout/ResponsiveContainer';
import { FaLeaf, FaSearch, FaCloudSun, FaUsers, FaBook, FaArrowRight, FaChartBar } from 'react-icons/fa';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WeatherWidget from '../components/weather/WeatherWidget';
import type { Database } from '../lib/supabase/types';

/**
 * Home page for Garden Buddy app
 */
export default function Home() {
  const [user, setUser] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user is logged in
  React.useEffect(() => {
    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (err) {
        console.error('Error checking user session:', err);
      } finally {
        setLoading(false);
      }
    }
    
    checkUser();
  }, []);

  // Handle navigation to diagnose page
  const handleDiagnoseClick = () => {
    if (user) {
      router.push('/diagnose');
    } else {
      router.push('/login?redirect=/diagnose');
    }
  };

  // Handle navigation to community page
  const handleCommunityClick = () => {
    if (user) {
      router.push('/community');
    } else {
      router.push('/login?redirect=/community');
    }
  };

  // Handle navigation to weather page
  const handleWeatherClick = () => {
    if (user) {
      router.push('/weather');
    } else {
      router.push('/login?redirect=/weather');
    }
  };

  // Handle navigation to logbook page
  const handleLogbookClick = () => {
    if (user) {
      router.push('/logbook');
    } else {
      router.push('/login?redirect=/logbook');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <ResponsiveContainer>
        <View style={[styles.heroInner, isDesktop ? { flexDirection: 'row' } : { flexDirection: 'column-reverse' }]}>
          <View style={[styles.heroContent, isDesktop && { paddingRight: 48, flex: 1 }]}>
            <View style={styles.logoContainer}>
              <FaLeaf size={48} color="#4CAF50" />
              <Text style={styles.logoText}>Garden Buddy</Text>
            </View>
            <Text style={[styles.heroTitle, isDesktop && { fontSize: 48, lineHeight: 56 }]}>Your AI-Powered Smart Farming Assistant</Text>
            <Text style={styles.heroSubtitle}>
              Detect plant diseases, get treatment recommendations, and monitor weather conditions for optimal plant health.
            </Text>
            <Button
              title="Get Started"
              onPress={handleDiagnoseClick}
              variant="primary"
              size="large"
              icon={<FaArrowRight size={16} color="#FFFFFF" />}
            />
          </View>
          <View style={[styles.heroImageContainer, isDesktop ? { flex: 1 } : { marginBottom: 32 }]}>
            <Image
              src="/images/plant-hero.jpg"
              alt="Healthy plants"
              width={isDesktop ? 600 : 400}
              height={isDesktop ? 400 : 240}
              style={styles.heroImage}
            />
          </View>
        </View>
        </ResponsiveContainer>
      </View>

      {/* Weather Widget Section - Only for logged-in users */}
      {user && (
        <View style={styles.weatherSection}>
          <ResponsiveContainer>
            <WeatherWidget 
              latitude={40.7128} 
              longitude={-74.0060} 
              cropType="general"
              compact={false}
            />
          </ResponsiveContainer>
        </View>
      )}

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <ResponsiveContainer>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={[styles.featuresGrid, isDesktop && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }]}>
          <Card style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <FaSearch size={32} color="#4CAF50" />
            </View>
            <Text style={styles.featureTitle}>AI Disease Detection</Text>
            <Text style={styles.featureDescription}>
              Upload a photo of your plant and get instant disease diagnosis with confidence scoring.
            </Text>
            <Button
              title="Diagnose Now"
              onPress={handleDiagnoseClick}
              variant="outline"
              size="small"
            />
          </Card>
          
          <Card style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <FaUsers size={32} color="#4CAF50" />
            </View>
            <Text style={styles.featureTitle}>Community Voting</Text>
            <Text style={styles.featureDescription}>
              Get help from the community for low-confidence AI diagnoses through voting.
            </Text>
            <Button
              title="Join Community"
              onPress={handleCommunityClick}
              variant="outline"
              size="small"
            />
          </Card>
          
          <Card style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <FaCloudSun size={32} color="#4CAF50" />
            </View>
            <Text style={styles.featureTitle}>Weather Alerts</Text>
            <Text style={styles.featureDescription}>
              Receive spray recommendations based on weather conditions to prevent diseases.
            </Text>
            <Button
              title="Check Weather"
              onPress={handleWeatherClick}
              variant="outline"
              size="small"
            />
          </Card>
          
          <Card style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <FaBook size={32} color="#4CAF50" />
            </View>
            <Text style={styles.featureTitle}>Crop Logbook</Text>
            <Text style={styles.featureDescription}>
              Track your plant health and treatments over time with a detailed logbook.
            </Text>
            <Button
              title="View Logbook"
              onPress={handleLogbookClick}
              variant="outline"
              size="small"
            />
          </Card>
        </View>
        </ResponsiveContainer>
      </View>

      {/* How It Works Section */}
      <View style={styles.howItWorksSection}>
        <ResponsiveContainer>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={[styles.stepsContainer, isDesktop ? { flexDirection: 'row' } : { flexDirection: 'column' }]}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Take a Photo</Text>
            <Text style={styles.stepDescription}>
              Capture a clear image of your plant's affected area using your device's camera.
            </Text>
          </View>
          
          <View style={styles.stepArrow}>
            <FaArrowRight size={24} color="#CCCCCC" />
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Get AI Diagnosis</Text>
            <Text style={styles.stepDescription}>
              Our AI analyzes the image and provides a diagnosis with confidence score.
            </Text>
          </View>
          
          <View style={styles.stepArrow}>
            <FaArrowRight size={24} color="#CCCCCC" />
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Receive Treatment</Text>
            <Text style={styles.stepDescription}>
              Get personalized treatment recommendations and preventive measures.
            </Text>
          </View>
        </View>
        </ResponsiveContainer>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <ResponsiveContainer>
        <Card style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Ready to improve your farming?</Text>
          <Text style={styles.ctaDescription}>
            Join thousands of farmers using Garden Buddy to keep their plants healthy and increase yields.
          </Text>
          <View style={styles.ctaButtons}>
            {!user ? (
              <>
                <Button
                  title="Sign Up"
                  onPress={() => router.push('/register')}
                  variant="primary"
                  size="large"
                />
                <Button
                  title="Log In"
                  onPress={() => router.push('/login')}
                  variant="outline"
                  size="large"
                />
              </>
            ) : (
              <Button
                title="Go to Dashboard"
                onPress={() => router.push('/diagnose')}
                variant="primary"
                size="large"
                icon={<FaChartBar size={16} color="#FFFFFF" />}
              />
            )}
          </View>
        </Card>
        </ResponsiveContainer>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ResponsiveContainer>
        <View style={styles.footerContent}>
          <View style={styles.footerLogoSection}>
            <FaLeaf size={32} color="#4CAF50" />
            <Text style={styles.footerLogoText}>Garden Buddy</Text>
            <Text style={styles.footerTagline}>
              AI-powered smart farming assistant
            </Text>
          </View>
          
          <View style={styles.footerLinks}>
            <View style={styles.footerLinkColumn}>
              <Text style={styles.footerLinkHeader}>Features</Text>
              <Link href="/diagnose" passHref>
                <Text style={styles.footerLink}>Disease Detection</Text>
              </Link>
              <Link href="/community" passHref>
                <Text style={styles.footerLink}>Community Voting</Text>
              </Link>
              <Link href="/weather" passHref>
                <Text style={styles.footerLink}>Weather Alerts</Text>
              </Link>
              <Link href="/logbook" passHref>
                <Text style={styles.footerLink}>Crop Logbook</Text>
              </Link>
            </View>
            
            <View style={styles.footerLinkColumn}>
              <Text style={styles.footerLinkHeader}>Company</Text>
              <Link href="/about" passHref>
                <Text style={styles.footerLink}>About Us</Text>
              </Link>
              <Link href="/privacy" passHref>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </Link>
              <Link href="/terms" passHref>
                <Text style={styles.footerLink}>Terms of Service</Text>
              </Link>
              <Link href="/contact" passHref>
                <Text style={styles.footerLink}>Contact Us</Text>
              </Link>
            </View>
          </View>
        </View>
        
        <View style={styles.footerBottom}>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} Garden Buddy. All rights reserved.
          </Text>
        </View>
        </ResponsiveContainer>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  hero: {
    backgroundColor: '#F9FFF9',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 500,
    paddingVertical: 48,
  },
  heroInner: {
    width: '100%',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginLeft: 12,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    lineHeight: 44,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 28,
  },
  heroImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    borderRadius: 16,
  },
  weatherSection: {
    paddingVertical: 24,
    backgroundColor: '#FAFAFA',
  },
  featuresSection: {
    padding: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 24,
  },
  featureCard: {
    width: 280,
    padding: 24,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  howItWorksSection: {
    padding: 24,
    marginTop: 24,
    backgroundColor: '#F9FFF9',
  },
  stepsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  step: {
    width: 280,
    alignItems: 'center',
    padding: 16,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepArrow: {
    margin: 16,
  },
  ctaSection: {
    padding: 24,
    marginTop: 24,
  },
  ctaCard: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 600,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  footer: {
    marginTop: 48,
    backgroundColor: '#333333',
    padding: 24,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  footerLogoSection: {
    marginBottom: 24,
  },
  footerLogoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  footerTagline: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 48,
    flexWrap: 'wrap',
  },
  footerLinkColumn: {
    minWidth: 160,
  },
  footerLinkHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  footerBottom: {
    marginTop: 24,
  },
  copyright: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
});
