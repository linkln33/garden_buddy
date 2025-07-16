"use client";

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, Pressable, ScrollView, Image } from 'react-native';
import { FaUser, FaCamera, FaPencilAlt, FaLock, FaChevronRight, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface UserProfileProps {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    location: string | null;
    preferOrganicTreatments: boolean;
    notificationsEnabled: boolean;
    weatherAlertsEnabled: boolean;
    communityVotingEnabled: boolean;
  };
  onUpdateProfile: (userData: Partial<UserProfileProps['user']>) => Promise<void>;
  onChangePassword: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

/**
 * UserProfile component for managing user account settings
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onUpdateProfile,
  onChangePassword,
  onLogout,
  onDeleteAccount,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    location: user.location || '',
    preferOrganicTreatments: user.preferOrganicTreatments,
    notificationsEnabled: user.notificationsEnabled,
    weatherAlertsEnabled: user.weatherAlertsEnabled,
    communityVotingEnabled: user.communityVotingEnabled,
  });
  const [error, setError] = useState<string | null>(null);

  // Handle form field changes
  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await onUpdateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || '',
      location: user.location || '',
      preferOrganicTreatments: user.preferOrganicTreatments,
      notificationsEnabled: user.notificationsEnabled,
      weatherAlertsEnabled: user.weatherAlertsEnabled,
      communityVotingEnabled: user.communityVotingEnabled,
    });
    setIsEditing(false);
    setError(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <FaUser size={40} color="#FFFFFF" />
              </View>
            )}
            {isEditing && (
              <Pressable style={styles.editAvatarButton}>
                <FaCamera size={16} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.fullName || 'Garden Buddy User'}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
          
          {!isEditing && (
            <Button
              title="Edit"
              onPress={() => setIsEditing(true)}
              variant="outline"
              size="small"
              icon={<FaPencilAlt size={14} color="#4CAF50" />}
            />
          )}
        </View>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(value) => handleChange('fullName', value)}
                placeholder="Enter your full name"
              />
            ) : (
              <Text style={styles.value}>{user.fullName || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(value) => handleChange('location', value)}
                placeholder="Enter your location"
              />
            ) : (
              <Text style={styles.value}>{user.location || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Prefer Organic Treatments</Text>
              <Text style={styles.switchDescription}>
                Prioritize organic treatment recommendations
              </Text>
            </View>
            <Switch
              value={formData.preferOrganicTreatments}
              onValueChange={(value) =>
                handleChange('preferOrganicTreatments', value)
              }
              trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
              thumbColor={formData.preferOrganicTreatments ? '#4CAF50' : '#FFFFFF'}
              disabled={!isEditing}
            />
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Push Notifications</Text>
              <Text style={styles.switchDescription}>
                Receive important updates and alerts
              </Text>
            </View>
            <Switch
              value={formData.notificationsEnabled}
              onValueChange={(value) =>
                handleChange('notificationsEnabled', value)
              }
              trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
              thumbColor={formData.notificationsEnabled ? '#4CAF50' : '#FFFFFF'}
              disabled={!isEditing}
            />
          </View>
          
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Weather Alerts</Text>
              <Text style={styles.switchDescription}>
                Get notified about spray recommendations
              </Text>
            </View>
            <Switch
              value={formData.weatherAlertsEnabled}
              onValueChange={(value) =>
                handleChange('weatherAlertsEnabled', value)
              }
              trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
              thumbColor={formData.weatherAlertsEnabled ? '#4CAF50' : '#FFFFFF'}
              disabled={!isEditing || !formData.notificationsEnabled}
            />
          </View>
          
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Community Voting</Text>
              <Text style={styles.switchDescription}>
                Get notified about new diagnoses to vote on
              </Text>
            </View>
            <Switch
              value={formData.communityVotingEnabled}
              onValueChange={(value) =>
                handleChange('communityVotingEnabled', value)
              }
              trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
              thumbColor={formData.communityVotingEnabled ? '#4CAF50' : '#FFFFFF'}
              disabled={!isEditing || !formData.notificationsEnabled}
            />
          </View>
        </View>
        
        {isEditing && (
          <View style={styles.editActions}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              size="medium"
            />
            <Button
              title="Save Changes"
              onPress={handleSubmit}
              variant="primary"
              size="medium"
              loading={isSaving}
              disabled={isSaving}
            />
          </View>
        )}
      </Card>
      
      <Card title="Account Actions" style={styles.actionsCard}>
        <Pressable style={styles.actionButton} onPress={onChangePassword}>
          <FaLock size={18} color="#4CAF50" style={styles.actionIcon} />
          <Text style={styles.actionText}>Change Password</Text>
          <FaChevronRight size={14} color="#CCCCCC" />
        </Pressable>
        
        <Pressable style={styles.actionButton} onPress={onLogout}>
          <FaSignOutAlt size={18} color="#FF9800" style={styles.actionIcon} />
          <Text style={styles.actionText}>Log Out</Text>
          <FaChevronRight size={14} color="#CCCCCC" />
        </Pressable>
        
        <Pressable
          style={styles.actionButton}
          onPress={() => setShowDeleteConfirm(true)}
        >
          <FaTrash size={18} color="#F44336" style={styles.actionIcon} />
          <Text style={[styles.actionText, styles.deleteText]}>Delete Account</Text>
          <FaChevronRight size={14} color="#CCCCCC" />
        </Pressable>
      </Card>
      
      {showDeleteConfirm && (
        <Card title="Delete Account" style={styles.deleteConfirmCard}>
          <Text style={styles.deleteConfirmText}>
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
          </Text>
          
          <View style={styles.deleteConfirmActions}>
            <Button
              title="Cancel"
              onPress={() => setShowDeleteConfirm(false)}
              variant="outline"
              size="medium"
            />
            <Button
              title="Delete Account"
              onPress={onDeleteAccount}
              variant="danger"
              size="medium"
            />
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 16,
  },
  formContainer: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  value: {
    fontSize: 16,
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666666',
    maxWidth: '80%',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionsCard: {
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionIcon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  deleteText: {
    color: '#F44336',
  },
  deleteConfirmCard: {
    marginTop: 16,
    backgroundColor: '#FFEBEE',
  },
  deleteConfirmText: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteConfirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default UserProfile;
