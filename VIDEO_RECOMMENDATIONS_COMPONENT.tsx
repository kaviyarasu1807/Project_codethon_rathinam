/**
 * Video Recommendations Component
 * Displays personalized video recommendations based on student performance
 */

import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { 
  Play, 
  Clock, 
  Eye, 
  CheckCircle2, 
  BookOpen, 
  Target,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoRecommendation {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
  relevanceScore: number;
  recommendationReason: string;
  conceptsCovered: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationReport {
  studentId: number;
  timestamp: number;
  videos: VideoRecommendation[];
  resources: any[];
  studyPlan: {
    immediate: string[];
    thisWeek: string[];
    thisMonth: string[];
  };
  estimatedStudyTime: string;
  focusAreas: string[];
}

export function VideoRecommendations({ userId }: { userId: number }) {
  const [recommendations, setRecommendations] = useState<RecommendationReport | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'videos' | 'resources' | 'plan'>('videos');

  // Load recommendations on mount
  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    try {
      const response = await fetch(`/api/recommendations/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: userId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        alert(data.error || 'Failed to generate recommendations');
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      alert('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const trackVideoWatch = async (videoId: string, watchTime: number, completed: boolean) => {
    try {
      await fetch('/api/recommendations/track-watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: userId,
          videoId,
          watchTime,
          completed
        })
      });
      
      if (completed) {
        setWatchedVideos(prev => new Set([...prev, videoId]));
      }
    } catch (error) {
      console.error('Failed to track video watch:', error);
    }
  };

  if (!recommendations) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">
            Get Personalized Video Recommendations
          </h2>
          <p className="text-stone-600 mb-6">
            Based on your quiz performance and learning analytics, we'll suggest the best educational videos to help you improve.
          </p>
          <button
            onClick={generateRecommendations}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate Recommendations
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Your Learning Videos</h1>
          <p className="text-stone-500">Personalized recommendations based on your performance</p>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Focus Areas */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-2xl text-white">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Your Focus Areas
        </h3>
        <div className="flex flex-wrap gap-2">
          {recommendations.focusAreas.map((area, idx) => (
            <span key={idx} className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              {area}
            </span>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
          <span>Estimated Study Time:</span>
          <span className="font-bold text-lg">{recommendations.estimatedStudyTime}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'videos'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Play className="w-4 h-4 inline mr-2" />
          Videos ({recommendations.videos.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'resources'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Resources ({recommendations.resources.length})
        </button>
        <button
          onClick={() => setActiveTab('plan')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'plan'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Study Plan
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'videos' && (
          <motion.div
            key="videos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Video Player */}
            {selectedVideo && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-stone-200">
                  <ReactPlayer
                    {...{
                      url: `https://www.youtube.com/watch?v=${selectedVideo.videoId}`,
                      controls: true,
                      width: "100%",
                      height: "450px",
                      onProgress: (state: any) => {
                        if (state.played > 0.9) {
                          trackVideoWatch(selectedVideo.videoId, state.playedSeconds, true);
                        }
                      }
                    } as any}
                  />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-stone-900 mb-2">{selectedVideo.title}</h3>
                        <p className="text-sm text-stone-600 mb-3">{selectedVideo.channelTitle}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedVideo.priority === 'high' ? 'bg-red-100 text-red-700' :
                        selectedVideo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {selectedVideo.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedVideo.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {selectedVideo.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {selectedVideo.difficulty}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-purple-600 mb-2">
                        💡 {selectedVideo.recommendationReason}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedVideo.conceptsCovered.map((concept, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    {watchedVideos.has(selectedVideo.videoId) && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Video List */}
            <div className={selectedVideo ? 'lg:col-span-1' : 'lg:col-span-3'}>
              <div className="space-y-4">
                {recommendations.videos.map((video, idx) => (
                  <motion.div
                    key={video.videoId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedVideo(video)}
                    className={`bg-white p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                      selectedVideo?.videoId === video.videoId
                        ? 'border-purple-500 shadow-lg'
                        : 'border-stone-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-32 h-20 object-cover rounded-lg"
                        />
                        {watchedVideos.has(video.videoId) && (
                          <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                          {video.duration}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-stone-900 mb-1 line-clamp-2">
                          {video.title}
                        </h4>
                        <p className="text-xs text-stone-500 mb-2">{video.channelTitle}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            video.priority === 'high' ? 'bg-red-100 text-red-700' :
                            video.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {video.priority}
                          </span>
                          <span className="text-xs text-stone-400">
                            Score: {video.relevanceScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'resources' && (
          <motion.div
            key="resources"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {recommendations.resources.map((resource, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    resource.type === 'video' ? 'bg-red-100' :
                    resource.type === 'article' ? 'bg-blue-100' :
                    resource.type === 'practice' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    {resource.type === 'video' && <Play className="w-5 h-5 text-red-600" />}
                    {resource.type === 'article' && <BookOpen className="w-5 h-5 text-blue-600" />}
                    {resource.type === 'practice' && <Target className="w-5 h-5 text-green-600" />}
                    {resource.type === 'interactive' && <Zap className="w-5 h-5 text-purple-600" />}
                  </div>
                  <span className="text-xs font-bold text-stone-400">
                    {resource.estimatedTime}
                  </span>
                </div>
                <h4 className="font-bold text-stone-900 mb-2">{resource.title}</h4>
                <p className="text-sm text-stone-600 mb-4">{resource.description}</p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  Access Resource →
                </a>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'plan' && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Immediate Actions */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100">
              <h3 className="font-bold text-lg text-red-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Today (Immediate)
              </h3>
              <ul className="space-y-3">
                {recommendations.studyPlan.immediate.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                    <span className="text-red-600 mt-0.5">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* This Week */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-lg text-blue-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                This Week
              </h3>
              <ul className="space-y-3">
                {recommendations.studyPlan.thisWeek.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="text-blue-600 mt-0.5">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* This Month */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
              <h3 className="font-bold text-lg text-green-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                This Month
              </h3>
              <ul className="space-y-3">
                {recommendations.studyPlan.thisMonth.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                    <span className="text-green-600 mt-0.5">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
