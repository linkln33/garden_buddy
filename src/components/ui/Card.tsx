import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  elevation?: number;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
  style?: any; // Allow custom styles to be passed to the card
}

/**
 * Card component for displaying content in a contained, styled container
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  elevation = 2,
  footer,
  headerRight,
  style,
}) => {
  const CardContainer = onPress ? Pressable : View;

  return (
    <CardContainer
      style={[
        styles.card,
        {
          elevation,
          shadowOpacity: elevation * 0.05,
        },
        style, // Apply custom styles passed from parent
      ]}
      onPress={onPress}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});

export default Card;
