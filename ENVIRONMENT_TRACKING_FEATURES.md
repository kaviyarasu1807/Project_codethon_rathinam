# Advanced Environment Tracking Features

## Overview
Comprehensive real-time monitoring system that tracks multiple environmental and behavioral metrics during quiz sessions to provide personalized learning insights.

## New Tracking Metrics

### 1. Quiz Solving Time
- **Total Time**: Complete quiz duration
- **Per Question Time**: Individual question solving time
- **Average Question Time**: Mean time across all questions
- **Real-time Display**: Live timer showing current question duration

### 2. Voice Recognition
- **Audio Stream Analysis**: Monitors microphone input using Web Audio API
- **Voice Activity Detection**: Detects when student speaks during quiz
- **Focus Impact**: Voice detection reduces focus level (indicates distraction)
- **Visual Indicator**: Orange "VOICE" badge appears when voice detected
- **Frequency Analysis**: Uses FFT to analyze audio frequencies

### 3. Typing Speed Tracking
- **Keystroke Monitoring**: Tracks all keyboard activity
- **WPM Calculation**: Calculates words per minute based on key press intervals
- **Engagement Metric**: Higher typing speed indicates active engagement
- **Real-time Display**: Shows current typing speed in WPM

### 4. Focus Level (Separate from Happiness)
- **Independent Metric**: Now tracked separately from happiness
- **Calculated From**:
  - Mouse movements (engagement indicator)
  - Typing activity
  - Tab switches (negative impact)
  - Voice detection (negative impact)
- **Range**: 0-100%
- **Color**: Blue indicator
- **Icon**: Activity icon

### 5. Happiness Level (Separate from Focus)
- **Independent Metric**: Emotional state tracking
- **Calculated From**:
  - Base happiness (decreases with quiz progress)
  - Focus bonus (higher focus = higher happiness)
  - Stress penalty (higher stress = lower happiness)
- **Range**: 0-100%
- **Color**: Yellow indicator
- **Icon**: Smile icon

### 6. Tab Switch Detection
- **Visibility API**: Monitors when student switches tabs/windows
- **Counter**: Tracks total number of tab switches
- **Focus Penalty**: Each switch reduces focus by 10%
- **Stress Impact**: Increases stress level
- **Alert**: Displayed in environment metrics panel

### 7. Mouse Movement Tracking
- **Engagement Score**: Measures mouse activity
- **Focus Boost**: Active mouse movement increases focus
- **Calculation**: Movement count / 10 = engagement percentage

### 8. Stress Level (Enhanced)
- **Multi-factor Calculation**:
  - Base stress (increases with quiz progress)
  - Focus penalty (low focus = high stress)
  - Voice penalty (+15% when voice detected)
  - Tab switch penalty (+2% per switch)
  - Time factor (sinusoidal variation)
- **Range**: 0-100%
- **Color**: Red (>60%) or Green (≤60%)
- **Icon**: Frown icon

## UI Components

### Live Tracking Panel
```
┌─────────────────────────────┐
│ 📷 Live Tracking            │
├─────────────────────────────┤
│ [Video Feed]                │
│ ACTIVE | LIVE | VOICE       │
├─────────────────────────────┤
│ 😟 STRESS LEVEL      45%    │
│ ████████░░░░░░░░░░░░        │
├─────────────────────────────┤
│ 😊 HAPPINESS         72%    │
│ ██████████████░░░░░░        │
├─────────────────────────────┤
│ 📊 FOCUS LEVEL       68%    │
│ █████████████░░░░░░░        │
└─────────────────────────────┘
```

### Environment Metrics Panel
```
┌─────────────────────────────┐
│ 🖥️ Environment Metrics      │
├─────────────────────────────┤
│ Question Time:        23s   │
│ Typing Speed:         45 WPM│
│ Tab Switches:         2     │
│ Voice Detected:       No    │
│ Engagement:           85%   │
└─────────────────────────────┘
```

## Database Schema Updates

### quiz_results Table (New Columns)
```sql
total_time INTEGER              -- Total quiz duration in seconds
avg_question_time REAL          -- Average time per question
typing_speed REAL               -- Average typing speed in WPM
tab_switch_count INTEGER        -- Number of tab switches
voice_detected INTEGER          -- 1 if voice was detected, 0 otherwise
avg_focus_level REAL            -- Average focus level (0-100)
avg_stress_level REAL           -- Average stress level (0-100)
avg_happiness_level REAL        -- Average happiness level (0-100)
```

### emotional_states Table (New Columns)
```sql
focus_level REAL                -- Focus level at time of recording
typing_speed REAL               -- Typing speed at time of recording
voice_detected INTEGER          -- Voice detection status
tab_switch_count INTEGER        -- Cumulative tab switches
```

## API Updates

### POST /api/quiz/submit
**New Request Fields:**
```json
{
  "studentId": 1,
  "score": 85,
  "missedConcepts": [...],
  "criticalConcepts": [...],
  "criticalQuestions": [...],
  "totalTime": 450,
  "avgQuestionTime": 50.5,
  "typingSpeed": 45.2,
  "tabSwitchCount": 2,
  "voiceDetected": 0,
  "avgFocusLevel": 68.5,
  "avgStressLevel": 45.3,
  "avgHappinessLevel": 72.1
}
```

### POST /api/emotional-state
**New Request Fields:**
```json
{
  "studentId": 1,
  "stressLevel": 45.3,
  "happinessLevel": 72.1,
  "focusLevel": 68.5,
  "typingSpeed": 45.2,
  "voiceDetected": 0,
  "tabSwitchCount": 2
}
```

## AI Guidance Enhancements

The AI now provides personalized recommendations based on environment metrics:

- **Low Focus (<50%)**: "Your focus levels suggest shorter study sessions with frequent breaks would be beneficial."
- **Multiple Tab Switches (>3)**: "We detected multiple tab switches - try using focus mode or website blockers during study time."
- **High Stress (>70%)**: "High stress detected - consider meditation or breathing exercises before studying."
- **Quick Answers (<10s avg)**: "You're answering quickly - take more time to read questions carefully."

## Browser Permissions Required

### Camera Access
- Required for face verification and emotion detection
- Requested at quiz start

### Microphone Access
- Required for voice detection
- Requested at quiz start
- Used only for activity detection (not recording)

### Notifications (Optional)
- For critical stress alerts
- Can be enabled from login page

## Technical Implementation

### Web Audio API
```typescript
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
// Frequency analysis for voice detection
```

### Visibility API
```typescript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Tab switch detected
  }
});
```

### Event Listeners
- `keydown`: Typing speed tracking
- `mousemove`: Engagement tracking
- `visibilitychange`: Tab switch detection

## Privacy & Security

- Audio is analyzed in real-time, not recorded or stored
- Video feed is processed locally, not transmitted
- All metrics are anonymized and used only for learning optimization
- Students can see all tracked metrics in real-time
- Data is stored securely in local database

## Performance Considerations

- Emotion monitoring runs every 10 seconds (not continuous)
- Voice detection checks every 500ms
- Mouse movement throttled to prevent performance issues
- All calculations done client-side to reduce server load

## Future Enhancements

- Eye tracking for attention detection
- Posture analysis using pose estimation
- Facial expression recognition for emotion detection
- Heart rate monitoring (if device supports)
- Screen recording for review (with consent)
- AI-powered study pattern recognition
