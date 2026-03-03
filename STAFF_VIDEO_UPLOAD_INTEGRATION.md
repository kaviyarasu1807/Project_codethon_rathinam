# Staff Video Upload - Integration Guide

## Overview
Staff members can now upload and manage educational videos directly from their dashboard.

## Component Created
**File:** `src/StaffVideoUpload.tsx`

### Features:
- ✅ Upload video with YouTube link
- ✅ Add title, description, duration
- ✅ Set difficulty level (beginner, intermediate, advanced)
- ✅ Assign concepts and tags
- ✅ Choose domain and category
- ✅ Edit uploaded videos
- ✅ Delete videos
- ✅ Activate/deactivate videos
- ✅ View statistics (total videos, views, ratings)
- ✅ Beautiful, modern UI with animations

## Integration Steps

### Step 1: Add Backend Endpoint

Add this endpoint to your server file (server.ts or server-mongodb.ts):

```typescript
// Get videos uploaded by specific staff member
app.get('/api/staff/my-videos/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;

    // For SQLite
    if (db.prepare) {
      const videos = db.prepare(`
        SELECT * FROM admin_video_suggestions 
        WHERE created_by = ? 
        ORDER BY created_at DESC
      `).all(staffId);

      // Parse JSON fields
      const parsedVideos = videos.map((v: any) => ({
        ...v,
        concepts: JSON.parse(v.concepts || '[]'),
        tags: JSON.parse(v.tags || '[]')
      }));

      return res.json({
        success: true,
        videos: parsedVideos
      });
    }

    // For MongoDB
    const AdminVideoSuggestionModel = mongoose.model('AdminVideoSuggestion');
    const videos = await AdminVideoSuggestionModel.find({ created_by: staffId })
      .sort({ created_at: -1 });

    return res.json({
      success: true,
      videos
    });

  } catch (error) {
    console.error('Error fetching staff videos:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch videos'
    });
  }
});
```

### Step 2: Update App.tsx (Staff Dashboard)

Find your staff dashboard section in App.tsx and add the video upload tab:

```typescript
import StaffVideoUpload from './StaffVideoUpload';

// In your staff dashboard component
const [activeTab, setActiveTab] = useState('students'); // Add 'videos' as option

// Add tab button
<button
  onClick={() => setActiveTab('videos')}
  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
    activeTab === 'videos'
      ? 'bg-emerald-600 text-white'
      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
  }`}
>
  <Video className="w-5 h-5" />
  Video Upload
</button>

// Add tab content
{activeTab === 'videos' && (
  <StaffVideoUpload 
    staffId={user.id} 
    staffName={user.name}
  />
)}
```

### Step 3: Complete Integration Example

Here's a complete example of how to integrate into your staff dashboard:

```typescript
const StaffDashboard = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-stone-900">
              Staff Dashboard - {user.name}
            </h1>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              activeTab === 'students'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Users className="w-5 h-5" />
            Students
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              activeTab === 'videos'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Video className="w-5 h-5" />
            Video Upload
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'students' && (
          <StudentsList />
        )}

        {activeTab === 'videos' && (
          <StaffVideoUpload 
            staffId={user.id} 
            staffName={user.name}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}
      </div>
    </div>
  );
};
```

## Features Explained

### 1. Upload Form
- **Title**: Video title (required)
- **Description**: What students will learn (required)
- **YouTube URL**: Full YouTube video link (required)
- **Duration**: Video length (optional, e.g., "15:30")
- **Difficulty**: Beginner, Intermediate, or Advanced
- **Domain**: Computer Science, Engineering, Medical, Arts
- **Category**: Tutorial, Explanation, Practice, Project, Review
- **Concepts**: Comma-separated list (e.g., "Data Structures, Arrays")
- **Tags**: Comma-separated keywords (e.g., "programming, fundamentals")

### 2. Statistics Dashboard
Shows at the top:
- **Total Videos**: Number of videos uploaded by staff
- **Active Videos**: Videos currently visible to students
- **Total Views**: Combined views across all videos
- **Average Rating**: Average rating from students

### 3. Video Cards
Each video shows:
- Thumbnail (auto-generated from YouTube)
- Title and description
- Difficulty badge
- Duration
- Concepts (first 3)
- View count and rating
- Edit, Hide/Show, Delete buttons

### 4. Actions
- **Edit**: Modify video details
- **Hide/Show**: Toggle visibility to students
- **Delete**: Remove video permanently

## Auto-Features

### Auto-Thumbnail
When staff pastes a YouTube URL, the system automatically:
1. Extracts the video ID
2. Generates thumbnail URL
3. Fills the thumbnail field

Example:
```
Input: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Auto-generated thumbnail: https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg
```

### Auto-Validation
- Required fields are marked with *
- URL validation for YouTube links
- Concepts must be provided
- Difficulty level must be selected

## UI Features

### Modern Design
- ✅ Gradient stat cards
- ✅ Smooth animations
- ✅ Hover effects
- ✅ Success/error messages
- ✅ Loading states
- ✅ Empty state with call-to-action

### Responsive
- ✅ Mobile-friendly
- ✅ Tablet-optimized
- ✅ Desktop layout

### User Experience
- ✅ Form validation
- ✅ Confirmation dialogs
- ✅ Auto-save indicators
- ✅ Clear feedback messages

## Example Usage

### Staff Uploads Video:
1. Click "Upload Video" button
2. Fill in form:
   - Title: "Introduction to React Hooks"
   - Description: "Learn useState, useEffect, and custom hooks"
   - URL: "https://www.youtube.com/watch?v=..."
   - Difficulty: Intermediate
   - Domain: Computer Science
   - Concepts: "React, Hooks, JavaScript"
   - Tags: "web development, frontend, react"
3. Click "Upload Video"
4. Video appears in grid
5. Students can now see it in their recommendations!

### Staff Edits Video:
1. Click "Edit" button on video card
2. Update fields
3. Click "Update Video"
4. Changes saved

### Staff Hides Video:
1. Click "Hide" button
2. Video becomes inactive
3. Students no longer see it
4. Click "Show" to reactivate

## Testing

### Test 1: Upload Video
```bash
# Staff uploads video
curl -X POST http://localhost:5000/api/admin/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Video",
    "description": "Test description",
    "video_url": "https://www.youtube.com/watch?v=test",
    "difficulty_level": "beginner",
    "concepts": ["Test Concept"],
    "domain": "Computer Science",
    "created_by": 1
  }'
```

### Test 2: Get Staff Videos
```bash
curl http://localhost:5000/api/staff/my-videos/1
```

### Test 3: Update Video
```bash
curl -X PUT http://localhost:5000/api/admin/videos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "is_active": false
  }'
```

## Benefits

### For Staff:
- ✅ Easy to upload videos
- ✅ Manage their own content
- ✅ See video performance
- ✅ Control visibility

### For Students:
- ✅ More learning resources
- ✅ Curated by their teachers
- ✅ Relevant to their courses
- ✅ High-quality content

### For System:
- ✅ Decentralized content creation
- ✅ Staff engagement
- ✅ Better learning outcomes
- ✅ Scalable solution

## Summary

Staff can now:
1. ✅ Upload educational videos
2. ✅ Add detailed information
3. ✅ Manage their videos
4. ✅ Track performance
5. ✅ Help students learn better

**The component is ready to integrate into your staff dashboard!** 🚀
