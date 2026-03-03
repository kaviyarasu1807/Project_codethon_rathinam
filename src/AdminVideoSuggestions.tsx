import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Video, Save, X, Search, Filter, CheckCircle, AlertCircle, Users, TrendingUp } from 'lucide-react';
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

interface AdminVideoSuggestionsProps {
  adminId: number;
}

export default function AdminVideoSuggestions({ adminId }: AdminVideoSuggestionsProps) {
  const [videos, setVideos] = useState<VideoSuggestion[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoSuggestion[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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
    fetchAllVideos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [videos, searchQuery, filterDomain, filterDifficulty, filterStatus]);

  const fetchAllVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/videos');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        // Ensure videos is always an array
        setVideos(Array.isArray(data.videos) ? data.videos : []);
      } else {
        showMessage('error', data.error || 'Failed to fetch videos');
        setVideos([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch videos:', error);
      showMessage('error', `Failed to load videos: ${error.message}`);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...videos];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.concepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Domain filter
    if (filterDomain !== 'all') {
      filtered = filtered.filter(v => v.domain === filterDomain);
    }

    // Difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(v => v.difficulty_level === filterDifficulty);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(v => 
        filterStatus === 'active' ? v.is_active : !v.is_active
      );
    }

    setFilteredVideos(filtered);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.title.trim() || !formData.description.trim() || !formData.video_url.trim()) {
        showMessage('error', 'Please fill in all required fields');
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        video_url: formData.video_url.trim(),
        thumbnail_url: formData.thumbnail_url.trim(),
        duration: formData.duration.trim(),
        difficulty_level: formData.difficulty_level,
        concepts: formData.concepts.split(',').map(c => c.trim()).filter(Boolean),
        domain: formData.domain.trim(),
        category: formData.category.trim(),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        created_by: adminId,
      };

      console.log('Submitting video:', payload);

      const url = editingVideo ? `/api/admin/videos/${editingVideo.id}` : '/api/admin/videos';
      const method = editingVideo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Get response text first
      const responseText = await res.text();
      console.log('Server response:', res.status, responseText);

      // Check if response is ok
      if (!res.ok) {
        if (res.status === 503) {
          showMessage('error', '❌ Database not connected! Please update MongoDB password in .env file and restart server.');
          return;
        }
        
        if (res.status === 400) {
          try {
            const errorData = JSON.parse(responseText);
            showMessage('error', `Validation error: ${errorData.error || 'Invalid data'}`);
          } catch {
            showMessage('error', `Validation error: ${responseText || 'Invalid data'}`);
          }
          return;
        }

        showMessage('error', `Server error (${res.status}): ${responseText || 'Unknown error'}`);
        return;
      }

      // Parse JSON response
      let data;
      try {
        if (!responseText || responseText.trim() === '') {
          showMessage('error', '❌ Server returned empty response. MongoDB may not be connected!');
          return;
        }
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        showMessage('error', '❌ Invalid server response. Check server logs.');
        return;
      }

      if (data.success) {
        showMessage('success', editingVideo ? '✅ Video updated successfully!' : '✅ Video added successfully!');
        resetForm();
        await fetchAllVideos();
      } else {
        showMessage('error', `Failed to save video: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error saving video:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        showMessage('error', '❌ Cannot connect to server! Make sure server is running: npm run dev:mongodb');
      } else {
        showMessage('error', `Failed to save video: ${error.message || 'Unknown error'}`);
      }
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
    setShowAddForm(true);
  };

  const handleDelete = async (videoId: number) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
      });

      const responseText = await res.text();
      
      if (!res.ok) {
        showMessage('error', `Failed to delete video (${res.status}): ${responseText}`);
        return;
      }

      const data = JSON.parse(responseText);

      if (data.success) {
        showMessage('success', '✅ Video deleted successfully!');
        await fetchAllVideos();
      } else {
        showMessage('error', `Failed to delete video: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error deleting video:', error);
      showMessage('error', `Failed to delete video: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (video: VideoSuggestion) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !video.is_active }),
      });

      const responseText = await res.text();
      
      if (!res.ok) {
        showMessage('error', `Failed to update video status (${res.status})`);
        return;
      }

      const data = JSON.parse(responseText);

      if (data.success) {
        showMessage('success', video.is_active ? '✅ Video deactivated' : '✅ Video activated');
        await fetchAllVideos();
      } else {
        showMessage('error', `Failed to update status: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error toggling video status:', error);
      showMessage('error', `Failed to update status: ${error.message}`);
    } finally {
      setLoading(false);
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
    setShowAddForm(false);
  };

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
    return null;
  };

  // Calculate statistics
  const stats = {
    total: videos.length,
    active: videos.filter(v => v.is_active).length,
    inactive: videos.filter(v => !v.is_active).length,
    totalViews: videos.reduce((sum, v) => sum + v.view_count, 0),
    avgRating: videos.length > 0 
      ? (videos.reduce((sum, v) => sum + v.rating, 0) / videos.length).toFixed(1)
      : '0.0',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Video Suggestions Management</h1>
            <p className="text-stone-600 mt-1">Manage all educational video suggestions</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showAddForm ? 'Cancel' : 'Add Video'}
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Videos</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Video className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Active</p>
                <p className="text-3xl font-bold">{stats.active}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Inactive</p>
                <p className="text-3xl font-bold">{stats.inactive}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Views</p>
                <p className="text-3xl font-bold">{stats.totalViews}</p>
              </div>
              <Eye className="w-10 h-10 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold">{stats.avgRating}</p>
              </div>
              <span className="text-4xl">⭐</span>
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

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-xl p-6 mb-6 border-2 border-emerald-200"
          >
            <h2 className="text-2xl font-bold text-stone-900 mb-6">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g., Introduction to Data Structures"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    rows={3}
                    placeholder="Describe what students will learn..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Video URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.video_url}
                    onChange={(e) => {
                      setFormData({ ...formData, video_url: e.target.value });
                      const thumbnail = getYouTubeThumbnail(e.target.value);
                      if (thumbnail && !formData.thumbnail_url) {
                        setFormData(prev => ({ ...prev, thumbnail_url: thumbnail }));
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g., 15:30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Difficulty Level *
                  </label>
                  <select
                    required
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Domain *
                  </label>
                  <select
                    required
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Medical">Medical</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Tutorial">Tutorial</option>
                    <option value="Explanation">Explanation</option>
                    <option value="Practice">Practice</option>
                    <option value="Project">Project</option>
                    <option value="Review">Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Concepts (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.concepts}
                    onChange={(e) => setFormData({ ...formData, concepts: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g., Data Structures, Arrays"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g., programming, fundamentals"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-stone-300 text-stone-700 rounded-lg font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : editingVideo ? 'Update' : 'Add Video'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-stone-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-stone-600" />
          <h3 className="font-semibold text-stone-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">All Domains</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Medical">Medical</option>
            <option value="Arts">Arts</option>
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <p className="text-sm text-stone-500 mt-2">
          Showing {filteredVideos.length} of {videos.length} videos
        </p>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${
              video.is_active ? 'border-emerald-200' : 'border-stone-200 opacity-60'
            }`}
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
                  <Video className="w-16 h-16 text-stone-600" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
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
                    className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                  >
                    {concept}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-stone-500 mb-3">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{video.view_count}</span>
                </div>
                <div>⭐ {video.rating.toFixed(1)}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(video)}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(video)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${
                    video.is_active
                      ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {video.is_active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12 bg-stone-50 rounded-xl">
          <Video className="w-16 h-16 text-stone-400 mx-auto mb-4" />
          <p className="text-stone-600 text-lg">No videos found</p>
          <p className="text-stone-500 text-sm">
            {searchQuery || filterDomain !== 'all' || filterDifficulty !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Click "Add Video" to create your first video suggestion'}
          </p>
        </div>
      )}
    </div>
  );
}
