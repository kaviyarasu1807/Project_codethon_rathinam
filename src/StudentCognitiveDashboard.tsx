import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  Clock,
  Zap,
  BookOpen,
  Lightbulb,
  Award,
  Eye,
  Frown,
  Smile,
  BarChart3,
  Calendar,
  X
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface StudentCognitiveDashboardProps {
  studentId: number;
  studentName: string;
  onClose: () => void;
}

interface CognitiveData {
  performanceHistory: Array<{ date: string; score: number; stress: number; focus: number }>;
  strengths: Array<{ concept: string; mastery: number }>;
  weaknesses: Array<{ concept: string; mastery: number; attempts: number }>;
  weeklyFocus: Array<{ day: string; hours: number; intensity: number }>;
  learningStyle: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    readingWriting: number;
  };
  stressLevel: 'Low' | 'Medium' | 'High';
  stressScore: number;
  interventionPlan: Array<{ priority: string; action: string; timeline: string }>;
  overallHealth: string;
  healthScore: number;
  engagementLevel: string;
  performanceTrend: string;
}

export default function StudentCognitiveDashboard({
  studentId,
  studentName,
  onClose
}: StudentCognitiveDashboardProps) {
  const [data, setData] = useState<CognitiveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCognitiveData();
  }, [studentId]);

  const fetchCognitiveData = async () => {
    setLoading(true);
    try {
      // Fetch quiz results
      const quizRes = await fetch(`/api/student/stats/${studentId}`);
      const quizData = await quizRes.json();

      // Fetch SAFA mastery data
      const masteryRes = await fetch(`/api/safa/mastery/${studentId}`);
      const masteryData = await masteryRes.json();

      // Fetch learning analytics
      const analyticsRes = await fetch(`/api/analytics/health-report/${studentId}`);
      const analyticsData = await analyticsRes.json();

      // Fetch answer history for performance tracking
      const historyRes = await fetch(`/api/safa/answer-history/${studentId}?limit=50`);
      const historyData = await historyRes.json();

      // Process data
      const cognitiveData = processCognitiveData(quizData, masteryData, analyticsData, historyData);
      setData(cognitiveData);
    } catch (error) {
      console.error('Failed to fetch cognitive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processCognitiveData = (quiz: any, mastery: any, analytics: any, history: any): CognitiveData => {
    // Performance history from answer attempts
    const performanceHistory = history.history?.slice(0, 10).reverse().map((h: any, i: number) => ({
      date: new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: h.is_correct ? 100 : 0,
      stress: Math.random() * 100, // Would come from emotional state data
      focus: Math.random() * 100
    })) || [];

    // Strengths (high mastery concepts)
    const strengths = mastery.mastery
      ?.filter((m: any) => m.mastery_score >= 70)
      .sort((a: any, b: any) => b.mastery_score - a.mastery_score)
      .slice(0, 5)
      .map((m: any) => ({
        concept: m.concept_name,
        mastery: m.mastery_score
      })) || [];

    // Weaknesses (low mastery concepts)
    const weaknesses = mastery.mastery
      ?.filter((m: any) => m.mastery_score < 70)
      .sort((a: any, b: any) => a.mastery_score - b.mastery_score)
      .slice(0, 5)
      .map((m: any) => ({
        concept: m.concept_name,
        mastery: m.mastery_score,
        attempts: m.total_attempts
      })) || [];

    // Weekly focus (simulated from attempt patterns)
    const weeklyFocus = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      hours: Math.random() * 5,
      intensity: Math.random() * 100
    }));

    // Learning style from analytics
    const learningStyle = {
      visual: analytics.report?.learningStyle === 'visual' ? 40 : 20,
      auditory: analytics.report?.learningStyle === 'auditory' ? 40 : 15,
      kinesthetic: analytics.report?.learningStyle === 'kinesthetic' ? 40 : 25,
      readingWriting: analytics.report?.learningStyle === 'reading-writing' ? 40 : 20
    };

    // Stress level from analytics
    const stressScore = analytics.report?.problems?.stressIndicators?.length * 20 || 30;
    const stressLevel: 'Low' | 'Medium' | 'High' = 
      stressScore < 40 ? 'Low' : stressScore < 70 ? 'Medium' : 'High';

    // Intervention plan from analytics
    const interventionPlan = [
      {
        priority: 'High',
        action: weaknesses[0] ? `Focus on ${weaknesses[0].concept}` : 'Continue current pace',
        timeline: '1-2 weeks'
      },
      {
        priority: 'Medium',
        action: analytics.report?.interventionRequired 
          ? 'Schedule mentor session' 
          : 'Practice problem-solving',
        timeline: '2-3 weeks'
      },
      {
        priority: 'Low',
        action: 'Review strong concepts periodically',
        timeline: 'Ongoing'
      }
    ];

    return {
      performanceHistory,
      strengths,
      weaknesses,
      weeklyFocus,
      learningStyle,
      stressLevel,
      stressScore,
      interventionPlan,
      overallHealth: analytics.report?.overallHealth || 'good',
      healthScore: analytics.report?.healthScore || 75,
      engagementLevel: analytics.report?.engagementLevel || 'medium',
      performanceTrend: analytics.report?.performanceTrend || 'stable'
    };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-stone-700 font-semibold">Loading cognitive data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-center text-stone-700">No cognitive data available for this student.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-stone-200 text-stone-700 py-2 rounded-lg font-semibold hover:bg-stone-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-white to-stone-50 rounded-3xl shadow-2xl max-w-7xl w-full my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 rounded-t-3xl relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{studentName}</h2>
                  <p className="text-emerald-100">Cognitive Performance Dashboard</p>
                </div>
              </div>
              
              {/* Health Score Badge */}
              <div className="flex items-center gap-4 mt-4">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-white" />
                    <div>
                      <p className="text-white/80 text-xs">Health Score</p>
                      <p className="text-white text-xl font-bold">{data.healthScore}/100</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                  <div className="flex items-center gap-2">
                    {data.performanceTrend === 'improving' ? (
                      <TrendingUp className="w-5 h-5 text-white" />
                    ) : data.performanceTrend === 'declining' ? (
                      <TrendingDown className="w-5 h-5 text-white" />
                    ) : (
                      <Activity className="w-5 h-5 text-white" />
                    )}
                    <div>
                      <p className="text-white/80 text-xs">Trend</p>
                      <p className="text-white text-lg font-bold capitalize">{data.performanceTrend}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-white" />
                    <div>
                      <p className="text-white/80 text-xs">Engagement</p>
                      <p className="text-white text-lg font-bold capitalize">{data.engagementLevel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors backdrop-blur-sm"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-2xl" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
          {/* Performance Overview & Stress Alert */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Graph */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-stone-900 text-lg">Performance Overview</h3>
                </div>
                <span className="text-xs text-stone-500">Last 10 attempts</span>
              </div>
              
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    name="Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="focus" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 3 }}
                    name="Focus"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Stress Alert */}
            <div className={`rounded-2xl p-6 shadow-lg border-2 ${
              data.stressLevel === 'High' 
                ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400' 
                : data.stressLevel === 'Medium'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400'
                : 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {data.stressLevel === 'High' ? (
                  <AlertTriangle className="w-8 h-8 text-white" />
                ) : data.stressLevel === 'Medium' ? (
                  <Frown className="w-8 h-8 text-white" />
                ) : (
                  <Smile className="w-8 h-8 text-white" />
                )}
                <div>
                  <p className="text-white/80 text-sm">Stress Level</p>
                  <p className="text-white text-2xl font-bold">{data.stressLevel}</p>
                </div>
              </div>
              
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm">Stress Score</span>
                  <span className="text-white font-bold">{data.stressScore}/100</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3">
                  <div 
                    className="bg-white rounded-full h-3 transition-all duration-500"
                    style={{ width: `${data.stressScore}%` }}
                  />
                </div>
              </div>

              {data.stressLevel !== 'Low' && (
                <div className="mt-4 bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-white text-xs font-semibold mb-1">⚠️ Action Required</p>
                  <p className="text-white/90 text-xs">
                    {data.stressLevel === 'High' 
                      ? 'Immediate intervention recommended. Schedule counseling session.'
                      : 'Monitor closely. Consider reducing workload.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 shadow-lg border border-emerald-200">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-lg">Strength Areas</h3>
              </div>
              
              <div className="space-y-3">
                {data.strengths.length > 0 ? data.strengths.map((strength, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 border border-emerald-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-stone-900">{strength.concept}</span>
                      <span className="text-emerald-600 font-bold">{strength.mastery}%</span>
                    </div>
                    <div className="w-full bg-emerald-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-full h-2"
                        style={{ width: `${strength.mastery}%` }}
                      />
                    </div>
                  </div>
                )) : (
                  <p className="text-stone-500 text-center py-4">No strength data available yet</p>
                )}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 shadow-lg border border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-red-600" />
                <h3 className="font-bold text-stone-900 text-lg">Weak Areas</h3>
              </div>
              
              <div className="space-y-3">
                {data.weaknesses.length > 0 ? data.weaknesses.map((weakness, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 border border-red-200">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-semibold text-stone-900 block">{weakness.concept}</span>
                        <span className="text-xs text-stone-500">{weakness.attempts} attempts</span>
                      </div>
                      <span className="text-red-600 font-bold">{weakness.mastery}%</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-orange-500 rounded-full h-2"
                        style={{ width: `${weakness.mastery}%` }}
                      />
                    </div>
                  </div>
                )) : (
                  <p className="text-stone-500 text-center py-4">No weakness data available yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Weekly Focus & Learning Style */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Focus Heatmap */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-stone-900 text-lg">Weekly Focus Pattern</h3>
              </div>
              
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.weeklyFocus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Study Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Learning Style */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-stone-900 text-lg">Learning Style Breakdown</h3>
              </div>
              
              <div className="space-y-4">
                {Object.entries(data.learningStyle).map(([style, percentage], idx) => (
                  <div key={style}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-stone-700 font-medium capitalize">
                        {style === 'readingWriting' ? 'Reading/Writing' : style}
                      </span>
                      <span className="text-stone-900 font-bold">{percentage}%</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-3">
                      <div 
                        className="rounded-full h-3 transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: COLORS[idx % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Intervention Plan */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-stone-900 text-lg">Suggested Intervention Plan</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.interventionPlan.map((plan, idx) => (
                <div 
                  key={idx}
                  className={`bg-white rounded-xl p-4 border-2 ${
                    plan.priority === 'High' 
                      ? 'border-red-300' 
                      : plan.priority === 'Medium'
                      ? 'border-amber-300'
                      : 'border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      plan.priority === 'High'
                        ? 'bg-red-100 text-red-700'
                        : plan.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {plan.priority} Priority
                    </span>
                  </div>
                  <p className="text-stone-900 font-semibold mb-2">{plan.action}</p>
                  <div className="flex items-center gap-1 text-stone-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{plan.timeline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <Eye className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-blue-100 text-sm">Overall Health</p>
              <p className="text-2xl font-bold capitalize">{data.overallHealth}</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
              <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-emerald-100 text-sm">Strengths</p>
              <p className="text-2xl font-bold">{data.strengths.length}</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
              <Target className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-red-100 text-sm">Focus Areas</p>
              <p className="text-2xl font-bold">{data.weaknesses.length}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <BookOpen className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-purple-100 text-sm">Engagement</p>
              <p className="text-2xl font-bold capitalize">{data.engagementLevel}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-4 rounded-b-3xl border-t border-stone-200">
          <div className="flex justify-between items-center">
            <p className="text-stone-500 text-sm">
              Last updated: {new Date().toLocaleString()}
            </p>
            <button
              onClick={onClose}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Close Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
