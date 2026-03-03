import React, { useState, useEffect } from 'react';
import { Play, Clock, Star, CheckCircle, Video as VideoIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoSuggestion {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  concepts: string[];
  domain: string;
  category: string;
  tags: string[];
  view_count: number;
  rating: number;
}

interface StudentVideoSuggestionsProps {
  studentId: number;
}

export default function StudentVideoSuggestions({ studentId }: StudentVideoSuggestionsProps) {
  const [videos, setVideos] = useState<VideoSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoSuggestion | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchVideoSuggestions();
  }, [studentId]);

  const fetchVideoSuggestions = async () => {
    try {
      const res = await fetch(`/api/student/video-suggestions/${studentId}`);
      const data = await res.json();
      
      if (data.success) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Failed to fetch video suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: VideoSuggestion) => {
    setSelectedVideo(video);
    trackVideoView(video.id);
  };

  const trackVideoView = async (videoId: number) => {
    try {
      await fetch('/api/student/track-video-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          videoId,
          watchedDuration: 0,
          completed: false,
        }),
      });
    } catch (error) {
      console.error('Failed to track video view:', error);
    }
  };

  const markAsWatched = async (videoId: number) => {
    try {
      await fetch('/api/student/track-video-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          videoId,
          watchedDuration: 0,
          completed: true,
        }),
      });
      
      setWatchedVideos(prev => new Set(prev).add(videoId));
    } catch (error) {
      console.error('Failed to mark video as watched:', error);
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900">Recommended Videos for You</h1>
        <p className="text-stone-600 mt-1">
          Personalized video suggestions based on your learning progress
        </p>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Player */}
            <div className="aspect-video bg-black">
              {getYouTubeVideoId(selectedVideo.video_url) ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedVideo.video_url)}`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Video player not available</p>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-stone-900 mb-2">
                {selectedVideo.title}
              </h2>
              <p className="text-stone-600 mb-4">{selectedVideo.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedVideo.concepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full font-medium"
                  >
                    {concept}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-stone-500">
                  {selectedVideo.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{selectedVideo.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{selectedVideo.rating.toFixed(1)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    markAsWatched(selectedVideo.id);
                    setSelectedVideo(null);
                  }}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Watched
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-stone-200 cursor-pointer"
              onClick={() => handleVideoClick(video)}
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-stone-900">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoIcon className="w-16 h-16 text-stone-600" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    video.difficulty_level === 'beginner' ? 'bg-green-500 text-white' :
                    video.difficulty_level === 'intermediate' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {video.difficulty_level}
                  </span>
                  {watchedVideos.has(video.id) && (
                    <span className="px-2 py-1 bg-emerald-500 text-white rounded text-xs font-bold">
                      ✓ Watched
                    </span>
                  )}
                </div>

                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold">
                    {video.duration}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-stone-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-stone-600 mb-3 line-clamp-2">
                  {video.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {video.concepts.slice(0, 2).map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                    >
                      {concept}
                    </span>
                  ))}
                  {video.concepts.length > 2 && (
                    <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">
                      +{video.concepts.length - 2} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-stone-500">
                  <span className="text-xs">{video.category}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{video.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <VideoIcon className="w-16 h-16 text-stone-400 mx-auto mb-4" />
          <p className="text-stone-600 text-lg">No video suggestions available yet</p>
          <p className="text-stone-500 text-sm">
            Complete a quiz to get personalized video recommendations
          </p>
        </div>
      )}
    </div>
  );
}
