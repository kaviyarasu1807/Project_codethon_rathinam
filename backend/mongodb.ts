/**
 * MongoDB Connection and Models
 * Replaces SQLite with MongoDB Atlas
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// CONNECTION
// ============================================================================

const MONGODB_URI = process.env.DATABASE_URL || '';
const DB_NAME = process.env.DATABASE_NAME || 'neuropath_learning_dna';

export async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${DB_NAME}`);
    console.log(`🌐 Cluster: ${MONGODB_URI.includes('cluster0') ? 'Cluster0' : 'Unknown'}`);
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed through app termination');
  process.exit(0);
});

// ============================================================================
// SCHEMAS & MODELS
// ============================================================================

// Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  domain: { type: String },
  department: { type: String },
  face_descriptor: { type: String },
  mobile_number: { type: String },
  address: { type: String },
  college_name: { type: String },
  created_at: { type: Date, default: Date.now }
});

// Quiz Result Schema
const quizResultSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  score: { type: Number, required: true },
  level: { type: String, required: true },
  missed_concepts: { type: [String], default: [] },
  critical_concepts: { type: [String], default: [] },
  critical_questions: { type: [String], default: [] },
  ai_guidance: { type: String },
  total_time: { type: Number },
  avg_question_time: { type: Number },
  question_times: { type: [Number], default: [] },
  typing_speed: { type: Number },
  tab_switch_count: { type: Number },
  voice_detected: { type: Number },
  avg_focus_level: { type: Number },
  avg_stress_level: { type: Number },
  avg_happiness_level: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

// Emotional State Schema
const emotionalStateSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  stress_level: { type: Number, required: true },
  happiness_level: { type: Number, required: true },
  focus_level: { type: Number },
  typing_speed: { type: Number },
  voice_detected: { type: Boolean },
  tab_switch_count: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

// Proctoring Violation Schema
const proctoringViolationSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  violation_type: { type: String, required: true },
  timestamp: { type: Number, required: true },
  screenshot: { type: String },
  created_at: { type: Date, default: Date.now }
});

// SAFA Concept Mastery Schema
const safaConceptMasterySchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  concept_id: { type: String, required: true },
  concept_name: { type: String, required: true },
  mastery_score: { type: Number, default: 0 },
  total_attempts: { type: Number, default: 0 },
  correct_attempts: { type: Number, default: 0 },
  average_time_spent: { type: Number, default: 0 },
  last_attempt_date: { type: Number },
  trend: { type: String, enum: ['improving', 'declining', 'stable'], default: 'stable' },
  confidence_level: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  updated_at: { type: Date, default: Date.now }
});

// SAFA Answer Attempts Schema
const safaAnswerAttemptSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  question_id: { type: String, required: true },
  concept_id: { type: String, required: true },
  answer: { type: String, required: true },
  correct_answer: { type: String, required: true },
  is_correct: { type: Boolean, required: true },
  attempt_number: { type: Number, required: true },
  time_spent: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  error_type: { type: String },
  error_severity: { type: String },
  feedback_level: { type: String },
  feedback_intensity: { type: Number },
  mastery_score_before: { type: Number },
  mastery_score_after: { type: Number },
  timestamp: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

// SAFA Feedback Log Schema
const safaFeedbackLogSchema = new mongoose.Schema({
  feedback_id: { type: String, required: true, unique: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  question_id: { type: String, required: true },
  error_type: { type: String, required: true },
  error_severity: { type: String, required: true },
  feedback_level: { type: String, required: true },
  feedback_intensity: { type: Number, required: true },
  feedback_content: { type: mongoose.Schema.Types.Mixed },
  next_difficulty: { type: String, required: true },
  revision_recommended: { type: Boolean, required: true },
  revision_concepts: { type: [String], default: [] },
  confidence_boost: { type: String, required: true },
  timestamp: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

// SAFA Revision Queue Schema
const safaRevisionQueueSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  concept_id: { type: String, required: true },
  priority: { type: Number, required: true },
  reason: { type: String, required: true },
  completed: { type: Boolean, default: false },
  added_date: { type: Number, required: true },
  completed_date: { type: Number },
  created_at: { type: Date, default: Date.now }
});

// Learning Analytics Report Schema
const learningAnalyticsReportSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  timestamp: { type: Number, required: true },
  overall_health: { type: String, enum: ['excellent', 'good', 'fair', 'poor', 'critical'], required: true },
  health_score: { type: Number, required: true, min: 0, max: 100 },
  problems: { type: mongoose.Schema.Types.Mixed, required: true },
  strengths: { type: [String], required: true },
  performance_trend: { type: String, enum: ['improving', 'declining', 'stable', 'fluctuating'], required: true },
  engagement_level: { type: String, enum: ['high', 'medium', 'low'], required: true },
  learning_style: { type: String, enum: ['visual', 'auditory', 'kinesthetic', 'reading-writing', 'mixed'], required: true },
  intervention_required: { type: Boolean, required: true },
  mentor_alert: { type: Boolean, required: true },
  created_at: { type: Date, default: Date.now }
});

// Video Recommendations Schema
const videoRecommendationSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  timestamp: { type: Number, required: true },
  videos: { type: mongoose.Schema.Types.Mixed, required: true },
  resources: { type: mongoose.Schema.Types.Mixed, required: true },
  study_plan: { type: mongoose.Schema.Types.Mixed, required: true },
  estimated_study_time: { type: String, required: true },
  focus_areas: { type: [String], required: true },
  created_at: { type: Date, default: Date.now }
});

// Video Watch History Schema
const videoWatchHistorySchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  video_id: { type: String, required: true },
  watch_time: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  timestamp: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

// Admin Video Suggestion Schema
const adminVideoSuggestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  video_url: { type: String, required: true },
  thumbnail_url: { type: String },
  duration: { type: String },
  difficulty_level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  concepts: { type: [String], default: [] },
  domain: { type: String, required: true },
  category: { type: String, default: 'Tutorial' },
  tags: { type: [String], default: [] },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  is_active: { type: Boolean, default: true },
  view_count: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Video View Schema
const videoViewModel = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  video_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminVideoSuggestion', required: true },
  watched_duration: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  rating: { type: Number },
  feedback: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// ============================================================================
// CREATE INDEXES
// ============================================================================

studentSchema.index({ email: 1 });
quizResultSchema.index({ student_id: 1, timestamp: -1 });
emotionalStateSchema.index({ student_id: 1, timestamp: -1 });
proctoringViolationSchema.index({ student_id: 1, timestamp: -1 });
safaConceptMasterySchema.index({ student_id: 1, concept_id: 1 });
safaAnswerAttemptSchema.index({ student_id: 1, created_at: -1 });
safaFeedbackLogSchema.index({ student_id: 1, timestamp: -1 });
safaRevisionQueueSchema.index({ student_id: 1, completed: 1 });
learningAnalyticsReportSchema.index({ student_id: 1, timestamp: -1 });
videoRecommendationSchema.index({ student_id: 1, timestamp: -1 });
videoWatchHistorySchema.index({ student_id: 1, video_id: 1 });
adminVideoSuggestionSchema.index({ domain: 1, difficulty_level: 1, is_active: 1 });
adminVideoSuggestionSchema.index({ concepts: 1 });
videoViewModel.index({ student_id: 1, video_id: 1 });

// ============================================================================
// EXPORT MODELS
// ============================================================================

export const Student = mongoose.model('Student', studentSchema);
export const QuizResult = mongoose.model('QuizResult', quizResultSchema);
export const EmotionalState = mongoose.model('EmotionalState', emotionalStateSchema);
export const ProctoringViolation = mongoose.model('ProctoringViolation', proctoringViolationSchema);
export const SafaConceptMastery = mongoose.model('SafaConceptMastery', safaConceptMasterySchema);
export const SafaAnswerAttempt = mongoose.model('SafaAnswerAttempt', safaAnswerAttemptSchema);
export const SafaFeedbackLog = mongoose.model('SafaFeedbackLog', safaFeedbackLogSchema);
export const SafaRevisionQueue = mongoose.model('SafaRevisionQueue', safaRevisionQueueSchema);
export const LearningAnalyticsReport = mongoose.model('LearningAnalyticsReport', learningAnalyticsReportSchema);
export const VideoRecommendation = mongoose.model('VideoRecommendation', videoRecommendationSchema);
export const VideoWatchHistory = mongoose.model('VideoWatchHistory', videoWatchHistorySchema);
export const AdminVideoSuggestion = mongoose.model('AdminVideoSuggestion', adminVideoSuggestionSchema);
export const VideoView = mongoose.model('VideoView', videoViewModel);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export async function initializeDatabase() {
  try {
    await connectMongoDB();
    
    // Create indexes
    await Promise.all([
      Student.createIndexes(),
      QuizResult.createIndexes(),
      EmotionalState.createIndexes(),
      ProctoringViolation.createIndexes(),
      SafaConceptMastery.createIndexes(),
      SafaAnswerAttempt.createIndexes(),
      SafaFeedbackLog.createIndexes(),
      SafaRevisionQueue.createIndexes(),
      LearningAnalyticsReport.createIndexes(),
      VideoRecommendation.createIndexes(),
      VideoWatchHistory.createIndexes(),
      AdminVideoSuggestion.createIndexes(),
      VideoView.createIndexes()
    ]);
    
    console.log('✅ Database indexes created successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

export default mongoose;
