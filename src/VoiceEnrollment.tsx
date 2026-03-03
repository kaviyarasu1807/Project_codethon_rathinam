/**
 * Voice Enrollment Component
 * Allows students to register their voice for verification
 */

import { useState, useRef } from 'react';
import { Mic, MicOff, CheckCircle2, AlertCircle, Loader, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceEnrollmentProps {
  studentId: number;
  onEnrollmentComplete: (success: boolean) => void;
}

export default function VoiceEnrollment({ studentId, onEnrollmentComplete }: VoiceEnrollmentProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStep, setRecordingStep] = useState(0);
  const [samples, setSamples] = useState<Float32Array[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingDataRef = useRef<Float32Array[]>([]);

  const PHRASES = [
    "My name is registered for this assessment",
    "I am the authorized student taking this test",
    "This is my authentic voice for verification"
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      setIsRecording(true);
      setError(null);
      recordingDataRef.current = [];

      // Record for 3 seconds
      captureAudioData();
      
      setTimeout(() => {
        stopRecording();
      }, 3000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setError('Microphone access denied. Please allow microphone permissions.');
    }
  };

  const captureAudioData = () => {
    if (!analyserRef.current || !isRecording) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(dataArray);

    recordingDataRef.current.push(new Float32Array(dataArray));

    if (isRecording) {
      requestAnimationFrame(captureAudioData);
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);

    // Save the recorded sample
    const combinedData = combineAudioData(recordingDataRef.current);
    setSamples(prev => [...prev, combinedData]);
    setRecordingStep(prev => prev + 1);

    // If all samples collected, process enrollment
    if (recordingStep + 1 >= PHRASES.length) {
      processEnrollment([...samples, combinedData]);
    }
  };

  const combineAudioData = (dataArrays: Float32Array[]): Float32Array => {
    const totalLength = dataArrays.reduce((sum, arr) => sum + arr.length, 0);
    const combined = new Float32Array(totalLength);
    
    let offset = 0;
    for (const arr of dataArrays) {
      combined.set(arr, offset);
      offset += arr.length;
    }
    
    return combined;
  };

  const processEnrollment = async (allSamples: Float32Array[]) => {
    setIsProcessing(true);
    
    try {
      // Extract voice features from samples
      const voiceFingerprint = extractVoiceFeatures(allSamples);
      
      // Convert to base64 for storage
      const fingerprintBase64 = arrayToBase64(voiceFingerprint);

      // Save to backend
      const response = await fetch('/api/voice-enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          voiceFingerprint: fingerprintBase64,
          sampleCount: allSamples.length
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save voice enrollment');
      }

      setSuccess(true);
      onEnrollmentComplete(true);
    } catch (err) {
      console.error('Enrollment failed:', err);
      setError('Failed to complete voice enrollment. Please try again.');
      onEnrollmentComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractVoiceFeatures = (samples: Float32Array[]): Float32Array => {
    // Simplified feature extraction - in production, use MFCC or similar
    const features: number[] = [];
    
    for (const sample of samples) {
      // Calculate basic features
      const mean = sample.reduce((a, b) => a + b, 0) / sample.length;
      const variance = sample.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sample.length;
      const energy = sample.reduce((a, b) => a + b * b, 0) / sample.length;
      
      features.push(mean, variance, energy);
      
      // Add frequency domain features (simplified)
      const fft = performSimpleFFT(sample);
      features.push(...fft.slice(0, 10)); // First 10 frequency bins
    }
    
    return new Float32Array(features);
  };

  const performSimpleFFT = (data: Float32Array): number[] => {
    // Simplified FFT - in production, use a proper FFT library
    const result: number[] = [];
    const n = Math.min(data.length, 128);
    
    for (let k = 0; k < n; k++) {
      let real = 0;
      let imag = 0;
      
      for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * k * i) / n;
        real += data[i] * Math.cos(angle);
        imag -= data[i] * Math.sin(angle);
      }
      
      result.push(Math.sqrt(real * real + imag * imag));
    }
    
    return result;
  };

  const arrayToBase64 = (array: Float32Array): string => {
    const bytes = new Uint8Array(array.buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const resetEnrollment = () => {
    setSamples([]);
    setRecordingStep(0);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-3 rounded-xl">
          <Volume2 className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900">Voice Enrollment</h2>
          <p className="text-sm text-stone-500">Register your voice for verification during assessments</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6 text-center"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-emerald-900 mb-2">Enrollment Complete!</h3>
          <p className="text-sm text-emerald-700">
            Your voice has been successfully registered. Voice verification will be active during your assessments.
          </p>
        </motion.div>
      )}

      {/* Enrollment Steps */}
      {!success && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-stone-700">Progress</span>
              <span className="text-sm text-stone-500">{recordingStep} / {PHRASES.length}</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(recordingStep / PHRASES.length) * 100}%` }}
              />
            </div>
          </div>

          {recordingStep < PHRASES.length && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
              <p className="text-xs font-bold text-purple-900 uppercase mb-2">
                Step {recordingStep + 1} of {PHRASES.length}
              </p>
              <p className="text-lg font-bold text-purple-900 mb-4">
                Please read this phrase clearly:
              </p>
              <div className="bg-white border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-center text-stone-900 font-medium leading-relaxed">
                  "{PHRASES[recordingStep]}"
                </p>
              </div>
              
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 text-red-600 mb-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Mic className="w-5 h-5" />
                    </motion.div>
                    <span className="text-sm font-bold">Recording... (3 seconds)</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={startRecording}
                disabled={isRecording || isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
              >
                {isRecording ? (
                  <>
                    <Mic className="w-5 h-5" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </>
                )}
              </button>
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <Loader className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
              <p className="text-sm font-bold text-blue-900">Processing voice samples...</p>
              <p className="text-xs text-blue-700 mt-1">This may take a few moments</p>
            </div>
          )}
        </>
      )}

      {/* Reset Button */}
      {(success || error) && (
        <button
          onClick={resetEnrollment}
          className="w-full bg-stone-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-stone-700 transition-colors"
        >
          Enroll Again
        </button>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong>Privacy Note:</strong> Your voice data is encrypted and stored securely. 
          It will only be used for identity verification during assessments and will not be shared with third parties.
        </p>
      </div>
    </div>
  );
}
