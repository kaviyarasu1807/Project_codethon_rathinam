# Video Suggestion API - Quick Reference

## Endpoints

### 1. Get All Videos
```
GET /api/admin/videos
```

**Query Parameters (optional):**
- `domain` - Filter by domain
- `difficulty_level` - Filter by difficulty
- `category` - Filter by category
- `is_active` - Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Introduction to Arrays",
      "description": "Learn about arrays",
      "video_url": "https://youtube.com/watch?v=...",
      "thumbnail_url": "https://img.youtube.com/vi/.../maxresdefault.jpg",
      "duration": "15:30",
      "difficulty_level": "beginner",
      "concepts": ["arrays", "data structures"],
      "domain": "Computer Science",
      "category": "Tutorial",
      "tags": ["programming", "basics"],
      "created_by": "507f1f77bcf86cd799439012",
      "created_at": "2024-01-01T00:00:00.000Z",
      "is_active": true,
      "view_count": 150,
      "rating": 4.5
    }
  ],
  "total": 1
}
```

---

### 2. Add New Video
```
POST /api/admin/videos
```

**Request Body:**
```json
{
  "title": "Introduction to Arrays",
  "description": "Learn about arrays and how to use them",
  "video_url": "https://www.youtube.com/watch?v=example",
  "thumbnail_url": "https://img.youtube.com/vi/example/maxresdefault.jpg",
  "duration": "15:30",
  "difficulty_level": "beginner",
  "concepts": ["arrays", "data structures"],
  "domain": "Computer Science",
  "category": "Tutorial",
  "tags": ["programming", "basics"],
  "created_by": 1
}
```

**Required Fields:**
- `title` ✅
- `description` ✅
- `video_url` ✅
- `difficulty_level` ✅ (beginner, intermediate, or advanced)
- `domain` ✅

**Response (201 Created):**
```json
{
  "success": true,
  "videoId": "507f1f77bcf86cd799439011",
  "video": { /* complete video object */ },
  "message": "Video suggestion added successfully"
}
```

**Error Responses:**
- `400` - Missing required fields or invalid data
- `409` - Duplicate video URL
- `503` - Database not connected

---

### 3. Update Video
```
PUT /api/admin/videos/:videoId
```

**Request Body (partial update):**
```json
{
  "title": "Updated Title",
  "is_active": false,
  "rating": 4.8
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "video": { /* updated video object */ },
  "message": "Video suggestion updated successfully"
}
```

**Error Responses:**
- `400` - Invalid video ID format or invalid data
- `404` - Video not found
- `503` - Database not connected

---

### 4. Delete Video
```
DELETE /api/admin/videos/:videoId
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Video suggestion deleted successfully",
  "deletedVideoId": "507f1f77bcf86cd799439011"
}
```

**Error Responses:**
- `400` - Invalid video ID format
- `404` - Video not found
- `503` - Database not connected

---

## Field Specifications

### difficulty_level
- `beginner` - For beginners
- `intermediate` - For intermediate learners
- `advanced` - For advanced learners

### domain
- `Computer Science`
- `Engineering`
- `Medical`
- `Arts`
- (or any custom domain)

### category
- `Tutorial` (default)
- `Explanation`
- `Practice`
- `Project`
- `Review`

### concepts
Array of strings representing concepts covered:
```json
["arrays", "loops", "functions"]
```

### tags
Array of strings for categorization:
```json
["programming", "basics", "beginner-friendly"]
```

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors, invalid data |
| 404 | Not Found | Video doesn't exist |
| 409 | Conflict | Duplicate video URL |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Database not connected |

---

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

### Common Error Messages

**Database Not Connected:**
```json
{
  "success": false,
  "error": "Database not connected. Please check MongoDB connection."
}
```

**Missing Required Fields:**
```json
{
  "success": false,
  "error": "Missing required fields: title, description, video_url, difficulty_level, domain"
}
```

**Invalid Difficulty Level:**
```json
{
  "success": false,
  "error": "Invalid difficulty_level. Must be: beginner, intermediate, or advanced"
}
```

**Invalid Video ID:**
```json
{
  "success": false,
  "error": "Invalid video ID format"
}
```

**Video Not Found:**
```json
{
  "success": false,
  "error": "Video not found"
}
```

---

## Frontend Usage Examples

### Fetch All Videos
```typescript
const fetchVideos = async () => {
  try {
    const res = await fetch('/api/admin/videos');
    const data = await res.json();
    
    if (data.success) {
      setVideos(data.videos);
    } else {
      console.error(data.error);
    }
  } catch (error) {
    console.error('Failed to fetch videos:', error);
  }
};
```

### Add New Video
```typescript
const addVideo = async (videoData) => {
  try {
    const res = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(videoData),
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log('Video added:', data.video);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Failed to add video:', error);
  }
};
```

### Update Video
```typescript
const updateVideo = async (videoId, updates) => {
  try {
    const res = await fetch(`/api/admin/videos/${videoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log('Video updated:', data.video);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Failed to update video:', error);
  }
};
```

### Delete Video
```typescript
const deleteVideo = async (videoId) => {
  try {
    const res = await fetch(`/api/admin/videos/${videoId}`, {
      method: 'DELETE',
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log('Video deleted');
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Failed to delete video:', error);
  }
};
```

---

## cURL Examples

### Get All Videos
```bash
curl http://localhost:5000/api/admin/videos
```

### Get Filtered Videos
```bash
curl "http://localhost:5000/api/admin/videos?domain=Computer%20Science&difficulty_level=beginner"
```

### Add Video
```bash
curl -X POST http://localhost:5000/api/admin/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Video",
    "description": "Test description",
    "video_url": "https://youtube.com/watch?v=test",
    "difficulty_level": "beginner",
    "domain": "Computer Science",
    "concepts": ["testing"],
    "created_by": 1
  }'
```

### Update Video
```bash
curl -X PUT http://localhost:5000/api/admin/videos/VIDEO_ID \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

### Delete Video
```bash
curl -X DELETE http://localhost:5000/api/admin/videos/VIDEO_ID
```

---

## Validation Rules

### Title
- Required ✅
- Must be non-empty string
- Trimmed automatically

### Description
- Required ✅
- Must be non-empty string
- Trimmed automatically

### Video URL
- Required ✅
- Must be valid URL format
- Trimmed automatically
- Must be unique (no duplicates)

### Difficulty Level
- Required ✅
- Must be one of: `beginner`, `intermediate`, `advanced`
- Case-sensitive

### Domain
- Required ✅
- Must be non-empty string
- Trimmed automatically

### Concepts
- Optional
- Must be array of strings
- Empty strings filtered out
- Each concept trimmed

### Tags
- Optional
- Must be array of strings
- Empty strings filtered out
- Each tag trimmed

---

## Tips & Best Practices

1. **Always check `success` field** in response
2. **Handle errors gracefully** with try-catch
3. **Validate data client-side** before sending
4. **Trim user inputs** before submission
5. **Use loading states** during API calls
6. **Show user-friendly error messages**
7. **Log requests/responses** for debugging
8. **Check HTTP status codes** for error types
9. **Refresh data** after successful operations
10. **Handle network errors** (server offline)

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| 503 error | Check MongoDB connection in .env |
| 400 error | Verify all required fields are provided |
| 404 error | Check video ID is correct |
| Empty response | Server may have crashed, check logs |
| Network error | Ensure server is running on port 5000 |
| Validation error | Check field formats match requirements |

---

## Need Help?

- Check server logs for detailed errors
- Use browser console to see request/response
- Verify MongoDB is connected (see server startup logs)
- Test with cURL to isolate frontend issues
- Read VIDEO_API_REWORK_COMPLETE.md for full details
