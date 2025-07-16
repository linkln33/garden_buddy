"use client";

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Link from 'next/link';
import { FaLeaf, FaTwitter, FaFacebook, FaInstagram, FaGithub } from 'react-icons/fa';

/**
 * Footer component with links and copyright information
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Logo and Description */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <FaLeaf size={24} color="#4CAF50" />
              <Text style={styles.logoText}>Garden Buddy</Text>
            </View>
            <Text style={styles.description}>
              AI-powered smart farming assistant to help you identify plant diseases,
              get treatment recommendations, and monitor weather conditions.
            </Text>
            <View style={styles.socialLinks}>
              <Link href="https://twitter.com/gardenbuddy" passHref>
                <View style={styles.socialIcon}>
                  <FaTwitter size={20} color="#4CAF50" />
                </View>
              </Link>
              <Link href="https://facebook.com/gardenbuddy" passHref>
                <View style={styles.socialIcon}>
                  <FaFacebook size={20} color="#4CAF50" />
                </View>
              </Link>
              <Link href="https://instagram.com/gardenbuddy" passHref>
                <View style={styles.socialIcon}>
                  <FaInstagram size={20} color="#4CAF50" />
                </View>
              </Link>
            </View>
          </View>

          {/* Quick Links */}
          <View style={styles.linksSection}>
            <View style={styles.linkColumn}>
              <Text style={styles.columnTitle}>Features</Text>
              <Link href="/diagnose" passHref>
                <Text style={styles.footerLink}>Disease Detection</Text>
              </Link>
              <Link href="/logbook" passHref>
                <Text style={styles.footerLink}>Crop Logbook</Text>
              </Link>
              <Link href="/community" passHref>
                <Text style={styles.footerLink}>Community Voting</Text>
              </Link>
              <Link href="/weather" passHref>
                <Text style={styles.footerLink}>Weather Alerts</Text>
              </Link>
            </View>
            
            <View style={styles.linkColumn}>
              <Text style={styles.columnTitle}>Company</Text>
              <Link href="/about" passHref>
                <Text style={styles.footerLink}>About Us</Text>
              </Link>
              <Link href="/contact" passHref>
                <Text style={styles.footerLink}>Contact</Text>
              </Link>
              <Link href="/careers" passHref>
                <Text style={styles.footerLink}>Careers</Text>
              </Link>
              <Link href="/blog" passHref>
                <Text style={styles.footerLink}>Blog</Text>
              </Link>
            </View>
            
            <View style={styles.linkColumn}>
              <Text style={styles.columnTitle}>Support</Text>
              <Link href="/help" passHref>
                <Text style={styles.footerLink}>Help Center</Text>
              </Link>
              <Link href="/faq" passHref>
                <Text style={styles.footerLink}>FAQ</Text>
              </Link>
              <Link href="/privacy" passHref>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </Link>
              <Link href="/terms" passHref>
                <Text style={styles.footerLink}>Terms of Service</Text>
              </Link>
            </View>
          </View>
        </View>
        
        {/* Copyright */}
        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>
            © {currentYear} Garden Buddy. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#F8F9FA',
    paddingTop: 48,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  container: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'column',
  },
  logoSection: {
    marginBottom: 32,
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 22,
  },
  socialLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  linksSection: {
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'space-around',
  },
  linkColumn: {
    marginBottom: 24,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  copyright: {
    paddingTop: 24,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  copyrightText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
