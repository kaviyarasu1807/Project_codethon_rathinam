import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Video, Save, X } from 'lucide-react';
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

interface AdminVideoManagerProps {
  adminId: number;
}

export default function AdminVideoManager({ adminId }: AdminVideoManagerProps) {
  const [videos, setVideos] = useState<VideoSuggestion[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoSuggestion | null>(null);
  const [loading, setLoading] = useState(false);

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
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos');
      const data = await res.json();
      if (data.success) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        concepts: formData.concepts.split(',').map(c => c.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        created_by: adminId,
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
        alert(editingVideo ? 'Video updated successfully!' : 'Video added successfully!');
        resetForm();
        fetchVideos();
      } else {
        alert('Failed to save video: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Failed to save video');
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
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        alert('Video deleted successfully!');
        fetchVideos();
      } else {
        alert('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
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
        fetchVideos();
      }
    } catch (error) {
      console.error('Error toggling video status:', error);
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Video Suggestions Manager</h1>
          <p className="text-stone-600 mt-1">Add and manage video recommendations for students</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
        >
          {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showAddForm ? 'Cancel' : 'Add Video'}
        </button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-stone-200"
          >
            <h2 className="text-xl font-bold text-stone-900 mb-4">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Video URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="https://www.youtube.com/watch?v=..."
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
                    placeholder="Describe what students will learn from this video..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="https://..."
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
                    placeholder="e.g., 15:30 or 930 seconds"
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
                    placeholder="e.g., Data Structures, Arrays, Linked Lists"
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
                    placeholder="e.g., programming, fundamentals, beginner"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-stone-300 text-stone-700 rounded-lg font-semibold hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : editingVideo ? 'Update Video' : 'Add Video'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Videos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                  <span>{video.view_count} views</span>
                </div>
                <div>
                  ⭐ {video.rating.toFixed(1)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(video)}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(video)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    video.is_active
                      ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {video.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-stone-400 mx-auto mb-4" />
          <p className="text-stone-600 text-lg">No videos added yet</p>
          <p className="text-stone-500 text-sm">Click "Add Video" to create your first video suggestion</p>
        </div>
      )}
    </div>
  );
}
