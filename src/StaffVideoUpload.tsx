import React, { useState, useEffect } from 'react';
import { Plus, Video, Edit, Trash2, Eye, Save, X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  created_by: number;
  created_at: string;
  is_active: boolean;
  view_count: number;
  rating: number;
}

interface StaffVideoUploadProps {
  staffId: number;
  staffName: string;
}

export default function StaffVideoUpload({ staffId, staffName }: StaffVideoUploadProps) {
  const [videos, setVideos] = useState<VideoSuggestion[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: '',
    difficulty_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    concepts: '',
    domain: 'Computer Science',
    category: 'Tutorial',
    tags: '',
  });

  useEffect(() => {
    fetchMyVideos();
  }, [staffId]);

  const fetchMyVideos = async () => {
    try {
      const res = await fetch(`/api/staff/my-videos/${staffId}`);
      const data = await res.json();
      if (data.success) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        concepts: formData.concepts.split(',').map(c => c.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        created_by: staffId,
      };

      const url = editingVideo ? `/api/admin/videos/${editingVideo.id}` : '/api/admin/videos';
      const method = editingVideo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        showMessage('success', editingVideo ? 'Video updated successfully!' : 'Video uploaded successfully!');
        resetForm();
        fetchMyVideos();
      } else {
        showMessage('error', 'Failed to save video: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving video:', error);
      showMessage('error', 'Failed to save video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video: VideoSuggestion) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || '',
      duration: video.duration || '',
      difficulty_level: video.difficulty_level,
      concepts: video.concepts.join(', '),
      domain: video.domain,
      category: video.category,
      tags: video.tags.join(', '),
    });
    setShowUploadForm(true);
  };

  const handleDelete = async (videoId: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        showMessage('success', 'Video deleted successfully!');
        fetchMyVideos();
      } else {
        showMessage('error', 'Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      showMessage('error', 'Failed to delete video');
    }
  };

  const toggleActive = async (video: VideoSuggestion) => {
    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !video.is_active }),
      });

      const data = await res.json();

      if (data.success) {
        showMessage('success', video.is_active ? 'Video deactivated' : 'Video activated');
        fetchMyVideos();
      }
    } catch (error) {
      console.error('Error toggling video status:', error);
      showMessage('error', 'Failed to update video status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      duration: '',
      difficulty_level: 'beginner',
      concepts: '',
      domain: 'Computer Science',
      category: 'Tutorial',
      tags: '',
    });
    setEditingVideo(null);
    setShowUploadForm(false);
  };

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Video Upload Center</h1>
            <p className="text-stone-600 mt-1">
              Upload and manage educational videos for students
            </p>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {showUploadForm ? (
              <>
                <X className="w-5 h-5" />
                Cancel
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Video
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Videos</p>
                <p className="text-3xl font-bold">{videos.length}</p>
              </div>
              <Video className="w-12 h-12 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Videos</p>
                <p className="text-3xl font-bold">{videos.filter(v => v.is_active).length}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Views</p>
                <p className="text-3xl font-bold">{videos.reduce((sum, v) => sum + v.view_count, 0)}</p>
              </div>
              <Eye className="w-12 h-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold">
                  {videos.length > 0 
                    ? (videos.reduce((sum, v) => sum + v.rating, 0) / videos.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
              <span className="text-5xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="font-medium">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Form */}
      <AnimatePresence>
        {showUploadForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-xl p-6 mb-6 border-2 border-emerald-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-900">
                  {editingVideo ? 'Edit Video Details' : 'Upload New Video'}
                </h2>
                <p className="text-stone-600 text-sm">
                  Fill in the details below to add a video resource
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="bg-stone-50 rounded-lg p-4">
                <h3 className="font-semibold text-stone-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      placeholder="e.g., Introduction to Data Structures and Algorithms"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none transition-all"
                      rows={4}
                      placeholder="Describe what students will learn from this video..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      YouTube Video URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.video_url}
                      onChange={(e) => {
                        setFormData({ ...formData, video_url: e.target.value });
                        // Auto-fill thumbnail
                        const thumbnail = getYouTubeThumbnail(e.target.value);
                        if (thumbnail && !formData.thumbnail_url) {
                          setFormData(prev => ({ ...prev, thumbnail_url: thumbnail }));
                        }
                      }}
                      className="w-full px-4 py-3 rounded-lg border-2 border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-stone-500 mt-1">
                      Paste the full YouTube video URL
                    </p>
                  </div>
                </div>
              </div>

              {/* Video Details */}
              <div className="bg-stone-50 rounded-lg p-4">
                <h3 className="font-semibold text-stone-900 mb-4">Video Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      placeholder="e.g., 15:30 or 15 minutes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Difficulty Level *
                    </label>
                    <select
                      required
                      value={formData.difficulty_level}
                      onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    >
                      <option value="beginner">🟢 Beginner</option>
                      <option value="intermediate">🟡 Intermediate</option>
                      <option value="advanced">🔴 Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Domain *
                    </label>
                    <select
                      required
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    >
                      <option value="Computer Science">💻 Computer Science</option>
                      <option value="Engineering">⚙️ Engineering</option>
                      <option value="Medical">🏥 Medical</option>
                      <option value="Arts">🎨 Arts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    >
                      <option value="Tutorial">📚 Tutorial</option>
                      <option value="Explanation">💡 Explanation</option>
                      <option value="Practice">✏️ Practice</option>
                      <option value="Project">🚀 Project</option>
                      <option value="Review">📝 Review</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tags & Concepts */}
              <div className="bg-stone-50 rounded-lg p-4">
                <h3 className="font-semibold text-stone-900 mb-4">Tags & Concepts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Concepts (comma-separated) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.concepts}
                      onChange={(e) => setFormData({ ...formData, concepts: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      placeholder="e.g., Data Structures, Arrays, Linked Lists"
                    />
                    <p className="text-xs text-stone-500 mt-1">
                      Separate multiple concepts with commas
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      placeholder="e.g., programming, fundamentals, beginner"
                    />
                    <p className="text-xs text-stone-500 mt-1">
                      Add relevant tags for better searchability
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t-2 border-stone-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-stone-300 text-stone-700 rounded-lg font-semibold hover:bg-stone-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingVideo ? 'Update Video' : 'Upload Video'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Videos Grid */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-4">My Uploaded Videos</h2>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all ${
                  video.is_active ? 'border-emerald-200' : 'border-stone-200 opacity-60'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-stone-800 to-stone-900">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-16 h-16 text-stone-600" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                      video.difficulty_level === 'beginner' ? 'bg-green-500 text-white' :
                      video.difficulty_level === 'intermediate' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {video.difficulty_level}
                    </span>
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
                    {video.concepts.slice(0, 3).map((concept, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium"
                      >
                        {concept}
                      </span>
                    ))}
                    {video.concepts.length > 3 && (
                      <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">
                        +{video.concepts.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-stone-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{video.view_count} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span>{video.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(video)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        video.is_active
                          ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {video.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-stone-50 rounded-xl border-2 border-dashed border-stone-300">
            <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-stone-400" />
            </div>
            <p className="text-stone-600 text-lg font-semibold mb-2">No videos uploaded yet</p>
            <p className="text-stone-500 text-sm mb-6">
              Start by uploading your first educational video
            </p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-lg"
            >
              <Upload className="w-5 h-5" />
              Upload Your First Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
