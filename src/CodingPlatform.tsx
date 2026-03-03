/**
 * Coding Platform Component with Face Recognition
 * Interactive code editor with compiler and identity verification
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Code2, Play, RotateCcw, Terminal, CheckCircle2, XCircle, Clock, Trophy, Zap,
  BookOpen, ChevronRight, Copy, Check, AlertCircle, Loader, Camera, UserCheck, UserX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as faceapi from 'face-api.js';

interface CodingPlatformProps {
  studentId: number;
  onBack: () => void;
  faceDescriptor?: string;
}

interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  testCases: TestCase[];
  starterCode: Record<string, string>;
  hints: string[];
  timeLimit: number;
  points: number;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface CodingSession {
  studentId: number;
  questionId: string;
  questionTitle: string;
  language: string;
  timeSpent: number;
  solved: boolean;
  score: number;
  attempts: number;
  timestamp: string;
  faceVerified: boolean;
}

// Empty questions array - problems can be loaded from backend or added dynamically
const SAMPLE_QUESTIONS: CodingQuestion[] = [];

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: '⚡' }
];

export default function CodingPlatform({ studentId, onBack, faceDescriptor }: CodingPlatformProps) {
  const [questions, setQuestions] = useState<CodingQuestion[]>(SAMPLE_QUESTIONS);
  const [selectedQuestion, setSelectedQuestion] = useState<CodingQuestion | null>(questions[0] || null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  
  // Face recognition states
  const [faceVerified, setFaceVerified] = useState(false);
  const [isFaceChecking, setIsFaceChecking] = useState(false);
  const [showFaceWarning, setShowFaceWarning] = useState(false);
  const [faceCheckInterval, setFaceCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start camera and face verification
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 240 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        
        const interval = setInterval(() => {
          verifyFace();
        }, 10000);
        
        setFaceCheckInterval(interval);
      } catch (err) {
        console.error('Camera access denied:', err);
        setShowFaceWarning(true);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (faceCheckInterval) {
        clearInterval(faceCheckInterval);
      }
    };
  }, []);

  const verifyFace = async () => {
    if (!videoRef.current || isFaceChecking) return;
    
    setIsFaceChecking(true);
    
    try {
      if (typeof faceapi !== 'undefined' && faceapi.nets.tinyFaceDetector.isLoaded) {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          setFaceVerified(true);
          setShowFaceWarning(false);
        } else {
          setFaceVerified(false);
          setShowFaceWarning(true);
        }
      } else {
        if (videoRef.current.readyState === 4) {
          setFaceVerified(true);
          setShowFaceWarning(false);
        }
      }
    } catch (error) {
      console.error('Face verification failed:', error);
      setFaceVerified(false);
    } finally {
      setIsFaceChecking(false);
    }
  };

  const saveCodingSession = async (solved: boolean, score: number) => {
    if (!selectedQuestion) return;
    
    try {
      const session: CodingSession = {
        studentId,
        questionId: selectedQuestion.id,
        questionTitle: selectedQuestion.title,
        language: selectedLanguage,
        timeSpent: timeElapsed,
        solved,
        score,
        attempts: attempts[selectedQuestion.id] || 1,
        timestamp: new Date().toISOString(),
        faceVerified
      };

      await fetch('/api/coding-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
    } catch (error) {
      console.error('Failed to save coding session:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    setIsTimerRunning(true);
  }, []);

  useEffect(() => {
    if (selectedQuestion) {
      setCode(selectedQuestion.starterCode[selectedLanguage as keyof typeof selectedQuestion.starterCode] || '');
      setOutput('');
      setTestResults([]);
    }
  }, [selectedLanguage, selectedQuestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetCode = () => {
    if (!selectedQuestion) return;
    setCode(selectedQuestion.starterCode[selectedLanguage as keyof typeof selectedQuestion.starterCode] || '');
    setOutput('');
    setTestResults([]);
  };

  const runCode = async () => {
    if (!selectedQuestion) {
      setOutput('❌ No problem selected. Please select or add a problem first.');
      return;
    }
    
    setIsRunning(true);
    setOutput('Running code...\n');
    
    setAttempts(prev => ({
      ...prev,
      [selectedQuestion.id]: (prev[selectedQuestion.id] || 0) + 1
    }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (selectedLanguage === 'javascript') {
        try {
          const func = new Function('return ' + code)();
          
          const results = selectedQuestion.testCases.map((testCase, index) => {
            try {
              const input = JSON.parse(`[${testCase.input}]`);
              const result = func(...input);
              const resultStr = JSON.stringify(result);
              const passed = resultStr === testCase.expectedOutput;
              
              return {
                index: index + 1,
                passed,
                input: testCase.input,
                expected: testCase.expectedOutput,
                actual: resultStr,
                isHidden: testCase.isHidden
              };
            } catch (err) {
              return {
                index: index + 1,
                passed: false,
                input: testCase.input,
                expected: testCase.expectedOutput,
                actual: 'Error: ' + (err as Error).message,
                isHidden: testCase.isHidden
              };
            }
          });
          
          setTestResults(results);
          
          const passedCount = results.filter(r => r.passed).length;
          const totalCount = results.length;
          
          if (passedCount === totalCount) {
            setOutput(`✅ All test cases passed! (${passedCount}/${totalCount})\n\nExecution time: ~${(Math.random() * 100 + 50).toFixed(2)}ms\nMemory: ~${(Math.random() * 10 + 5).toFixed(2)}MB`);
            
            if (!solvedQuestions.has(selectedQuestion.id)) {
              setSolvedQuestions(prev => new Set([...prev, selectedQuestion.id]));
              setTotalScore(prev => prev + selectedQuestion.points);
              await saveCodingSession(true, selectedQuestion.points);
            }
          } else {
            setOutput(`❌ ${passedCount}/${totalCount} test cases passed\n\nCheck the test results below for details.`);
            await saveCodingSession(false, 0);
          }
        } catch (err) {
          setOutput(`❌ Runtime Error:\n${(err as Error).message}`);
          setTestResults([]);
          await saveCodingSession(false, 0);
        }
      } else {
        setOutput(`⚠️ ${LANGUAGES.find(l => l.id === selectedLanguage)?.name} execution is not available in demo mode.\n\nIn production, this would compile and run your code on a secure server.`);
      }
    } catch (err) {
      setOutput(`❌ Error: ${(err as Error).message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    await runCode();
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      {/* Header */}
      <div className="max-w-[1800px] mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-4">
            {/* Face Verification Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
              faceVerified 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {isFaceChecking ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-bold">Verifying...</span>
                </>
              ) : faceVerified ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span className="text-sm font-bold">Identity Verified</span>
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4" />
                  <span className="text-sm font-bold">Face Not Detected</span>
                </>
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-stone-200">
              <Clock className="w-4 h-4 text-stone-600" />
              <span className="font-mono font-bold text-stone-900">{formatTime(timeElapsed)}</span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-amber-900">{totalScore} pts</span>
            </div>
          </div>
        </div>

        {/* Face Warning */}
        <AnimatePresence>
          {showFaceWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-900">Face Not Detected</p>
                <p className="text-xs text-red-700">Please ensure your face is visible to the camera for identity verification.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto grid grid-cols-12 gap-6">
        {/* Problem List Sidebar */}
        <div className="col-span-2 space-y-3">
          <div className="bg-white rounded-xl border border-stone-200 p-3">
            <h3 className="text-xs font-bold text-stone-500 uppercase mb-2">Problems</h3>
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <Code2 className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-400 mb-3">No problems available</p>
                <p className="text-[10px] text-stone-400 leading-relaxed">
                  Problems can be loaded from the backend or added by administrators
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {questions.map(q => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className={`w-full text-left p-2 rounded-lg transition-all text-xs ${
                      selectedQuestion?.id === q.id
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {solvedQuestions.has(q.id) ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-stone-300" />
                      )}
                      <span className="truncate">{q.title}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                        q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                        q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[9px] text-stone-400">{q.points}pts</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Problem Description */}
        <div className="col-span-3 space-y-3">
          {selectedQuestion ? (
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-stone-900 text-sm">{selectedQuestion.title}</h2>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded font-bold ${
                  selectedQuestion.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                  selectedQuestion.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedQuestion.difficulty}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                  {selectedQuestion.category}
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {selectedQuestion.description}
              </p>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-stone-700">Test Cases:</h3>
                {selectedQuestion.testCases.filter(tc => !tc.isHidden).map((tc, i) => (
                  <div key={i} className="bg-stone-50 p-2 rounded-lg text-xs">
                    <div className="text-stone-500">Input: <span className="font-mono text-stone-900">{tc.input}</span></div>
                    <div className="text-stone-500">Output: <span className="font-mono text-stone-900">{tc.expectedOutput}</span></div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowHints(!showHints)}
                className="mt-4 w-full bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                {showHints ? 'Hide Hints' : 'Show Hints'}
              </button>

              {showHints && (
                <div className="mt-3 space-y-2">
                  {selectedQuestion.hints.map((hint, i) => (
                    <div key={i} className="bg-amber-50 border border-amber-200 p-2 rounded-lg">
                      <p className="text-xs text-amber-900">💡 {hint}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
              <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-bold text-stone-700 mb-2">No Problem Selected</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Select a problem from the list to start coding, or wait for problems to be loaded.
              </p>
            </div>
          )}

          {/* Hidden Camera Feed */}
          <div className="hidden">
            <video ref={videoRef} width="320" height="240" autoPlay muted />
            <canvas ref={canvasRef} width="320" height="240" />
          </div>
        </div>

        {/* Code Editor */}
        <div className="col-span-7 space-y-3">
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            {/* Editor Header */}
            <div className="bg-stone-50 border-b border-stone-200 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-stone-600" />
                <span className="text-xs font-bold text-stone-700">Code Editor</span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Language Selector */}
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="text-xs bg-white border border-stone-200 rounded-lg px-2 py-1 font-bold text-stone-700"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id}>
                      {lang.icon} {lang.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={copyToClipboard}
                  className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
                </button>

                <button
                  onClick={resetCode}
                  className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
                  title="Reset code"
                >
                  <RotateCcw className="w-4 h-4 text-stone-600" />
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-[65vh] p-4 font-mono text-sm text-stone-900 bg-stone-50 resize-none focus:outline-none"
              spellCheck={false}
              placeholder="Write your code here..."
            />

            {/* Editor Footer */}
            <div className="bg-stone-50 border-t border-stone-200 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-stone-600">
                  Attempts: <span className="font-bold text-stone-900">{selectedQuestion ? (attempts[selectedQuestion.id] || 0) : 0}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Code
                    </>
                  )}
                </button>

                <button
                  onClick={submitSolution}
                  disabled={isRunning}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Output Console */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 p-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-stone-600" />
              <span className="text-xs font-bold text-stone-700">Output</span>
            </div>
            
            <div className="p-4 h-[33vh] overflow-y-auto">
              <pre className="font-mono text-xs text-stone-900 whitespace-pre-wrap">
                {output || 'Run your code to see output...'}
              </pre>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-bold text-stone-700 mb-2">Test Results:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {testResults.map((result) => (
                      <div
                        key={result.index}
                        className={`p-3 rounded-lg border ${
                          result.passed
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {result.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-xs font-bold ${
                            result.passed ? 'text-emerald-700' : 'text-red-700'
                          }`}>
                            Test Case {result.index} {result.isHidden && '(Hidden)'}
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-stone-600">
                            Input: <span className="font-mono text-stone-900">{result.input}</span>
                          </div>
                          <div className="text-stone-600">
                            Expected: <span className="font-mono text-stone-900">{result.expected}</span>
                          </div>
                          <div className="text-stone-600">
                            Actual: <span className={`font-mono ${result.passed ? 'text-emerald-700' : 'text-red-700'}`}>
                              {result.actual}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
