"use client";

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useIsDesktop } from '../../utils/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * A container component that provides responsive max-width for desktop layouts
 */
export default function ResponsiveContainer({ children, style }: ResponsiveContainerProps) {
  const isDesktop = useIsDesktop();
  
  return (
    <View 
      style={[
        styles.container,
        isDesktop && styles.desktopContainer,
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  desktopContainer: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
  }
});
