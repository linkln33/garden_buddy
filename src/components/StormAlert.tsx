import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { FaExclamationTriangle } from 'react-icons/fa';

interface StormAlertProps {
  alert?: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    start?: number;
    end?: number;
  };
  // Direct props for simplified usage
  id?: string;
  title?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
  additionalInfo?: Array<{label: string; value: string}>;
  onDismiss: () => void;
}

export default function StormAlert({ alert, id, title, description, severity, additionalInfo, onDismiss }: StormAlertProps) {
  // Use either direct props or alert object props
  const alertTitle = title || (alert?.title || '');
  const alertDescription = description || (alert?.description || '');
  const alertSeverity = severity || (alert?.severity || 'medium');
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#d32f2f'; // Red
      case 'medium':
        return '#f57c00'; // Orange
      case 'low':
        return '#388e3c'; // Green
      default:
        return '#2196f3'; // Blue
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Card 
      style={[styles.alertCard, { borderLeftColor: getSeverityColor(alertSeverity) }]}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertTitleContainer}>
          <FaExclamationTriangle color={getSeverityColor(alertSeverity)} size={20} />
          <Text style={styles.alertTitle}>{alertTitle}</Text>
        </View>
        <Button onPress={onDismiss} compact>Dismiss</Button>
      </View>
      <Text style={styles.alertDescription}>{alertDescription}</Text>
      {alert?.start && alert?.end && (
        <Text style={styles.alertTime}>
          {formatDate(alert.start)} - {formatDate(alert.end)}
        </Text>
      )}
      
      {/* Display additional info if provided */}
      {additionalInfo && additionalInfo.length > 0 && (
        <View style={styles.additionalInfo}>
          {additionalInfo.map((info, index) => (
            <Text key={index} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{info.label}:</Text> {info.value}
            </Text>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  alertCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    overflow: 'hidden',
    padding: 12
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between'
  },
  alertTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  alertTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
    flex: 1
  },
  alertDescription: {
    marginBottom: 8
  },
  alertTime: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8
  },
  dismissButton: {
    marginLeft: 'auto'
  },
  additionalInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  infoItem: {
    marginBottom: 4,
    fontSize: 14
  },
  infoLabel: {
    fontWeight: 'bold'
  }
});
