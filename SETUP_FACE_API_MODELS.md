# Setup Guide: face-api.js Models

## Quick Setup

### Step 1: Download Models
Download the pre-trained models from the face-api.js repository:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

### Step 2: Required Models
You need these 3 models (download all files for each):

1. **tiny_face_detector**
   - tiny_face_detector_model-weights_manifest.json
   - tiny_face_detector_model-shard1

2. **face_landmark_68**
   - face_landmark_68_model-weights_manifest.json
   - face_landmark_68_model-shard1

3. **face_recognition**
   - face_recognition_model-weights_manifest.json
   - face_recognition_model-shard1

### Step 3: Create Models Folder
```bash
mkdir public/models
```

### Step 4: Place Models
Copy all downloaded model files into `public/models/` folder:
```
public/
  models/
    tiny_face_detector_model-weights_manifest.json
    tiny_face_detector_model-shard1
    face_landmark_68_model-weights_manifest.json
    face_landmark_68_model-shard1
    face_recognition_model-weights_manifest.json
    face_recognition_model-shard1
```

### Step 5: Verify Installation
The models will be automatically loaded when:
- User registers (face capture)
- User starts quiz (face verification)
- Quiz is running (continuous proctoring)

## Alternative: Use CDN (Development Only)
For quick testing, you can load models from CDN by modifying the MODEL_URL:
```typescript
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
```

⚠️ **Warning**: CDN loading is slower and not recommended for production.

## Troubleshooting

### Models Not Loading
**Error**: "Failed to load face-api models"
**Solution**: 
1. Check if `public/models/` folder exists
2. Verify all model files are present
3. Check browser console for specific errors
4. Ensure file names match exactly (case-sensitive)

### CORS Errors
**Error**: "CORS policy blocked"
**Solution**: 
- Models must be served from same origin
- Use `public/` folder (automatically served by Vite)
- Don't use external URLs in production

### Slow Loading
**Issue**: Models take long to load
**Solution**:
- Models are ~6MB total
- First load will be slower
- Browser caches models after first load
- Consider showing loading indicator

## Model Sizes
- tiny_face_detector: ~1.2 MB
- face_landmark_68: ~350 KB
- face_recognition: ~4.2 MB
- **Total**: ~5.75 MB

## Performance Tips

1. **Lazy Loading**: Models load only when needed
2. **Caching**: Browser caches models after first load
3. **Compression**: Enable gzip on server for faster transfer
4. **Preloading**: Load models during registration to cache them

## Testing Models

### Test Face Registration
1. Go to registration page
2. Fill student details
3. Click "Next: Face Capture"
4. Wait for "Models loaded" message
5. Click "Capture Face"
6. Should see face detection box

### Test Face Verification
1. Login as student
2. Start quiz
3. Should see "Models loaded. Starting camera..."
4. Click "Verify Identity"
5. Should see face landmarks drawn

### Test Proctoring
1. Start quiz after verification
2. Look for "PROCTORING" badge on video
3. Try violations:
   - Look away (no face)
   - Have someone else appear (multiple faces)
   - Blur camera (face blurred)

## Production Checklist

- [ ] Models downloaded and placed in `public/models/`
- [ ] All 6 model files present
- [ ] File names match exactly
- [ ] Models load successfully in registration
- [ ] Models load successfully in quiz
- [ ] Face detection works
- [ ] Face matching works
- [ ] Proctoring detects violations
- [ ] Server has gzip compression enabled
- [ ] Models cached by browser

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify model files are accessible at `/models/`
3. Test with different browsers
4. Ensure camera permissions granted
5. Check network tab for failed requests

## References

- face-api.js GitHub: https://github.com/justadudewhohacks/face-api.js
- Models Repository: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
- Documentation: https://justadudewhohacks.github.io/face-api.js/docs/index.html
