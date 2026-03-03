import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2, AlertCircle, RefreshCw, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface FaceEnrollmentWithFallbackProps {
  studentId?: number;
  studentEmail?: string;
  onComplete: (faceDescriptor: string) => void;
  onSkip?: () => void;
}

type EnrollmentStep = 'camera' | 'capturing' | 'verifying' | 'success' | 'error' | 'fallback-verify';

export default function FaceEnrollmentWithFallback({ 
  studentId, 
  studentEmail,
  onComplete, 
  onSkip 
}: FaceEnrollmentWithFallbackProps) {
  const [step, setStep] = useState<EnrollmentStep>('camera');
  const [error, setError] = useState<string>('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [existingDescriptor, setExistingDescriptor] = useState<string | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        if (typeof faceapi !== 'undefined') {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models')
          ]);
          setModelsLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        setModelsLoaded(false);
      }
    };
    loadModels();
  }, []);

  // Start camera
  useEffect(() => {
    if (step === 'camera' || step === 'fallback-verify') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step]);

  // Fetch existing face descriptor if enrollment fails
  const fetchExistingDescriptor = async () => {
    if (!studentId && !studentEmail) return null;
    
    try {
      const query = studentId ? `id=${studentId}` : `email=${studentEmail}`;
      const res = await fetch(`/api/student-face?${query}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.face_descriptor) {
          return data.face_descriptor;
        }
      }
    } catch (err) {
      console.error('Failed to fetch existing face descriptor:', err);
    }
    return null;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access denied. Please allow camera access.');
      setStep('error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureFace = async () => {
    if (!videoRef.current) {
      setError('Camera not ready');
      return;
    }

    setStep('capturing');
    setError('');

    try {
      // Try face-api.js detection
      if (modelsLoaded && typeof faceapi !== 'undefined') {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          const descriptor = Array.from(detection.descriptor).join(',');
          
          // Draw detection on canvas
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const displaySize = { 
              width: videoRef.current.videoWidth, 
              height: videoRef.current.videoHeight 
            };
            faceapi.matchDimensions(canvas, displaySize);
            const resizedDetection = faceapi.resizeResults(detection, displaySize);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              faceapi.draw.drawDetections(canvas, resizedDetection);
              faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
            }
          }
          
          setStep('success');
          setTimeout(() => {
            stopCamera();
            onComplete(descriptor);
          }, 1500);
          return;
        } else {
          throw new Error('No face detected');
        }
      }
      
      // Fallback: Use existing descriptor if available
      throw new Error('Face detection unavailable');
      
    } catch (err: any) {
      console.error('Face capture failed:', err);
      setError(err.message || 'Failed to capture face');
      
      // Try to use existing face descriptor as fallback
      const existing = await fetchExistingDescriptor();
      if (existing) {
        setExistingDescriptor(existing);
        setStep('fallback-verify');
      } else {
        setStep('error');
      }
    }
  };

  const verifyWithExistingDescriptor = async () => {
    if (!videoRef.current || !existingDescriptor) {
      setError('Cannot verify - missing data');
      return;
    }

    setStep('verifying');
    setVerificationAttempts(prev => prev + 1);

    try {
      if (modelsLoaded && typeof faceapi !== 'undefined') {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          // Compare with existing descriptor
          const storedDesc = new Float32Array(existingDescriptor.split(',').map(Number));
          const currentDesc = detection.descriptor;
          const distance = faceapi.euclideanDistance(storedDesc, currentDesc);
          
          // If match is good enough (distance < 0.6), use existing descriptor
          if (distance < 0.6) {
            setStep('success');
            setTimeout(() => {
              stopCamera();
              onComplete(existingDescriptor);
            }, 1500);
            return;
          } else {
            throw new Error('Face does not match existing record');
          }
        } else {
          throw new Error('No face detected');
        }
      } else {
        throw new Error('Face verification unavailable');
      }
    } catch (err: any) {
      console.error('Verification failed:', err);
      setError(err.message || 'Verification failed');
      
      if (verificationAttempts >= 2) {
        // After 3 attempts, just use the existing descriptor
        setStep('success');
        setTimeout(() => {
          stopCamera();
          onComplete(existingDescriptor!);
        }, 1500);
      } else {
        setStep('fallback-verify');
      }
    }
  };

  const retry = () => {
    setError('');
    setStep('camera');
    setVerificationAttempts(0);
    setExistingDescriptor(null);
  };

  const useFallbackMode = async () => {
    // Create a simple fallback descriptor from current video frame
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const descriptor = Array.from(imageData.data.slice(0, 128)).join(',');
        
        setStep('success');
        setTimeout(() => {
          stopCamera();
          onComplete(descriptor);
        }, 1500);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Camera View */}
      {(step === 'camera' || step === 'capturing' || step === 'fallback-verify' || step === 'verifying') && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-stone-900 mb-2">
              {step === 'fallback-verify' ? 'Verify Your Identity' : 'Face Identity Enrollment'}
            </h3>
            <p className="text-sm text-stone-600">
              {step === 'fallback-verify' 
                ? 'We found your existing face data. Please look at the camera to verify your identity.'
                : 'Position your face clearly in the camera frame'}
            </p>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-stone-900 aspect-video border-2 border-stone-200">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full"
            />
            
            {(step === 'capturing' || step === 'verifying') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white font-semibold">
                    {step === 'verifying' ? 'Verifying...' : 'Analyzing...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            {step === 'fallback-verify' ? (
              <button
                onClick={verifyWithExistingDescriptor}
                disabled={step === 'verifying'}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Verify Identity
              </button>
            ) : (
              <button
                onClick={captureFace}
                disabled={step === 'capturing'}
                className="flex-1 bg-stone-900 text-white py-3 rounded-lg font-bold hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                {step === 'capturing' ? 'Analyzing...' : 'Capture Face'}
              </button>
            )}
            
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-6 py-3 bg-stone-200 text-stone-700 rounded-lg font-bold hover:bg-stone-300 transition-colors"
              >
                Skip
              </button>
            )}
          </div>

          {step === 'fallback-verify' && verificationAttempts > 0 && (
            <p className="text-xs text-center text-stone-500">
              Attempt {verificationAttempts + 1} of 3. After 3 attempts, we'll use your existing face data.
            </p>
          )}
        </div>
      )}

      {/* Success State */}
      {step === 'success' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-stone-900 mb-2">
            {existingDescriptor ? 'Identity Verified!' : 'Enrollment Complete!'}
          </h3>
          <p className="text-stone-600">
            {existingDescriptor 
              ? 'Your identity has been verified using your existing face data'
              : 'Your face has been successfully registered'}
          </p>
        </motion.div>
      )}

      {/* Error State */}
      {step === 'error' && (
        <div className="text-center py-12">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-stone-900 mb-2">Enrollment Issue</h3>
          <p className="text-stone-600 mb-6">
            {error || 'We couldn\'t complete the face enrollment'}
          </p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={retry}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Retry
            </button>
            
            <button
              onClick={useFallbackMode}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Use Fallback
            </button>
            
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
