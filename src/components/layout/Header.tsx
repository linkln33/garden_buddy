"use client";

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaLeaf, FaUserCircle, FaTimes, FaBars } from 'react-icons/fa';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../../lib/supabase/types';

/**
 * Header component with navigation menu
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const menuAnimation = new Animated.Value(isMenuOpen ? 1 : 0);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setIsScrolled(window.scrollY > 10);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Toggle menu animation
  useEffect(() => {
    Animated.timing(menuAnimation, {
      toValue: isMenuOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isMenuOpen, menuAnimation]);

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Animation interpolations
  const menuHeight = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const menuOpacity = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      <View 
        style={[
          styles.header, 
          isScrolled && styles.headerScrolled
        ]}
      >
        <View style={styles.container}>
          <Link href="/" passHref>
            <View style={styles.logoContainer}>
              <FaLeaf size={24} color="#4CAF50" />
              <Text style={styles.logoText}>Garden Buddy</Text>
            </View>
          </Link>

          {/* Desktop Navigation */}
          <View style={styles.desktopNav}>
            <Link href="/" passHref>
              <Text style={[styles.navLink, pathname === '/' && styles.activeLink]}>
                Home
              </Text>
            </Link>
            {user ? (
              <>
                <Link href="/diagnose" passHref>
                  <Text style={[styles.navLink, pathname === '/diagnose' && styles.activeLink]}>
                    Diagnose
                  </Text>
                </Link>
                <Link href="/logbook" passHref>
                  <Text style={[styles.navLink, pathname === '/logbook' && styles.activeLink]}>
                    Logbook
                  </Text>
                </Link>
                <Link href="/community" passHref>
                  <Text style={[styles.navLink, pathname === '/community' && styles.activeLink]}>
                    Community
                  </Text>
                </Link>
                <Link href="/weather" passHref>
                  <Text style={[styles.navLink, pathname === '/weather' && styles.activeLink]}>
                    Weather
                  </Text>
                </Link>
              </>
            ) : (
              <>
                <Link href="/about" passHref>
                  <Text style={[styles.navLink, pathname === '/about' && styles.activeLink]}>
                    About
                  </Text>
                </Link>
                <Link href="/contact" passHref>
                  <Text style={[styles.navLink, pathname === '/contact' && styles.activeLink]}>
                    Contact
                  </Text>
                </Link>
              </>
            )}
          </View>

          {/* Auth Buttons (Desktop) */}
          <View style={styles.desktopAuth}>
            {user ? (
              <>
                <Link href="/profile" passHref>
                  <View style={styles.profileButton}>
                    <FaUserCircle size={20} color="#4CAF50" />
                    <Text style={styles.profileText}>Profile</Text>
                  </View>
                </Link>
                <Pressable style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Link href="/login" passHref>
                  <View style={styles.loginButton}>
                    <Text style={styles.loginText}>Login</Text>
                  </View>
                </Link>
                <Link href="/register" passHref>
                  <View style={styles.registerButton}>
                    <Text style={styles.registerText}>Sign Up</Text>
                  </View>
                </Link>
              </>
            )}
          </View>

          {/* Mobile Menu Button */}
          <Pressable 
            style={styles.menuButton} 
            onPress={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? 
              <FaTimes size={24} color="#333333" /> : 
              <FaBars size={24} color="#333333" />
            }
          </Pressable>
        </View>
      </View>

      {/* Mobile Menu */}
      <Animated.View 
        style={[
          styles.mobileMenu,
          {
            height: menuHeight,
            opacity: menuOpacity,
            display: isMenuOpen ? 'flex' : 'none',
          },
        ]}
      >
        <View style={styles.mobileMenuContent}>
          <Link href="/" passHref>
            <Text 
              style={[styles.mobileNavLink, pathname === '/' && styles.activeLink]}
              onPress={() => setIsMenuOpen(false)}
            >
              Home
            </Text>
          </Link>
          
          {user ? (
            <>
              <Link href="/diagnose" passHref>
                <Text 
                  style={[styles.mobileNavLink, pathname === '/diagnose' && styles.activeLink]}
                  onPress={() => setIsMenuOpen(false)}
                >
                  Diagnose
                </Text>
              </Link>
              <Link href="/logbook" passHref>
                <Text 
                  style={[styles.mobileNavLink, pathname === '/logbook' && styles.activeLink]}
                  onPress={() => setIsMenuOpen(false)}
                >
                  Logbook
                </Text>
              </Link>
              <Link href="/community" passHref>
                <Text 
                  style={[styles.mobileNavLink, pathname === '/community' && styles.activeLink]}
                  onPress={() => setIsMenuOpen(false)}
                >
                  Community
                </Text>
              </Link>
              <Link href="/weather" passHref>
                <Text 
                  style={[styles.mobileNavLink, pathname === '/weather' && styles.activeLink]}
                  onPress={() => setIsMenuOpen(false)}
                >
                  Weather
                </Text>
              </Link>
              <Link href="/profile" passHref>
                <Text 
                  style={[styles.mobileNavLink, pathname === '/profile' && styles.activeLink]}
                  onPress={() => setIsMenuOpen(false)}
                >
                  Profile
                </Text>
              </Link>
              <Pressable 
                onPress={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <Text style={styles.mobileLogoutLink}>Logout</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Link href="/about" passHref>
                <Text 
                  style={[styles.mobileNavLink, pathname === '/about' && styles.activeLink]}
                  onPress={() => setIsMenuOpen(false)}
                >
                  About
                </Text>
              </Link>
              <Link href="/contact" passHref>
                <Text 
                  style={[styles.mobileNavLink, pathname === '/contact' && styles.activeLink]}
                  onPress={() => setIsMenuOpen(false)}
                >
                  Contact
                </Text>
              </Link>
              <Link href="/login" passHref>
                <Text 
                  style={[styles.mobileNavLink, pathname === '/login' && styles.activeLink]}
                  onPress={() => setIsMenuOpen(false)}
                >
                  Login
                </Text>
              </Link>
              <Link href="/register" passHref>
                <Text 
                  style={[styles.mobileNavLink, pathname === '/register' && styles.activeLink]}
                  onPress={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Text>
              </Link>
            </>
          )}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    position: 'relative' as 'relative',
    top: 0,
    zIndex: 100,
    width: '100%',
  },
  headerScrolled: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
    marginLeft: 8,
  },
  desktopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    display: 'none',
    // Media query handled via CSS
  },
  navLink: {
    fontSize: 16,
    color: '#333333',
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  activeLink: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  desktopAuth: {
    flexDirection: 'row',
    alignItems: 'center',
    display: 'none',
    // Media query handled via CSS
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  profileText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  loginText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  registerText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  menuButton: {
    display: 'flex',
    // Media query handled via CSS
  },
  mobileMenu: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    position: 'absolute' as 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 99,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mobileMenuContent: {
    padding: 24,
  },
  mobileNavLink: {
    fontSize: 18,
    color: '#333333',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  mobileLogoutLink: {
    fontSize: 18,
    color: '#F44336',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    fontWeight: '600',
  },
});
