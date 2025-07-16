import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { EChartsConfidenceMeter } from '@/components/ui/EChartsConfidenceMeter';
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter';

/**
 * Test page for confidence meter components
 */
export default function TestConfidencePage() {
  const [score, setScore] = React.useState(0.75);
  
  const increaseScore = () => {
    setScore(prev => Math.min(1, prev + 0.1));
  };
  
  const decreaseScore = () => {
    setScore(prev => Math.max(0, prev - 0.1));
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confidence Meter Test Page</Text>
      
      <View style={styles.controlsContainer}>
        <Pressable style={styles.button} onPress={decreaseScore}>
          <Text style={styles.buttonText}>- Decrease</Text>
        </Pressable>
        <Text style={styles.scoreText}>{(score * 100).toFixed(0)}%</Text>
        <Pressable style={styles.button} onPress={increaseScore}>
          <Text style={styles.buttonText}>+ Increase</Text>
        </Pressable>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ECharts Confidence Meter</Text>
        <View style={styles.meterContainer}>
          <EChartsConfidenceMeter 
            score={score} 
            size="medium" 
            animated={true} 
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Original Confidence Meter</Text>
        <View style={styles.meterContainer}>
          <ConfidenceMeter 
            score={score} 
            size="medium" 
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Information</Text>
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Raw Score: {score}</Text>
          <Text style={styles.debugText}>Percentage: {(score * 100).toFixed(0)}%</Text>
          <Text style={styles.debugText}>Confidence Level: {
            score >= 0.8 ? 'High' : score >= 0.6 ? 'Medium' : 'Low'
          }</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    maxWidth: 800,
    marginHorizontal: 'auto',
    marginVertical: 40
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20
  },
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  meterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10
  },
  debugContainer: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5
  },
  debugText: {
    fontFamily: 'monospace',
    marginBottom: 5
  }
});
