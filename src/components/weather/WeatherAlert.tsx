"use client";

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface WeatherAlertProps {
  alertType: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  shouldSpray: boolean;
  bestTimeToSpray?: string;
  recommendedProducts?: string[];
  onDismiss: () => void;
  onViewDetails: () => void;
}

/**
 * WeatherAlert component displays weather-based spray recommendations
 */
export const WeatherAlert: React.FC<WeatherAlertProps> = ({
  alertType,
  description,
  riskLevel,
  shouldSpray,
  bestTimeToSpray,
  recommendedProducts,
  onDismiss,
  onViewDetails,
}) => {
  // Determine alert icon and color based on risk level
  const getAlertIcon = () => {
    switch (riskLevel) {
      case 'high':
        return <FaExclamationTriangle size={24} color="#FFFFFF" />;
      case 'medium':
        return <FaExclamationCircle size={24} color="#FFFFFF" />;
      case 'low':
        return <FaInfoCircle size={24} color="#FFFFFF" />;
      default:
        return <FaInfoCircle size={24} color="#FFFFFF" />;
    }
  };

  const getAlertColor = () => {
    switch (riskLevel) {
      case 'high':
        return '#F44336'; // Red
      case 'medium':
        return '#FFC107'; // Yellow
      case 'low':
        return '#2196F3'; // Blue
      default:
        return '#2196F3';
    }
  };

  const getAlertTitle = () => {
    if (shouldSpray) {
      return `${alertType} Alert: Spraying Recommended`;
    }
    return `${alertType} Alert: No Action Needed`;
  };

  return (
    <Card>
      <View style={styles.alertHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getAlertColor() }]}>
          {getAlertIcon()}
        </View>
        
        <View style={styles.alertTitleContainer}>
          <Text style={styles.alertTitle}>{getAlertTitle()}</Text>
          <Text style={[styles.riskBadge, { color: getAlertColor() }]}>
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
          </Text>
        </View>
        
        <Pressable style={styles.dismissButton} onPress={onDismiss}>
          <FaTimes size={18} color="#666666" />
        </Pressable>
      </View>
      
      <View style={styles.alertContent}>
        <Text style={styles.description}>{description}</Text>
        
        {shouldSpray && bestTimeToSpray && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Best Time to Spray:</Text>
            <Text style={styles.infoText}>{bestTimeToSpray}</Text>
          </View>
        )}
        
        {shouldSpray && recommendedProducts && recommendedProducts.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Recommended Products:</Text>
            {recommendedProducts.map((product, index) => (
              <Text key={index} style={styles.productItem}>• {product}</Text>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.alertFooter}>
        <Button
          title="View Details"
          onPress={onViewDetails}
          variant="outline"
          size="small"
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  riskBadge: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  dismissButton: {
    padding: 8,
  },
  alertContent: {
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
    marginBottom: 12,
  },
  infoSection: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#444444',
  },
  productItem: {
    fontSize: 14,
    color: '#444444',
    marginLeft: 8,
    marginBottom: 2,
  },
  alertFooter: {
    alignItems: 'flex-end',
  },
});

export default WeatherAlert;
