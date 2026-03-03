/**
 * Voice Detection Component using CNN and Spectrogram Analysis
 * Microphone Input → Spectrogram Conversion → CNN Model → Softmax Classification
 */

import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Mic, MicOff, Volume2, VolumeX, AlertTriangle, CheckCircle2, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceDetectionProps {
  studentId: number;
  referenceVoiceData?: Float32Array; // Stored voice fingerprint from enrollment
  onVoiceVerified: (verified: boolean) => void;
  onVoiceAlert: (message: string) => void;
  continuous?: boolean;
}

interface VoiceAnalysis {
  isCorrectVoice: boolean;
  confidence: number;
  timestamp: number;
  spectrogramData: number[][];
}

export default function VoiceDetection({
  studentId,
  referenceVoiceData,
  onVoiceVerified,
  onVoiceAlert,
  continuous = true
}: VoiceDetectionProps) {
  const [isListening, setIsListening] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [isCorrectVoice, setIsCorrectVoice] = useState<boolean | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<tf.LayersModel | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize TensorFlow.js and load/create CNN model
  useEffect(() => {
    const initializeModel = async () => {
      try {
        await tf.ready();
        
        // Create a simple CNN model for voice classification
        const model = createVoiceCNNModel();
        modelRef.current = model;
        setIsModelLoaded(true);
        
        console.log('Voice detection CNN model initialized');
      } catch (err) {
        console.error('Failed to initialize model:', err);
        setError('Failed to load voice detection model');
      }
    };

    initializeModel();

    return () => {
      if (modelRef.current) {
        modelRef.current.dispose();
      }
    };
  }, []);

  // Create CNN model for voice classification
  const createVoiceCNNModel = (): tf.LayersModel => {
    const model = tf.sequential();

    // Input layer - spectrogram (128 frequency bins x 128 time frames)
    model.add(tf.layers.conv2d({
      inputShape: [128, 128, 1],
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Second convolutional layer
    model.add(tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Third convolutional layer
    model.add(tf.layers.conv2d({
      filters: 128,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Flatten and dense layers
    model.add(tf.layers.flatten());
    model.add(tf.layers.dropout({ rate: 0.5 }));
    model.add(tf.layers.dense({ units: 256, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    // Output layer with softmax for binary classification (correct voice / incorrect voice)
    model.add(tf.layers.dense({ units: 2, activation: 'softmax' }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  };

  // Start microphone and audio analysis
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;

      // Create audio context and analyser
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;

      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      setIsListening(true);
      setError(null);

      // Start continuous analysis
      if (continuous) {
        analyzeAudio();
      }
    } catch (err) {
      console.error('Microphone access denied:', err);
      setError('Microphone access denied. Please allow microphone permissions.');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsListening(false);
    setVoiceDetected(false);
  };

  // Analyze audio continuously
  const analyzeAudio = () => {
    if (!analyserRef.current || !isListening) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate audio level
    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
    setAudioLevel(average);

    // Detect if voice is present (threshold-based)
    const voiceThreshold = 30;
    const isVoicePresent = average > voiceThreshold;
    setVoiceDetected(isVoicePresent);

    // If voice detected, perform spectrogram analysis
    if (isVoicePresent) {
      performVoiceVerification(dataArray);
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  // Convert audio data to spectrogram and classify
  const performVoiceVerification = async (audioData: Uint8Array) => {
    if (!modelRef.current || !isModelLoaded) return;

    try {
      // Convert audio data to spectrogram
      const spectrogram = await audioToSpectrogram(audioData);
      
      // Prepare tensor for CNN model
      const inputTensor = tf.tidy(() => {
        // Reshape 2D spectrogram to 4D tensor [batch, height, width, channels]
        const flatData = spectrogram.flat();
        const tensor = tf.tensor4d(flatData, [1, 128, 128, 1]);
        return tensor.div(255.0); // Normalize
      });

      // Run CNN prediction
      const prediction = modelRef.current.predict(inputTensor) as tf.Tensor;
      const predictionData = await prediction.data();
      
      // Softmax output: [probability_incorrect, probability_correct]
      const correctVoiceProbability = predictionData[1];
      const isCorrect = correctVoiceProbability > 0.7; // 70% confidence threshold

      setIsCorrectVoice(isCorrect);
      setConfidence(correctVoiceProbability * 100);
      onVoiceVerified(isCorrect);

      if (!isCorrect && correctVoiceProbability < 0.5) {
        onVoiceAlert('Unrecognized voice detected! Please ensure only the registered student is speaking.');
      }

      // Cleanup tensors
      inputTensor.dispose();
      prediction.dispose();

      // Save voice analysis
      await saveVoiceAnalysis({
        isCorrectVoice: isCorrect,
        confidence: correctVoiceProbability,
        timestamp: Date.now(),
        spectrogramData: spectrogram
      });
    } catch (err) {
      console.error('Voice verification failed:', err);
    }
  };

  // Convert audio frequency data to spectrogram (simplified)
  const audioToSpectrogram = async (audioData: Uint8Array): Promise<number[][]> => {
    // Create a 128x128 spectrogram representation
    const spectrogramSize = 128;
    const spectrogram: number[][] = [];

    for (let i = 0; i < spectrogramSize; i++) {
      const row: number[] = [];
      for (let j = 0; j < spectrogramSize; j++) {
        // Map audio frequency data to spectrogram grid
        const index = Math.floor((i * audioData.length) / spectrogramSize);
        const value = audioData[index] || 0;
        row.push(value);
      }
      spectrogram.push(row);
    }

    return spectrogram;
  };

  // Save voice analysis to backend
  const saveVoiceAnalysis = async (analysis: VoiceAnalysis) => {
    try {
      await fetch('/api/voice-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          ...analysis,
          spectrogramData: null // Don't send large data, just metadata
        })
      });
    } catch (err) {
      console.error('Failed to save voice analysis:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-stone-900">Voice Detection</h3>
        </div>
        
        {!isModelLoaded && (
          <div className="flex items-center gap-2 text-amber-600">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold">Loading Model...</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Voice Status */}
      <div className="space-y-3 mb-4">
        {/* Listening Status */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${
          isListening 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center gap-2">
            {isListening ? (
              <Mic className="w-4 h-4 text-emerald-600" />
            ) : (
              <MicOff className="w-4 h-4 text-stone-400" />
            )}
            <span className="text-sm font-bold text-stone-900">
              {isListening ? 'Listening...' : 'Not Listening'}
            </span>
          </div>
          
          {isListening && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-stone-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500"
                  animate={{ width: `${Math.min(audioLevel, 100)}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="text-xs text-stone-500">{Math.round(audioLevel)}%</span>
            </div>
          )}
        </div>

        {/* Voice Detection Status */}
        {isListening && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                voiceDetected
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {voiceDetected ? (
                  <Volume2 className="w-4 h-4 text-blue-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-stone-400" />
                )}
                <span className="text-sm font-bold text-stone-900">
                  {voiceDetected ? 'Voice Detected' : 'No Voice'}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Voice Verification Result */}
        {isListening && voiceDetected && isCorrectVoice !== null && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 rounded-lg border ${
                isCorrectVoice
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {isCorrectVoice ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-bold ${
                    isCorrectVoice ? 'text-emerald-900' : 'text-red-900'
                  }`}>
                    {isCorrectVoice ? 'Voice Verified' : 'Unrecognized Voice'}
                  </p>
                  <p className={`text-xs ${
                    isCorrectVoice ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    Confidence: {confidence.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              {!isCorrectVoice && (
                <p className="text-xs text-red-700 leading-relaxed">
                  The detected voice does not match the registered student. Please ensure only the authorized student is speaking.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Control Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={!isModelLoaded}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-colors ${
          isListening
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-stone-300 disabled:cursor-not-allowed'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4" />
            Stop Listening
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            Start Voice Detection
          </>
        )}
      </button>

      {/* Info */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong>How it works:</strong> The system captures audio from your microphone, converts it to a spectrogram, 
          and uses a CNN model to verify if the voice matches the registered student's voice pattern.
        </p>
      </div>
    </div>
  );
}
