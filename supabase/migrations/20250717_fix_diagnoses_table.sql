-- Fix diagnoses table to ensure it has the correct columns
-- This migration checks if confidence column exists and renames it to confidence_score if needed
-- It also adds confidence_score if neither column exists

DO $$
BEGIN
    -- Check if confidence column exists but confidence_score doesn't
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'diagnoses' 
        AND column_name = 'confidence'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'diagnoses' 
        AND column_name = 'confidence_score'
    ) THEN
        -- Rename confidence to confidence_score
        ALTER TABLE public.diagnoses RENAME COLUMN confidence TO confidence_score;
        RAISE NOTICE 'Renamed confidence column to confidence_score';
    
    -- Check if confidence_score column doesn't exist (and neither does confidence)
    ELSIF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'diagnoses' 
        AND column_name = 'confidence_score'
    ) THEN
        -- Add confidence_score column
        ALTER TABLE public.diagnoses ADD COLUMN confidence_score FLOAT;
        RAISE NOTICE 'Added missing confidence_score column';
    END IF;
END $$;
