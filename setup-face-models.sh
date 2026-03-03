#!/bin/bash

# Face-API.js Models Setup Script
# Downloads required models for face detection and recognition

echo "🎭 Setting up face-api.js models..."

# Create models directory
mkdir -p public/models
cd public/models

echo "📥 Downloading models from GitHub..."

# Base URL
BASE_URL="https://github.com/justadudewhohacks/face-api.js/raw/master/weights"

# Download Tiny Face Detector
echo "  - Tiny Face Detector..."
curl -L -o tiny_face_detector_model-weights_manifest.json "$BASE_URL/tiny_face_detector_model-weights_manifest.json"
curl -L -o tiny_face_detector_model-shard1 "$BASE_URL/tiny_face_detector_model-shard1"

# Download Face Landmark 68
echo "  - Face Landmark 68..."
curl -L -o face_landmark_68_model-weights_manifest.json "$BASE_URL/face_landmark_68_model-weights_manifest.json"
curl -L -o face_landmark_68_model-shard1 "$BASE_URL/face_landmark_68_model-shard1"

# Download Face Recognition
echo "  - Face Recognition Model..."
curl -L -o face_recognition_model-weights_manifest.json "$BASE_URL/face_recognition_model-weights_manifest.json"
curl -L -o face_recognition_model-shard1 "$BASE_URL/face_recognition_model-shard1"
curl -L -o face_recognition_model-shard2 "$BASE_URL/face_recognition_model-shard2"

echo "✅ Models downloaded successfully!"
echo ""
echo "📁 Models location: public/models/"
echo ""
echo "Files downloaded:"
ls -lh

cd ../..

echo ""
echo "🎉 Setup complete! You can now use face enrollment."
echo ""
echo "Next steps:"
echo "1. Import FaceEnrollmentFixed component"
echo "2. Start your development server"
echo "3. Test face enrollment"
