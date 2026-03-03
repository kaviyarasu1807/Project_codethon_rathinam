## Admin Video Suggestions System - Complete Guide

## Overview
This system allows admins to add custom video suggestions (YouTube links, descriptions, etc.) and students see personalized video recommendations based on their learning needs.

## Features

### For Admins:
- ✅ Add video suggestions with title, description, URL
- ✅ Set difficulty level (beginner, intermediate, advanced)
- ✅ Assign concepts and tags
- ✅ Categorize by domain (Engineering, Computer Science, etc.)
- ✅ Edit and delete videos
- ✅ Activate/deactivate videos
- ✅ View analytics (views, ratings)

### For Students:
- ✅ See personalized video recommendations
- ✅ Videos matched to their weak concepts
- ✅ Videos matched to their skill level
- ✅ Watch videos in embedded player
- ✅ Mark videos as watched
- ✅ Rate videos

## Files Created

### 1. Backend Logic
**File:** `backend/admin-video-suggestions.ts`
- `addVideoSuggestion()` - Admin adds new video
- `getAllVideoSuggestions()` - Get all videos (admin)
- `getStudentVideoSuggestions()` - Get personalized videos for student
- `updateVideoSuggestion()` - Edit video
- `deleteVideoSuggestion()` - Delete video
- `trackVideoView()` - Track when student watches
- `getVideoAnalytics()` - Get video statistics

### 2. Database Schema
**File:** `backend/admin-video-schema.sql`
- `admin_video_suggestions` table - Stores video data
- `video_views` table - Tracks student views
- Sample data included

### 3. Admin Component
**File:** `src/AdminVideoManager.tsx`
- Add/Edit video form
- Video list with cards
- Edit, delete, activate/deactivate actions
- Beautiful UI with Tailwind CSS

### 4. Student Component
**File:** `src/StudentVideoSuggestions.tsx`
- Personalized video grid
- Video player modal
- Mark as watched
- Rating system

## Database Schema

### admin_video_suggestions Table
```sql
CREATE TABLE admin_video_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT,
  difficulty_level TEXT CHECK(difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  concepts TEXT, -- JSON array
  domain TEXT NOT NULL,
  category TEXT DEFAULT 'Tutorial',
  tags TEXT, -- JSON array
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1,
  view_count INTEGER DEFAULT 0,
  rating REAL DEFAULT 0
);
```

### video_views Table
```sql
CREATE TABLE video_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  video_id INTEGER NOT NULL,
  watched_duration INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  rating INTEGER,
  feedback TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Integration Steps

### Step 1: Add Database Tables

#### For SQLite (server.ts):
Add to your server.ts file after existing table creation:

```typescript
// Add admin video suggestions tables
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_video_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration TEXT,
    difficulty_level TEXT NOT NULL CHECK(difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    concepts TEXT NOT NULL,
    domain TEXT NOT NULL,
    category TEXT DEFAULT 'Tutorial',
    tags TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    view_count INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    FOREIGN KEY (created_by) REFERENCES staff(id)
  );

  CREATE TABLE IF NOT EXISTS video_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    video_id INTEGER NOT NULL,
    watched_duration INTEGER NOT NULL,
    completed INTEGER DEFAULT 0,
    rating INTEGER,
    feedback TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (video_id) REFERENCES admin_video_suggestions(id)
  );
`);
```

#### For MongoDB (server-mongodb.ts):
Add Mongoose schemas in `backend/mongodb.ts`:

```typescript
const adminVideoSuggestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  video_url: { type: String, required: true },
  thumbnail_url: String,
  duration: String,
  difficulty_level: { 
    type: String, 
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  concepts: [String],
  domain: { type: String, required: true },
  category: { type: String, default: 'Tutorial' },
  tags: [String],
  created_by: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: true },
  view_count: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }
});

export const AdminVideoSuggestion = mongoose.model('AdminVideoSuggestion', adminVideoSuggestionSchema);

const videoViewModel = new mongoose.Schema({
  student_id: { type: String, required: true },
  video_id: { type: String, required: true },
  watched_duration: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  rating: Number,
  feedback: String,
  timestamp: { type: Date, default: Date.now }
});

export const VideoView = mongoose.model('VideoView', videoViewModel);
```

### Step 2: Add API Routes

#### For SQLite (server.ts):
```typescript
import { 
  addVideoSuggestion, 
  getAllVideoSuggestions, 
  getStudentVideoSuggestions,
  updateVideoSuggestion,
  deleteVideoSuggestion,
  trackVideoView,
  getVideoAnalytics
} from './backend/admin-video-suggestions.js';

// Admin routes
app.post('/api/admin/videos', (req, res) => addVideoSuggestion(req, res, db));
app.get('/api/admin/videos', (req, res) => getAllVideoSuggestions(req, res, db));
app.put('/api/admin/videos/:videoId', (req, res) => updateVideoSuggestion(req, res, db));
app.delete('/api/admin/videos/:videoId', (req, res) => deleteVideoSuggestion(req, res, db));
app.get('/api/admin/videos/:videoId/analytics', (req, res) => getVideoAnalytics(req, res, db));

// Student routes
app.get('/api/student/video-suggestions/:studentId', (req, res) => getStudentVideoSuggestions(req, res, db));
app.post('/api/student/track-video-view', (req, res) => trackVideoView(req, res, db));
```

#### For MongoDB (server-mongodb.ts):
```typescript
import { 
  addVideoSuggestion, 
  getAllVideoSuggestions, 
  getStudentVideoSuggestions,
  updateVideoSuggestion,
  deleteVideoSuggestion,
  trackVideoView,
  getVideoAnalytics
} from './backend/admin-video-suggestions.js';

// Pass mongoose connection instead of db
const mongoose = require('mongoose');

app.post('/api/admin/videos', (req, res) => addVideoSuggestion(req, res, mongoose));
app.get('/api/admin/videos', (req, res) => getAllVideoSuggestions(req, res, mongoose));
// ... etc
```

### Step 3: Add Components to App

#### For Admin Dashboard:
In your admin dashboard component, add:

```typescript
import AdminVideoManager from './AdminVideoManager';

// In admin dashboard
{activeTab === 'videos' && (
  <AdminVideoManager adminId={user.id} />
)}
```

#### For Student Dashboard:
In your student dashboard component, add:

```typescript
import StudentVideoSuggestions from './StudentVideoSuggestions';

// In student dashboard
{activeTab === 'videos' && (
  <StudentVideoSuggestions studentId={user.id} />
)}
```

## Usage Examples

### Admin: Add Video

1. Click "Add Video" button
2. Fill in form:
   - Title: "Introduction to Data Structures"
   - Description: "Learn arrays, linked lists, stacks, and queues"
   - Video URL: "https://www.youtube.com/watch?v=..."
   - Difficulty: Beginner
   - Domain: Computer Science
   - Concepts: "Data Structures, Arrays, Linked Lists"
   - Tags: "programming, fundamentals"
3. Click "Add Video"
4. Video appears in list

### Admin: Edit Video

1. Click "Edit" button on video card
2. Update fields
3. Click "Update Video"
4. Changes saved

### Admin: Deactivate Video

1. Click "Deactivate" button
2. Video becomes inactive (students won't see it)
3. Click "Activate" to re-enable

### Student: Watch Video

1. Student sees personalized video recommendations
2. Videos match their weak concepts and skill level
3. Click on video card
4. Video plays in modal
5. Click "Mark as Watched"
6. Video marked as completed

## API Endpoints

### POST /api/admin/videos
Add new video suggestion

**Request:**
```json
{
  "title": "Introduction to Data Structures",
  "description": "Learn the fundamentals...",
  "video_url": "https://www.youtube.com/watch?v=...",
  "thumbnail_url": "https://...",
  "duration": "15:30",
  "difficulty_level": "beginner",
  "concepts": ["Data Structures", "Arrays"],
  "domain": "Computer Science",
  "category": "Tutorial",
  "tags": ["programming", "fundamentals"],
  "created_by": 1
}
```

**Response:**
```json
{
  "success": true,
  "videoId": 1,
  "message": "Video suggestion added successfully"
}
```

### GET /api/admin/videos
Get all video suggestions

**Query Parameters:**
- `domain` - Filter by domain
- `difficulty_level` - Filter by difficulty
- `category` - Filter by category
- `is_active` - Filter by active status

**Response:**
```json
{
  "success": true,
  "videos": [...],
  "total": 10
}
```

### GET /api/student/video-suggestions/:studentId
Get personalized videos for student

**Response:**
```json
{
  "success": true,
  "videos": [...],
  "student": {
    "id": 1,
    "name": "John Doe",
    "domain": "Computer Science",
    "level": "beginner"
  },
  "weakConcepts": ["Data Structures", "Algorithms"],
  "total": 5
}
```

### POST /api/student/track-video-view
Track video view

**Request:**
```json
{
  "studentId": 1,
  "videoId": 1,
  "watchedDuration": 300,
  "completed": true,
  "rating": 5,
  "feedback": "Great video!"
}
```

## How Personalization Works

### 1. Get Student's Weak Concepts
```typescript
// From latest quiz result
const weakConcepts = ['Data Structures', 'Algorithms'];
const level = 'beginner';
```

### 2. Match Videos
```typescript
// Find videos that:
// - Match student's domain
// - Match student's level
// - Cover weak concepts
// - Are active
```

### 3. Prioritize
```typescript
// Sort by:
// 1. Concept match (videos covering weak concepts first)
// 2. Rating (higher rated first)
// 3. View count (popular videos first)
```

### 4. Limit Results
```typescript
// Return top 10 videos
```

## Benefits

### For Admins:
- ✅ Easy to add curated content
- ✅ Control what students see
- ✅ Track video performance
- ✅ Update content anytime

### For Students:
- ✅ Personalized recommendations
- ✅ Relevant to their needs
- ✅ Matched to skill level
- ✅ Easy to watch and track

### For System:
- ✅ Better learning outcomes
- ✅ Increased engagement
- ✅ Data-driven insights
- ✅ Scalable solution

## Testing

### Test 1: Admin Adds Video
```bash
curl -X POST http://localhost:5000/api/admin/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Video",
    "description": "Test description",
    "video_url": "https://www.youtube.com/watch?v=test",
    "difficulty_level": "beginner",
    "concepts": ["Test"],
    "domain": "Computer Science",
    "created_by": 1
  }'
```

### Test 2: Student Gets Suggestions
```bash
curl http://localhost:5000/api/student/video-suggestions/1
```

### Test 3: Track Video View
```bash
curl -X POST http://localhost:5000/api/student/track-video-view \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "videoId": 1,
    "watchedDuration": 300,
    "completed": true
  }'
```

## Summary

This system provides a complete solution for admin-curated video suggestions with personalized recommendations for students based on their learning needs.

**Key Features:**
- ✅ Admin can add/edit/delete videos
- ✅ Students get personalized recommendations
- ✅ Videos matched to weak concepts and skill level
- ✅ Track views and ratings
- ✅ Beautiful UI for both admin and students

**Ready to use!** 🚀
