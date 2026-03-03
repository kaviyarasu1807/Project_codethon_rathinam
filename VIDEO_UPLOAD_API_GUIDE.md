# Video Upload API - Complete Guide

## Overview

This API allows admins to upload actual video files (not just YouTube links) to the server. Videos are stored locally and can be streamed to users.

## Installation

First, install the required package:

```bash
npm install multer
npm install --save-dev @types/multer
```

## API Endpoints

### 1. Upload Video

**Endpoint:** `POST /api/videos/upload`

**Content-Type:** `multipart/form-data`

**Request:**
```javascript
const formData = new FormData();
formData.append('video', videoFile); // File object from input

fetch('/api/videos/upload', {
  method: 'POST',
  body: formData
})
```

**Response:**
```json
{
  "success": true,
  "video": {
    "filename": "my-video-1234567890.mp4",
    "originalName": "my-video.mp4",
    "size": 52428800,
    "mimeType": "video/mp4",
    "videoUrl": "/api/videos/stream/my-video-1234567890.mp4",
    "thumbnailUrl": "/api/videos/thumbnail/my-video-1234567890.mp4",
    "path": "/uploads/videos/my-video-1234567890.mp4"
  },
  "message": "Video uploaded successfully"
}
```

**Supported Formats:**
- MP4 (video/mp4)
- MPEG (video/mpeg)
- QuickTime (video/quicktime)
- AVI (video/x-msvideo)
- FLV (video/x-flv)
- WebM (video/webm)
- MKV (video/x-matroska)

**File Size Limit:** 500MB

### 2. Stream Video

**Endpoint:** `GET /api/videos/stream/:filename`

**Description:** Streams video with support for range requests (seeking)

**Usage:**
```html
<video controls>
  <source src="/api/videos/stream/my-video-1234567890.mp4" type="video/mp4">
</video>
```

**Response:** Video stream with proper headers for seeking

### 3. Get Video Thumbnail

**Endpoint:** `GET /api/videos/thumbnail/:filename`

**Description:** Returns video thumbnail (placeholder for now)

**Usage:**
```html
<img src="/api/videos/thumbnail/my-video-1234567890.mp4" alt="Video thumbnail">
```

**Note:** Currently returns placeholder. Implement ffmpeg for production.

### 4. Delete Video

**Endpoint:** `DELETE /api/videos/:filename`

**Description:** Deletes video file and thumbnail

**Request:**
```javascript
fetch('/api/videos/my-video-1234567890.mp4', {
  method: 'DELETE'
})
```

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

### 5. List All Videos

**Endpoint:** `GET /api/videos/list`

**Description:** Returns list of all uploaded videos

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "filename": "video1-1234567890.mp4",
      "size": 52428800,
      "uploadedAt": "2024-01-15T10:30:00.000Z",
      "videoUrl": "/api/videos/stream/video1-1234567890.mp4",
      "thumbnailUrl": "/api/videos/thumbnail/video1-1234567890.mp4"
    }
  ],
  "total": 1
}
```

### 6. Get Video Metadata

**Endpoint:** `GET /api/videos/metadata/:filename`

**Description:** Returns detailed metadata for a video

**Response:**
```json
{
  "success": true,
  "metadata": {
    "filename": "my-video-1234567890.mp4",
    "size": 52428800,
    "sizeFormatted": "50.00 MB",
    "uploadedAt": "2024-01-15T10:30:00.000Z",
    "modifiedAt": "2024-01-15T10:30:00.000Z",
    "videoUrl": "/api/videos/stream/my-video-1234567890.mp4",
    "thumbnailUrl": "/api/videos/thumbnail/my-video-1234567890.mp4"
  }
}
```

## Frontend Integration

### React Component Example

```typescript
import React, { useState } from 'react';

export default function VideoUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);

    try {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setVideoUrl(response.video.videoUrl);
          alert('Video uploaded successfully!');
        }
      });

      xhr.open('POST', '/api/videos/upload');
      xhr.send(formData);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      
      {uploading && (
        <div>
          <p>Uploading: {progress.toFixed(0)}%</p>
          <progress value={progress} max="100" />
        </div>
      )}

      {videoUrl && (
        <video controls width="640">
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
```

### With Fetch API

```typescript
const uploadVideo = async (file: File) => {
  const formData = new FormData();
  formData.append('video', file);

  const response = await fetch('/api/videos/upload', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Video URL:', data.video.videoUrl);
    return data.video;
  } else {
    throw new Error(data.error);
  }
};
```

## Error Handling

### Common Errors

**1. File Too Large**
```json
{
  "success": false,
  "error": "File too large. Maximum size is 500MB."
}
```

**2. Invalid File Type**
```json
{
  "success": false,
  "error": "Invalid file type. Only video files are allowed."
}
```

**3. No File Uploaded**
```json
{
  "success": false,
  "error": "No video file uploaded"
}
```

**4. Video Not Found**
```json
{
  "success": false,
  "error": "Video not found"
}
```

## Storage Structure

Videos are stored in:
```
project-root/
├── uploads/
│   ├── videos/
│   │   ├── video1-1234567890.mp4
│   │   ├── video2-9876543210.mp4
│   │   └── ...
│   └── thumbnails/
│       ├── video1-1234567890.mp4.jpg
│       ├── video2-9876543210.mp4.jpg
│       └── ...
```

## Security Considerations

### 1. File Type Validation
- Only video MIME types are allowed
- File extension is preserved

### 2. File Size Limit
- Maximum 500MB per file
- Configurable in `backend/video-upload.ts`

### 3. Unique Filenames
- Timestamp + random string prevents collisions
- Original filename is preserved in metadata

### 4. Access Control
- Add authentication middleware to upload endpoint
- Restrict to admin users only

**Example:**
```typescript
// In server-mongodb.ts
app.post("/api/videos/upload", 
  authenticateAdmin,  // Add this middleware
  videoUpload.single('video'), 
  uploadVideo, 
  handleMulterError
);
```

## Production Enhancements

### 1. Thumbnail Generation with FFmpeg

Install ffmpeg:
```bash
npm install fluent-ffmpeg
npm install --save-dev @types/fluent-ffmpeg
```

Update `getVideoThumbnail` function:
```typescript
import ffmpeg from 'fluent-ffmpeg';

export async function getVideoThumbnail(req: Request, res: Response) {
  const { filename } = req.params;
  const videoPath = path.join(process.cwd(), 'uploads', 'videos', filename);
  const thumbnailDir = path.join(process.cwd(), 'uploads', 'thumbnails');
  const thumbnailPath = path.join(thumbnailDir, `${filename}.jpg`);

  if (fs.existsSync(thumbnailPath)) {
    return res.sendFile(thumbnailPath);
  }

  // Create thumbnails directory
  if (!fs.existsSync(thumbnailDir)) {
    fs.mkdirSync(thumbnailDir, { recursive: true });
  }

  // Generate thumbnail
  ffmpeg(videoPath)
    .screenshots({
      timestamps: ['00:00:01'],
      filename: `${filename}.jpg`,
      folder: thumbnailDir,
      size: '320x240'
    })
    .on('end', () => {
      res.sendFile(thumbnailPath);
    })
    .on('error', (err) => {
      console.error('Thumbnail generation error:', err);
      res.status(500).json({ error: 'Failed to generate thumbnail' });
    });
}
```

### 2. Cloud Storage (AWS S3, Google Cloud Storage)

For production, consider using cloud storage:

```typescript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export async function uploadToS3(file: Express.Multer.File) {
  const params = {
    Bucket: 'your-bucket-name',
    Key: file.filename,
    Body: fs.createReadStream(file.path),
    ContentType: file.mimetype
  };

  return s3.upload(params).promise();
}
```

### 3. Video Transcoding

Convert videos to multiple formats/qualities:

```typescript
import ffmpeg from 'fluent-ffmpeg';

export async function transcodeVideo(inputPath: string, outputPath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .size('1280x720')
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
```

### 4. Progress Tracking

Store upload progress in database:

```typescript
// MongoDB schema
const uploadProgressSchema = new mongoose.Schema({
  filename: String,
  userId: ObjectId,
  progress: Number,
  status: String,
  createdAt: Date
});
```

## Testing

### Test Upload with cURL

```bash
curl -X POST \
  -F "video=@/path/to/video.mp4" \
  http://localhost:5000/api/videos/upload
```

### Test Streaming

```bash
curl -I http://localhost:5000/api/videos/stream/video-1234567890.mp4
```

### Test Delete

```bash
curl -X DELETE http://localhost:5000/api/videos/video-1234567890.mp4
```

## Monitoring

### Disk Space

Monitor available disk space:

```typescript
import { exec } from 'child_process';

export function checkDiskSpace() {
  exec('df -h', (error, stdout) => {
    if (error) {
      console.error('Error checking disk space:', error);
      return;
    }
    console.log('Disk space:', stdout);
  });
}
```

### Upload Statistics

Track upload metrics:
- Total uploads
- Total storage used
- Average file size
- Upload success rate

## Troubleshooting

### Issue: "ENOENT: no such file or directory"
**Solution:** Create uploads directory manually:
```bash
mkdir -p uploads/videos uploads/thumbnails
```

### Issue: "File too large"
**Solution:** Increase limit in `backend/video-upload.ts`:
```typescript
limits: {
  fileSize: 1000 * 1024 * 1024, // 1GB
}
```

### Issue: "Cannot read property 'file' of undefined"
**Solution:** Ensure Content-Type is multipart/form-data

### Issue: Video won't play in browser
**Solution:** Check video codec compatibility. Use H.264 for best compatibility.

## Next Steps

1. ✅ Install multer: `npm install multer @types/multer`
2. ✅ Create uploads directory
3. ✅ Test upload endpoint
4. ✅ Integrate with admin dashboard
5. ⚠️ Add authentication middleware
6. ⚠️ Implement thumbnail generation (ffmpeg)
7. ⚠️ Consider cloud storage for production
8. ⚠️ Add video transcoding
9. ⚠️ Implement progress tracking
10. ⚠️ Set up monitoring

## Status

✅ Backend API complete
✅ File upload working
✅ Video streaming working
✅ File management working
⚠️ Thumbnail generation (placeholder)
⚠️ Authentication (needs implementation)
⚠️ Cloud storage (optional)

Ready to use for local development!
