import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

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
  
  // Determine color based on confidence level
  const getColor = () => {
    if (percentage >= 80) return '#4CAF50'; // Green for high confidence
    if (percentage >= 60) return '#FFC107'; // Yellow for medium confidence
    return '#F44336'; // Red for low confidence
  };

  // Get gradient colors for meter
  const getGradientColors = () => {
    return [
      { color: '#F44336', position: 0 },    // Red (low)
      { color: '#FF9800', position: 0.3 },  // Orange (low-medium)
      { color: '#FFC107', position: 0.6 },  // Yellow (medium)
      { color: '#8BC34A', position: 0.8 },  // Light green (medium-high)
      { color: '#4CAF50', position: 1 }     // Green (high)
    ];
  };
  
  // Determine label based on confidence level
  const getLabel = () => {
    if (percentage >= 80) return 'High Confidence';
    if (percentage >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };
  
  // Define sizes based on prop
  let meterHeight = 10;
  let fontSize = 14;
  let labelSize = 12;
  
  // Make meter width responsive to container width
  let meterWidth = Dimensions.get('window').width - 40; // Full width minus padding
  
  if (size === 'small') {
    meterHeight = 8;
    fontSize = 12;
    labelSize = 10;
  } else if (size === 'large') {
    meterHeight = 12;
    fontSize = 16;
    labelSize = 14;
  }
  const color = getColor();
  const gradientColors = getGradientColors();


  return (
    <View style={styles.container}>
      {/* Confidence Percentage */}
      {showPercentage && (
        <Text style={[styles.percentage, { fontSize, color }]}>
          {percentage}%
        </Text>
      )}
      
      {/* Colorful Meter */}
      <View style={[styles.meterContainer, { width: meterWidth }]}>
        {/* Gradient Background */}
        <View style={[styles.meterBackground, { height: meterHeight }]}>
          <View style={styles.gradientContainer}>
            {gradientColors.map((gc, index) => (
              <View 
                key={index}
                style={[
                  styles.gradientSegment,
                  { 
                    backgroundColor: gc.color,
                    left: gc.position * meterWidth,
                    width: index < gradientColors.length - 1 
                      ? (gradientColors[index+1].position - gc.position) * meterWidth 
                      : 0,
                    height: meterHeight
                  }
                ]}
              />
            ))}
          </View>
        </View>
        
        {/* Tick marks */}
        <View style={styles.tickContainer}>
          {[0, 25, 50, 75, 100].map(tick => (
            <View 
              key={tick} 
              style={[
                styles.tick, 
                { 
                  left: (tick / 100) * meterWidth, 
                  height: meterHeight / 2,
                  top: meterHeight
                }
              ]}
            />
          ))}
        </View>
        
        {/* Needle */}
        <View 
          style={[
            styles.needle, 
            { 
              left: (percentage / 100) * meterWidth, 
              height: meterHeight * 2,
              top: -meterHeight / 2
            }
          ]}
        >
          <View style={[styles.needleHead, { backgroundColor: color }]} />
        </View>
      </View>
      
      {/* Label */}
      {showLabel && (
        <Text style={[styles.label, { fontSize: labelSize, color }]}>
          {getLabel()}
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
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientContainer: {
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gradientSegment: {
    position: 'absolute',
    height: '100%',
  },
  tickContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  tick: {
    position: 'absolute',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  needle: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#333',
    transform: [{ translateX: -1 }],
  },
  needleHead: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 0,
    left: -3,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default ConfidenceMeter;
