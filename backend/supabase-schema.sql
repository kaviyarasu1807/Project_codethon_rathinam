-- NeuroPath Learning DNA System - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Students Table
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  domain TEXT NOT NULL,
  face_descriptor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Results Table
CREATE TABLE IF NOT EXISTS quiz_results (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  level TEXT NOT NULL,
  missed_concepts TEXT,
  critical_concepts TEXT,
  critical_questions TEXT,
  ai_guidance TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
  id BIGSERIAL PRIMARY KEY,
  level TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL
);

-- Emotional States Table
CREATE TABLE IF NOT EXISTS emotional_states (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  stress_level REAL NOT NULL,
  happiness_level REAL NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_results_student_id ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_timestamp ON quiz_results(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_states_student_id ON emotional_states(student_id);
CREATE INDEX IF NOT EXISTS idx_emotional_states_timestamp ON emotional_states(timestamp DESC);

-- Seed Recommendations
INSERT INTO recommendations (level, content) VALUES
  ('Beginner', 'Focus on core fundamentals. We recommend starting with ''Introduction to Logic'' and ''Basic Problem Solving'' modules. Try to practice 30 minutes daily.'),
  ('Intermediate', 'Great progress! You should dive deeper into ''Advanced Algorithms'' and ''System Design Basics''. Focus on building small projects to apply your knowledge.'),
  ('Advanced', 'Excellent! You have a strong grasp of the material. We recommend exploring ''Machine Learning Architectures'' and ''Distributed Systems''. Consider mentoring others to solidify your expertise.')
ON CONFLICT (level) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic - adjust based on your auth strategy)
-- Allow public read access to recommendations
CREATE POLICY "Public read recommendations" ON recommendations FOR SELECT USING (true);

-- Students can read their own data
CREATE POLICY "Students read own data" ON students FOR SELECT USING (true);
CREATE POLICY "Students insert own data" ON students FOR INSERT WITH CHECK (true);

-- Staff can read all student data
CREATE POLICY "Staff read all" ON staff FOR SELECT USING (true);
CREATE POLICY "Staff insert" ON staff FOR INSERT WITH CHECK (true);

-- Quiz results policies
CREATE POLICY "Quiz results read" ON quiz_results FOR SELECT USING (true);
CREATE POLICY "Quiz results insert" ON quiz_results FOR INSERT WITH CHECK (true);

-- Emotional states policies
CREATE POLICY "Emotional states read" ON emotional_states FOR SELECT USING (true);
CREATE POLICY "Emotional states insert" ON emotional_states FOR INSERT WITH CHECK (true);

-- ============================================================================
-- LEARNING ANALYTICS AI TABLES
-- ============================================================================

-- Learning Analytics Reports Table
CREATE TABLE IF NOT EXISTS learning_analytics_reports (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  timestamp BIGINT NOT NULL,
  overall_health TEXT NOT NULL CHECK (overall_health IN ('excellent', 'good', 'fair', 'poor', 'critical')),
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  problems TEXT NOT NULL, -- JSON array of LearningProblem objects
  strengths TEXT NOT NULL, -- JSON array of strings
  performance_trend TEXT NOT NULL CHECK (performance_trend IN ('improving', 'declining', 'stable', 'fluctuating')),
  engagement_level TEXT NOT NULL CHECK (engagement_level IN ('high', 'medium', 'low')),
  learning_style TEXT NOT NULL CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading-writing', 'mixed')),
  intervention_required INTEGER NOT NULL DEFAULT 0 CHECK (intervention_required IN (0, 1)),
  mentor_alert INTEGER NOT NULL DEFAULT 0 CHECK (mentor_alert IN (0, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for learning analytics
CREATE INDEX IF NOT EXISTS idx_analytics_student_id ON learning_analytics_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON learning_analytics_reports(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_health ON learning_analytics_reports(overall_health);
CREATE INDEX IF NOT EXISTS idx_analytics_intervention ON learning_analytics_reports(intervention_required);
CREATE INDEX IF NOT EXISTS idx_analytics_mentor_alert ON learning_analytics_reports(mentor_alert);

-- RLS Policies for learning analytics
ALTER TABLE learning_analytics_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analytics read" ON learning_analytics_reports FOR SELECT USING (true);
CREATE POLICY "Analytics insert" ON learning_analytics_reports FOR INSERT WITH CHECK (true);

-- View for mentor alerts
CREATE OR REPLACE VIEW mentor_alert_dashboard AS
SELECT 
  s.id as student_id,
  s.name as student_name,
  s.email as student_email,
  s.domain,
  lar.overall_health,
  lar.health_score,
  lar.problems,
  lar.intervention_required,
  lar.mentor_alert,
  lar.timestamp,
  lar.created_at
FROM learning_analytics_reports lar
JOIN students s ON lar.student_id = s.id
WHERE lar.mentor_alert = 1
ORDER BY lar.timestamp DESC;

-- View for intervention queue
CREATE OR REPLACE VIEW intervention_queue AS
SELECT 
  s.id as student_id,
  s.name as student_name,
  s.email as student_email,
  s.domain,
  lar.overall_health,
  lar.health_score,
  lar.problems,
  lar.performance_trend,
  lar.engagement_level,
  lar.timestamp
FROM learning_analytics_reports lar
JOIN students s ON lar.student_id = s.id
WHERE lar.intervention_required = 1
ORDER BY 
  CASE lar.overall_health
    WHEN 'critical' THEN 1
    WHEN 'poor' THEN 2
    WHEN 'fair' THEN 3
    ELSE 4
  END,
  lar.timestamp DESC;


-- ============================================================================
-- VIDEO RECOMMENDATIONS TABLES
-- ============================================================================

-- Video Recommendations Table
CREATE TABLE IF NOT EXISTS video_recommendations (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  timestamp BIGINT NOT NULL,
  videos TEXT NOT NULL, -- JSON array of VideoRecommendation objects
  resources TEXT NOT NULL, -- JSON array of LearningResource objects
  study_plan TEXT NOT NULL, -- JSON object with immediate/thisWeek/thisMonth
  estimated_study_time TEXT NOT NULL,
  focus_areas TEXT NOT NULL, -- JSON array of concept names
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Watch History Table
CREATE TABLE IF NOT EXISTS video_watch_history (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  watch_time INTEGER NOT NULL, -- seconds watched
  completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for video recommendations
CREATE INDEX IF NOT EXISTS idx_video_recommendations_student ON video_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_video_recommendations_timestamp ON video_recommendations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_video_watch_history_student ON video_watch_history(student_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_history_video ON video_watch_history(video_id);

-- RLS Policies for video recommendations
ALTER TABLE video_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_watch_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Video recommendations read" ON video_recommendations FOR SELECT USING (true);
CREATE POLICY "Video recommendations insert" ON video_recommendations FOR INSERT WITH CHECK (true);

CREATE POLICY "Video watch history read" ON video_watch_history FOR SELECT USING (true);
CREATE POLICY "Video watch history insert" ON video_watch_history FOR INSERT WITH CHECK (true);

-- View for student video progress
CREATE OR REPLACE VIEW student_video_progress AS
SELECT 
  s.id as student_id,
  s.name as student_name,
  COUNT(DISTINCT vwh.video_id) as videos_watched,
  SUM(vwh.watch_time) as total_watch_time,
  SUM(vwh.completed) as videos_completed,
  AVG(vwh.watch_time) as avg_watch_time
FROM students s
LEFT JOIN video_watch_history vwh ON s.id = vwh.student_id
GROUP BY s.id, s.name;
