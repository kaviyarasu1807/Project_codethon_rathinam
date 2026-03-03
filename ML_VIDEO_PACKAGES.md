# ML & Video Packages Installation Guide

## ✅ Installed Packages

### TensorFlow.js & ML Models
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-node
npm install @tensorflow-models/coco-ssd @tensorflow-models/mobilenet --legacy-peer-deps
```

**Packages Installed**:
- `@tensorflow/tfjs` (v4.22.0) - Core TensorFlow.js library for browser
- `@tensorflow/tfjs-node` (v4.22.0) - TensorFlow.js for Node.js backend
- `@tensorflow-models/coco-ssd` - Object detection model
- `@tensorflow-models/mobilenet` - Image classification model

### Video Players & YouTube Integration
```bash
npm install react-player react-youtube googleapis youtube-search-api react-webcam
```

**Packages Installed**:
- `react-player` - Universal video player for React (supports YouTube, Vimeo, etc.)
- `react-youtube` - Official YouTube player component for React
- `googleapis` - Official Google APIs client library
- `youtube-search-api` - Search YouTube videos programmatically
- `react-webcam` - Webcam component for React

---

## 📦 Package Details

### 1. TensorFlow.js (@tensorflow/tfjs)
**Purpose**: Run machine learning models in the browser

**Use Cases**:
- Image classification
- Object detection
- Pose estimation
- Face recognition
- Custom ML models

**Example**:
```typescript
import * as tf from '@tensorflow/tfjs';

// Create a simple model
const model = tf.sequential({
  layers: [
    tf.layers.dense({ inputShape: [784], units: 128, activation: 'relu' }),
    tf.layers.dense({ units: 10, activation: 'softmax' })
  ]
});

// Make predictions
const prediction = model.predict(tf.tensor2d([[1, 2, 3, 4]]));
```

---

### 2. COCO-SSD (@tensorflow-models/coco-ssd)
**Purpose**: Real-time object detection

**Detects**: 90 common objects (person, car, dog, laptop, etc.)

**Example**:
```typescript
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const detectObjects = async (imageElement: HTMLImageElement) => {
  const model = await cocoSsd.load();
  const predictions = await model.detect(imageElement);
  
  predictions.forEach(prediction => {
    console.log(prediction.class); // e.g., "person"
    console.log(prediction.score); // confidence: 0-1
    console.log(prediction.bbox); // [x, y, width, height]
  });
};
```

---

### 3. MobileNet (@tensorflow-models/mobilenet)
**Purpose**: Image classification

**Classifies**: 1000+ object categories

**Example**:
```typescript
import * as mobilenet from '@tensorflow-models/mobilenet';

const classifyImage = async (imageElement: HTMLImageElement) => {
  const model = await mobilenet.load();
  const predictions = await model.classify(imageElement);
  
  predictions.forEach(prediction => {
    console.log(prediction.className); // e.g., "golden retriever"
    console.log(prediction.probability); // confidence: 0-1
  });
};
```

---

### 4. React Player (react-player)
**Purpose**: Universal video player supporting multiple platforms

**Supports**:
- YouTube
- Vimeo
- Twitch
- Facebook
- Streamable
- Wistia
- DailyMotion
- Mixcloud
- SoundCloud
- File URLs (mp4, webm, ogv, mp3, etc.)

**Example**:
```typescript
import ReactPlayer from 'react-player';

function VideoPlayer() {
  return (
    <ReactPlayer
      url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      controls
      width="100%"
      height="400px"
      playing={false}
      volume={0.8}
      onReady={() => console.log('Player ready')}
      onPlay={() => console.log('Playing')}
      onPause={() => console.log('Paused')}
    />
  );
}
```

---

### 5. React YouTube (react-youtube)
**Purpose**: Official YouTube player component

**Features**:
- Full YouTube API support
- Event handling
- Player controls
- Playlist support

**Example**:
```typescript
import YouTube from 'react-youtube';

function YouTubePlayer() {
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1
    }
  };

  const onReady = (event: any) => {
    event.target.pauseVideo();
  };

  return (
    <YouTube
      videoId="dQw4w9WgXcQ"
      opts={opts}
      onReady={onReady}
      onPlay={() => console.log('Playing')}
      onPause={() => console.log('Paused')}
      onEnd={() => console.log('Ended')}
    />
  );
}
```

---

### 6. Google APIs (googleapis)
**Purpose**: Access Google services (YouTube Data API, etc.)

**Example - YouTube Search**:
```typescript
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: 'YOUR_API_KEY'
});

async function searchVideos(query: string) {
  const response = await youtube.search.list({
    part: ['snippet'],
    q: query,
    maxResults: 10,
    type: ['video']
  });

  return response.data.items;
}
```

---

### 7. YouTube Search API (youtube-search-api)
**Purpose**: Simple YouTube search without API key

**Example**:
```typescript
import YoutubeSearchApi from 'youtube-search-api';

async function searchYouTube(query: string) {
  const results = await YoutubeSearchApi.GetListByKeyword(
    query,
    false, // not playlist
    10,    // max results
    [{ type: 'video' }]
  );

  results.items.forEach(item => {
    console.log(item.title);
    console.log(item.id); // video ID
    console.log(item.thumbnail.url);
  });
}
```

---

### 8. React Webcam (react-webcam)
**Purpose**: Access device camera in React

**Example**:
```typescript
import Webcam from 'react-webcam';
import { useRef } from 'react';

function WebcamCapture() {
  const webcamRef = useRef<Webcam>(null);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    console.log(imageSrc); // base64 image
  };

  return (
    <>
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        width={640}
        height={480}
        videoConstraints={{
          width: 1280,
          height: 720,
          facingMode: "user"
        }}
      />
      <button onClick={capture}>Capture Photo</button>
    </>
  );
}
```

---

## 🎯 Integration Examples

### Example 1: Object Detection with Webcam
```typescript
import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

function ObjectDetector() {
  const webcamRef = useRef<Webcam>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [model, setModel] = useState<any>(null);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const detect = async () => {
    if (model && webcamRef.current) {
      const video = webcamRef.current.video;
      if (video) {
        const predictions = await model.detect(video);
        setDetections(predictions);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(detect, 100);
    return () => clearInterval(interval);
  }, [model]);

  return (
    <div className="relative">
      <Webcam ref={webcamRef} />
      {detections.map((detection, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: detection.bbox[0],
            top: detection.bbox[1],
            width: detection.bbox[2],
            height: detection.bbox[3],
            border: '2px solid red'
          }}
        >
          <span className="bg-red-500 text-white px-2 py-1 text-xs">
            {detection.class} ({Math.round(detection.score * 100)}%)
          </span>
        </div>
      ))}
    </div>
  );
}
```

---

### Example 2: YouTube Video Library
```typescript
import { useState } from 'react';
import ReactPlayer from 'react-player';
import YoutubeSearchApi from 'youtube-search-api';

function VideoLibrary() {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const searchVideos = async () => {
    const results = await YoutubeSearchApi.GetListByKeyword(
      searchQuery,
      false,
      10,
      [{ type: 'video' }]
    );
    setVideos(results.items);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Search */}
      <div className="lg:col-span-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search videos..."
          className="w-full px-4 py-2 border rounded"
        />
        <button onClick={searchVideos} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
          Search
        </button>
      </div>

      {/* Video Player */}
      {selectedVideo && (
        <div className="lg:col-span-2">
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${selectedVideo}`}
            controls
            width="100%"
            height="400px"
          />
        </div>
      )}

      {/* Video List */}
      <div className="lg:col-span-1 space-y-4">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => setSelectedVideo(video.id)}
            className="cursor-pointer p-4 border rounded hover:bg-gray-50"
          >
            <img src={video.thumbnail.url} alt={video.title} className="w-full rounded mb-2" />
            <h3 className="font-bold text-sm">{video.title}</h3>
            <p className="text-xs text-gray-500">{video.channelTitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Example 3: Image Classification
```typescript
import { useState, useRef } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';

function ImageClassifier() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [model, setModel] = useState<any>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await mobilenet.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && model && imageRef.current) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (imageRef.current && event.target?.result) {
          imageRef.current.src = event.target.result as string;
          imageRef.current.onload = async () => {
            const predictions = await model.classify(imageRef.current!);
            setPredictions(predictions);
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6">
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <img ref={imageRef} alt="Upload" className="mt-4 max-w-md" />
      
      {predictions.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Predictions:</h3>
          {predictions.map((pred, idx) => (
            <div key={idx} className="p-2 bg-gray-100 rounded mb-2">
              <span className="font-medium">{pred.className}</span>
              <span className="ml-2 text-gray-600">
                {(pred.probability * 100).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🚀 Use Cases for NeuroPath

### 1. Smart Video Recommendations
- Search educational videos based on weak concepts
- Recommend YouTube tutorials for struggling topics
- Track video watch time and engagement

### 2. Real-Time Proctoring Enhancement
- Object detection to identify cheating (phone, books, etc.)
- Pose estimation to detect unusual body positions
- Multiple person detection

### 3. Interactive Learning
- Image classification for visual learning exercises
- Object detection for interactive quizzes
- Webcam-based engagement tracking

### 4. Content Library
- Curated video library for each concept
- YouTube integration for supplementary materials
- Video progress tracking

---

## 📝 Next Steps

1. **Create Video Library Component** - Browse and watch educational videos
2. **Integrate Object Detection** - Enhance proctoring with object detection
3. **Add Image Classification** - Interactive visual learning exercises
4. **YouTube Search Integration** - Search videos for weak concepts
5. **Video Progress Tracking** - Track which videos students watch

---

## ⚠️ Important Notes

### API Keys Required:
- **YouTube Data API**: Get from Google Cloud Console
- **TensorFlow Models**: No API key needed (runs locally)

### Performance Considerations:
- TensorFlow models can be heavy (10-50MB)
- Load models once and reuse
- Use Web Workers for heavy computations
- Consider lazy loading for better performance

### Browser Compatibility:
- TensorFlow.js: Modern browsers (Chrome, Firefox, Safari, Edge)
- WebRTC (Webcam): Requires HTTPS in production
- YouTube Player: All modern browsers

---

**Status**: ✅ All packages installed successfully
**Ready for**: ML integration, video players, YouTube features
