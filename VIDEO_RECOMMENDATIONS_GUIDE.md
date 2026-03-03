# Video Recommendations System - Complete Guide

## 🎯 Overview

The Video Recommendations System analyzes student performance reports (quiz results, SAFA feedback, learning analytics) and automatically suggests personalized YouTube videos and learning resources to help students improve.

---

## ✅ What Was Built

### 1. Backend Engine (`backend/video-recommendation-engine.ts`)
- **600+ lines** of intelligent recommendation logic
- Analyzes student reports comprehensively
- Searches YouTube for relevant educational content
- Ranks videos by relevance and quality
- Generates personalized study plans
- Tracks video watch progress

### 2. API Endpoints (`server.ts`)
- `POST /api/recommendations/generate` - Generate recommendations
- `GET /api/recommendations/:studentId` - Get latest recommendations
- `POST /api/recommendations/track-watch` - Track video watch progress
- `GET /api/recommendations/watch-history/:studentId` - Get watch history

### 3. Database Schema (`backend/supabase-schema.sql`)
- `video_recommendations` table - Stores recommendation reports
- `video_watch_history` table - Tracks video engagement
- Views for analytics and progress tracking

### 4. Frontend Component (`VIDEO_RECOMMENDATIONS_COMPONENT.tsx`)
- Beautiful video library interface
- Integrated YouTube player
- Study plan visualization
- Resource recommendations
- Watch progress tracking

---

## 🔄 How It Works

### Step 1: Analyze Student Report
```typescript
Input:
- Weak concepts (mastery < 50%)
- Critical concepts (urgent attention needed)
- Missed questions
- Learning problems (from Analytics AI)
- Performance trend
- Learning style

Output:
- Top 5 focus areas prioritized by urgency
```

### Step 2: Search YouTube Videos
```typescript
For each focus area:
1. Get concept keywords (e.g., "Data Structures" → ["data structures tutorial", "arrays linked lists"])
2. Adjust search based on learning style:
   - Visual: Add "animation visualization"
   - Auditory: Add "lecture explanation"
   - Kinesthetic: Add "hands-on practical"
3. Add difficulty level:
   - Mastery <40%: "beginner tutorial"
   - Mastery 40-70%: "intermediate"
   - Mastery >70%: "advanced"
4. Search YouTube (5 videos per keyword)
5. Rate limit: 500ms between searches
```

### Step 3: Rank Videos by Relevance
```typescript
Scoring System (0-100+):

Quality Channel Bonus: +30
- Khan Academy, MIT OpenCourseWare, Crash Course, etc.

View Count Bonus:
- >1M views: +20
- >100K views: +15
- >10K views: +10

Duration Bonus:
- 10-30 minutes: +15 (optimal)
- 5-45 minutes: +10 (acceptable)

Recency Bonus:
- Days/weeks old: +10
- Months old: +5

Learning Style Match: +15
- Visual learner + "animation" in title

Difficulty Match: +20
- Beginner student + beginner video

Critical Concept Bonus: +25
- Video covers critical concept → HIGH PRIORITY

Weak Concept Bonus: +15
- Video covers weak concept → MEDIUM PRIORITY
```

### Step 4: Generate Additional Resources
```typescript
For each focus area:
- Practice Problems (priority: 3)
- Interactive Tutorials (priority: 2)
- Articles & Guides (priority: 1)
```

### Step 5: Create Study Plan
```typescript
Immediate (Today):
- Review most critical concept
- Watch 1 high-priority video
- Complete 5 practice problems

This Week (7 days):
- Day 1-3: Focus on top 3 concepts
- Watch 2 videos per concept
- Complete exercises
- Take mini-quizzes

This Month (30 days):
- Week 1: Master critical concepts
- Week 2: Strengthen weak areas
- Week 3: Practice and review
- Week 4: Comprehensive assessment
```

### Step 6: Track Progress
```typescript
When student watches video:
- Track watch time (seconds)
- Mark as completed if >90% watched
- Store in watch_history table
- Update progress metrics
```

---

## 📊 Example Analysis

### Student Profile
```json
{
  "studentId": 1,
  "weakConcepts": ["Data Structures", "Algorithms"],
  "criticalConcepts": ["Data Structures"],
  "masteryScores": {
    "Data Structures": 28,
    "Algorithms": 45,
    "Operating Systems": 75
  },
  "learningProblems": [
    {
      "type": "concept_gap",
      "severity": "critical",
      "affectedConcepts": ["Data Structures"]
    }
  ],
  "performanceTrend": "declining",
  "learningStyle": "visual"
}
```

### Generated Recommendations
```json
{
  "focusAreas": [
    "Data Structures",
    "Algorithms"
  ],
  "videos": [
    {
      "videoId": "RBSGKlAvoiM",
      "title": "Data Structures Easy to Advanced Course - Full Tutorial",
      "channelTitle": "freeCodeCamp.org",
      "duration": "8:18:00",
      "relevanceScore": 95,
      "priority": "high",
      "recommendationReason": "Recommended for Data Structures",
      "difficulty": "beginner"
    }
  ],
  "studyPlan": {
    "immediate": [
      "🚨 URGENT: Review Data Structures immediately",
      "📺 Watch: 'Data Structures Easy to Advanced Course'",
      "📝 Complete 5 practice problems on Data Structures"
    ],
    "thisWeek": [
      "Day 1: Focus on Data Structures",
      "  📺 Watch: 'Arrays and Linked Lists Tutorial'",
      "  📝 Practice: Complete Data Structures exercises"
    ]
  },
  "estimatedStudyTime": "12h 45m"
}
```

---

## 🎨 Frontend Integration

### Add to Dashboard Navigation
```typescript
// In src/App.tsx Dashboard component

<button 
  onClick={() => setView('videos')}
  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
    view === 'videos' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-stone-500 hover:bg-stone-50'
  }`}
>
  <Play className="w-5 h-5" />
  Learning Videos
</button>
```

### Add View Component
```typescript
{view === 'videos' && user.role === 'student' && (
  <motion.div 
    key="videos"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    <VideoRecommendations userId={user.id} />
  </motion.div>
)}
```

---

## 🚀 API Usage Examples

### Generate Recommendations
```bash
curl -X POST http://localhost:5000/api/recommendations/generate \
  -H "Content-Type: application/json" \
  -d '{"studentId": 1}'
```

### Get Recommendations
```bash
curl http://localhost:5000/api/recommendations/1
```

### Track Video Watch
```bash
curl -X POST http://localhost:5000/api/recommendations/track-watch \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "videoId": "RBSGKlAvoiM",
    "watchTime": 450,
    "completed": true
  }'
```

---

## 📈 Features

### Intelligent Ranking
- ✅ Quality channel detection (Khan Academy, MIT, etc.)
- ✅ View count analysis
- ✅ Duration optimization (prefers 10-30 min videos)
- ✅ Recency bonus
- ✅ Learning style matching
- ✅ Difficulty level matching
- ✅ Concept relevance scoring

### Personalization
- ✅ Based on weak concepts
- ✅ Prioritizes critical concepts
- ✅ Adapts to learning style (visual/auditory/kinesthetic)
- ✅ Matches difficulty to mastery level
- ✅ Considers performance trend

### Study Planning
- ✅ Immediate actions (today)
- ✅ Weekly plan (7 days)
- ✅ Monthly goals (30 days)
- ✅ Estimated study time
- ✅ Focus area identification

### Progress Tracking
- ✅ Watch time tracking
- ✅ Completion detection (>90% watched)
- ✅ Watch history
- ✅ Progress analytics

---

## 🎯 Use Cases

### 1. After Quiz Completion
```typescript
// Automatically generate recommendations after quiz
const handleQuizComplete = async (result) => {
  setQuizResult(result);
  
  // Generate video recommendations
  await fetch('/api/recommendations/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: userId })
  });
  
  // Show recommendations
  setView('videos');
};
```

### 2. Weekly Review
```typescript
// Generate fresh recommendations every week
useEffect(() => {
  const weeklyUpdate = setInterval(() => {
    generateRecommendations();
  }, 7 * 24 * 60 * 60 * 1000); // 7 days
  
  return () => clearInterval(weeklyUpdate);
}, []);
```

### 3. Mentor Dashboard
```typescript
// Show students who need video recommendations
const studentsNeedingHelp = await fetch('/api/analytics/intervention-queue');

studentsNeedingHelp.forEach(student => {
  // Auto-generate recommendations for struggling students
  generateRecommendations(student.id);
});
```

---

## 📊 Analytics & Insights

### Student Video Progress View
```sql
SELECT 
  student_name,
  videos_watched,
  total_watch_time / 60 as hours_watched,
  videos_completed,
  avg_watch_time / 60 as avg_minutes_per_video
FROM student_video_progress
WHERE student_id = 1;
```

### Most Watched Concepts
```sql
SELECT 
  concept,
  COUNT(*) as video_count,
  SUM(watch_time) as total_time
FROM video_watch_history vwh
JOIN video_recommendations vr ON vwh.student_id = vr.student_id
GROUP BY concept
ORDER BY total_time DESC;
```

---

## 🎨 UI Components

### Video Card
- Thumbnail with duration overlay
- Title and channel name
- Priority badge (high/medium/low)
- Relevance score
- Completion checkmark
- Click to play

### Video Player
- Full YouTube player integration
- Auto-tracking of watch progress
- Completion detection
- Related concepts display
- Recommendation reason

### Study Plan
- Three columns: Today, This Week, This Month
- Color-coded by urgency
- Checkboxes for completion
- Estimated time per task

---

## ⚙️ Configuration

### Concept Keywords
Add custom keywords for your concepts in `video-recommendation-engine.ts`:

```typescript
private conceptKeywords: Record<string, string[]> = {
  'Your Concept': ['keyword1', 'keyword2', 'keyword3'],
  // ...
};
```

### Quality Channels
Add trusted educational channels:

```typescript
private qualityChannels = [
  'Your Channel Name',
  // ...
];
```

### Ranking Weights
Adjust scoring in `rankVideos()` method:

```typescript
// Quality channel bonus
if (isQualityChannel) score += 30; // Adjust this

// View count bonus
if (views > 1000000) score += 20; // Adjust this
```

---

## 🚨 Important Notes

### YouTube API Limits
- **Free tier**: 10,000 quota units/day
- **Search**: 100 units per request
- **Limit**: ~100 searches/day
- **Solution**: Cache results, use youtube-search-api (no quota)

### Performance
- Rate limit: 500ms between searches
- Async/await for all API calls
- Cache recommendations for 24 hours
- Lazy load videos (don't load all at once)

### Privacy
- Track only video IDs, not content
- Store watch time, not viewing behavior
- GDPR compliant (can delete all data)

---

## 📝 Next Steps

### Phase 1: Basic Integration (Done ✅)
- [x] Backend recommendation engine
- [x] API endpoints
- [x] Database schema
- [x] Frontend component

### Phase 2: Enhancement (Recommended)
- [ ] Add to Dashboard navigation
- [ ] Integrate with Quiz completion
- [ ] Add watch progress UI
- [ ] Create mentor dashboard view

### Phase 3: Advanced Features
- [ ] Video playlists
- [ ] Collaborative filtering (recommend based on similar students)
- [ ] Video notes and bookmarks
- [ ] Discussion forums per video
- [ ] Quiz questions based on videos

---

## 🎉 Summary

The Video Recommendations System is a complete, intelligent solution that:

1. **Analyzes** student performance comprehensively
2. **Searches** YouTube for relevant educational content
3. **Ranks** videos by quality and relevance
4. **Personalizes** based on learning style and mastery
5. **Plans** study schedules with actionable steps
6. **Tracks** progress and engagement

**Status**: ✅ Backend Complete | ✅ Frontend Component Ready | 🔄 Integration Pending

**Impact**: Transforms passive learning into active, guided improvement with personalized video recommendations!
