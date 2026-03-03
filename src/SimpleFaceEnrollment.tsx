/**
 * Simple Face Enrollment - No External Dependencies
 * Works without face-api.js models - uses pure image capture
 */

import { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, AlertCircle, Loader, RefreshCw, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SimpleFaceEnrollmentProps {
  onComplete: (imageData: string) => void;
  onSkip?: () => void;
}

export default function SimpleFaceEnrollment({ onComplete, onSkip }: SimpleFaceEnrollmentProps) {
  const [step, setStep] = useState<'ready' | 'capturing' | 'success' | 'error'>('ready');
  const [cameraReady, setCameraReady] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const REQUIRED_CAPTURES = 3;

  // Start camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request camera with optimal settings
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
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is being used by another application. Please close other apps and try again.');
      } else {
        setError('Failed to access camera. Please check your camera and try again.');
      }
      
      setStep('error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setStep('capturing');
      setError(null);

      // Countdown before capture
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Store captured image
      setCapturedImages(prev => [...prev, imageData]);
      setCaptureCount(prev => prev + 1);

      // Check if we have enough captures
      if (captureCount + 1 >= REQUIRED_CAPTURES) {
        await finalizeEnrollment([...capturedImages, imageData]);
      } else {
        setStep('ready');
      }
    } catch (err) {
      console.error('Capture error:', err);
      setError('Failed to capture image. Please try again.');
      setStep('error');
    }
  };

  const finalizeEnrollment = async (images: string[]) => {
    try {
      // Create a composite descriptor from all images
      const descriptor = {
        images: images,
        timestamp: new Date().toISOString(),
        captureCount: images.length
      };

      // Convert to JSON string for storage
      const descriptorString = JSON.stringify(descriptor);

      setStep('success');
      
      // Clean up camera
      stopCamera();

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

  const retry = () => {
    setError(null);
    setCaptureCount(0);
    setCapturedImages([]);
    setStep('ready');
    startCamera();
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-3 rounded-xl">
          <User className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Face Identity Enrollment</h2>
          <p className="text-sm text-stone-500">Capture your photo for identity verification</p>
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
              className="hidden"
            />
            
            {/* Camera Status */}
            <div className="absolute top-4 right-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm ${
                cameraReady
                  ? 'bg-emerald-500/80 text-white'
                  : 'bg-amber-500/80 text-white'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  cameraReady ? 'bg-white animate-pulse' : 'bg-white/50'
                }`} />
                <span className="text-sm font-bold">
                  {cameraReady ? 'Camera Ready' : 'Starting Camera...'}
                </span>
              </div>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-white text-9xl font-bold"
                >
                  {countdown}
                </motion.div>
              </div>
            )}

            {/* Capture Progress */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-bold">
                    Photo {captureCount}/{REQUIRED_CAPTURES}
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

            {/* Face Guide Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-80 border-4 border-white/30 rounded-full" />
            </div>
          </div>

          {/* Captured Images Preview */}
          {capturedImages.length > 0 && (
            <div className="flex gap-3 justify-center">
              {capturedImages.map((img, i) => (
                <div key={i} className="relative">
                  <img 
                    src={img} 
                    alt={`Capture ${i + 1}`}
                    className="w-20 h-20 rounded-lg object-cover border-2 border-emerald-500"
                  />
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">📸 Instructions:</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Position your face in the center oval guide</li>
              <li>Ensure good lighting on your face</li>
              <li>Look directly at the camera</li>
              <li>Remove glasses if possible</li>
              <li>We'll capture {REQUIRED_CAPTURES} photos with a 3-second countdown</li>
            </ul>
          </div>

          {/* Capture Button */}
          <button
            onClick={captureImage}
            disabled={!cameraReady || step === 'capturing'}
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
                Capture Photo ({captureCount}/{REQUIRED_CAPTURES})
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
          <p className="text-stone-600">Your photos have been successfully captured</p>
          
          {/* Show captured images */}
          <div className="flex gap-3 justify-center mt-6">
            {capturedImages.map((img, i) => (
              <img 
                key={i}
                src={img} 
                alt={`Capture ${i + 1}`}
                className="w-24 h-24 rounded-lg object-cover border-2 border-emerald-500"
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Error State with Retry */}
      {step === 'error' && (
        <div className="text-center py-12">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-stone-900 mb-2">Enrollment Failed</h3>
          <p className="text-stone-600 mb-6 max-w-md mx-auto">{error || 'Something went wrong'}</p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={retry}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
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

          {/* Troubleshooting Tips */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-left max-w-md mx-auto">
            <p className="text-sm font-bold text-amber-900 mb-2">💡 Troubleshooting Tips:</p>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Check browser camera permissions</li>
              <li>Close other apps using the camera</li>
              <li>Try a different browser (Chrome recommended)</li>
              <li>Ensure you're using HTTPS</li>
              <li>Restart your browser</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
