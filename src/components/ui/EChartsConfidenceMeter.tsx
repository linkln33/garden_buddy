import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Conditionally import ECharts only for web
let ReactECharts: any = null;
if (Platform.OS === 'web') {
  try {
    ReactECharts = require('echarts-for-react').default;
  } catch (error) {
    console.warn('ECharts not available:', error);
  }
}

interface EChartsConfidenceMeterProps {
  score: number; // Score between 0 and 1
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
}

/**
 * EChartsConfidenceMeter component displays a beautiful gauge chart for AI confidence
 * Uses ECharts for rich visualizations with animations and gradients
 */
export const EChartsConfidenceMeter: React.FC<EChartsConfidenceMeterProps> = ({
  score,
  size = 'medium',
  showLabel = true,
  showPercentage = true,
  animated = true,
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
  
  // Determine size of the chart
  const getChartSize = () => {
    switch (size) {
      case 'small':
        return { height: 120, width: 120 };
      case 'medium':
        return { height: 160, width: 160 };
      case 'large':
        return { height: 200, width: 200 };
      default:
        return { height: 160, width: 160 };
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

  // ECharts gauge configuration
  const getOption = () => ({
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '75%'],
        radius: '90%',
        min: 0,
        max: 100,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.3, '#F44336'],
              [0.7, '#FFC107'],
              [1, '#4CAF50']
            ]
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 20,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 2
          }
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: 'auto',
            width: 5
          }
        },
        axisLabel: {
          color: '#464646',
          fontSize: 12,
          distance: -60,
          rotate: 'tangential',
          formatter: function (value: number) {
            if (value === 0) return '0%';
            if (value === 50) return '50%';
            if (value === 100) return '100%';
            return '';
          }
        },
        title: {
          offsetCenter: [0, '-10%'],
          fontSize: getFontSize(),
          color: '#333'
        },
        detail: {
          fontSize: getFontSize() + 4,
          offsetCenter: [0, '-35%'],
          valueAnimation: animated,
          formatter: function (value: number) {
            return Math.round(value) + '%';
          },
          color: 'auto'
        },
        data: [
          {
            value: percentage,
            name: showLabel ? getLabel() : ''
          }
        ]
      }
    ],
    animation: animated,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  });

  const chartSize = getChartSize();

  // For web platforms, use ECharts if available
  if (Platform.OS === 'web' && ReactECharts) {
    return (
      <View style={styles.container}>
        <ReactECharts
          option={getOption()}
          style={{
            height: chartSize.height,
            width: chartSize.width,
          }}
          opts={{ renderer: 'svg' }}
        />
        {showPercentage && (
          <Text style={[styles.additionalInfo, { fontSize: getFontSize() - 2 }]}>
            AI Confidence Score
          </Text>
        )}
      </View>
    );
  }

  // Fallback for mobile platforms - use simple progress bar
  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { fontSize: getFontSize(), color: getColor() }]}>
          {getLabel()}
        </Text>
      )}
      <View style={[styles.meterContainer, { width: chartSize.width * 0.8, height: 12 }]}>
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
      <Text style={[styles.additionalInfo, { fontSize: getFontSize() - 2 }]}>
        AI Confidence Score
      </Text>
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
    marginVertical: 8,
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
  additionalInfo: {
    marginTop: 4,
    color: '#666666',
    fontStyle: 'italic',
  },
});

export default EChartsConfidenceMeter;
