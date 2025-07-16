import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ConfidenceMeterProps {
  score: number; // Score between 0 and 1
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showPercentage?: boolean;
}

/**
 * Beautiful, colorful confidence meter for plant disease diagnosis
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
  
  // Determine color based on confidence level - divided into 4 parts
  const getColor = () => {
    if (percentage >= 75) return '#4CAF50'; // Green for high confidence (75-100%)
    if (percentage >= 50) return '#CDDC39'; // Lime for medium-high confidence (50-75%)
    if (percentage >= 25) return '#FF9800'; // Orange for medium-low confidence (25-50%)
    return '#F44336'; // Red for low confidence (0-25%)
  };

  // Define the colors for the meter sections
  const meterColors = {
    low: '#F44336',      // Red (0-25%)
    mediumLow: '#FF9800', // Orange (25-50%)
    mediumHigh: '#CDDC39', // Lime yellow green (50-75%)
    high: '#4CAF50'      // Green (75-100%)
  };
  
  // Determine label based on confidence level - divided into 4 parts
  const getLabel = () => {
    if (percentage >= 75) return 'High Confidence';
    if (percentage >= 50) return 'Medium Confidence';
    if (percentage >= 25) return 'Low Confidence';
    return 'Very Low Confidence';
  };
  
  // Define sizes based on prop - match the width of the image container
  let meterHeight = 15;
  let fontSize = 16;
  let labelSize = 14;
  
  // Use fixed numeric width for calculations
  let meterWidth = 300; // Default medium size
  
  if (size === 'small') {
    meterHeight = 12;
    fontSize = 14;
    labelSize = 12;
    meterWidth = 240;
  } else if (size === 'medium') {
    meterHeight = 15;
    fontSize = 16;
    labelSize = 14;
    meterWidth = 300;
  } else if (size === 'large') {
    meterHeight = 20;
    fontSize = 18;
    labelSize = 16;
    meterWidth = 400;
  }
  const color = getColor();

  // We no longer need the renderTicks function as we've removed the ticks for a cleaner design
  

  return (
    <View style={styles.container}>
      {/* Confidence Percentage */}
      {showPercentage && (
        <Text style={[styles.percentage, { fontSize, color }]}>
          {percentage}%
        </Text>
      )}
      
      {/* Colorful Meter */}
      <View style={[styles.meterContainer, { width: '100%' }]}>
        {/* Meter with 4 distinct color sections */}
        <View style={[styles.meterBackground, { width: '100%', height: meterHeight }]}>
          {/* Red section (0-25%) */}
          <View style={[styles.meterSection, { width: '25%', backgroundColor: '#F44336' }]} />
          {/* Orange section (25-50%) */}
          <View style={[styles.meterSection, { width: '25%', backgroundColor: '#FF9800' }]} />
          {/* Lime yellow green section (50-75%) */}
          <View style={[styles.meterSection, { width: '25%', backgroundColor: '#CDDC39' }]} />
          {/* Green section (75-100%) */}
          <View style={[styles.meterSection, { width: '25%', backgroundColor: '#4CAF50' }]} />
        </View>
        
        {/* Single Needle */}
        {/* Needle indicator - positioned using absolute positioning */}
        <View 
          style={[styles.needleContainer, { left: `${percentage}%` }]}
        >
          <View 
            style={[
              styles.needleLine,
              { height: meterHeight }
            ]}
          />
          <View style={styles.needleHead} />
        </View>
      </View>
      
      {/* Label */}
      {showLabel && (
        <Text style={[styles.label, { fontSize: fontSize, color }]}>
          {percentage >= 75 ? 'High Confidence' : 
           percentage >= 50 ? 'Medium Confidence' : 
           percentage >= 25 ? 'Low Confidence' : 'Very Low Confidence'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },
  percentage: {
    fontWeight: '700',
    marginBottom: 5,
    textAlign: 'center',
  },
  meterContainer: {
    position: 'relative',
    marginTop: 5,
    marginBottom: 15,
    width: '100%',
  },
  meterBackground: {
    height: 20,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  meterSection: {
    height: '100%',
    minWidth: 30,
  },
  // Needle styles
  needleContainer: {
    position: 'absolute',
    top: 0,
    height: '100%',
    transform: [{ translateX: -1 }],
    zIndex: 10,
    alignItems: 'center',
  },
  needleLine: {
    width: 2,
    backgroundColor: '#333',
  },
  needleHead: {
    position: 'absolute',
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#fff',
    transform: [{ translateX: -5 }],
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default ConfidenceMeter;
