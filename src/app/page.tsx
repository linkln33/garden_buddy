"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useIsDesktop } from '../utils/responsive';
import ResponsiveContainer from '../components/layout/ResponsiveContainer';
import { FaLeaf, FaSearch, FaCloudSun, FaUsers, FaBook, FaArrowRight, FaChartBar, 
         FaMapMarkerAlt, FaCamera, FaExclamationTriangle, FaShieldAlt, FaDatabase } from 'react-icons/fa';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WeatherWidget from '../components/weather/WeatherWidget';
import type { Database } from '../lib/supabase/types';

/**
 * Home page for Garden Buddy app
 * Redesigned to match Agrio style with modern UI
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

  // Navigation handlers with authentication check
  const navigateTo = (path: string) => {
    if (user) {
      router.push(path);
    } else {
      router.push(`/login?redirect=${path}`);
    }
  };

  // Handle navigation to diagnose page
  const handleDiagnoseClick = () => navigateTo('/diagnose');

  // Handle navigation to community page
  const handleCommunityClick = () => navigateTo('/community');

  // Handle navigation to weather page
  const handleWeatherClick = () => navigateTo('/weather');

  // Handle navigation to logbook page
  const handleLogbookClick = () => navigateTo('/logbook');
  
  // Handle navigation to offline diagnosis page
  const handleOfflineDiagnosisClick = () => navigateTo('/diagnose/offline');

  return (
    <ScrollView style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <ResponsiveContainer>
          <View style={styles.headerInner}>
            <View style={styles.logoContainer}>
              <FaLeaf size={32} color="#4CAF50" />
              <Text style={styles.logoText}>Garden Buddy</Text>
            </View>
            <View style={styles.headerNav}>
              {isDesktop && (
                <>
                  <Link href="/features" passHref>
                    <Text style={styles.navLink}>Features</Text>
                  </Link>
                  <Link href="/about" passHref>
                    <Text style={styles.navLink}>About</Text>
                  </Link>
                  <Link href="/blog" passHref>
                    <Text style={styles.navLink}>Blog</Text>
                  </Link>
                </>
              )}
              {!user ? (
                <View style={styles.authButtons}>
                  <Button
                    title="Log In"
                    onPress={() => router.push('/login')}
                    variant="outline"
                    size="small"
                  />
                  <Button
                    title="Sign Up"
                    onPress={() => router.push('/register')}
                    variant="primary"
                    size="small"
                  />
                </View>
              ) : (
                <Button
                  title="Dashboard"
                  onPress={() => router.push('/dashboard')}
                  variant="primary"
                  size="small"
                />
              )}
            </View>
          </View>
        </ResponsiveContainer>
      </View>
      
      {/* Hero Section */}
      <View style={styles.hero}>
        <ResponsiveContainer>
          <View style={[styles.heroInner, isDesktop ? { flexDirection: 'row' } : { flexDirection: 'column-reverse' }]}>
            <View style={[styles.heroContent, isDesktop && { paddingRight: 48, flex: 1 }]}>
              <Text style={[styles.heroTitle, isDesktop && { fontSize: 48, lineHeight: 56 }]}>
                Precision plant protection.
                <Text style={styles.heroTitleHighlight}> made easy!</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                AI-powered plant disease diagnosis, weather monitoring, and treatment recommendations for optimal plant health.
              </Text>
              <View style={styles.heroButtons}>
                <Button
                  title="Get Started"
                  onPress={handleDiagnoseClick}
                  variant="primary"
                  size="large"
                />
                <Button
                  title="See how it works"
                  onPress={() => router.push('#how-it-works')}
                  variant="outline"
                  size="large"
                />
              </View>
            </View>
            <View style={[styles.heroImageContainer, isDesktop ? { flex: 1 } : { marginBottom: 32 }]}>
              <Image
                src="/images/plant-hero.jpg"
                alt="Garden Buddy App"
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

      {/* AI Plant Disease Recognition Section */}
      <View style={styles.recognitionSection}>
        <ResponsiveContainer>
          <View style={[styles.recognitionInner, isDesktop ? { flexDirection: 'row' } : { flexDirection: 'column' }]}>
            <View style={[styles.recognitionImageContainer, isDesktop ? { flex: 1, marginRight: 48 } : { marginBottom: 32 }]}>
              <View style={styles.phoneFrameContainer}>
                <View style={styles.phoneResultsCard}>
                  <Text style={styles.resultsTitle}>Results</Text>
                  <View style={styles.diseaseResultContainer}>
                    <Image
                      src="/images/plant-disease-sample.jpg"
                      alt="Plant disease sample"
                      width={120}
                      height={120}
                      style={styles.diseaseSampleImage}
                    />
                    <View style={styles.diseaseInfo}>
                      <Text style={styles.diseaseName}>Aceria Oleae</Text>
                      <Text style={styles.confidenceScore}>Confidence: 97%</Text>
                    </View>
                  </View>
                  <View style={styles.treatmentSection}>
                    <Text style={styles.treatmentTitle}>Conventional Treatment</Text>
                    <Text style={styles.treatmentDescription}>
                      Apply copper fungicide according to manufacturer instructions.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={[styles.recognitionContent, isDesktop && { flex: 1 }]}>
              <View style={styles.featureIconContainer}>
                <FaSearch size={32} color="#4CAF50" />
              </View>
              <Text style={styles.featureSectionTitle}>App that recognizes plant diseases and pests</Text>
              <Text style={styles.featureDescription}>
                Images of plant problems are uploaded to the app then analyzed through our artificial intelligence algorithms. The
                system provides users with identifications, suggested solutions and helps with decision making.
              </Text>
              <Button
                title="Free Plant Health Check"
                onPress={handleDiagnoseClick}
                variant="primary"
                size="large"
              />
            </View>
          </View>
        </ResponsiveContainer>
      </View>

      {/* Interactive Map Section */}
      <View style={styles.mapSection}>
        <ResponsiveContainer>
          <View style={[styles.mapInner, isDesktop ? { flexDirection: 'row-reverse' } : { flexDirection: 'column' }]}>
            <View style={[styles.mapImageContainer, isDesktop ? { flex: 1, marginLeft: 48 } : { marginBottom: 32 }]}>
              <Image
                src="/images/field-map-sample.jpg"
                alt="Interactive field map"
                width={isDesktop ? 600 : 400}
                height={isDesktop ? 350 : 240}
                style={styles.mapImage}
              />
            </View>
            
            <View style={[styles.mapContent, isDesktop && { flex: 1 }]}>
              <View style={styles.featureIconContainer}>
                <FaMapMarkerAlt size={32} color="#4CAF50" />
              </View>
              <Text style={styles.featureSectionTitle}>Interactive field mapping and monitoring</Text>
              <Text style={styles.featureDescription}>
                Track plant health across your entire property with GPS-tagged observations. Monitor disease spread, treatment effectiveness, and identify problem areas quickly.
              </Text>
              <Button
                title="Learn more"
                onPress={handleWeatherClick}
                variant="outline"
                size="large"
              />
            </View>
          </View>
        </ResponsiveContainer>
      </View>

      {/* AI Alert System Section */}
      <View style={styles.alertSection}>
        <ResponsiveContainer>
          <View style={[styles.alertInner, isDesktop ? { flexDirection: 'row' } : { flexDirection: 'column' }]}>
            <View style={[styles.alertImageContainer, isDesktop ? { flex: 1, marginRight: 48 } : { marginBottom: 32 }]}>
              <View style={styles.phoneFrameContainer}>
                <View style={styles.alertNotification}>
                  <View style={styles.alertHeader}>
                    <FaExclamationTriangle size={24} color="#FF6B35" />
                    <Text style={styles.alertTitle}>Attention!</Text>
                  </View>
                  <Text style={styles.alertMessage}>
                    Alert: Powdery Mildew detected in your region. Check your plants and apply preventive measures.
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={[styles.alertContent, isDesktop && { flex: 1 }]}>
              <View style={styles.featureIconContainer}>
                <FaExclamationTriangle size={32} color="#4CAF50" />
              </View>
              <Text style={styles.featureSectionTitle}>The first AI-based alert system</Text>
              <Text style={styles.featureDescription}>
                Our app notifies subscribers after crop diseases and pests are detected and expected to arrive to their regions. The alerts come with written preventative measures to aid in impeding infestations.
              </Text>
              <Button
                title="Start Receiving Alerts Today"
                onPress={handleDiagnoseClick}
                variant="primary"
                size="large"
              />
            </View>
          </View>
        </ResponsiveContainer>
      </View>

      {/* Offline Diagnosis Section */}
      <View style={styles.offlineSection}>
        <ResponsiveContainer>
          <View style={[styles.offlineInner, isDesktop ? { flexDirection: 'row-reverse' } : { flexDirection: 'column' }]}>
            <View style={[styles.offlineImageContainer, isDesktop ? { flex: 1, marginLeft: 48 } : { marginBottom: 32 }]}>
              <Image
                src="/images/offline-diagnosis.jpg"
                alt="Offline plant diagnosis"
                width={isDesktop ? 600 : 400}
                height={isDesktop ? 350 : 240}
                style={styles.offlineImage}
              />
            </View>
            
            <View style={[styles.offlineContent, isDesktop && { flex: 1 }]}>
              <View style={styles.featureIconContainer}>
                <FaDatabase size={32} color="#4CAF50" />
              </View>
              <Text style={styles.featureSectionTitle}>Works offline when you need it most</Text>
              <Text style={styles.featureDescription}>
                Garden Buddy works even without internet connection. Our app includes an offline plant disease diagnosis model using the PlantVillage dataset, so you can identify plant issues anywhere, anytime.
              </Text>
              <Button
                title="Try Offline Diagnosis"
                onPress={handleOfflineDiagnosisClick}
                variant="outline"
                size="large"
              />
            </View>
          </View>
        </ResponsiveContainer>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <ResponsiveContainer>
          <Card style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Join Garden Buddy, the most advanced plant protection app</Text>
            <Text style={styles.ctaDescription}>
              Start protecting your plants today with our AI-powered diagnosis and treatment recommendations.
            </Text>
            <View style={styles.ctaButtons}>
              {!user ? (
                <>
                  <Button
                    title="Sign Up Free"
                    onPress={() => router.push('/register')}
                    variant="primary"
                    size="large"
                  />
                  <Button
                    title="See Demo"
                    onPress={() => router.push('/demo')}
                    variant="outline"
                    size="large"
                  />
                </>
              ) : (
                <Button
                  title="Go to Dashboard"
                  onPress={() => router.push('/dashboard')}
                  variant="primary"
                  size="large"
                  icon={<FaChartBar size={16} color="#FFFFFF" />}
                />
              )}
            </View>
            <View style={styles.appStoreButtons}>
              <Image
                src="/images/google-play-badge.png"
                alt="Get it on Google Play"
                width={135}
                height={40}
                style={styles.storeBadge}
              />
              <Image
                src="/images/app-store-badge.png"
                alt="Download on the App Store"
                width={135}
                height={40}
                style={styles.storeBadge}
              />
            </View>
          </Card>
        </ResponsiveContainer>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ResponsiveContainer>
          <View style={[styles.footerContent, isDesktop ? { flexDirection: 'row', justifyContent: 'space-between' } : { flexDirection: 'column' }]}>
            <View style={styles.footerLogoSection}>
              <View style={styles.logoContainer}>
                <FaLeaf size={24} color="#4CAF50" />
                <Text style={[styles.logoText, { fontSize: 18 }]}>Garden Buddy</Text>
              </View>
              <Text style={styles.footerTagline}>Your AI-Powered Plant Protection Assistant</Text>
            </View>
            
            <View style={[styles.footerLinks, isDesktop ? { flexDirection: 'row' } : { flexDirection: 'column', marginTop: 24 }]}>
              <View style={styles.footerLinkColumn}>
                <Text style={styles.footerLinkHeader}>Product</Text>
                <Link href="/features" passHref>
                  <Text style={styles.footerLink}>Features</Text>
                </Link>
                <Link href="/pricing" passHref>
                  <Text style={styles.footerLink}>Pricing</Text>
                </Link>
                <Link href="/demo" passHref>
                  <Text style={styles.footerLink}>Demo</Text>
                </Link>
              </View>
              
              <View style={styles.footerLinkColumn}>
                <Text style={styles.footerLinkHeader}>Company</Text>
                <Link href="/about" passHref>
                  <Text style={styles.footerLink}>About Us</Text>
                </Link>
                <Link href="/blog" passHref>
                  <Text style={styles.footerLink}>Blog</Text>
                </Link>
                <Link href="/contact" passHref>
                  <Text style={styles.footerLink}>Contact</Text>
                </Link>
              </View>
              
              <View style={styles.footerLinkColumn}>
                <Text style={styles.footerLinkHeader}>Legal</Text>
                <Link href="/privacy" passHref>
                  <Text style={styles.footerLink}>Privacy Policy</Text>
                </Link>
                <Link href="/terms" passHref>
                  <Text style={styles.footerLink}>Terms of Service</Text>
                </Link>
              </View>
            </View>
          </View>
          
          <View style={styles.footerBottom}>
            <Text style={styles.copyright}>  {new Date().getFullYear()} Garden Buddy. All rights reserved.</Text>
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
  // Header styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navLink: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  // Hero section styles
  hero: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 64,
  },
  heroInner: {
    alignItems: 'center',
  },
  heroContent: {
    paddingVertical: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333333',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    lineHeight: 44,
  },
  heroTitleHighlight: {
    color: '#4CAF50',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 28,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  heroImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    borderRadius: 12,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  // Weather section styles
  weatherSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
  },
  // Recognition section styles
  recognitionSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 64,
  },
  recognitionInner: {
    alignItems: 'center',
  },
  recognitionContent: {
    paddingVertical: 24,
  },
  featureSectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    lineHeight: 40,
  },
  featureDescription: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 28,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  recognitionImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrameContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  phoneResultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: 280,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  diseaseResultContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  diseaseSampleImage: {
    borderRadius: 8,
    marginRight: 16,
  },
  diseaseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  confidenceScore: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  treatmentSection: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  treatmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  treatmentDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  // Map section styles
  mapSection: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 64,
  },
  mapInner: {
    alignItems: 'center',
  },
  mapContent: {
    paddingVertical: 24,
  },
  mapImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapImage: {
    borderRadius: 12,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  // Alert section styles
  alertSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 64,
  },
  alertInner: {
    alignItems: 'center',
  },
  alertContent: {
    paddingVertical: 24,
  },
  alertImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertNotification: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 16,
    width: 280,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginLeft: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  // Offline section styles
  offlineSection: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 64,
  },
  offlineInner: {
    alignItems: 'center',
  },
  offlineContent: {
    paddingVertical: 24,
  },
  offlineImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineImage: {
    borderRadius: 12,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  // CTA section styles
  ctaSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 64,
  },
  ctaCard: {
    padding: 48,
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 28,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  appStoreButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  storeBadge: {
    borderRadius: 8,
  },
  // Footer styles
  footer: {
    backgroundColor: '#333333',
    paddingVertical: 64,
    paddingBottom: 32,
  },
  footerContent: {
    marginBottom: 48,
  },
  footerLogoSection: {
    marginBottom: 24,
  },
  footerTagline: {
    color: '#CCCCCC',
    marginTop: 8,
  },
  footerLinks: {
    gap: 48,
  },
  footerLinkColumn: {
    marginBottom: 24,
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
