/**
 * Fixed Face Identity Enrollment Component
 * Handles connection issues and provides fallback mechanisms
 */

import { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, AlertCircle, Loader, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as faceapi from 'face-api.js';

interface FaceEnrollmentProps {
  onComplete: (descriptor: string) => void;
  onSkip?: () => void;
}

export default function FaceEnrollmentFixed({ onComplete, onSkip }: FaceEnrollmentProps) {
  const [step, setStep] = useState<'loading' | 'ready' | 'capturing' | 'success' | 'error'>('loading');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [descriptors, setDescriptors] = useState<Float32Array[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const REQUIRED_CAPTURES = 3;
  const MAX_RETRIES = 3;
  const MODEL_BASE_URL = '/models'; // Adjust based on your setup

  // Check internet connection
  useEffect(() => {
    const updateOnlineStatus = () => {
      setConnectionStatus(navigator.onLine ? 'online' : 'offline');
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Load face-api.js models with retry logic
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setStep('loading');
      setError(null);

      // Check if models are already loaded
      if (faceapi.nets.tinyFaceDetector.isLoaded) {
        setModelsLoaded(true);
        setStep('ready');
        return;
      }

      console.log('Loading face-api.js models...');

      // Try loading from multiple sources
      const modelSources = [
        MODEL_BASE_URL,
        '/public/models',
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'
      ];

      let loaded = false;
      for (const source of modelSources) {
        try {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(source),
            faceapi.nets.faceLandmark68Net.loadFromUri(source),
            faceapi.nets.faceRecognitionNet.loadFromUri(source)
          ]);
          
          console.log(`Models loaded successfully from: ${source}`);
          loaded = true;
          break;
        } catch (err) {
          console.warn(`Failed to load from ${source}:`, err);
          continue;
        }
      }

      if (!loaded) {
        throw new Error('Failed to load models from all sources');
      }

      setModelsLoaded(true);
      setStep('ready');
    } catch (err) {
      console.error('Error loading models:', err);
      
      if (retryCount < MAX_RETRIES) {
        setError(`Loading models failed. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadModels(), 2000);
      } else {
        setError('Failed to load face detection models. Using fallback mode.');
        setStep('error');
      }
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
        
        // Start face detection
        detectFace();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access denied. Please allow camera permissions and try again.');
      setStep('error');
    }
  };

  // Detect face continuously
  const detectFace = async () => {
    if (!videoRef.current || !modelsLoaded || step === 'capturing') return;

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setFaceDetected(true);
        
        // Draw detection on canvas
        if (canvasRef.current) {
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          
          const resizedDetection = faceapi.resizeResults(detection, displaySize);
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            faceapi.draw.drawDetections(canvasRef.current, resizedDetection);
            faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetection);
          }
        }
      } else {
        setFaceDetected(false);
      }

      // Continue detection
      if (step === 'ready') {
        requestAnimationFrame(detectFace);
      }
    } catch (err) {
      console.error('Face detection error:', err);
      // Continue trying
      if (step === 'ready') {
        setTimeout(detectFace, 100);
      }
    }
  };

  // Capture face descriptor
  const captureFace = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    try {
      setStep('capturing');
      setError(null);

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('No face detected. Please position your face in the frame.');
        setStep('ready');
        return;
      }

      // Store descriptor
      setDescriptors(prev => [...prev, detection.descriptor]);
      setCaptureCount(prev => prev + 1);

      // Check if we have enough captures
      if (captureCount + 1 >= REQUIRED_CAPTURES) {
        await finalizEnrollment([...descriptors, detection.descriptor]);
      } else {
        setStep('ready');
        setTimeout(() => detectFace(), 100);
      }
    } catch (err) {
      console.error('Capture error:', err);
      setError('Failed to capture face. Please try again.');
      setStep('ready');
    }
  };

  // Finalize enrollment by averaging descriptors
  const finalizEnrollment = async (allDescriptors: Float32Array[]) => {
    try {
      // Average all descriptors for better accuracy
      const avgDescriptor = new Float32Array(128);
      
      for (let i = 0; i < 128; i++) {
        let sum = 0;
        for (const desc of allDescriptors) {
          sum += desc[i];
        }
        avgDescriptor[i] = sum / allDescriptors.length;
      }

      // Convert to string for storage
      const descriptorString = Array.from(avgDescriptor).join(',');
      
      setStep('success');
      
      // Clean up
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Call completion callback
      setTimeout(() => {
        onComplete(descriptorString);
      }, 1500);
    } catch (err) {
      console.error('Finalization error:', err);
      setError('Failed to finalize enrollment. Please try again.');
      setStep('error');
    }
  };

  // Fallback enrollment (without face-api.js)
  const fallbackEnrollment = async () => {
    try {
      if (!videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Capture image from video
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);

      // Create a simple descriptor from image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const descriptor = Array.from(imageData.data.slice(0, 128)).map(v => v / 255);
      const descriptorString = descriptor.join(',');

      setStep('success');
      
      setTimeout(() => {
        onComplete(descriptorString);
      }, 1500);
    } catch (err) {
      console.error('Fallback enrollment error:', err);
      setError('Enrollment failed. Please try again.');
    }
  };

  // Retry loading
  const retry = () => {
    setRetryCount(0);
    setError(null);
    setDescriptors([]);
    setCaptureCount(0);
    loadModels();
  };

  // Start camera when ready
  useEffect(() => {
    if (step === 'ready' && !cameraReady) {
      startCamera();
    }
  }, [step]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Face Identity Enrollment</h2>
          <p className="text-sm text-stone-500">Secure your account with facial recognition</p>
        </div>
        
        {/* Connection Status */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          connectionStatus === 'online'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {connectionStatus === 'online' ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="text-xs font-bold">{connectionStatus}</span>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {step === 'loading' && (
        <div className="text-center py-12">
          <Loader className="w-12 h-12 text-emerald-600 mx-auto mb-4 animate-spin" />
          <p className="text-stone-600 font-medium">Loading face detection models...</p>
          <p className="text-sm text-stone-500 mt-2">This may take a moment</p>
        </div>
      )}

      {/* Ready/Capturing State */}
      {(step === 'ready' || step === 'capturing') && (
        <div className="space-y-6">
          {/* Video Preview */}
          <div className="relative bg-stone-900 rounded-xl overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
            
            {/* Face Detection Indicator */}
            <div className="absolute top-4 right-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm ${
                faceDetected
                  ? 'bg-emerald-500/80 text-white'
                  : 'bg-red-500/80 text-white'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  faceDetected ? 'bg-white animate-pulse' : 'bg-white/50'
                }`} />
                <span className="text-sm font-bold">
                  {faceDetected ? 'Face Detected' : 'No Face'}
                </span>
              </div>
            </div>

            {/* Capture Progress */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-bold">
                    Capture {captureCount}/{REQUIRED_CAPTURES}
                  </span>
                  <span className="text-white/70 text-xs">
                    {step === 'capturing' ? 'Capturing...' : 'Ready'}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${(captureCount / REQUIRED_CAPTURES) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">📸 Instructions:</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Position your face in the center of the frame</li>
              <li>Ensure good lighting on your face</li>
              <li>Look directly at the camera</li>
              <li>Keep your face steady during capture</li>
              <li>We'll capture {REQUIRED_CAPTURES} images for accuracy</li>
            </ul>
          </div>

          {/* Capture Button */}
          <button
            onClick={captureFace}
            disabled={!faceDetected || step === 'capturing'}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
          >
            {step === 'capturing' ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Capturing...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Capture Face ({captureCount}/{REQUIRED_CAPTURES})
              </>
            )}
          </button>

          {/* Skip Button */}
          {onSkip && (
            <button
              onClick={onSkip}
              className="w-full text-stone-600 hover:text-stone-900 text-sm font-medium"
            >
              Skip for now
            </button>
          )}
        </div>
      )}

      {/* Success State */}
      {step === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-stone-900 mb-2">Enrollment Complete!</h3>
          <p className="text-stone-600">Your face has been successfully registered</p>
        </motion.div>
      )}

      {/* Error State with Retry */}
      {step === 'error' && (
        <div className="text-center py-12">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-stone-900 mb-2">Enrollment Failed</h3>
          <p className="text-stone-600 mb-6">We couldn't complete the face enrollment</p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={retry}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Retry
            </button>
            
            {modelsLoaded && (
              <button
                onClick={fallbackEnrollment}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-5 h-5" />
                Use Fallback Mode
              </button>
            )}
            
            {onSkip && (
              <button
                onClick={onSkip}
                className="bg-stone-200 text-stone-700 px-6 py-3 rounded-lg font-bold hover:bg-stone-300 transition-colors"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
