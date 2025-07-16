import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ConfidenceMeterProps {
  score: number; // Score between 0 and 1
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showPercentage?: boolean;
}

/**
 * ConfidenceMeter component displays a visual representation of AI confidence
 * Used to show how confident the AI is in its disease detection
 */
export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  size = 'medium',
  showLabel = true,
  showPercentage = true,
}) => {
  // Ensure score is between 0 and 1
  const normalizedScore = Math.max(0, Math.min(1, score));
  
  // Convert score to percentage
  const percentage = Math.round(normalizedScore * 100);
  
  // Determine color based on confidence level
  const getColor = () => {
    if (percentage >= 80) return '#4CAF50'; // Green for high confidence
    if (percentage >= 60) return '#FFC107'; // Yellow for medium confidence
    return '#F44336'; // Red for low confidence
  };
  
  // Determine label based on confidence level
  const getLabel = () => {
    if (percentage >= 80) return 'High Confidence';
    if (percentage >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };
  
  // Determine size of the meter
  const getMeterSize = () => {
    switch (size) {
      case 'small':
        return { height: 8, width: 120 };
      case 'medium':
        return { height: 12, width: 180 };
      case 'large':
        return { height: 16, width: 240 };
      default:
        return { height: 12, width: 180 };
    }
  };
  
  // Determine font size based on meter size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 14;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { fontSize: getFontSize(), color: getColor() }]}>
          {getLabel()}
        </Text>
      )}
      <View style={[styles.meterContainer, { ...getMeterSize() }]}>
        <View
          style={[
            styles.meterFill,
            {
              width: `${percentage}%`,
              backgroundColor: getColor(),
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={[styles.percentage, { fontSize: getFontSize() }]}>
          {percentage}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  meterContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 999,
  },
  percentage: {
    marginTop: 4,
    fontWeight: '500',
    color: '#333333',
  },
});

export default ConfidenceMeter;
