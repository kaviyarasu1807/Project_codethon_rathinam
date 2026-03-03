-- Admin Video Suggestions System - Database Schema

-- Table for admin-curated video suggestions
CREATE TABLE IF NOT EXISTS admin_video_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT, -- e.g., "10:30" or "600" seconds
  difficulty_level TEXT NOT NULL CHECK(difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  concepts TEXT NOT NULL, -- JSON array of concept names
  domain TEXT NOT NULL, -- Engineering, Medical, Computer Science, etc.
  category TEXT DEFAULT 'Tutorial', -- Tutorial, Explanation, Practice, Project, etc.
  tags TEXT, -- JSON array of tags
  created_by INTEGER, -- Admin/Staff ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1, -- 1 = active, 0 = inactive
  view_count INTEGER DEFAULT 0,
  rating REAL DEFAULT 0, -- Average rating 0-5
  FOREIGN KEY (created_by) REFERENCES staff(id)
);

-- Table for tracking student video views
CREATE TABLE IF NOT EXISTS video_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  video_id INTEGER NOT NULL,
  watched_duration INTEGER NOT NULL, -- Seconds watched
  completed INTEGER DEFAULT 0, -- 1 = completed, 0 = not completed
  rating INTEGER, -- 1-5 stars
  feedback TEXT, -- Optional student feedback
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (video_id) REFERENCES admin_video_suggestions(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_videos_domain ON admin_video_suggestions(domain);
CREATE INDEX IF NOT EXISTS idx_admin_videos_difficulty ON admin_video_suggestions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_admin_videos_active ON admin_video_suggestions(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_videos_rating ON admin_video_suggestions(rating DESC);
CREATE INDEX IF NOT EXISTS idx_video_views_student ON video_views(student_id);
CREATE INDEX IF NOT EXISTS idx_video_views_video ON video_views(video_id);

-- Sample data for testing
INSERT INTO admin_video_suggestions (
  title, description, video_url, thumbnail_url, duration,
  difficulty_level, concepts, domain, category, tags, created_by, is_active
) VALUES
(
  'Introduction to Data Structures',
  'Learn the fundamentals of data structures including arrays, linked lists, stacks, and queues. Perfect for beginners!',
  'https://www.youtube.com/watch?v=example1',
  'https://img.youtube.com/vi/example1/maxresdefault.jpg',
  '15:30',
  'beginner',
  '["Data Structures", "Arrays", "Linked Lists"]',
  'Computer Science',
  'Tutorial',
  '["programming", "fundamentals", "data-structures"]',
  1,
  1
),
(
  'Advanced Algorithms Explained',
  'Deep dive into sorting algorithms, searching techniques, and algorithm complexity analysis.',
  'https://www.youtube.com/watch?v=example2',
  'https://img.youtube.com/vi/example2/maxresdefault.jpg',
  '25:45',
  'advanced',
  '["Algorithms", "Sorting", "Searching"]',
  'Computer Science',
  'Explanation',
  '["algorithms", "advanced", "complexity"]',
  1,
  1
),
(
  'Web Development Basics',
  'Start your web development journey with HTML, CSS, and JavaScript basics.',
  'https://www.youtube.com/watch?v=example3',
  'https://img.youtube.com/vi/example3/maxresdefault.jpg',
  '20:00',
  'beginner',
  '["Web Development", "HTML", "CSS", "JavaScript"]',
  'Computer Science',
  'Tutorial',
  '["web", "frontend", "beginner"]',
  1,
  1
),
(
  'Operating Systems Concepts',
  'Understanding process management, memory allocation, and file systems in operating systems.',
  'https://www.youtube.com/watch?v=example4',
  'https://img.youtube.com/vi/example4/maxresdefault.jpg',
  '18:20',
  'intermediate',
  '["Operating Systems", "Process Management", "Memory"]',
  'Computer Science',
  'Explanation',
  '["os", "systems", "intermediate"]',
  1,
  1
),
(
  'Engineering Mechanics - Statics',
  'Learn about forces, moments, and equilibrium in engineering mechanics.',
  'https://www.youtube.com/watch?v=example5',
  'https://img.youtube.com/vi/example5/maxresdefault.jpg',
  '22:15',
  'intermediate',
  '["Engineering Mechanics", "Statics", "Forces"]',
  'Engineering',
  'Tutorial',
  '["mechanics", "engineering", "physics"]',
  1,
  1
);
