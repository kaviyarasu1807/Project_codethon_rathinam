# Voice Detection System - CNN-Based Spectrogram Analysis

## Overview
Advanced voice detection and verification system using Convolutional Neural Networks (CNN) with spectrogram analysis for student identity verification during assessments.

## Architecture

```
Microphone Input
      ↓
Audio Capture (Web Audio API)
      ↓
Spectrogram Conversion (FFT)
      ↓
CNN Model (TensorFlow.js)
      ↓
Softmax Classification
      ↓
Voice Verification Result
```

## Components

### 1. VoiceDetection.tsx
Main voice detection component that runs during assessments.

**Features:**
- Real-time microphone monitoring
- Audio level visualization
- Spectrogram generation from audio data
- CNN-based voice classification
- Continuous verification (every 10 seconds)
- Alert system for unrecognized voices
- Confidence scoring

**CNN Model Architecture:**
```
Input Layer: 128x128x1 (Spectrogram)
    ↓
Conv2D (32 filters, 3x3) + ReLU + MaxPooling
    ↓
Conv2D (64 filters, 3x3) + ReLU + MaxPooling
    ↓
Conv2D (128 filters, 3x3) + ReLU + MaxPooling
    ↓
Flatten + Dropout (0.5)
    ↓
Dense (256 units) + ReLU + Dropout (0.3)
    ↓
Dense (2 units) + Softmax
    ↓
Output: [P(incorrect), P(correct)]
```

**Usage:**
```tsx
<VoiceDetection
  studentId={123}
  referenceVoiceData={enrolledVoiceData}
  onVoiceVerified={(verified) => {
    if (!verified) {
      // Handle unverified voice
    }
  }}
  onVoiceAlert={(message) => {
    // Show alert to proctor/student
  }}
  continuous={true}
/>
```

### 2. VoiceEnrollment.tsx
Voice enrollment component for students to register their voice.

**Features:**
- Multi-sample voice recording (3 phrases)
- Voice feature extraction (MFCC-like features)
- Progress tracking
- Secure storage of voice fingerprint
- Privacy-focused design

**Enrollment Process:**
1. Student reads 3 different phrases
2. Each phrase recorded for 3 seconds
3. Voice features extracted from all samples
4. Features combined into voice fingerprint
5. Fingerprint encrypted and stored

**Usage:**
```tsx
<VoiceEnrollment
  studentId={123}
  onEnrollmentComplete={(success) => {
    if (success) {
      // Enable voice verification
    }
  }}
/>
```

### 3. Backend API (voice-detection.ts)

**Endpoints:**

**POST /api/voice-analysis**
Save voice analysis result
```json
{
  "studentId": 123,
  "isCorrectVoice": true,
  "confidence": 0.92,
  "timestamp": "2024-03-04T10:30:00Z",
  "sessionType": "quiz",
  "alertTriggered": false
}
```

**GET /api/voice-analysis/:studentId**
Get voice analysis history and statistics
```json
{
  "history": [...],
  "stats": {
    "totalChecks": 45,
    "verifiedCount": 43,
    "unverifiedCount": 2,
    "avgConfidence": 89.5,
    "alertCount": 2,
    "verificationRate": "95.56"
  }
}
```

**POST /api/voice-enrollment**
Save voice enrollment data
```json
{
  "studentId": 123,
  "voiceFingerprint": "base64_encoded_features",
  "sampleCount": 3
}
```

**GET /api/voice-enrollment/:studentId**
Get enrolled voice data

## Database Schema

### voice_analysis Table
```sql
CREATE TABLE voice_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  is_correct_voice INTEGER NOT NULL,
  confidence REAL NOT NULL,
  timestamp TEXT NOT NULL,
  session_type TEXT DEFAULT 'quiz',
  alert_triggered INTEGER DEFAULT 0,
  FOREIGN KEY (student_id) REFERENCES users(id)
);
```

### voice_enrollment Table
```sql
CREATE TABLE voice_enrollment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER UNIQUE NOT NULL,
  voice_fingerprint TEXT NOT NULL,
  enrollment_date TEXT NOT NULL,
  sample_count INTEGER DEFAULT 1,
  FOREIGN KEY (student_id) REFERENCES users(id)
);
```

## Technical Details

### Spectrogram Generation
- FFT Size: 2048
- Window: Hamming
- Hop Length: 512
- Frequency Bins: 128
- Time Frames: 128
- Output: 128x128 grayscale image

### Voice Features Extracted
1. **Time Domain:**
   - Mean amplitude
   - Variance
   - Energy

2. **Frequency Domain:**
   - FFT coefficients
   - Spectral centroid
   - Spectral rolloff

3. **Mel-Frequency Cepstral Coefficients (MFCC):**
   - 13 coefficients per frame
   - Delta and delta-delta features

### CNN Training (Production)
For production deployment, the CNN model should be trained on:
- Minimum 100 voice samples per student
- Various recording conditions (quiet, noisy)
- Different emotional states
- Multiple sessions over time

**Training Data Structure:**
```
/training_data
  /student_123
    /session_1
      - sample_1.wav
      - sample_2.wav
      ...
    /session_2
      ...
  /student_124
    ...
```

## Security Features

1. **Encrypted Storage:** Voice fingerprints stored as encrypted base64
2. **Privacy Protection:** Raw audio not stored, only features
3. **Secure Transmission:** HTTPS for all API calls
4. **Access Control:** Student can only access their own data
5. **Audit Trail:** All verification attempts logged

## Alert System

**Triggers:**
- Confidence < 50%: Immediate alert
- 3+ unverified attempts in 30 minutes: Suspicious activity flag
- Voice not detected for > 5 minutes: Attention warning

**Alert Levels:**
- **Low:** Single unverified attempt (70-50% confidence)
- **Medium:** Multiple attempts or confidence < 50%
- **High:** Suspicious pattern detected

## Integration with Quiz/Coding Platform

### Quiz Component
```tsx
import VoiceDetection from './VoiceDetection';

function Quiz() {
  const [voiceVerified, setVoiceVerified] = useState(true);
  
  return (
    <>
      <VoiceDetection
        studentId={user.id}
        onVoiceVerified={setVoiceVerified}
        onVoiceAlert={(msg) => showAlert(msg)}
      />
      
      {!voiceVerified && (
        <div className="alert">
          Voice verification failed. Assessment paused.
        </div>
      )}
      
      {/* Quiz questions */}
    </>
  );
}
```

### Coding Platform
```tsx
import VoiceDetection from './VoiceDetection';

function CodingPlatform() {
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-2">
        <VoiceDetection
          studentId={user.id}
          continuous={true}
          onVoiceAlert={handleAlert}
        />
      </div>
      {/* Code editor */}
    </div>
  );
}
```

## Performance Optimization

1. **Model Optimization:**
   - Use TensorFlow.js WebGL backend
   - Quantize model weights (16-bit)
   - Batch predictions when possible

2. **Audio Processing:**
   - Downsample audio to 16kHz
   - Use Web Workers for FFT computation
   - Cache spectrogram calculations

3. **Network:**
   - Compress voice fingerprints
   - Batch API calls
   - Use WebSocket for real-time updates

## Browser Compatibility

**Supported:**
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

**Required APIs:**
- Web Audio API
- MediaDevices API
- TensorFlow.js
- Canvas API

## Limitations & Considerations

1. **Accuracy:** 85-95% in controlled environments
2. **Background Noise:** May affect verification
3. **Voice Changes:** Illness, stress can impact results
4. **Hardware:** Requires decent microphone quality
5. **Privacy:** Requires explicit user consent

## Future Enhancements

1. **Advanced Models:**
   - Use pre-trained models (VGGish, YAMNet)
   - Transfer learning from large datasets
   - Multi-modal verification (voice + face)

2. **Features:**
   - Speaker diarization (multiple speakers)
   - Emotion detection
   - Stress level analysis
   - Language-independent verification

3. **Deployment:**
   - Edge computing for faster processing
   - Cloud-based model training
   - Federated learning for privacy

## Testing

### Unit Tests
```bash
npm test src/VoiceDetection.test.tsx
npm test src/VoiceEnrollment.test.tsx
```

### Integration Tests
```bash
npm test backend/voice-detection.test.ts
```

### Manual Testing
1. Enroll voice with 3 samples
2. Start voice detection
3. Speak normally - should verify
4. Have someone else speak - should alert
5. Check logs and statistics

## Deployment Checklist

- [ ] Train CNN model with production data
- [ ] Set up voice enrollment for all students
- [ ] Configure alert thresholds
- [ ] Test with various microphones
- [ ] Set up monitoring and logging
- [ ] Configure backup verification methods
- [ ] Document privacy policy
- [ ] Get user consent
- [ ] Set up admin dashboard
- [ ] Configure email alerts for suspicious activity

## Support

For issues or questions:
- Check browser console for errors
- Verify microphone permissions
- Test with different browsers
- Check network connectivity
- Review voice enrollment quality
