"use client";

import React, { useState, useEffect } from 'react';
import { useIsDesktop } from '../../utils/responsive';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaLeaf, FaUserCircle, FaTimes, FaBars, FaBell } from 'react-icons/fa';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../../lib/supabase/types';

/**
 * Header component with navigation menu
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const isDesktop = useIsDesktop();
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

  // Fetch notifications when user is logged in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        // Fetch weather alerts as notifications
        const { data: weatherAlerts, error: weatherError } = await supabase
          .from('weather_alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (weatherError) throw weatherError;
        
        // You can add more notification types here and combine them
        setNotifications(weatherAlerts || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user) {
      fetchNotifications();
      
      // Set up real-time subscription for new notifications
      const weatherSubscription = supabase
        .channel('weather_alerts_channel')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'weather_alerts' }, 
          (payload) => {
            setNotifications(prev => [payload.new, ...prev].slice(0, 5));
          }
        )
        .subscribe();
        
      return () => {
        weatherSubscription.unsubscribe();
      };
    }
  }, [user, supabase]);

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
          <View style={[styles.desktopNav, isDesktop && { display: 'flex' }]}>
            <Link href="/" passHref style={{ textDecoration: 'none' }}>
              <Text style={[styles.navLink, pathname === '/' && styles.activeLink]}>
                Home
              </Text>
            </Link>
            {user ? (
              <>
                <Link href="/diagnose" passHref style={{ textDecoration: 'none' }}>
                  <Text style={[styles.navLink, pathname === '/diagnose' && styles.activeLink]}>
                    Diagnose
                  </Text>
                </Link>
                <Link href="/logbook" passHref style={{ textDecoration: 'none' }}>
                  <Text style={[styles.navLink, pathname === '/logbook' && styles.activeLink]}>
                    Logbook
                  </Text>
                </Link>
                <Link href="/community" passHref style={{ textDecoration: 'none' }}>
                  <Text style={[styles.navLink, pathname === '/community' && styles.activeLink]}>
                    Community
                  </Text>
                </Link>
                <Link href="/weather" passHref style={{ textDecoration: 'none' }}>
                  <Text style={[styles.navLink, pathname === '/weather' && styles.activeLink]}>
                    Weather
                  </Text>
                </Link>
              </>
            ) : (
              <>
                <Link href="/about" passHref style={{ textDecoration: 'none' }}>
                  <Text style={[styles.navLink, pathname === '/about' && styles.activeLink]}>
                    About
                  </Text>
                </Link>
                <Link href="/contact" passHref style={{ textDecoration: 'none' }}>
                  <Text style={[styles.navLink, pathname === '/contact' && styles.activeLink]}>
                    Contact
                  </Text>
                </Link>
              </>
            )}
          </View>

          {/* Auth Buttons (Desktop) */}
          <View style={[styles.desktopAuth, isDesktop && { display: 'flex' }]}>
            {user ? (
              <>
                {/* Notifications Bell */}
                <Pressable 
                  style={styles.notificationButton} 
                  onPress={() => setShowNotifications(!showNotifications)}
                >
                  <View style={styles.bellContainer}>
                    <FaBell size={20} color="#4CAF50" />
                    {notifications.length > 0 && (
                      <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>{notifications.length}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <View style={styles.notificationsDropdown}>
                    <Text style={styles.notificationsTitle}>Notifications</Text>
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <View key={notification.id} style={styles.notificationItem}>
                          <Text style={styles.notificationText}>
                            {notification.message || 'Weather alert: ' + notification.alert_type}
                          </Text>
                          <Text style={styles.notificationTime}>
                            {new Date(notification.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noNotifications}>No new notifications</Text>
                    )}
                  </View>
                )}
                
                <Pressable 
                  style={styles.profileButton} 
                  onPress={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <FaUserCircle size={20} color="#4CAF50" />
                  <Text style={styles.profileText}>Profile</Text>
                </Pressable>
                
                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <View style={styles.profileDropdown}>
                    <Text style={styles.welcomeText}>Welcome back, {user?.email?.split('@')[0] || 'User'}</Text>
                    <Link href="/profile" passHref style={{ textDecoration: 'none' }}>
                      <View style={styles.dropdownItem}>
                        <Text style={styles.dropdownItemText}>My Profile</Text>
                      </View>
                    </Link>
                    <Link href="/settings" passHref style={{ textDecoration: 'none' }}>
                      <View style={styles.dropdownItem}>
                        <Text style={styles.dropdownItemText}>Settings</Text>
                      </View>
                    </Link>
                    <Pressable style={styles.dropdownItem} onPress={handleLogout}>
                      <Text style={[styles.dropdownItemText, styles.logoutText]}>Logout</Text>
                    </Pressable>
                  </View>
                )}
              </>
            ) : (
              <>
                <Link href="/login" passHref style={{ textDecoration: 'none' }}>
                  <View style={styles.loginButton}>
                    <Text style={styles.loginText}>Login</Text>
                  </View>
                </Link>
                <Link href="/register" passHref style={{ textDecoration: 'none' }}>
                  <View style={styles.registerButton}>
                    <Text style={styles.registerText}>Sign Up</Text>
                  </View>
                </Link>
              </>
            )}
          </View>

          {/* Mobile Menu Button */}
          <Pressable 
            style={[styles.menuButton, isDesktop && { display: 'none' }]} 
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
            display: (isMenuOpen && !isDesktop) ? 'flex' : 'none',
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
    position: 'relative' as 'relative',
    cursor: 'pointer',
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
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
    paddingVertical: 12,
  },
  notificationButton: {
    marginRight: 16,
    position: 'relative',
  },
  bellContainer: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  notificationsDropdown: {
    position: 'absolute',
    top: 60,
    right: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: 300,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    padding: 16,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  profileDropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 12,
    zIndex: 1000,
    minWidth: 200,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333333',
  },
  notificationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999999',
  },
  noNotifications: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 16,
  }
});
