# Garden Buddy: Dashboard & Feature Implementation

## Overview

Garden Buddy is a comprehensive plant disease detection and management application that helps gardeners identify and treat plant diseases. This document outlines the current implementation, planned dashboard features, and upcoming enhancements.

## Current Implementation

### Core Features 

1. **Plant Disease Detection System**
   - **Multiple AI Provider Options:**
     - **Plant Database (Free)**: Uses keyword matching against a comprehensive disease database of 6 common plant diseases
     - **Claude AI (Free Vision)**: Uses Anthropic's Claude model for image analysis
     - **OpenAI GPT-4 Vision (Paid)**: Most accurate but requires a paid API key
   - **Smart Diagnosis System:**
     - Analyzes images for visual keywords
     - Matches against plant disease database
     - Calculates confidence scores based on plant type and symptoms
     - Provides detailed treatment recommendations
   - **Enhanced Confidence Meter:**
     - Visual meter with 4 color sections (red, orange, lime, green)
     - Single pointer design for clarity
     - Width matches image container for consistent UI
     - No rounded corners for cleaner appearance

2. **Community Feed**
   - Located at `/community` route
   - Shows diagnoses with confidence scores below 80%
   - Users can upvote or downvote diagnoses to help improve accuracy
   - Votes are stored in the `community_votes` table with the `voted_disease` field
   - RLS policies ensure users can only vote once per diagnosis

3. **Responsive Design**
   - Implemented desktop responsiveness
   - Uses a custom `useIsDesktop` hook to detect screen size
   - `ResponsiveContainer` component constrains content width on desktop
   - Different layouts for mobile and desktop (horizontal nav bar on desktop, hamburger menu on mobile)

### Database Structure

1. **Tables**
   - `users`: Core user data
   - `profiles`: User profile information (expertise level, avatar, bio)
   - `diagnoses`: Plant disease diagnoses with AI results
   - `treatments`: Tracking applied treatments
   - `community_votes`: Community voting on diagnoses
   - `weather_alerts`: Weather-based spray recommendations

2. **Security**
   - Row Level Security (RLS) policies protect user data
   - Authentication handled by Supabase
   - Storage bucket for plant images with proper access controls

## Success Metrics & KPIs

### User Engagement Metrics
- **Daily Active Users**: Target 1000+ within 6 months
- **Feature Adoption**: 80%+ users trying multiple AI providers
- **Community Participation**: 30%+ users voting on diagnoses
- **Voice Feature Usage**: Track adoption of accessibility features
- **Offline Mode Engagement**: Monitor PWA usage patterns

### Technical Performance
- **Diagnosis Accuracy**: >85% confidence for common diseases
- **Response Time**: <2s for AI analysis, <1s for offline detection
- **Weather Alert Accuracy**: >90% relevance for spray timing
- **Community Validation**: Track expert vs. community agreement rates

### Agricultural Impact
- **Treatment Success Rate**: User-reported outcome tracking
- **Disease Prevention**: Early detection success stories
- **Knowledge Sharing**: Quality of community-generated content
- **Regional Coverage**: Geographic diversity of user base

## Implementation Priority Matrix

### High Impact, Low Effort (Do First)
1. GPS field tagging with browser geolocation
2. Enhanced confidence meter ( completed)
3. Basic weather API integration
4. Spray tracking extension to current logging

### High Impact, High Effort (Plan Carefully)
1. Offline mode with TensorFlow.js integration
2. Voice interface with Web Speech API
3. Expert verification system
4. Advanced analytics dashboard

### Medium Impact, Low Effort (Quick Wins)
1. Disease trend visualization
2. Treatment calendar UI
3. Community Q&A basic features
4. Multilingual text support

### Medium Impact, High Effort (Future Phases)
1. Professional multi-field management
2. Government integration partnerships
3. Advanced ML model training
4. Real-time disease outbreak mapping

## Future Enhancements

### Phase 1: Enhanced Dashboard Features (High Priority)
1. **Weather Integration** (Free APIs Available)
   - Add weather widget with OpenWeatherMap API
   - Display humidity and temperature alerts
   - Show spray recommendations based on weather conditions
   - **NEW**: Agromonitoring satellite data integration

2. **Advanced Analytics Dashboard**
   - Treatment success rate tracking with visual charts
   - Disease occurrence patterns by region
   - Seasonal trend analysis with predictive insights
   - **NEW**: GPS-based field performance comparison
   - **NEW**: Community validation accuracy metrics

3. **Smart Notification System**
   - Firebase FCM push notifications for weather alerts
   - Treatment application reminders with optimal timing
   - Community activity notifications
   - **NEW**: Voice notifications for accessibility
   - **NEW**: Multilingual alert support with priority indicators
   - Add ability to mark as read or dismiss

4. **Recent Uploads Carousel**
   - Create a horizontal scrolling carousel of recent diagnoses
   - Fetch from the `diagnoses` table, ordered by creation date
   - Show plant type, disease name, and thumbnail image
   - Add click-through to full diagnosis details

5. **Community Feed Highlights**
   - Show a subset of the community feed (3-5 items)
   - Focus on items with the most votes or activity
   - Add a "View All" link to the full community page

6. **Enhanced Tips Section**
   - Display seasonal farming tips based on location and time of year
   - Show preventive measures for common diseases
   - Include links to detailed guides and resources
   - **NEW**: Voice-enabled tip playback for accessibility
   - **NEW**: GPS-based regional recommendations
   - **NEW**: Integration with CABI Plantwise knowledge base

### Phase 2: Advanced Features (Medium Priority)
1. **Offline Capabilities** (PWA + TensorFlow.js)
   - TensorFlow.js integration for offline plant disease detection
   - Cache recent diagnoses and treatment recommendations
   - PlantVillage dataset models for browser-based ML
   - Offline-first data synchronization with Supabase
   - **NEW**: Progressive Web App (PWA) installation

2. **Voice Interface & Accessibility**
   - Web Speech API for voice commands and navigation
   - Audio descriptions of diagnoses in multiple languages
   - Voice notes for treatment tracking
   - **NEW**: Hands-free operation for field use
   - **NEW**: Integration with screen readers

3. **Advanced Analytics & ML**
   - Machine learning insights from community data
   - Predictive disease modeling based on weather patterns
   - Personalized recommendations using user history
   - **NEW**: Regional disease outbreak prediction
   - **NEW**: Treatment resistance pattern detection

### Phase 3: Community & Collaboration (Long-term)
1. **Expert Network & Verification**
   - Connect users with verified agricultural experts
   - Expert badge system for professional validation
   - Professional consultation booking with calendar integration
   - **NEW**: Integration with agricultural extension services
   - **NEW**: Expert-moderated Q&A system

2. **Enhanced Knowledge Sharing**
   - User-generated content with photo galleries
   - Success story sharing with before/after comparisons
   - Best practices documentation with voice narration
   - **NEW**: Integration with CABI Plantwise Knowledge Bank
   - **NEW**: Multilingual content creation and translation

3. **Smart Regional Communities**
   - GPS-based local user groups and discussions
   - Automated local disease alerts from community reports
   - Regional farming calendars with weather integration
   - **NEW**: Government agricultural department partnerships
   - **NEW**: Real-time disease outbreak mapping

## Dashboard Implementation Plan

### Enhanced Dashboard Layout

```
+-------------------------------------------------------+
| Header with Navigation & Auth                         |
+-------------------------------------------------------+
| Quick Diagnose Section (Camera/Upload + GPS)          |
+-------------------------------------------------------+
| Weather Alerts & Spray Recommendations               |
+-------------------------------------------------------+
| Recent Uploads Carousel (with GPS tags)              |
+-------------------------------------------------------+
| Disease Trend Analytics (Regional)                    |
+-------------------------------------------------------+
| Community Feed Highlights + Expert Badges            |
+-------------------------------------------------------+
| Seasonal Tips & Voice Recommendations                 |
+-------------------------------------------------------+
| Footer                                                |
+-------------------------------------------------------+
```

### Implementation Steps

1. **Create Dashboard Page**
   - Create a new file at `src/app/dashboard/page.tsx`
   - Use React Native Web components with responsive design
   - Implement authentication check to redirect non-logged in users

2. **Quick Diagnose Section**
   - Add a simplified version of the ImageUploader at the top
   - Include plant type selection and AI provider options
   - Add a prominent "Diagnose" button

3. **Notifications Panel**
   - Fetch notifications from the `weather_alerts` table
   - Display unread notifications with priority indicators
   - Add ability to mark as read or dismiss

4. **Recent Uploads Carousel**
   - Create a horizontal scrolling carousel of recent diagnoses
   - Fetch from the `diagnoses` table, ordered by creation date
   - Show plant type, disease name, and thumbnail image
   - Add click-through to full diagnosis details

5. **Community Feed Highlights**
   - Show a subset of the community feed (3-5 items)
   - Focus on items with the most votes or activity
   - Add a "View All" link to the full community page

6. **Tips Section**
   - Create a seasonal tips component
   - Fetch tips based on user's location and preferred crops
   - Include preventive measures for common seasonal diseases

## New Features

### Comments System

To enhance community engagement, we'll implement a comments system that allows users to leave comments on diagnoses and vote on comments:

#### Database Schema

```sql
-- Create comments table for user comments on diagnoses
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnosis_id UUID REFERENCES public.diagnoses(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create comment_votes table for voting on comments
CREATE TABLE IF NOT EXISTS public.comment_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES public.comments(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (comment_id, user_id) -- Each user can only vote once per comment
);

-- Add RLS policies
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

-- Comments can be read by anyone, but only created/edited by the author
CREATE POLICY comments_select_policy ON public.comments FOR SELECT USING (true);
CREATE POLICY comments_insert_policy ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY comments_update_policy ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY comments_delete_policy ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Comment votes can be read by anyone, but only created/edited by the voter
CREATE POLICY comment_votes_select_policy ON public.comment_votes FOR SELECT USING (true);
CREATE POLICY comment_votes_insert_policy ON public.comment_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY comment_votes_update_policy ON public.comment_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY comment_votes_delete_policy ON public.comment_votes FOR DELETE USING (auth.uid() = user_id);
```

#### UI Components

1. **CommentsList Component**
   - Display comments for a specific diagnosis
   - Sort by most upvoted or most recent
   - Show user avatar, name, comment text, and vote count

2. **CommentForm Component**
   - Text input for adding new comments
   - Submit button with loading state
   - Character limit and validation

3. **CommentVoting Component**
   - Upvote/downvote buttons
   - Vote count display
   - Visual indication of user's vote

#### Implementation

1. Create the database tables and RLS policies
2. Implement the UI components
3. Add comment functionality to the diagnosis detail page and community feed
4. Add real-time updates using Supabase subscriptions

### Perplexity AI Integration

To provide the most up-to-date information on plant diseases and treatments, we'll integrate Perplexity AI as a fourth AI provider option:

#### Implementation Steps

1. **API Integration**
   - Create an API route at `/api/perplexity` to handle requests to Perplexity AI
   - Implement proper authentication and error handling
   - Format requests to include plant images and context

2. **UI Updates**
   - Add Perplexity as a provider option in the diagnose page
   - Update the provider selection UI to include Perplexity with appropriate labeling
   - Add description: "Free AI with up-to-date information - requires internet"

3. **Response Handling**
   - Parse Perplexity responses to extract disease information
   - Format responses to match the existing diagnosis result structure
   - Include source citations from Perplexity in the results

4. **Setup Script**
   - Create `add-perplexity-key.js` script to help users set up their Perplexity API key
   - Add documentation on obtaining a free Perplexity API key

#### Benefits of Perplexity Integration

- Access to the most current plant disease research and treatments
- Web search capabilities to find recent outbreaks or new treatment methods
- Source citations to provide users with additional reading materials
- Free tier available for basic usage

## Implementation Timeline

1. **Week 1: Dashboard Foundation**
   - Create dashboard page structure
   - Implement authentication and data fetching
   - Design responsive layout

2. **Week 2: Dashboard Components**
   - Implement quick diagnose section
   - Create notifications panel
   - Build recent uploads carousel

3. **Week 3: Comments System**
   - Create database tables and RLS policies
   - Implement comment UI components
   - Add comment functionality to diagnosis pages

4. **Week 4: Perplexity Integration**
   - Set up Perplexity API integration
   - Update UI to include Perplexity as a provider
   - Test and optimize response handling

5. **Week 5: Testing and Refinement**
   - Comprehensive testing across devices
   - Performance optimization
   - User feedback implementation

## Technical Considerations

1. **Performance**
   - Implement pagination for comments and community feed
   - Use image optimization for thumbnails in carousels
   - Implement lazy loading for dashboard sections

2. **Security**
   - Ensure proper RLS policies for all new tables
   - Implement rate limiting for comments and votes
   - Sanitize user input to prevent XSS attacks

3. **Accessibility**
   - Ensure all new components meet WCAG standards
   - Add proper aria labels and keyboard navigation
   - Test with screen readers

4. **Mobile Optimization**
   - Ensure all new features work well on mobile devices
   - Optimize touch targets for mobile users
   - Test on various screen sizes

## Conclusion

The planned dashboard and new features will significantly enhance the Garden Buddy application, providing users with a comprehensive tool for plant disease management. The addition of comments and Perplexity AI integration will make the platform more interactive and provide access to the most current information available.
