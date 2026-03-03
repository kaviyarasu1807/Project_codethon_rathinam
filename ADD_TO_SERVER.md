# Quick Integration - Add to Server

## Add This Endpoint to Your Server

### For server.ts (SQLite):

```typescript
// Get videos uploaded by specific staff member
app.get('/api/staff/my-videos/:staffId', (req, res) => {
  try {
    const { staffId } = req.params;

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

    res.json({
      success: true,
      videos: parsedVideos
    });

  } catch (error) {
    console.error('Error fetching staff videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch videos'
    });
  }
});
```

### For server-mongodb.ts (MongoDB):

```typescript
// Get videos uploaded by specific staff member
app.get('/api/staff/my-videos/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;

    const videos = await AdminVideoSuggestion.find({ created_by: staffId })
      .sort({ created_at: -1 });

    res.json({
      success: true,
      videos
    });

  } catch (error) {
    console.error('Error fetching staff videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch videos'
    });
  }
});
```

## Add to App.tsx (Staff Dashboard)

### Step 1: Import Component
```typescript
import StaffVideoUpload from './StaffVideoUpload';
import { Video } from 'lucide-react';
```

### Step 2: Add Tab Button
```typescript
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
```

### Step 3: Add Tab Content
```typescript
{activeTab === 'videos' && (
  <StaffVideoUpload 
    staffId={user.id} 
    staffName={user.name}
  />
)}
```

## That's It!

Staff can now upload videos from their dashboard! 🚀
