# Garden Buddy: AI-Powered Smart Farming Assistant

Garden Buddy is a mobile-first web application designed to help farmers and gardeners identify plant diseases, get treatment recommendations, receive weather-based alerts, and collaborate with a community of growers.

## 🌱 Vision

To empower farmers and gardeners with accessible AI technology that helps them identify and treat plant diseases early, leading to improved crop yields and sustainable farming practices.

## 🔍 Core Features

### 1. AI Disease Detection
- Upload or capture photos of plant leaves
- AI analysis using GPT-4 Vision API
- Disease identification with confidence score
- Treatment recommendations (organic and chemical options)

### 2. Community Voting System
- Low-confidence predictions (under 80%) sent to community feed
- Farmers can vote on correct diagnosis
- Accuracy meter showing AI confidence level
- Community-validated diagnoses

### 3. Weather-Based Alerts
- Location-based weather monitoring
- Preventive spray recommendations based on weather conditions
- Customized alerts for different crop types
- Historical weather pattern analysis

### 4. Crop Logbook
- Track disease history by crop and location
- Record treatments applied and outcomes
- Visual timeline of plant health
- Export reports for record-keeping

### 5. User Profile & Settings
- Farm/garden location setup
- Crop type preferences
- Notification settings
- Treatment preference (organic vs. conventional)

## 🏗️ Technical Architecture

### Frontend
- **Framework**: Next.js with App Router
- **Mobile Integration**: React Native Web components
- **Styling**: Tailwind CSS with NativeWind
- **Navigation**: React Navigation for native-like experience
- **Charts/Visualization**: Chart.js for data visualization

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for images
- **Serverless Functions**: Supabase Edge Functions
- **Push Notifications**: Expo Notifications via Supabase Edge Functions

### AI Integration
- **Image Analysis**: OpenAI GPT-4 Vision API
- **Treatment Recommendations**: OpenAI GPT API
- **Confidence Scoring**: Custom algorithm based on AI response

### External APIs
- **Weather Data**: OpenWeatherMap API
- **Geolocation**: Browser Geolocation API

## 📱 App Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── onboarding/
│   ├── (main)/
│   │   ├── diagnose/
│   │   ├── community/
│   │   ├── profile/
│   │   └── weather/
│   └── api/
├── components/
│   ├── ui/
│   ├── diagnose/
│   ├── community/
│   └── weather/
├── lib/
│   ├── supabase/
│   ├── openai/
│   └── weather/
└── utils/
```

## 🗓️ Development Roadmap

### Phase 1: Core Infrastructure (Current)
- Project setup with Next.js and Supabase
- Mobile-first UI components
- Authentication system
- Database schema design

### Phase 2: Disease Detection
- Camera/gallery integration
- GPT-4 Vision API integration
- Confidence scoring algorithm
- Treatment recommendation system

### Phase 3: Community Features
- Community feed implementation
- Voting system for diagnoses
- User profiles and reputation system
- Notification system

### Phase 4: Weather Integration
- Weather API integration
- Alert system based on weather conditions
- Spray recommendation engine
- Historical weather data analysis

### Phase 5: Refinement & Launch
- Performance optimization
- Comprehensive testing
- User feedback implementation
- Public launch

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📊 Database Schema

### Users Table
- id (primary key)
- email
- created_at
- last_login
- location
- preferred_crops (array)
- notification_preferences

### Diagnoses Table
- id (primary key)
- user_id (foreign key)
- image_url
- plant_type
- disease_name
- confidence_score
- ai_diagnosis
- community_diagnosis
- created_at
- status (pending, confirmed, disputed)

### Treatments Table
- id (primary key)
- diagnosis_id (foreign key)
- treatment_type (organic, chemical)
- description
- application_date
- effectiveness_rating

### Community_Votes Table
- id (primary key)
- diagnosis_id (foreign key)
- user_id (foreign key)
- voted_disease
- created_at

### Weather_Alerts Table
- id (primary key)
- user_id (foreign key)
- alert_type
- description
- created_at
- expires_at
- status (active, expired, dismissed)

## 🔐 Authentication Flow

Garden Buddy implements a comprehensive authentication system using Supabase Auth with the following features:

### User Authentication Pages

- **Login Page** (`/login`): Email/password authentication with error handling and "Remember me" option
- **Registration Page** (`/register`): New user signup with email verification
- **Forgot Password Page** (`/forgot-password`): Password reset request via email
- **Reset Password Page** (`/reset-password`): Secure password change with validation
- **Change Password Page** (`/profile/change-password`): Authenticated password updates

### Authentication Flow

1. **Registration Flow**:
   - User enters email, password, and confirms password
   - Form validates password requirements (length, complexity)
   - On submit, creates Supabase auth user and profile record
   - Sends verification email to user
   - Redirects to success page with instructions

2. **Login Flow**:
   - User enters email and password
   - On successful authentication, redirects to home/dashboard
   - Failed attempts show appropriate error messages
   - "Remember me" option extends session duration

3. **Password Reset Flow**:
   - User requests password reset via email
   - Email contains secure reset link
   - Reset page validates new password requirements
   - On successful reset, redirects to login

4. **Protected Routes**:
   - Middleware checks authentication status
   - Unauthenticated users redirected to login
   - Authenticated users accessing auth pages redirected to home
   - Preserves original destination after login via URL parameters

### Implementation Details

- **Middleware** (`/src/middleware.ts`): Route protection and session handling
- **Auth Callback** (`/src/app/auth/callback/route.ts`): Handles Supabase auth redirects
- **Supabase Integration**: Uses `@supabase/ssr` for server and client components
- **Session Management**: Automatic token refresh and secure cookie handling
- **Form Components**: Reusable login and registration form components

## 🔒 Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
