import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBrowserClient } from '@supabase/ssr';
import { AntDesign } from '@expo/vector-icons';

interface VotingSystemProps {
  diagnosisId: string;
  initialConfidence: number;
  onConfidenceUpdate: (newConfidence: number) => void;
}

export const VotingSystem: React.FC<VotingSystemProps> = ({
  diagnosisId,
  initialConfidence,
  onConfidenceUpdate
}) => {
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Fetch existing votes when component mounts
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        // Count all votes for this diagnosis
        const { data: votesData, error: votesError } = await supabase
          .from('community_votes')
          .select('id, voted_disease')
          .eq('diagnosis_id', diagnosisId);
          
        if (votesError) {
          console.error('Error fetching votes:', votesError);
          return;
        }
        
        // For now, we'll consider any vote as an upvote since the schema doesn't have vote_value
        // In a real app, we'd need to modify the schema to include vote direction
        const upCount = votesData?.length || 0;
        const downCount = 0; // No downvotes in current schema
        
        setUpvotes(upCount);
        setDownvotes(downCount);
        
        // Calculate and update confidence score based on votes
        updateConfidenceScore(upCount, downCount);
        
        // Check if current user has voted
        const { data: userSession } = await supabase.auth.getSession();
        if (userSession?.session?.user) {
          const { data: userVoteData } = await supabase
            .from('community_votes')
            .select('id, voted_disease')
            .eq('diagnosis_id', diagnosisId)
            .eq('user_id', userSession.session.user.id)
            .maybeSingle();
            
          if (userVoteData) {
            // If the user has voted, consider it an upvote for now
            setUserVote('up');
          }
        }
      } catch (error) {
        console.error('Error in fetchVotes:', error);
      }
    };
    
    fetchVotes();
  }, [diagnosisId]);
  
  // Calculate new confidence score based on votes
  const updateConfidenceScore = (up: number, down: number) => {
    const totalVotes = up + down;
    if (totalVotes === 0) return;
    
    // Base confidence from AI
    let baseConfidence = initialConfidence;
    
    // Calculate vote ratio (between -1 and 1)
    const voteRatio = totalVotes > 0 ? (up - down) / totalVotes : 0;
    
    // Calculate vote weight (more votes = more weight, max 0.3)
    const voteWeight = Math.min(0.3, totalVotes / 20);
    
    // Adjust confidence based on votes
    // Positive votes increase confidence, negative votes decrease it
    let newConfidence = baseConfidence + (voteRatio * voteWeight);
    
    // Ensure confidence stays between 0.1 and 0.95
    newConfidence = Math.min(Math.max(newConfidence, 0.1), 0.95);
    
    // Update parent component
    onConfidenceUpdate(newConfidence);
  };
  
  const handleVote = async (isUpvote: boolean) => {
    // For now, we only support upvotes based on the current schema
    if (!isUpvote) {
      console.log('Downvoting not supported in current schema');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get user session
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user) {
        console.error('User must be logged in to vote');
        return;
      }
      
      const userId = userSession.session.user.id;
      
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('community_votes')
        .select('*')
        .eq('diagnosis_id', diagnosisId)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing vote:', checkError);
        return;
      }
      
      // If user has already voted
      if (existingVote) {
        // User is clicking the same vote again (unvote)
        await supabase
          .from('community_votes')
          .delete()
          .eq('id', existingVote.id);
        
        // Update local state
        setUpvotes(prev => prev - 1);
        setUserVote(null);
      } else {
        // New vote - get the disease name from the diagnosis
        const { data: diagnosisData, error: diagnosisError } = await supabase
          .from('diagnoses')
          .select('disease_name')
          .eq('id', diagnosisId)
          .single();
          
        if (diagnosisError || !diagnosisData) {
          console.error('Could not find diagnosis:', diagnosisError);
          return;
        }
        
        // New vote
        const { error: insertError } = await supabase
          .from('community_votes')
          .insert({
            diagnosis_id: diagnosisId,
            user_id: userId,
            voted_disease: diagnosisData.disease_name // Use the disease name from the diagnosis
          });
          
        if (insertError) {
          console.error('Error inserting vote:', insertError);
          return;
        }
        
        // Update local state
        setUpvotes(prev => prev + 1);
        setUserVote('up');
      }
      
      // Update confidence score based on new vote counts
      const newUpvotes = isUpvote ? upvotes + 1 : upvotes - (userVote === 'up' ? 1 : 0);
      const newDownvotes = !isUpvote ? downvotes + 1 : downvotes - (userVote === 'down' ? 1 : 0);
      updateConfidenceScore(newUpvotes, newDownvotes);
      
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Vote text in center */}
      <Text style={styles.voteText}>Vote on result</Text>
      
      <View style={styles.votingContainer}>
        {/* Downvote button on the left side (red minus) */}
        <TouchableOpacity 
          style={[styles.voteButton, styles.downvoteButton, userVote === 'down' && styles.selectedDownvote]}
          onPress={() => handleVote(false)}
          disabled={isLoading}
        >
          <Text style={[styles.voteSymbol, {color: userVote === 'down' ? '#FFFFFF' : '#F44336'}]}>−</Text>
        </TouchableOpacity>
        
        {/* Upvote button on the right (green plus) */}
        <TouchableOpacity 
          style={[styles.voteButton, styles.upvoteButton, userVote === 'up' && styles.selectedUpvote]}
          onPress={() => handleVote(true)}
          disabled={isLoading}
        >
          <Text style={[styles.voteSymbol, {color: userVote === 'up' ? '#FFFFFF' : '#4CAF50'}]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 5,
    width: '100%',
    alignItems: 'center',
  },
  votingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 100,
  },
  voteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  upvoteButton: {
    borderColor: '#4CAF50',
  },
  downvoteButton: {
    borderColor: '#F44336',
  },
  selectedUpvote: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  selectedDownvote: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  voteSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  voteText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  selectedVoteText: {
    color: '#FFFFFF',
  },
});

export default VotingSystem;
