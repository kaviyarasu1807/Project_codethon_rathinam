/**
 * User Report Analysis Component
 * Comprehensive analysis dashboard with beautiful visualizations
 */

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Award, Brain, Clock, Target, Zap, 
  BookOpen, AlertTriangle, CheckCircle2, BarChart3, PieChart,
  Activity, Download, Share2, Calendar, Filter, Eye
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface UserReportProps {
  userId: number;
  userName: string;
  userRole: 'student' | 'admin';
}

interface ReportData {
  overview: {
    totalQuizzes: number;
    averageScore: number;
    totalTimeSpent: number;
    completionRate: number;
    improvement: number;
  };
  performance: {
    scores: Array<{ date: string; score: number; level: string }>;
    timeAnalysis: Array<{ date: string; time: number }>;
    conceptMastery: Array<{ concept: string; mastery: number; questions: number }>;
  };
  emotional: {
    avgStress: number;
    avgHappiness: number;
    avgFocus: number;
    trends: Array<{ date: string; stress: number; happiness: number; focus: number }>;
  };
  behavioral: {
    tabSwitches: number;
    voiceAlerts: number;
    typingSpeed: number;
    attentionScore: number;
  };
  strengths: Array<{ concept: string; score: number }>;
  weaknesses: Array<{ concept: string; score: number }>;
  recommendations: string[];
  badges: Array<{ name: string; icon: string; earned: boolean; date?: string }>;
}

const COLORS = {
  primary: '#10b981',
  secondary: '#3b82f6',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',
  pink: '#ec4899'
};

export default function UserReportAnalysis({ userId, userName, userRole }: UserReportProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'emotional' | 'behavioral'>('overview');

  useEffect(() => {
    fetchReportData();
  }, [userId, timeRange]);

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/user-report/${userId}?range=${timeRange}`);
      const data = await response.json();
      setReportData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // Generate PDF or export data
    alert('Report download feature - integrate with PDF library');
  };

  const shareReport = () => {
    // Share report functionality
    alert('Share report feature');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center p-12">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
        <p className="text-stone-600">No report data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Learning DNA Report</h1>
            <p className="text-emerald-100">{userName}'s Comprehensive Analysis</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/30 font-bold"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="all">All Time</option>
            </select>
            
            <button
              onClick={downloadReport}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={shareReport}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-emerald-100">Average Score</p>
                <p className="text-2xl font-bold">{reportData.overview.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-emerald-100">Total Quizzes</p>
                <p className="text-2xl font-bold">{reportData.overview.totalQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-emerald-100">Time Spent</p>
                <p className="text-2xl font-bold">{Math.round(reportData.overview.totalTimeSpent / 60)}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                {reportData.overview.improvement >= 0 ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-sm text-emerald-100">Improvement</p>
                <p className="text-2xl font-bold">
                  {reportData.overview.improvement >= 0 ? '+' : ''}
                  {reportData.overview.improvement}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-stone-200 p-2 flex gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'emotional', label: 'Emotional Intelligence', icon: Brain },
          { id: 'behavioral', label: 'Behavioral Analysis', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Performance Chart */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-xl font-bold text-stone-900 mb-6">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportData.performance.scores}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke={COLORS.primary} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-emerald-900">Top Strengths</h3>
              </div>
              <div className="space-y-3">
                {reportData.strengths.slice(0, 5).map((strength, i) => (
                  <div key={i} className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-stone-900">{strength.concept}</span>
                      <span className="text-emerald-600 font-bold">{strength.score}%</span>
                    </div>
                    <div className="w-full bg-emerald-100 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-600 p-2 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-red-900">Areas for Improvement</h3>
              </div>
              <div className="space-y-3">
                {reportData.weaknesses.slice(0, 5).map((weakness, i) => (
                  <div key={i} className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-stone-900">{weakness.concept}</span>
                      <span className="text-red-600 font-bold">{weakness.score}%</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${weakness.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">AI-Powered Recommendations</h3>
            </div>
            <div className="space-y-3">
              {reportData.recommendations.map((rec, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 p-1 rounded-full mt-0.5">
                      <Zap className="w-4 h-4" />
                    </div>
                    <p className="text-white leading-relaxed">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Concept Mastery Radar */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-xl font-bold text-stone-900 mb-6">Concept Mastery Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={reportData.performance.conceptMastery}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="concept" stroke="#64748b" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" />
                <Radar 
                  name="Mastery" 
                  dataKey="mastery" 
                  stroke={COLORS.primary} 
                  fill={COLORS.primary} 
                  fillOpacity={0.6} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Time Analysis */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-xl font-bold text-stone-900 mb-6">Time Spent Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.performance.timeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="time" fill={COLORS.secondary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Concept Breakdown */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-xl font-bold text-stone-900 mb-6">Detailed Concept Breakdown</h3>
            <div className="space-y-4">
              {reportData.performance.conceptMastery.map((concept, i) => (
                <div key={i} className="border border-stone-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-stone-900">{concept.concept}</h4>
                      <p className="text-sm text-stone-500">{concept.questions} questions attempted</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">{concept.mastery}%</p>
                      <p className="text-xs text-stone-500">Mastery Level</p>
                    </div>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        concept.mastery >= 80 ? 'bg-emerald-600' :
                        concept.mastery >= 60 ? 'bg-blue-600' :
                        concept.mastery >= 40 ? 'bg-amber-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${concept.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Emotional Intelligence Tab */}
      {activeTab === 'emotional' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Emotional Stats Cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-600 p-3 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-700 font-bold uppercase">Avg Stress</p>
                  <p className="text-3xl font-bold text-red-900">{reportData.emotional.avgStress}%</p>
                </div>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${reportData.emotional.avgStress}%` }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-3 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-bold uppercase">Avg Happiness</p>
                  <p className="text-3xl font-bold text-blue-900">{reportData.emotional.avgHappiness}%</p>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${reportData.emotional.avgHappiness}%` }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 p-3 rounded-xl">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-bold uppercase">Avg Focus</p>
                  <p className="text-3xl font-bold text-purple-900">{reportData.emotional.avgFocus}%</p>
                </div>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${reportData.emotional.avgFocus}%` }}
                />
              </div>
            </div>
          </div>

          {/* Emotional Trends */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-xl font-bold text-stone-900 mb-6">Emotional Intelligence Trends</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={reportData.emotional.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="stress" 
                  stroke={COLORS.danger} 
                  strokeWidth={3}
                  name="Stress Level"
                />
                <Line 
                  type="monotone" 
                  dataKey="happiness" 
                  stroke={COLORS.secondary} 
                  strokeWidth={3}
                  name="Happiness"
                />
                <Line 
                  type="monotone" 
                  dataKey="focus" 
                  stroke={COLORS.purple} 
                  strokeWidth={3}
                  name="Focus"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Behavioral Analysis Tab */}
      {activeTab === 'behavioral' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Behavioral Metrics */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 p-3 rounded-xl">
                  <Activity className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-bold uppercase">Tab Switches</p>
                  <p className="text-3xl font-bold text-stone-900">{reportData.behavioral.tabSwitches}</p>
                </div>
              </div>
              <p className="text-xs text-stone-500">
                {reportData.behavioral.tabSwitches > 20 ? 'High activity detected' : 'Normal behavior'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-3 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-bold uppercase">Voice Alerts</p>
                  <p className="text-3xl font-bold text-stone-900">{reportData.behavioral.voiceAlerts}</p>
                </div>
              </div>
              <p className="text-xs text-stone-500">
                {reportData.behavioral.voiceAlerts > 5 ? 'Requires attention' : 'Good compliance'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-bold uppercase">Typing Speed</p>
                  <p className="text-3xl font-bold text-stone-900">{reportData.behavioral.typingSpeed}</p>
                </div>
              </div>
              <p className="text-xs text-stone-500">Words per minute</p>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-bold uppercase">Attention Score</p>
                  <p className="text-3xl font-bold text-stone-900">{reportData.behavioral.attentionScore}%</p>
                </div>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${reportData.behavioral.attentionScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Behavioral Insights */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
            <h3 className="text-xl font-bold text-indigo-900 mb-4">Behavioral Insights</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold text-stone-900 mb-2">Engagement Level</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full bg-stone-200 rounded-full h-3">
                      <div 
                        className="bg-indigo-600 h-3 rounded-full"
                        style={{ width: `${reportData.behavioral.attentionScore}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">
                    {reportData.behavioral.attentionScore >= 80 ? 'High' :
                     reportData.behavioral.attentionScore >= 60 ? 'Good' :
                     reportData.behavioral.attentionScore >= 40 ? 'Fair' : 'Low'}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold text-stone-900 mb-2">Integrity Score</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full bg-stone-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          reportData.behavioral.tabSwitches < 10 && reportData.behavioral.voiceAlerts < 3
                            ? 'bg-emerald-600'
                            : reportData.behavioral.tabSwitches < 20 && reportData.behavioral.voiceAlerts < 5
                            ? 'bg-amber-600'
                            : 'bg-red-600'
                        }`}
                        style={{ 
                          width: `${Math.max(0, 100 - (reportData.behavioral.tabSwitches * 2 + reportData.behavioral.voiceAlerts * 5))}%` 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">
                    {reportData.behavioral.tabSwitches < 10 && reportData.behavioral.voiceAlerts < 3 ? 'Excellent' :
                     reportData.behavioral.tabSwitches < 20 && reportData.behavioral.voiceAlerts < 5 ? 'Good' : 'Needs Review'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Badges & Achievements */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h3 className="text-xl font-bold text-stone-900 mb-6">Badges & Achievements</h3>
        <div className="grid grid-cols-6 gap-4">
          {reportData.badges.map((badge, i) => (
            <div
              key={i}
              className={`text-center p-4 rounded-xl border-2 transition-all ${
                badge.earned
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300'
                  : 'bg-stone-50 border-stone-200 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <p className="text-xs font-bold text-stone-900">{badge.name}</p>
              {badge.earned && badge.date && (
                <p className="text-[10px] text-stone-500 mt-1">{badge.date}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
