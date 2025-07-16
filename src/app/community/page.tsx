"use client";

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { createBrowserClient } from '@supabase/ssr';
import VotingCard from '../../components/community/VotingCard';
import Card from '../../components/ui/Card';
import type { Database } from '../../lib/supabase/types';

/**
 * Community page for viewing and voting on low-confidence diagnoses
 */
export default function CommunityPage() {
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const supabase = createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  // Fetch low-confidence diagnoses from database
  useEffect(() => {
    async function fetchDiagnoses() {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setError('You must be logged in to view community diagnoses');
          setLoading(false);
          return;
        }
        
        // Fetch diagnoses with confidence score < 80%
        const { data: diagnosesData, error: diagnosesError } = await supabase
          .from('diagnoses')
          .select(`
            id,
            plant_type,
            disease_name,
            confidence_score,
            description,
            image_url,
            created_at,
            status,
            community_votes:community_votes(
              id,
              diagnosis_id,
              vote_option,
              created_at
            )
          `)
          .eq('status', 'pending')
          .lt('confidence_score', 80)
          .order('created_at', { ascending: false });
        
        if (diagnosesError) {
          throw diagnosesError;
        }
        
        // Fetch user's votes
        const { data: userVotesData, error: userVotesError } = await supabase
          .from('community_votes')
          .select('diagnosis_id, vote_option')
          .eq('user_id', session.user.id);
        
        if (userVotesError) {
          throw userVotesError;
        }
        
        // Create a map of diagnosis_id to vote_option
        const votesMap: Record<string, string> = {};
        userVotesData.forEach((vote) => {
          votesMap[vote.diagnosis_id] = vote.vote_option;
        });
        
        setUserVotes(votesMap);
        setDiagnoses(diagnosesData || []);
      } catch (err) {
        console.error('Error fetching community diagnoses:', err);
        setError('Failed to load community diagnoses');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDiagnoses();
  }, []);

  // Handle voting on a diagnosis
  const handleVote = async (diagnosisId: string, voteOption: string) => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setError('You must be logged in to vote');
        return;
      }
      
      // Check if user has already voted on this diagnosis
      const existingVote = userVotes[diagnosisId];
      
      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('community_votes')
          .update({ vote_option: voteOption })
          .eq('diagnosis_id', diagnosisId)
          .eq('user_id', session.user.id);
        
        if (error) {
          throw error;
        }
      } else {
        // Insert new vote
        const { error } = await supabase
          .from('community_votes')
          .insert({
            diagnosis_id: diagnosisId,
            user_id: session.user.id,
            vote_option: voteOption,
          });
        
        if (error) {
          throw error;
        }
      }
      
      // Update local state
      setUserVotes((prev) => ({
        ...prev,
        [diagnosisId]: voteOption,
      }));
      
      // Update the diagnoses list with the new vote
      setDiagnoses((prev) =>
        prev.map((diagnosis) => {
          if (diagnosis.id === diagnosisId) {
            // Create a new array of community votes
            const updatedVotes = [...diagnosis.community_votes];
            
            // Find if the user already has a vote
            const existingVoteIndex = updatedVotes.findIndex(
              (vote) => vote.user_id === session.user.id
            );
            
            if (existingVoteIndex >= 0) {
              // Update existing vote
              updatedVotes[existingVoteIndex] = {
                ...updatedVotes[existingVoteIndex],
                vote_option: voteOption,
              };
            } else {
              // Add new vote
              updatedVotes.push({
                id: `temp-${Date.now()}`,
                diagnosis_id: diagnosisId,
                user_id: session.user.id,
                vote_option: voteOption,
                created_at: new Date().toISOString(),
              });
            }
            
            return {
              ...diagnosis,
              community_votes: updatedVotes,
            };
          }
          return diagnosis;
        })
      );
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError('Failed to submit your vote. Please try again.');
    }
  };

  // Calculate vote counts for a diagnosis
  const calculateVoteCounts = (votes: any[]) => {
    const counts: Record<string, number> = {};
    
    votes.forEach((vote) => {
      const option = vote.vote_option;
      counts[option] = (counts[option] || 0) + 1;
    });
    
    return counts;
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.emptyText}>Loading community diagnoses...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <Card>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </Card>
      );
    }
    
    return (
      <Card>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No diagnoses need voting</Text>
          <Text style={styles.emptyText}>
            When the AI is unsure about a plant diagnosis, it will appear here for community input.
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Voting</Text>
        <Text style={styles.subtitle}>
          Help improve diagnoses by voting on cases where the AI is uncertain
        </Text>
      </View>

      {diagnoses.length > 0 ? (
        <FlatList
          data={diagnoses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VotingCard
              imageUrl={item.image_url}
              plantType={item.plant_type}
              aiDiagnosis={item.disease_name}
              confidenceScore={item.confidence_score}
              createdAt={item.created_at}
              voteCounts={calculateVoteCounts(item.community_votes)}
              userVote={userVotes[item.id]}
              onVote={(option) => handleVote(item.id, option)}
              voteOptions={[
                item.disease_name,
                'Healthy Plant',
                'Different Disease',
                'Not Sure',
              ]}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
});
