/**
 * NeuroPath Learning DNA System - MongoDB Server
 * Express server with MongoDB Atlas integration
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import axios from 'axios';

// Import MongoDB connection and models
import {
  initializeDatabase,
  Student,
  QuizResult,
  EmotionalState,
  ProctoringViolation,
  SafaConceptMastery,
  SafaAnswerAttempt,
  SafaFeedbackLog,
  SafaRevisionQueue,
  LearningAnalyticsReport,
  VideoRecommendation,
  VideoWatchHistory,
  AdminVideoSuggestion,
  VideoView
} from './backend/mongodb.js';

// Import video upload handlers
import {
  videoUpload,
  uploadVideo,
  streamVideo,
  getVideoThumbnail,
  deleteVideo,
  listVideos,
  getVideoMetadata,
  handleMulterError
} from './backend/video-upload.js';

// Import ML integration
import {
  predictStudentCategory,
  batchPredictStudents,
  getModelInfo,
  getFeatureImportance,
  checkMLHealth,
  calculateMLFeatures
} from './backend/ml-integration.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Initialize MongoDB with retry logic
  let mongoConnected = false;
  try {
    await initializeDatabase();
    mongoConnected = true;
    console.log('✅ MongoDB connection successful');
  } catch (error) {
    console.error('⚠️  MongoDB Connection Failed:', error);
    console.log('⚠️  Server will start in FALLBACK MODE');
    console.log('⚠️  Please check:');
    console.log('   1. Internet connection');
    console.log('   2. MongoDB Atlas cluster is running');
    console.log('   3. IP address is whitelisted in MongoDB Atlas');
    console.log('   4. Connection string in .env is correct');
    console.log('');
    console.log('💡 The server will continue to run, but database operations will fail.');
    console.log('💡 Fix the connection and restart the server.');
  }

  // ============================================================================
  // AUTHENTICATION ENDPOINTS
  // ============================================================================

  // Register
  app.post("/api/register", async (req, res) => {
    try {
      const { name, email, password, role, domain, department, face_descriptor, mobile_number, address, college_name } = req.body;
      
      // Check if user exists
      const existingUser = await Student.findOne({ email });
      if (existingUser) {
        return res.json({ success: false, error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new student
      const student = new Student({
        name,
        email,
        password: hashedPassword,
        role: role || 'student',
        domain,
        department,
        face_descriptor,
        mobile_number,
        address,
        college_name
      });

      await student.save();
      res.json({ success: true });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;
      
      const user = await Student.findOne({ email, role });
      if (!user) {
        return res.json({ success: false, error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.json({ success: false, error: "Invalid credentials" });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          domain: user.domain,
          department: user.department,
          face_descriptor: user.face_descriptor,
          mobile_number: user.mobile_number,
          address: user.address,
          college_name: user.college_name
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ============================================================================
  // QUIZ ENDPOINTS
  // ============================================================================

  // Submit Quiz
  app.post("/api/quiz/submit", async (req, res) => {
    try {
      const {
        studentId, score, missedConcepts, criticalConcepts, criticalQuestions,
        totalTime, avgQuestionTime, questionTimes, typingSpeed, tabSwitchCount,
        voiceDetected, avgFocusLevel, avgStressLevel, avgHappinessLevel
      } = req.body;

      // Determine level
      let level = 'Beginner';
      if (score >= 80) level = 'Advanced';
      else if (score >= 50) level = 'Intermediate';

      // Create quiz result
      const quizResult = new QuizResult({
        student_id: studentId,
        score,
        level,
        missed_concepts: missedConcepts,
        critical_concepts: criticalConcepts,
        critical_questions: criticalQuestions,
        total_time: totalTime,
        avg_question_time: avgQuestionTime,
        question_times: questionTimes,
        typing_speed: typingSpeed,
        tab_switch_count: tabSwitchCount,
        voice_detected: voiceDetected,
        avg_focus_level: avgFocusLevel,
        avg_stress_level: avgStressLevel,
        avg_happiness_level: avgHappinessLevel
      });

      await quizResult.save();

      res.json({
        success: true,
        result: {
          score,
          level,
          recommendation: `You scored ${score}%. ${level === 'Advanced' ? 'Excellent work!' : level === 'Intermediate' ? 'Good progress!' : 'Keep practicing!'}`,
          criticalConcepts,
          criticalQuestions
        }
      });
    } catch (error) {
      console.error("Quiz submission error:", error);
      res.status(500).json({ error: "Failed to submit quiz" });
    }
  });

  // Get Student Stats
  app.get("/api/student/stats/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;

      const quizResults = await QuizResult.find({ student_id: studentId })
        .sort({ timestamp: -1 })
        .limit(10);

      if (quizResults.length === 0) {
        return res.json({ hasTakenQuiz: false });
      }

      const latest = quizResults[0];
      const avgScore = quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length;

      res.json({
        hasTakenQuiz: true,
        score: latest.score,
        level: latest.level,
        recommendation: `Average score: ${Math.round(avgScore)}%`,
        criticalConcepts: latest.critical_concepts,
        criticalQuestions: latest.critical_questions
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ============================================================================
  // EMOTIONAL STATE ENDPOINTS
  // ============================================================================

  app.post("/api/emotional-state", async (req, res) => {
    try {
      const { studentId, stressLevel, happinessLevel, focusLevel, typingSpeed, voiceDetected, tabSwitchCount } = req.body;

      const emotionalState = new EmotionalState({
        student_id: studentId,
        stress_level: stressLevel,
        happiness_level: happinessLevel,
        focus_level: focusLevel,
        typing_speed: typingSpeed,
        voice_detected: voiceDetected,
        tab_switch_count: tabSwitchCount
      });

      await emotionalState.save();
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to save emotional state:", error);
      res.status(500).json({ error: "Failed to save emotional state" });
    }
  });

  // ============================================================================
  // PROCTORING ENDPOINTS
  // ============================================================================

  app.post("/api/proctoring/violation", async (req, res) => {
    try {
      const { studentId, violationType, timestamp, screenshot } = req.body;

      const violation = new ProctoringViolation({
        student_id: studentId,
        violation_type: violationType,
        timestamp,
        screenshot
      });

      await violation.save();
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to log violation:", error);
      res.status(500).json({ error: "Failed to log violation" });
    }
  });

  // ============================================================================
  // SAFA ENDPOINTS
  // ============================================================================

  app.post("/api/safa/submit-answer", async (req, res) => {
    try {
      const { studentId, questionId, conceptId, answer, correctAnswer, attemptNumber, timeSpent, difficulty } = req.body;
      
      // Import SAFA algorithm
      const { safaAlgorithm } = await import('./backend/safa-algorithm.js');
      
      // Get or create mastery
      let mastery = await SafaConceptMastery.findOne({ student_id: studentId, concept_id: conceptId });
      
      if (!mastery) {
        mastery = new SafaConceptMastery({
          student_id: studentId,
          concept_id: conceptId,
          concept_name: conceptId,
          mastery_score: 0
        });
        await mastery.save();
      }

      // Prepare data
      const answerData = {
        studentId,
        questionId,
        conceptId,
        answer,
        correctAnswer,
        attemptNumber,
        timeSpent,
        difficulty,
        timestamp: Date.now()
      };

      const questionMetadata = {
        questionId,
        conceptId,
        difficulty,
        commonErrors: [],
        hints: {
          micro: "Think about the key concept.",
          guided: "Consider the relationship between the variables.",
          detailed: ["Identify key information", "Apply the concept", "Calculate step by step"]
        },
        prerequisites: [],
        relatedConcepts: []
      };

      const currentMastery = {
        conceptId: mastery.concept_id,
        conceptName: mastery.concept_name,
        masteryScore: mastery.mastery_score,
        totalAttempts: mastery.total_attempts,
        correctAttempts: mastery.correct_attempts,
        averageTimeSpent: mastery.average_time_spent,
        lastAttemptDate: mastery.last_attempt_date,
        trend: mastery.trend,
        confidenceLevel: mastery.confidence_level
      };

      // Generate feedback
      const feedback = await safaAlgorithm.analyzeAndGenerateFeedback(answerData, questionMetadata, currentMastery);

      // Update mastery
      await SafaConceptMastery.findOneAndUpdate(
        { student_id: studentId, concept_id: conceptId },
        {
          mastery_score: feedback.masteryUpdate.masteryScore,
          total_attempts: feedback.masteryUpdate.totalAttempts,
          correct_attempts: feedback.masteryUpdate.correctAttempts,
          average_time_spent: feedback.masteryUpdate.averageTimeSpent,
          last_attempt_date: feedback.masteryUpdate.lastAttemptDate,
          trend: feedback.masteryUpdate.trend,
          confidence_level: feedback.masteryUpdate.confidenceLevel,
          updated_at: new Date()
        }
      );

      // Log answer attempt
      const answerAttempt = new SafaAnswerAttempt({
        student_id: studentId,
        question_id: questionId,
        concept_id: conceptId,
        answer: String(answer),
        correct_answer: String(correctAnswer),
        is_correct: answer === correctAnswer,
        attempt_number: attemptNumber,
        time_spent: timeSpent,
        difficulty,
        error_type: feedback.errorClassification.errorType,
        error_severity: feedback.errorClassification.severity,
        feedback_level: feedback.feedbackLevel.level,
        feedback_intensity: feedback.feedbackLevel.intensity,
        mastery_score_before: currentMastery.masteryScore,
        mastery_score_after: feedback.masteryUpdate.masteryScore,
        timestamp: Date.now()
      });
      await answerAttempt.save();

      // Log feedback
      const feedbackLog = new SafaFeedbackLog({
        feedback_id: feedback.feedbackId,
        student_id: studentId,
        question_id: questionId,
        error_type: feedback.errorClassification.errorType,
        error_severity: feedback.errorClassification.severity,
        feedback_level: feedback.feedbackLevel.level,
        feedback_intensity: feedback.feedbackLevel.intensity,
        feedback_content: feedback.feedbackLevel.content,
        next_difficulty: feedback.nextQuestionDifficulty,
        revision_recommended: feedback.revisionRecommended,
        revision_concepts: feedback.revisionConcepts,
        confidence_boost: feedback.confidenceBoost,
        timestamp: Date.now()
      });
      await feedbackLog.save();

      // Add to revision queue if needed
      if (feedback.revisionRecommended) {
        for (const concept of feedback.revisionConcepts) {
          await SafaRevisionQueue.findOneAndUpdate(
            { student_id: studentId, concept_id: concept, completed: false },
            {
              student_id: studentId,
              concept_id: concept,
              priority: feedback.feedbackLevel.intensity,
              reason: feedback.errorClassification.description,
              added_date: Date.now()
            },
            { upsert: true }
          );
        }
      }

      res.json({ success: true, feedback });
    } catch (error) {
      console.error("SAFA submit answer failed:", error);
      res.status(500).json({ error: "Failed to process answer" });
    }
  });

  // Get Mastery
  app.get("/api/safa/mastery/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const masteryData = await SafaConceptMastery.find({ student_id: studentId })
        .sort({ mastery_score: 1 });
      
      res.json({ success: true, mastery: masteryData });
    } catch (error) {
      console.error("Failed to get mastery data:", error);
      res.status(500).json({ error: "Failed to get mastery data" });
    }
  });

  // Get Revision Queue
  app.get("/api/safa/revision-queue/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const queue = await SafaRevisionQueue.find({ student_id: studentId, completed: false })
        .sort({ priority: -1, added_date: 1 });
      
      res.json({ success: true, queue });
    } catch (error) {
      console.error("Failed to get revision queue:", error);
      res.status(500).json({ error: "Failed to get revision queue" });
    }
  });

  // Get Answer History
  app.get("/api/safa/answer-history/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const { conceptId, limit = 20 } = req.query;
      
      const query: any = { student_id: studentId };
      if (conceptId) {
        query.concept_id = conceptId;
      }
      
      const history = await SafaAnswerAttempt.find(query)
        .sort({ created_at: -1 })
        .limit(Number(limit));
      
      res.json({ success: true, history });
    } catch (error) {
      console.error("Failed to get answer history:", error);
      res.status(500).json({ error: "Failed to get answer history" });
    }
  });

  // Get Feedback Analytics
  app.get("/api/safa/analytics/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      
      // Get overall statistics
      const attempts = await SafaAnswerAttempt.find({ student_id: studentId });
      const stats = {
        total_attempts: attempts.length,
        correct_attempts: attempts.filter(a => a.is_correct).length,
        avg_time_spent: attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.time_spent, 0) / attempts.length : 0,
        avg_mastery_score: attempts.length > 0 ? attempts.reduce((sum, a) => sum + (a.mastery_score_after || 0), 0) / attempts.length : 0
      };
      
      // Get error type distribution
      const incorrectAttempts = attempts.filter(a => !a.is_correct);
      const errorTypes: Record<string, number> = {};
      incorrectAttempts.forEach(a => {
        if (a.error_type) {
          errorTypes[a.error_type] = (errorTypes[a.error_type] || 0) + 1;
        }
      });
      const errorDistribution = Object.entries(errorTypes).map(([error_type, count]) => ({ error_type, count }));
      
      // Get feedback level distribution
      const feedbackLevels: Record<string, number> = {};
      attempts.forEach(a => {
        if (a.feedback_level) {
          feedbackLevels[a.feedback_level] = (feedbackLevels[a.feedback_level] || 0) + 1;
        }
      });
      const feedbackDistribution = Object.entries(feedbackLevels).map(([feedback_level, count]) => ({ feedback_level, count }));
      
      // Get mastery progress over time
      const masteryProgress = attempts
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(a => ({
          concept_id: a.concept_id,
          mastery_score: a.mastery_score_after,
          timestamp: a.timestamp
        }));
      
      res.json({
        success: true,
        analytics: {
          stats,
          errorDistribution,
          feedbackDistribution,
          masteryProgress
        }
      });
    } catch (error) {
      console.error("Failed to get analytics:", error);
      res.status(500).json({ error: "Failed to get analytics" });
    }
  });

  // ============================================================================
  // LEARNING ANALYTICS AI ENDPOINTS
  // ============================================================================

  // Analyze Student Behavior
  app.post("/api/analytics/analyze-behavior", async (req, res) => {
    try {
      const { 
        studentId, questionId, conceptId, answer, correctAnswer, 
        timeSpent, expectedTime, attemptNumber, difficulty,
        confidenceLevel, hesitationTime, revisionCount,
        focusLevel, stressLevel
      } = req.body;

      // Import Learning Analytics AI
      const { learningAnalyticsAI } = await import('./backend/learning-analytics-ai.js');

      // Get previous attempts
      const previousAttempts = await SafaAnswerAttempt.find({ student_id: studentId })
        .sort({ created_at: -1 })
        .limit(10);

      // Get concept history
      const conceptHistory = await SafaConceptMastery.find({ student_id: studentId });

      // Prepare behavior data
      const behaviorData = {
        studentId,
        questionId,
        conceptId,
        answer,
        correctAnswer,
        timeSpent,
        expectedTime,
        attemptNumber,
        difficulty,
        confidenceLevel,
        hesitationTime,
        revisionCount,
        focusLevel,
        stressLevel,
        previousAttempts: previousAttempts.map((a: any) => ({
          studentId: a.student_id,
          questionId: a.question_id,
          conceptId: a.concept_id,
          answer: a.answer,
          correctAnswer: a.correct_answer,
          timeSpent: a.time_spent,
          expectedTime: expectedTime,
          attemptNumber: a.attempt_number,
          difficulty: a.difficulty,
          focusLevel: focusLevel,
          stressLevel: stressLevel
        })),
        conceptHistory: conceptHistory.map((c: any) => ({
          conceptId: c.concept_id,
          totalAttempts: c.total_attempts,
          correctAttempts: c.correct_attempts,
          averageTime: c.average_time_spent,
          masteryScore: c.mastery_score,
          trend: c.trend
        }))
      };

      // Analyze behavior
      const report = await learningAnalyticsAI.analyzeStudentBehavior(behaviorData);

      // Store analytics report
      const analyticsReport = new LearningAnalyticsReport({
        student_id: studentId,
        timestamp: report.timestamp,
        overall_health: report.overallHealth,
        health_score: report.healthScore,
        problems: report.problems,
        strengths: report.strengths,
        performance_trend: report.performanceTrend,
        engagement_level: report.engagementLevel,
        learning_style: report.learningStyle,
        intervention_required: report.interventionRequired,
        mentor_alert: report.mentorAlert
      });
      await analyticsReport.save();

      res.json({ success: true, report });
    } catch (error) {
      console.error("Learning analytics analysis failed:", error);
      res.status(500).json({ error: "Failed to analyze behavior" });
    }
  });

  // Get Student Health Report
  app.get("/api/analytics/health-report/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      
      const latestReport = await LearningAnalyticsReport.findOne({ student_id: studentId })
        .sort({ timestamp: -1 });

      if (!latestReport) {
        return res.json({ 
          success: true, 
          report: null,
          message: 'No analytics data available yet' 
        });
      }

      const report = {
        studentId: latestReport.student_id,
        timestamp: latestReport.timestamp,
        overallHealth: latestReport.overall_health,
        healthScore: latestReport.health_score,
        problems: latestReport.problems,
        strengths: latestReport.strengths,
        performanceTrend: latestReport.performance_trend,
        engagementLevel: latestReport.engagement_level,
        learningStyle: latestReport.learning_style,
        interventionRequired: latestReport.intervention_required,
        mentorAlert: latestReport.mentor_alert
      };

      res.json({ success: true, report });
    } catch (error) {
      console.error("Failed to get health report:", error);
      res.status(500).json({ error: "Failed to get health report" });
    }
  });

  // ============================================================================
  // VIDEO RECOMMENDATIONS ENDPOINTS
  // ============================================================================

  // Generate Video Recommendations
  app.post("/api/recommendations/generate", async (req, res) => {
    try {
      const { studentId } = req.body;

      // Import video recommendation engine
      const { videoRecommendationEngine } = await import('./backend/video-recommendation-engine.js');

      // Get student's latest quiz result
      const latestQuiz = await QuizResult.findOne({ student_id: studentId })
        .sort({ timestamp: -1 });

      if (!latestQuiz) {
        return res.json({ 
          success: false, 
          error: 'No quiz data available. Please take a quiz first.' 
        });
      }

      // Get mastery scores
      const masteryData = await SafaConceptMastery.find({ student_id: studentId });
      const masteryScores: Record<string, number> = {};
      masteryData.forEach((m: any) => {
        masteryScores[m.concept_id] = m.mastery_score;
      });

      // Get learning analytics
      const analytics = await LearningAnalyticsReport.findOne({ student_id: studentId })
        .sort({ timestamp: -1 });

      // Prepare student report
      const report = {
        studentId,
        weakConcepts: latestQuiz.missed_concepts || [],
        criticalConcepts: latestQuiz.critical_concepts || [],
        missedQuestions: latestQuiz.critical_questions || [],
        masteryScores,
        learningProblems: analytics ? analytics.problems : [],
        performanceTrend: (analytics?.performance_trend === 'fluctuating' ? 'stable' : analytics?.performance_trend) || 'stable' as 'improving' | 'declining' | 'stable',
        learningStyle: analytics?.learning_style || 'mixed' as 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing' | 'mixed'
      };

      // Generate recommendations
      const recommendations = await videoRecommendationEngine.generateRecommendations(report);

      // Store recommendations
      const videoRec = new VideoRecommendation({
        student_id: studentId,
        timestamp: recommendations.timestamp,
        videos: recommendations.videos,
        resources: recommendations.resources,
        study_plan: recommendations.studyPlan,
        estimated_study_time: recommendations.estimatedStudyTime,
        focus_areas: recommendations.focusAreas
      });
      await videoRec.save();

      res.json({ success: true, recommendations });
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Get Latest Recommendations
  app.get("/api/recommendations/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;

      const recommendation = await VideoRecommendation.findOne({ student_id: studentId })
        .sort({ timestamp: -1 });

      if (!recommendation) {
        return res.json({ 
          success: false, 
          message: 'No recommendations available. Generate recommendations first.' 
        });
      }

      const result = {
        studentId: recommendation.student_id,
        timestamp: recommendation.timestamp,
        videos: recommendation.videos,
        resources: recommendation.resources,
        studyPlan: recommendation.study_plan,
        estimatedStudyTime: recommendation.estimated_study_time,
        focusAreas: recommendation.focus_areas
      };

      res.json({ success: true, recommendations: result });
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  // Track Video Watch
  app.post("/api/recommendations/track-watch", async (req, res) => {
    try {
      const { studentId, videoId, watchTime, completed } = req.body;

      const watchHistory = new VideoWatchHistory({
        student_id: studentId,
        video_id: videoId,
        watch_time: watchTime,
        completed: completed || false,
        timestamp: Date.now()
      });
      await watchHistory.save();

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to track video watch:", error);
      res.status(500).json({ error: "Failed to track video watch" });
    }
  });

  // Get Watch History
  app.get("/api/recommendations/watch-history/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;

      const history = await VideoWatchHistory.find({ student_id: studentId })
        .sort({ timestamp: -1 })
        .limit(50);

      res.json({ success: true, history });
    } catch (error) {
      console.error("Failed to get watch history:", error);
      res.status(500).json({ error: "Failed to get watch history" });
    }
  });

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  // Get All Students
  app.get("/api/admin/students", async (req, res) => {
    try {
      const students = await Student.aggregate([
        {
          $lookup: {
            from: 'quizresults',
            let: { studentId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$student_id', '$$studentId'] } } },
              { $sort: { timestamp: -1 } },
              { $limit: 1 }
            ],
            as: 'latestQuiz'
          }
        },
        {
          $lookup: {
            from: 'emotionalstates',
            let: { studentId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$student_id', '$$studentId'] } } },
              { $sort: { timestamp: -1 } },
              { $limit: 1 }
            ],
            as: 'latestEmotion'
          }
        },
        {
          $project: {
            id: '$_id',
            name: 1,
            email: 1,
            domain: 1,
            score: { $arrayElemAt: ['$latestQuiz.score', 0] },
            level: { $arrayElemAt: ['$latestQuiz.level', 0] },
            critical_concepts: { $arrayElemAt: ['$latestQuiz.critical_concepts', 0] },
            critical_questions: { $arrayElemAt: ['$latestQuiz.critical_questions', 0] },
            timestamp: { $arrayElemAt: ['$latestQuiz.timestamp', 0] },
            stress_level: { $arrayElemAt: ['$latestEmotion.stress_level', 0] },
            happiness_level: { $arrayElemAt: ['$latestEmotion.happiness_level', 0] }
          }
        }
      ]);

      res.json(students);
    } catch (error) {
      console.error("Failed to fetch admin students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  // Get Emotional Summary
  app.get("/api/admin/emotional-summary", async (req, res) => {
    try {
      const summary = await Student.aggregate([
        {
          $lookup: {
            from: 'emotionalstates',
            let: { studentId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$student_id', '$$studentId'] } } },
              { $sort: { timestamp: -1 } },
              { $limit: 1 }
            ],
            as: 'latestEmotion'
          }
        },
        {
          $unwind: { path: '$latestEmotion', preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            name: 1,
            stress_level: '$latestEmotion.stress_level',
            happiness_level: '$latestEmotion.happiness_level',
            timestamp: '$latestEmotion.timestamp'
          }
        }
      ]);

      res.json(summary);
    } catch (error) {
      console.error("Failed to fetch emotional summary:", error);
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  });

  // ============================================================================
  // ADMIN VIDEO SUGGESTIONS ENDPOINTS
  // ============================================================================

  // Get all video suggestions (Admin)
  app.get("/api/admin/videos", async (req, res) => {
    try {
      if (!mongoConnected) {
        return res.json({
          success: true,
          videos: [],
          total: 0,
          message: "Database not connected"
        });
      }

      const { domain, difficulty_level, category, is_active } = req.query;

      const filter: any = {};
      if (domain) filter.domain = domain;
      if (difficulty_level) filter.difficulty_level = difficulty_level;
      if (category) filter.category = category;
      if (is_active !== undefined) filter.is_active = is_active === 'true';

      const videoDocs = await AdminVideoSuggestion.find(filter)
        .sort({ created_at: -1 })
        .populate('created_by', 'name email')
        .lean();

      // Transform MongoDB documents to match frontend interface
      const videos = videoDocs.map((video: any) => ({
        id: video._id.toString(),
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url || '',
        duration: video.duration || '',
        difficulty_level: video.difficulty_level,
        concepts: video.concepts || [],
        domain: video.domain,
        category: video.category || 'Tutorial',
        tags: video.tags || [],
        created_by: video.created_by?._id?.toString() || video.created_by,
        created_at: video.created_at,
        is_active: video.is_active,
        view_count: video.view_count || 0,
        rating: video.rating || 0
      }));

      res.json({
        success: true,
        videos,
        total: videos.length
      });
    } catch (error: any) {
      console.error("Failed to fetch video suggestions:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to fetch video suggestions" 
      });
    }
  });

  // Add new video suggestion (Admin)
  app.post("/api/admin/videos", async (req, res) => {
    try {
      console.log('📥 POST /api/admin/videos - Request received');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      if (!mongoConnected) {
        console.error('❌ MongoDB not connected');
        return res.status(503).json({ 
          success: false, 
          error: "Database not connected. Please check MongoDB connection." 
        });
      }

      const {
        title, description, video_url, thumbnail_url, duration,
        difficulty_level, concepts, domain, category, tags, created_by
      } = req.body;

      console.log('Extracted fields:', { title, description, video_url, difficulty_level, domain, created_by });

      // Validate required fields
      if (!title || !description || !video_url || !difficulty_level || !domain) {
        console.error('❌ Missing required fields');
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, description, video_url, difficulty_level, domain'
        });
      }

      // Validate difficulty level
      if (!['beginner', 'intermediate', 'advanced'].includes(difficulty_level)) {
        console.error('❌ Invalid difficulty level:', difficulty_level);
        return res.status(400).json({
          success: false,
          error: 'Invalid difficulty_level. Must be: beginner, intermediate, or advanced'
        });
      }

      // Validate created_by
      if (!created_by) {
        console.error('❌ Missing created_by field');
        return res.status(400).json({
          success: false,
          error: 'Missing created_by field (admin ID required)'
        });
      }

      // Create video suggestion
      const videoData = {
        title: title.trim(),
        description: description.trim(),
        video_url: video_url.trim(),
        thumbnail_url: thumbnail_url?.trim() || '',
        duration: duration?.trim() || '',
        difficulty_level,
        concepts: Array.isArray(concepts) ? concepts : [],
        domain: domain.trim(),
        category: category?.trim() || 'Tutorial',
        tags: Array.isArray(tags) ? tags : [],
        created_by,
        is_active: true,
        view_count: 0,
        rating: 0
      };

      console.log('Creating video with data:', JSON.stringify(videoData, null, 2));

      const videoSuggestion = new AdminVideoSuggestion(videoData);

      console.log('Saving to database...');
      const savedVideo = await videoSuggestion.save();
      console.log('✅ Video saved successfully:', savedVideo._id);

      const response = {
        success: true,
        videoId: savedVideo._id.toString(),
        video: {
          id: savedVideo._id.toString(),
          title: savedVideo.title,
          description: savedVideo.description,
          video_url: savedVideo.video_url,
          thumbnail_url: savedVideo.thumbnail_url,
          duration: savedVideo.duration,
          difficulty_level: savedVideo.difficulty_level,
          concepts: savedVideo.concepts,
          domain: savedVideo.domain,
          category: savedVideo.category,
          tags: savedVideo.tags,
          created_by: savedVideo.created_by,
          created_at: savedVideo.created_at,
          is_active: savedVideo.is_active,
          view_count: savedVideo.view_count,
          rating: savedVideo.rating
        },
        message: 'Video suggestion added successfully'
      };

      console.log('📤 Sending response:', response.success);
      res.status(201).json(response);
    } catch (error: any) {
      console.error("❌ Failed to add video suggestion:");
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Full error:", error);
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(409).json({ 
          success: false, 
          error: "A video with this URL already exists" 
        });
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((e: any) => e.message).join(', ');
        return res.status(400).json({ 
          success: false, 
          error: `Validation error: ${validationErrors}` 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to add video suggestion" 
      });
    }
  });

  // Update video suggestion (Admin)
  app.put("/api/admin/videos/:videoId", async (req, res) => {
    try {
      if (!mongoConnected) {
        return res.status(503).json({ 
          success: false, 
          error: "Database not connected" 
        });
      }

      const { videoId } = req.params;
      const updates = req.body;
      
      // Validate videoId
      if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid video ID format'
        });
      }

      // Add updated timestamp
      updates.updated_at = new Date();

      // Validate difficulty level if provided
      if (updates.difficulty_level && !['beginner', 'intermediate', 'advanced'].includes(updates.difficulty_level)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid difficulty_level'
        });
      }

      const updatedVideo = await AdminVideoSuggestion.findByIdAndUpdate(
        videoId, 
        updates,
        { new: true, runValidators: true }
      ).lean();

      if (!updatedVideo) {
        return res.status(404).json({
          success: false,
          error: 'Video not found'
        });
      }

      res.json({
        success: true,
        video: {
          id: updatedVideo._id.toString(),
          title: updatedVideo.title,
          description: updatedVideo.description,
          video_url: updatedVideo.video_url,
          thumbnail_url: updatedVideo.thumbnail_url,
          duration: updatedVideo.duration,
          difficulty_level: updatedVideo.difficulty_level,
          concepts: updatedVideo.concepts,
          domain: updatedVideo.domain,
          category: updatedVideo.category,
          tags: updatedVideo.tags,
          created_by: updatedVideo.created_by,
          created_at: updatedVideo.created_at,
          updated_at: updatedVideo.updated_at,
          is_active: updatedVideo.is_active,
          view_count: updatedVideo.view_count,
          rating: updatedVideo.rating
        },
        message: 'Video suggestion updated successfully'
      });
    } catch (error: any) {
      console.error("Failed to update video suggestion:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to update video suggestion" 
      });
    }
  });

  // Delete video suggestion (Admin)
  app.delete("/api/admin/videos/:videoId", async (req, res) => {
    try {
      if (!mongoConnected) {
        return res.status(503).json({ 
          success: false, 
          error: "Database not connected" 
        });
      }

      const { videoId } = req.params;

      // Validate videoId
      if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid video ID format'
        });
      }

      const deletedVideo = await AdminVideoSuggestion.findByIdAndDelete(videoId);

      if (!deletedVideo) {
        return res.status(404).json({
          success: false,
          error: 'Video not found'
        });
      }

      // Also delete associated video views
      await VideoView.deleteMany({ video_id: videoId });

      res.json({
        success: true,
        message: 'Video suggestion deleted successfully',
        deletedVideoId: videoId
      });
    } catch (error: any) {
      console.error("Failed to delete video suggestion:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to delete video suggestion" 
      });
    }
  });

  // Get video suggestions for student
  app.get("/api/student/videos/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;

      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ success: false, error: 'Student not found' });
      }

      // Get student's latest quiz to find weak concepts
      const latestQuiz = await QuizResult.findOne({ student_id: studentId })
        .sort({ timestamp: -1 });

      let weakConcepts: string[] = [];
      let level = 'beginner';

      if (latestQuiz) {
        weakConcepts = latestQuiz.missed_concepts || [];
        level = latestQuiz.level?.toLowerCase() || 'beginner';
      }

      // Get matching videos
      const filter: any = {
        domain: student.domain,
        difficulty_level: level,
        is_active: true
      };

      // Prioritize videos matching weak concepts
      if (weakConcepts.length > 0) {
        filter.concepts = { $in: weakConcepts };
      }

      const videos = await AdminVideoSuggestion.find(filter)
        .sort({ rating: -1, view_count: -1 })
        .limit(10);

      res.json({
        success: true,
        videos,
        student: {
          id: student._id,
          name: student.name,
          domain: student.domain,
          level
        },
        weakConcepts,
        total: videos.length
      });
    } catch (error) {
      console.error("Failed to fetch student video suggestions:", error);
      res.status(500).json({ success: false, error: "Failed to fetch video suggestions" });
    }
  });

  // Track video view
  app.post("/api/admin/videos/track-view", async (req, res) => {
    try {
      const { studentId, videoId, watchedDuration, completed, rating, feedback } = req.body;

      const videoView = new VideoView({
        student_id: studentId,
        video_id: videoId,
        watched_duration: watchedDuration,
        completed,
        rating,
        feedback
      });
      await videoView.save();

      // Update video stats
      const video = await AdminVideoSuggestion.findById(videoId);
      if (video) {
        video.view_count += 1;
        if (rating) {
          video.rating = ((video.rating * video.view_count) + rating) / (video.view_count + 1);
        }
        await video.save();
      }

      res.json({ success: true, message: 'Video view tracked successfully' });
    } catch (error) {
      console.error("Failed to track video view:", error);
      res.status(500).json({ success: false, error: "Failed to track video view" });
    }
  });

  // ============================================================================
  // ML COGNITIVE TWIN ENDPOINTS
  // ============================================================================

  // Get ML prediction for a student
  app.post("/api/ml/predict-student/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;

      // Check ML API health
      const isHealthy = await checkMLHealth();
      if (!isHealthy) {
        return res.status(503).json({
          success: false,
          error: 'ML API is not available. Please ensure Python ML server is running on port 5001.'
        });
      }

      // Fetch student data
      const quizResults = await QuizResult.find({ student_id: studentId }).sort({ timestamp: -1 }).limit(10);
      const emotionalStates = await EmotionalState.find({ student_id: studentId }).sort({ timestamp: -1 }).limit(10);
      const masteryData = await SafaConceptMastery.find({ student_id: studentId });

      // Calculate ML features
      const mlFeatures = calculateMLFeatures(quizResults, emotionalStates, masteryData);
      mlFeatures.student_id = parseInt(studentId);

      // Get prediction
      const prediction = await predictStudentCategory(mlFeatures);

      res.json({
        success: true,
        prediction,
        features_used: mlFeatures
      });
    } catch (error) {
      console.error("ML prediction error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get ML prediction"
      });
    }
  });

  // Batch predict for all students
  app.post("/api/ml/batch-predict-all", async (req, res) => {
    try {
      // Check ML API health
      const isHealthy = await checkMLHealth();
      if (!isHealthy) {
        return res.status(503).json({
          success: false,
          error: 'ML API is not available'
        });
      }

      // Get all students
      const students = await Student.find({ role: 'student' });

      const predictions = [];

      for (const student of students) {
        try {
          const quizResults = await QuizResult.find({ student_id: student._id }).sort({ timestamp: -1 }).limit(10);
          const emotionalStates = await EmotionalState.find({ student_id: student._id }).sort({ timestamp: -1 }).limit(10);
          const masteryData = await SafaConceptMastery.find({ student_id: student._id });

          const mlFeatures = calculateMLFeatures(quizResults, emotionalStates, masteryData);
          mlFeatures.student_id = student._id;

          const prediction = await predictStudentCategory(mlFeatures);

          predictions.push({
            student_id: student._id,
            student_name: student.name,
            prediction
          });
        } catch (error) {
          console.error(`Error predicting for student ${student._id}:`, error);
        }
      }

      res.json({
        success: true,
        predictions,
        total: predictions.length
      });
    } catch (error) {
      console.error("Batch prediction error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to perform batch prediction"
      });
    }
  });

  // Get ML model information
  app.get("/api/ml/model-info", async (req, res) => {
    try {
      const isHealthy = await checkMLHealth();
      if (!isHealthy) {
        return res.status(503).json({
          success: false,
          error: 'ML API is not available'
        });
      }

      const modelInfo = await getModelInfo();

      res.json({
        success: true,
        model_info: modelInfo
      });
    } catch (error) {
      console.error("Model info error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get model information"
      });
    }
  });

  // Get feature importance
  app.get("/api/ml/feature-importance", async (req, res) => {
    try {
      const isHealthy = await checkMLHealth();
      if (!isHealthy) {
        return res.status(503).json({
          success: false,
          error: 'ML API is not available'
        });
      }

      const featureImportance = await getFeatureImportance();

      res.json({
        success: true,
        feature_importance: featureImportance
      });
    } catch (error) {
      console.error("Feature importance error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get feature importance"
      });
    }
  });

  // Check ML API health
  app.get("/api/ml/health", async (req, res) => {
    try {
      const isHealthy = await checkMLHealth();

      res.json({
        success: true,
        ml_api_healthy: isHealthy,
        ml_api_url: process.env.ML_API_URL || 'http://localhost:5001'
      });
    } catch (error) {
      res.json({
        success: false,
        ml_api_healthy: false,
        error: error.message
      });
    }
  });

  // ============================================================================
  // VIDEO UPLOAD ENDPOINTS
  // ============================================================================

  // Upload video file
  app.post("/api/videos/upload", videoUpload.single('video'), uploadVideo, handleMulterError);

  // Stream video
  app.get("/api/videos/stream/:filename", streamVideo);

  // Get video thumbnail
  app.get("/api/videos/thumbnail/:filename", getVideoThumbnail);

  // Delete video
  app.delete("/api/videos/:filename", deleteVideo);

  // List all uploaded videos
  app.get("/api/videos/list", listVideos);

  // Get video metadata
  app.get("/api/videos/metadata/:filename", getVideoMetadata);

  // ============================================================================
  // VITE INTEGRATION
  // ============================================================================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: MongoDB Atlas`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(console.error);
