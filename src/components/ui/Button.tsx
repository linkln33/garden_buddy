import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

export interface ButtonProps {
  onPress: () => void;
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Button component with various styles and states
 */
export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  // Determine background color based on variant
  const getBackgroundColor = () => {
    if (disabled) return '#CCCCCC';
    
    switch (variant) {
      case 'primary':
        return '#4CAF50'; // Green
      case 'secondary':
        return '#2196F3'; // Blue
      case 'outline':
      case 'text':
        return 'transparent';
      case 'danger':
        return '#F44336'; // Red
      default:
        return '#4CAF50';
    }
  };

  // Determine text color based on variant
  const getTextColor = () => {
    if (disabled) return '#666666';
    
    switch (variant) {
      case 'outline':
      case 'text':
        return '#4CAF50';
      default:
        return '#FFFFFF';
    }
  };

  // Determine padding based on size
  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'medium':
        return { paddingVertical: 12, paddingHorizontal: 24 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  // Determine font size based on size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  // Determine border style for outline variant
  const getBorderStyle = () => {
    return variant === 'outline' ? { borderWidth: 2, borderColor: '#4CAF50' } : {};
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          opacity: pressed ? 0.8 : 1,
          width: fullWidth ? '100%' : 'auto',
          ...getPadding(),
          ...getBorderStyle(),
        },
        style, // Apply custom style prop
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <React.Fragment>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          {title && (
            <Text
              style={[
                styles.text,
                {
                  color: getTextColor(),
                  fontSize: getFontSize(),
                  marginLeft: icon ? 8 : 0,
                },
              ]}
            >
              {title}
            </Text>
          )}
        </React.Fragment>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
});

export default Button;
