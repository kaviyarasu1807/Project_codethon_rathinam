# Face Recognition Based Quiz Proctoring System

## Overview
A comprehensive AI-powered proctoring system that uses face recognition to ensure exam integrity. The system continuously monitors students during quizzes and detects various violations.

## Features

### 1. Face Registration (During Sign-up)
- **AI-Powered Face Detection**: Uses face-api.js with TinyFaceDetector
- **128-Dimensional Face Encoding**: Stores unique facial descriptor
- **Visual Feedback**: Shows face detection landmarks during capture
- **Secure Storage**: Face descriptor stored in database

### 2. Face Verification (Before Quiz)
- **Identity Matching**: Compares live face with registered face
- **Euclidean Distance Calculation**: Measures similarity between faces
- **Match Threshold**: 60% similarity required to proceed
- **Visual Indicators**: Shows match score and detection overlay
- **Rejection Handling**: Blocks access if face doesn't match

### 3. Continuous Proctoring (During Quiz)
The system monitors for the following violations:

#### a) Face Not Matching
- **Detection**: Compares live face with registered face every 3 seconds
- **Threshold**: <60% similarity triggers violation
- **Alert**: Red overlay with "FACE NOT MATCHING" warning
- **Action**: Logs violation with screenshot

#### b) No Face Detected
- **Detection**: Monitors if face disappears from frame
- **Timer**: 5-second grace period
- **Alert**: Red overlay with countdown timer
- **Action**: Logs violation after 5 seconds

#### c) Multiple Faces
- **Detection**: Detects if more than one face appears
- **Alert**: Orange overlay with "MULTIPLE FACES" warning
- **Action**: Immediate violation log

#### d) Face Blurred
- **Detection**: Uses Laplacian variance for blur detection
- **Threshold**: Variance <100 indicates blur
- **Alert**: Yellow overlay with "FACE BLURRED" warning
- **Action**: Logs violation with screenshot

### 4. Violation Management
- **Violation Counter**: Shows X/3 violations
- **Screenshot Evidence**: Captures frame when violation occurs
- **Timestamp Logging**: Records exact time of violation
- **Database Storage**: All violations stored with student ID
- **Auto-Submit**: Quiz automatically submitted after 3 violations
- **Alert Banner**: Top banner shows current violation

### 5. Visual Indicators

#### Status Badges
- **ACTIVE**: Camera is running
- **LIVE**: Real-time monitoring active
- **PROCTORING**: AI proctoring enabled
- **VOICE**: Voice detected

#### Violation Overlays
- **Red**: Face not matching / No face detected
- **Orange**: Multiple faces
- **Yellow**: Face blurred

## Technical Implementation

### Face-api.js Models Used
1. **TinyFaceDetector**: Fast face detection
2. **FaceLandmark68Net**: 68-point facial landmarks
3. **FaceRecognitionNet**: 128-dimensional face descriptors
4. **FaceExpressionNet**: Emotion detection (optional)

### Algorithms

#### 1. Face Matching
```typescript
const distance = faceapi.euclideanDistance(storedDescriptor, currentDescriptor);
const similarity = Math.max(0, (1 - distance) * 100);
// Match if similarity >= 60%
```

#### 2. Blur Detection (Laplacian Variance)
```typescript
// Calculate Laplacian operator for each pixel
const laplacian = Math.abs(4 * gray - topGray - bottomGray - leftGray - rightGray);
const variance = sum / count;
// Blurred if variance < 100
```

#### 3. Violation Logging
```typescript
const violation = {
  type: 'FACE_NOT_MATCHING',
  timestamp: Date.now(),
  screenshot: canvas.toDataURL('image/jpeg', 0.8)
};
```

### Performance Optimization
- **Proctoring Interval**: 3 seconds (prevents lag)
- **Lightweight Models**: TinyFaceDetector for speed
- **Canvas Caching**: Reuses canvas for screenshots
- **Async Processing**: Non-blocking violation logging

## Database Schema

### proctoring_violations Table
```sql
CREATE TABLE proctoring_violations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  violation_type TEXT,
  timestamp BIGINT,
  screenshot TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);
```

### Violation Types
- `NO_FACE_DETECTED`: Face disappeared for >5 seconds
- `MULTIPLE_FACES`: More than one face in frame
- `FACE_BLURRED`: Face out of focus
- `FACE_NOT_MATCHING`: Different person detected

## API Endpoints

### POST /api/proctoring/violation
Logs a proctoring violation
```json
{
  "studentId": 1,
  "violationType": "FACE_NOT_MATCHING",
  "timestamp": 1234567890,
  "screenshot": "data:image/jpeg;base64,..."
}
```

### GET /api/proctoring/violations/:studentId
Retrieves all violations for a student
```json
{
  "success": true,
  "violations": [
    {
      "id": 1,
      "student_id": 1,
      "violation_type": "FACE_NOT_MATCHING",
      "timestamp": 1234567890,
      "screenshot": "data:image/jpeg;base64,...",
      "created_at": "2024-01-01 10:00:00"
    }
  ]
}
```

## Setup Instructions

### 1. Install face-api.js Models
Download models and place in `public/models/`:
- tiny_face_detector_model-weights_manifest.json
- face_landmark_68_model-weights_manifest.json
- face_recognition_model-weights_manifest.json

### 2. Install Dependencies
```bash
npm install face-api.js
```

### 3. Camera Permissions
Ensure browser has camera access permissions.

## User Experience

### Registration Flow
1. Student fills registration form
2. Clicks "Next: Face Capture"
3. Camera activates
4. Clicks "Capture Face"
5. AI detects face and shows landmarks
6. Face descriptor saved
7. Registration complete

### Quiz Flow
1. Student starts quiz
2. Face verification screen appears
3. Clicks "Verify Identity"
4. AI matches face with registered face
5. If match ≥60%: Quiz starts with proctoring
6. If match <60%: Access denied
7. During quiz: Continuous monitoring
8. Violations logged and displayed
9. After 3 violations: Auto-submit

## Security Features

1. **Face Descriptor Encryption**: 128-dimensional vector stored securely
2. **Screenshot Evidence**: Visual proof of violations
3. **Timestamp Verification**: Exact time of each violation
4. **Auto-Lock**: Quiz locked after 3 violations
5. **No Bypass**: Cannot proceed without face match

## Benefits

1. **Prevents Impersonation**: Ensures correct student takes exam
2. **Deters Cheating**: Continuous monitoring discourages violations
3. **Evidence Collection**: Screenshots provide proof
4. **Automated Enforcement**: No manual monitoring required
5. **Fair Assessment**: Maintains exam integrity

## Limitations

1. **Lighting Conditions**: Poor lighting may affect detection
2. **Camera Quality**: Low-quality cameras may cause false positives
3. **Model Loading**: Initial load time for AI models
4. **Browser Compatibility**: Requires modern browser with WebRTC
5. **Privacy Concerns**: Face data storage requires consent

## Future Enhancements

1. **Gaze Tracking**: Detect if student looking away
2. **Object Detection**: Identify unauthorized materials
3. **Audio Analysis**: Detect suspicious sounds
4. **Screen Recording**: Record entire session
5. **Live Monitoring**: Real-time staff oversight
6. **Mobile Support**: Proctoring on mobile devices

## Files Modified

- `src/App.tsx`: Added proctoring system to Quiz component
- `server.ts`: Added proctoring violation endpoints
- `FACE_RECOGNITION_PROCTORING.md`: This documentation

## Testing Checklist

- [ ] Face registration captures descriptor
- [ ] Face verification matches correctly
- [ ] No face detection triggers after 5 seconds
- [ ] Multiple faces detected and logged
- [ ] Blur detection works correctly
- [ ] Face mismatch detected and logged
- [ ] Violation counter increments
- [ ] Screenshots captured correctly
- [ ] Auto-submit after 3 violations
- [ ] Violations saved to database
- [ ] Visual overlays display correctly
- [ ] Status badges show correctly

## Conclusion

This comprehensive proctoring system provides robust exam security using AI-powered face recognition. It detects multiple violation types, provides visual feedback, logs evidence, and automatically enforces rules to maintain exam integrity.
