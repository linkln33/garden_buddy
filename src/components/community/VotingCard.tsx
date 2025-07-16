import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ConfidenceMeter from '../ui/ConfidenceMeter';

interface VotingOption {
  id: string;
  diseaseName: string;
  votes: number;
}

interface VotingCardProps {
  id?: string;
  imageUrl: string;
  plantType: string;
  aiDiagnosis: string;
  confidenceScore: number;
  options?: VotingOption[];
  onVote: (option: string) => Promise<void>;
  userVote?: string; // ID of the option the user has already voted for, if any
  createdAt: string;
  userAvatar?: string;
  userName?: string;
  voteCounts?: Record<string, number>;
  voteOptions?: any[];
}

/**
 * VotingCard component for community voting on plant disease diagnoses
 * Used in the community feed for diagnoses with low AI confidence
 */
export const VotingCard: React.FC<VotingCardProps> = ({
  id,
  imageUrl,
  plantType,
  aiDiagnosis,
  confidenceScore,
  options,
  onVote,
  userVote,
  createdAt,
  userAvatar,
  userName,
  voteCounts,
  voteOptions,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(userVote);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total votes
  const totalVotes = options ? options.reduce((sum, option) => sum + option.votes, 0) : 
    voteCounts ? Object.values(voteCounts).reduce((sum, count) => sum + count, 0) : 0;

  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Handle vote submission
  const handleVote = async () => {
    if (!selectedOption) return;
    
    setIsVoting(true);
    setError(null);
    
    try {
      await onVote(selectedOption);
    } catch (err) {
      setError('Failed to submit vote. Please try again.');
      console.error('Voting error:', err);
    } finally {
      setIsVoting(false);
    }
  };

  // Calculate percentage for a given option
  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <Card
      title={`Help identify: ${plantType}`}
      subtitle={`Posted on ${formattedDate}`}
      headerRight={
        userName && (
          <View style={styles.userInfo}>
            {userAvatar && (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            )}
            <Text style={styles.userName}>{userName}</Text>
          </View>
        )
      }
    >
      <View style={styles.content}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        
        <View style={styles.diagnosisContainer}>
          <Text style={styles.diagnosisLabel}>AI Diagnosis:</Text>
          <Text style={styles.diagnosisText}>{aiDiagnosis}</Text>
          <ConfidenceMeter score={confidenceScore} size="small" />
          <Text style={styles.helpText}>
            This diagnosis has low confidence. Help the community by voting!
          </Text>
        </View>
        
        <View style={styles.votingSection}>
          <Text style={styles.votingTitle}>What do you think this is?</Text>
          
          {options && options.map((option) => (
            <Pressable
              key={option.id}
              style={[
                styles.optionContainer,
                selectedOption === option.id && styles.selectedOption,
              ]}
              onPress={() => setSelectedOption(option.id)}
              disabled={!!userVote}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionName}>{option.diseaseName}</Text>
                <Text style={styles.voteCount}>{option.votes} votes</Text>
              </View>
              
              <View style={styles.percentageBar}>
                <View
                  style={[
                    styles.percentageFill,
                    { width: `${getPercentage(option.votes)}%` },
                  ]}
                />
                <Text style={styles.percentageText}>
                  {getPercentage(option.votes)}%
                </Text>
              </View>
            </Pressable>
          ))}
          
          {voteOptions && voteOptions.map((option) => (
            <Pressable
              key={option}
              style={[
                styles.optionContainer,
                selectedOption === option && styles.selectedOption,
              ]}
              onPress={() => setSelectedOption(option)}
              disabled={!!userVote}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionName}>{option}</Text>
                <Text style={styles.voteCount}>{voteCounts && voteCounts[option] || 0} votes</Text>
              </View>
              
              <View style={styles.percentageBar}>
                <View
                  style={[
                    styles.percentageFill,
                    { width: voteCounts ? `${getPercentage(voteCounts[option])}%` : '0%' },
                  ]}
                />
                <Text style={styles.percentageText}>
                  {voteCounts ? getPercentage(voteCounts[option]) : 0}%
                </Text>
              </View>
            </Pressable>
          ))}
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          {!userVote && (
            <Button
              title="Submit Vote"
              onPress={handleVote}
              disabled={!selectedOption || isVoting}
              loading={isVoting}
              fullWidth
              variant="primary"
              size="medium"
            />
          )}
          
          {userVote && (
            <Text style={styles.votedText}>
              Thanks for your vote! The community will help determine the correct diagnosis.
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  diagnosisContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  diagnosisLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  diagnosisText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginVertical: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  votingSection: {
    gap: 12,
  },
  votingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  optionContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
  },
  voteCount: {
    fontSize: 13,
    color: '#666666',
  },
  percentageBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  percentageFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  percentageText: {
    position: 'absolute',
    right: 0,
    top: -18,
    fontSize: 12,
    color: '#666666',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 8,
  },
  votedText: {
    color: '#4CAF50',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    color: '#666666',
  },
});

export default VotingCard;
