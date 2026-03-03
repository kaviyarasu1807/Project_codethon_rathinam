# NeuroPath - AI-Powered Adaptive Learning Platform

## Project Overview

NeuroPath is an intelligent educational assessment platform that uses AI, emotional intelligence tracking, and LSTM algorithms to create personalized learning experiences. The system analyzes student behavior, emotional states, and performance patterns to provide tailored recommendations and identify learning gaps.

## Core Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **UI Framework**: Tailwind CSS + Motion (Framer Motion)
- **Charts**: Recharts
- **Icons**: Lucide React
- **AI/ML**: LSTM Algorithm for personalized recommendations

## Key Features

### 1. Dual Role System
- **Student Portal**: Take quizzes, view personalized recommendations, track emotional intelligence
- **Staff Dashboard**: Monitor all students, view detailed analytics, access comprehensive metrics

### 2. Advanced Authentication
- Email/password login with role-based access
- Forgot password with token-based reset (1-hour expiration)
- Face verification using camera access
- Domain-specific registration (Engineering, Medical, General Studies)
- Attractive gradient UI with glass morphism effects

### 3. Intelligent Quiz System
- Domain-specific questions (Engineering, Medical, General)
- Real-time emotional state tracking during assessment
- Camera-based face verification
- Automatic level classification (Beginner/Intermediate/Advanced)
- Critical concept identification based on stress patterns

### 4. Comprehensive Environment Tracking

The system monitors multiple behavioral and environmental factors:

- **Quiz Solving Time**: Total time and average per question
- **Typing Speed**: Words per minute (WPM) calculation
- **Voice Recognition**: Detects if student is speaking during quiz
- **Tab Switches**: Tracks focus loss when switching tabs
- **Mouse Movements**: Monitors interaction patterns
- **Emotional States**: 
  - Stress Level (0-100%)
  - Happiness Level (0-100%)
  - Focus Level (0-100%)

### 5. LSTM-Based Recommendation Engine

After quiz completion, the system uses LSTM algorithms to analyze:

- **Learning Style Detection**: Visual, Auditory, Kinesthetic, Reading-Writing, or Multimodal
- **Optimal Study Time**: Best time of day for learning
- **Session Duration**: Recommended study session length
- **Retention Rate**: Predicted knowledge retention percentage
- **Improvement Prediction**: Expected performance improvement

**Personalized Outputs**:
- Custom study schedule
- Resource recommendations (videos, articles, practice problems)
- Study techniques tailored to learning style
- Environmental optimization tips
- Motivational insights

### 6. Enhanced Emotional Intelligence History

**Real-time Tracking**:
- Stress, happiness, and focus levels during quiz
- 20 historical data points with trend analysis
- Interactive area chart with gradient visualization

**Detailed Statistics**:
- Average, peak, and lowest values for each metric
- Trend indicators (Improving/Declining/Stable)
- Color-coded analysis cards

**AI-Powered Insights**:
- Performance recommendations based on stress patterns
- Focus improvement suggestions
- Contextual advice for better learning outcomes

### 7. Staff Dashboard Features

**Student Overview Cards**:
- Individual student performance metrics
- Quiz completion time and scores
- Voice detection status
- Typing speed analysis
- Tab switch count
- Emotional state averages (stress, happiness, focus)
- Critical concepts flagged

**Detailed Modal View**:
- Click any student card for comprehensive analytics
- Full emotional history visualization
- Question-by-question performance breakdown
- LSTM recommendations review

### 8. Personalized Student Dashboard

**Overview Section**:
- Current DNA Level (Beginner/Intermediate/Advanced)
- Latest quiz score
- Critical focus areas count
- Domain information with verification badge

**Emotional Intelligence Chart**:
- Multi-line area chart showing stress, happiness, focus
- Statistical analysis cards with trends
- AI-generated insights and recommendations

**Recommendation Cards**:
- General DNA guidance
- AI-driven study preferences (LSTM/SVM analysis)
- Targeted concept support
- High-stress questions flagged
- Critical concepts highlighted

### 9. Attractive UI/UX Design

**Login Page**:
- Animated gradient background (emerald/blue/purple)
- Floating animated orbs
- Glass morphism with backdrop blur
- Icon-enhanced inputs with password visibility toggle
- Smooth transitions and hover effects
- Rotating logo animation

**Dashboard**:
- Modern card-based layout
- Color-coded metrics for quick assessment
- Responsive design for all screen sizes
- Smooth animations using Motion (Framer Motion)
- Professional gradient themes

## Database Schema

### Tables (6 Total)

1. **students**: User accounts with face descriptors
2. **quiz_results**: Quiz scores, levels, recommendations, environmental metrics
3. **emotional_states**: Real-time emotional tracking data
4. **recommendations**: General learning recommendations by level
5. **password_reset_tokens**: Secure password reset functionality
6. **question_responses**: Individual question answers and stress levels

## API Endpoints (10 Total)

1. `POST /api/register` - User registration
2. `POST /api/login` - User authentication
3. `POST /api/quiz/submit` - Submit quiz with all tracking data
4. `GET /api/stats` - Get student statistics and emotional history
5. `GET /api/admin/students` - Get all students (admin only)
6. `GET /api/admin/summary` - Get platform summary (admin only)
7. `POST /api/forgot-password` - Request password reset
8. `POST /api/verify-reset-token` - Verify reset token
9. `POST /api/reset-password` - Reset password with token
10. `GET /api/health` - Health check endpoint

## Unique Selling Points

### 1. Emotional Intelligence Integration
Unlike traditional quiz platforms, NeuroPath tracks emotional states in real-time to identify stress patterns and provide mental health insights.

### 2. LSTM-Powered Personalization
Advanced machine learning algorithms analyze historical data to predict optimal learning strategies and create personalized study plans.

### 3. Comprehensive Behavioral Analysis
Tracks 10+ behavioral metrics (typing speed, voice, tab switches, mouse movements) to understand student engagement deeply.

### 4. Critical Concept Detection
Automatically identifies topics that cause high stress, allowing targeted intervention and support.

### 5. Multi-Domain Support
Tailored question banks and recommendations for Engineering, Medical, and General Studies domains.

### 6. Face Verification
Camera-based identity verification ensures assessment integrity.

### 7. Trend Analysis
Historical tracking with trend indicators helps students see improvement over time.

## Project Structure

```
NeuroPath/
├── backend/
│   ├── lstm-recommender.ts    # LSTM recommendation engine
│   ├── supabase-schema.sql    # Database schema
│   └── supabase.ts            # Database configuration
├── src/
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── server.ts                  # Express backend server
├── neuropath.db              # SQLite database
├── package.json              # Dependencies
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── Documentation Files:
    ├── START.md                          # Quick start guide
    ├── CONNECTION_STATUS.md              # Backend connection status
    ├── BACKEND_CONNECTION_GUIDE.md       # Backend setup guide
    ├── LSTM_RECOMMENDATION_SYSTEM.md     # LSTM algorithm details
    ├── ENVIRONMENT_TRACKING_FEATURES.md  # Tracking features guide
    ├── ADMIN_DASHBOARD_GUIDE.md          # Staff dashboard guide
    ├── PASSWORD_RESET_GUIDE.md           # Password reset guide
    ├── ATTRACTIVE_LOGIN_REGISTER.md      # UI design guide
    └── EMOTIONAL_INTELLIGENCE_DETAILS.md # Emotional tracking guide
```

## How It Works

### Student Journey

1. **Registration**: Student registers with email, password, domain selection
2. **Login**: Authenticates with attractive gradient UI
3. **Camera Access**: System requests camera for face verification
4. **Quiz Taking**: 
   - Answers domain-specific questions
   - System tracks emotional states, typing speed, voice, tab switches
   - Real-time stress/happiness/focus monitoring
5. **Instant Results**: 
   - Automatic level classification
   - LSTM-generated personalized recommendations
   - Critical concepts highlighted
   - Study schedule created
6. **Dashboard**: 
   - View emotional intelligence history
   - Track improvement trends
   - Access AI insights
   - Retake assessments

### Staff Journey

1. **Login**: Staff authenticates with admin credentials
2. **Dashboard**: View all students in card-based layout
3. **Analytics**: 
   - See quiz times, typing speeds, voice detection
   - Monitor emotional states across all students
   - Identify struggling students (high stress, low focus)
4. **Detailed View**: Click student card for comprehensive metrics
5. **Intervention**: Use data to provide targeted support

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Quick Start
```bash
# Install dependencies
npm install

# Start both backend and frontend
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

### Default Accounts
Create accounts through registration or use existing ones in the database.

## Technical Highlights

### Performance Optimizations
- Efficient SQLite queries with proper indexing
- React component memoization
- Lazy loading for charts and heavy components
- Optimized re-renders with proper state management

### Security Features
- Password hashing (bcrypt)
- Token-based password reset with expiration
- SQL injection prevention with prepared statements
- Role-based access control
- Secure session management

### Scalability Considerations
- Modular component architecture
- Separation of concerns (frontend/backend)
- RESTful API design
- Database migrations for schema updates
- Environment-based configuration

## Future Enhancement Possibilities

1. **Multi-language Support**: Internationalization for global reach
2. **Mobile App**: React Native version for iOS/Android
3. **Live Proctoring**: Real-time monitoring during exams
4. **Peer Comparison**: Anonymous benchmarking against classmates
5. **Gamification**: Badges, achievements, leaderboards
6. **Video Lessons**: Integrated learning resources
7. **Calendar Integration**: Sync study schedules with Google Calendar
8. **Export Reports**: PDF/CSV export of performance data
9. **Parent Portal**: Allow parents to monitor student progress
10. **AI Chatbot**: 24/7 study assistance and doubt clearing

## Use Cases

### Educational Institutions
- Conduct adaptive assessments
- Identify at-risk students early
- Provide data-driven interventions
- Track emotional well-being

### Corporate Training
- Employee skill assessment
- Personalized training paths
- Stress management insights
- Performance tracking

### Self-Learning Platforms
- Individual learners can self-assess
- Get personalized study recommendations
- Track learning progress over time
- Optimize study habits

## Project Metrics

- **Total Files**: 20+ (including documentation)
- **Lines of Code**: ~3000+ (TypeScript/React)
- **API Endpoints**: 10
- **Database Tables**: 6
- **Tracked Metrics**: 10+
- **Emotional States**: 3 (Stress, Happiness, Focus)
- **Question Bank**: 30+ questions across 3 domains
- **Documentation Pages**: 9

## Key Achievements

✅ Full-stack implementation with TypeScript
✅ Real-time emotional intelligence tracking
✅ LSTM-based personalized recommendations
✅ Comprehensive behavioral analysis
✅ Attractive, modern UI with animations
✅ Role-based access control
✅ Password reset functionality
✅ Face verification integration
✅ Detailed analytics dashboard
✅ Trend analysis and insights
✅ Complete documentation

## Conclusion

NeuroPath represents a next-generation educational platform that goes beyond traditional assessment by incorporating emotional intelligence, behavioral analysis, and AI-powered personalization. The system provides actionable insights for both students and educators, creating a holistic learning ecosystem that adapts to individual needs and promotes better learning outcomes.

The platform successfully combines modern web technologies, machine learning algorithms, and user-centric design to deliver a comprehensive solution for adaptive learning and student success.

---

**Project Status**: ✅ Fully Functional
**Last Updated**: March 3, 2026
**Version**: 1.0.0
