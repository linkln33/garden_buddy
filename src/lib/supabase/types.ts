export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          last_login: string | null
          location: Json | null
          preferred_crops: string[] | null
          notification_preferences: Json | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          last_login?: string | null
          location?: Json | null
          preferred_crops?: string[] | null
          notification_preferences?: Json | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          last_login?: string | null
          location?: Json | null
          preferred_crops?: string[] | null
          notification_preferences?: Json | null
        }
      }
      diagnoses: {
        Row: {
          id: string
          user_id: string
          image_url: string
          plant_type: string
          disease_name: string
          confidence_score: number
          ai_diagnosis: Json
          community_diagnosis: string | null
          created_at: string
          status: 'pending' | 'confirmed' | 'disputed'
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          plant_type: string
          disease_name: string
          confidence_score: number
          ai_diagnosis: Json
          community_diagnosis?: string | null
          created_at?: string
          status?: 'pending' | 'confirmed' | 'disputed'
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          plant_type?: string
          disease_name?: string
          confidence_score?: number
          ai_diagnosis?: Json
          community_diagnosis?: string | null
          created_at?: string
          status?: 'pending' | 'confirmed' | 'disputed'
        }
      }
      cached_diagnoses: {
        Row: {
          id: string
          diagnosis: Json
          image_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          diagnosis: Json
          image_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          diagnosis?: Json
          image_hash?: string
          created_at?: string
        }
      }
      treatments: {
        Row: {
          id: string
          diagnosis_id: string
          treatment_type: 'organic' | 'chemical'
          description: string
          application_date: string | null
          effectiveness_rating: number | null
        }
        Insert: {
          id?: string
          diagnosis_id: string
          treatment_type: 'organic' | 'chemical'
          description: string
          application_date?: string | null
          effectiveness_rating?: number | null
        }
        Update: {
          id?: string
          diagnosis_id?: string
          treatment_type?: 'organic' | 'chemical'
          description?: string
          application_date?: string | null
          effectiveness_rating?: number | null
        }
      }
      community_votes: {
        Row: {
          id: string
          diagnosis_id: string
          user_id: string
          voted_disease: string
          created_at: string
        }
        Insert: {
          id?: string
          diagnosis_id: string
          user_id: string
          voted_disease: string
          created_at?: string
        }
        Update: {
          id?: string
          diagnosis_id?: string
          user_id?: string
          voted_disease?: string
          created_at?: string
        }
      }
      weather_alerts: {
        Row: {
          id: string
          user_id: string
          alert_type: string
          description: string
          created_at: string
          expires_at: string
          status: 'active' | 'expired' | 'dismissed'
        }
        Insert: {
          id?: string
          user_id: string
          alert_type: string
          description: string
          created_at?: string
          expires_at: string
          status?: 'active' | 'expired' | 'dismissed'
        }
        Update: {
          id?: string
          user_id?: string
          alert_type?: string
          description?: string
          created_at?: string
          expires_at?: string
          status?: 'active' | 'expired' | 'dismissed'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for more convenient access
export type User = Database['public']['Tables']['users']['Row']
export type Diagnosis = Database['public']['Tables']['diagnoses']['Row']
export type Treatment = Database['public']['Tables']['treatments']['Row']
export type CommunityVote = Database['public']['Tables']['community_votes']['Row']
export type WeatherAlert = Database['public']['Tables']['weather_alerts']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type DiagnosisInsert = Database['public']['Tables']['diagnoses']['Insert']
export type TreatmentInsert = Database['public']['Tables']['treatments']['Insert']
export type CommunityVoteInsert = Database['public']['Tables']['community_votes']['Insert']
export type WeatherAlertInsert = Database['public']['Tables']['weather_alerts']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type DiagnosisUpdate = Database['public']['Tables']['diagnoses']['Update']
export type TreatmentUpdate = Database['public']['Tables']['treatments']['Update']
export type CommunityVoteUpdate = Database['public']['Tables']['community_votes']['Update']
export type WeatherAlertUpdate = Database['public']['Tables']['weather_alerts']['Update']
