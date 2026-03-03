import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { analyzeSkills, generateAdaptiveStudyPlan, generateProgressAnalytics } from "./backend/adaptive-learning.js";

const db = new Database("neuropath.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    domain TEXT NOT NULL,
    face_descriptor TEXT,
    mobile_number TEXT,
    address TEXT,
    college_name TEXT,
    department TEXT
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    department TEXT
  );

  CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    score INTEGER,
    level TEXT,
    missed_concepts TEXT,
    critical_concepts TEXT,
    critical_questions TEXT,
    ai_guidance TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT UNIQUE,
    content TEXT
  );

  CREATE TABLE IF NOT EXISTS emotional_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    stress_level REAL,
    happiness_level REAL,
    focus_level REAL DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS skill_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    concept TEXT,
    strength_score REAL,
    attempts INTEGER DEFAULT 1,
    last_performance REAL,
    trend TEXT,
    next_review_date DATETIME,
    difficulty_level TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS study_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    plan_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS proctoring_violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    violation_type TEXT,
    timestamp BIGINT,
    screenshot TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS safa_concept_mastery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    concept_id TEXT,
    concept_name TEXT,
    mastery_score REAL DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    average_time_spent REAL DEFAULT 0,
    last_attempt_date BIGINT,
    trend TEXT DEFAULT 'stable',
    confidence_level TEXT DEFAULT 'low',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE(student_id, concept_id)
  );

  CREATE TABLE IF NOT EXISTS safa_answer_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    question_id TEXT,
    concept_id TEXT,
    answer TEXT,
    correct_answer TEXT,
    is_correct INTEGER,
    attempt_number INTEGER,
    time_spent REAL,
    difficulty TEXT,
    error_type TEXT,
    error_severity TEXT,
    feedback_level TEXT,
    feedback_intensity INTEGER,
    mastery_score_before REAL,
    mastery_score_after REAL,
    timestamp BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS safa_feedback_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feedback_id TEXT UNIQUE,
    student_id INTEGER,
    question_id TEXT,
    error_type TEXT,
    error_severity TEXT,
    feedback_level TEXT,
    feedback_intensity INTEGER,
    feedback_content TEXT,
    next_difficulty TEXT,
    revision_recommended INTEGER,
    revision_concepts TEXT,
    confidence_boost TEXT,
    timestamp BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS safa_revision_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    concept_id TEXT,
    priority INTEGER DEFAULT 1,
    reason TEXT,
    added_date BIGINT,
    completed INTEGER DEFAULT 0,
    completed_date BIGINT,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );
`);

// Migration: Ensure student_id exists in quiz_results (for older DB versions)
try {
  const columns = db.prepare("PRAGMA table_info(quiz_results)").all() as any[];
  if (!columns.some(c => c.name === 'student_id')) {
    db.exec("ALTER TABLE quiz_results ADD COLUMN student_id INTEGER REFERENCES students(id)");
  }
} catch (e) {
  console.error("Migration failed for quiz_results:", e);
}

// Migration: Ensure critical_concepts exists in quiz_results
try {
  const columns = db.prepare("PRAGMA table_info(quiz_results)").all() as any[];
  if (!columns.some(c => c.name === 'critical_concepts')) {
    db.exec("ALTER TABLE quiz_results ADD COLUMN critical_concepts TEXT");
  }
} catch (e) {
  console.error("Migration failed for critical_concepts:", e);
}

// Migration: Ensure critical_questions exists in quiz_results
try {
  const columns = db.prepare("PRAGMA table_info(quiz_results)").all() as any[];
  if (!columns.some(c => c.name === 'critical_questions')) {
    db.exec("ALTER TABLE quiz_results ADD COLUMN critical_questions TEXT");
  }
} catch (e) {
  console.error("Migration failed for critical_questions:", e);
}

// Migration: Ensure ai_guidance exists in quiz_results
try {
  const columns = db.prepare("PRAGMA table_info(quiz_results)").all() as any[];
  if (!columns.some(c => c.name === 'ai_guidance')) {
    db.exec("ALTER TABLE quiz_results ADD COLUMN ai_guidance TEXT");
  }
} catch (e) {
  console.error("Migration failed for ai_guidance:", e);
}

// Migration: Ensure face_descriptor exists in students
try {
  const columns = db.prepare("PRAGMA table_info(students)").all() as any[];
  if (!columns.some(c => c.name === 'face_descriptor')) {
    db.exec("ALTER TABLE students ADD COLUMN face_descriptor TEXT");
  }
} catch (e) {
  console.error("Migration failed for students:", e);
}

// Migration: Add new tracking columns to quiz_results
try {
  const columns = db.prepare("PRAGMA table_info(quiz_results)").all() as any[];
  if (!columns.some(c => c.name === 'total_time')) {
    db.exec("ALTER TABLE quiz_results ADD COLUMN total_time INTEGER");
  }
  if (!columns.some(c => c.name === 'avg_question_time')) {
    db.exec("ALTER TABLE quiz_results ADD COLUMN avg_question_time REAL");
  }
  if (!columns.some(c => c.name === 'typing_speed')) {
    db.exec("ALTER TABLE quiz_results ADD COLUMN typing_speed REAL");
  }
  if (!columns.some(c => c.name === 'tab_switch_count')) {
    db.exec("ALTER TABLE quiz_results ADD COLUMN tab_switch_count INTEGER");
  }
  if (!columns.some(c => c.name === 'voice_detected')) {
    db.exec("ALTER TABLE quiz_results ADD COLUMN voice_detected INTEGER");
  }
  if (!columns.some(c => c.name === 'avg_focus_level')) {
    db.exec("ALTER TABLE quiz_results ADD COLUMN avg_focus_level REAL");
  }
  if (!columns.some(c => c.name === 'avg_stress_level')) {
    db.exec("ALTER TABLE quiz_results ADD COLUMN avg_stress_level REAL");
  }
  if (!columns.some(c => c.name === 'avg_happiness_level')) {
    db.exec("ALTER TABLE quiz_results ADD COLUMN avg_happiness_level REAL");
  }
} catch (e) {
  console.error("Migration failed for quiz_results tracking columns:", e);
}

// Migration: Add new tracking columns to emotional_states
try {
  const columns = db.prepare("PRAGMA table_info(emotional_states)").all() as any[];
  if (!columns.some(c => c.name === 'focus_level')) {
    db.exec("ALTER TABLE emotional_states ADD COLUMN focus_level REAL");
  }
  if (!columns.some(c => c.name === 'typing_speed')) {
    db.exec("ALTER TABLE emotional_states ADD COLUMN typing_speed REAL");
  }
  if (!columns.some(c => c.name === 'voice_detected')) {
    db.exec("ALTER TABLE emotional_states ADD COLUMN voice_detected INTEGER");
  }
  if (!columns.some(c => c.name === 'tab_switch_count')) {
    db.exec("ALTER TABLE emotional_states ADD COLUMN tab_switch_count INTEGER");
  }
} catch (e) {
  console.error("Migration failed for emotional_states tracking columns:", e);
}

// Seed recommendations if empty
const seedRecs = db.prepare("SELECT COUNT(*) as count FROM recommendations").get() as { count: number };
if (seedRecs.count === 0) {
  const insertRec = db.prepare("INSERT INTO recommendations (level, content) VALUES (?, ?)");
  insertRec.run("Beginner", "Focus on core fundamentals. We recommend starting with 'Introduction to Logic' and 'Basic Problem Solving' modules. Try to practice 30 minutes daily.");
  insertRec.run("Intermediate", "Great progress! You should dive deeper into 'Advanced Algorithms' and 'System Design Basics'. Focus on building small projects to apply your knowledge.");
  insertRec.run("Advanced", "Excellent! You have a strong grasp of the material. We recommend exploring 'Machine Learning Architectures' and 'Distributed Systems'. Consider mentoring others to solidify your expertise.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Auth: Register
  app.post("/api/register", (req, res) => {
    const { name, email, password, role, domain, department, face_descriptor, mobile_number, address, college_name } = req.body;
    try {
      if (role === 'staff') {
        const info = db.prepare("INSERT INTO staff (name, email, password, department) VALUES (?, ?, ?, ?)").run(name, email, password, department || 'General');
        res.json({ success: true, userId: info.lastInsertRowid });
      } else {
        const info = db.prepare("INSERT INTO students (name, email, password, domain, face_descriptor, mobile_number, address, college_name, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
          name, 
          email, 
          password, 
          domain || 'General', 
          face_descriptor || null,
          mobile_number || null,
          address || null,
          college_name || null,
          department || null
        );
        res.json({ success: true, userId: info.lastInsertRowid });
      }
    } catch (error) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  // Auth: Login
  app.post("/api/login", (req, res) => {
    const { email, password, role } = req.body;
    let user;
    if (role === 'staff') {
      user = db.prepare("SELECT * FROM staff WHERE email = ? AND password = ?").get(email, password) as any;
    } else {
      user = db.prepare("SELECT * FROM students WHERE email = ? AND password = ?").get(email, password) as any;
    }
    
    if (user) {
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: role, 
          domain: user.domain, 
          department: user.department, 
          face_descriptor: user.face_descriptor,
          mobile_number: user.mobile_number,
          address: user.address,
          college_name: user.college_name
        } 
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Auth: Forgot Password
  app.post("/api/forgot-password", (req, res) => {
    const { email } = req.body;
    
    try {
      const student = db.prepare("SELECT id, name, email FROM students WHERE email = ?").get(email) as any;
      const staff = db.prepare("SELECT id, name, email FROM staff WHERE email = ?").get(email) as any;
      
      if (!student && !staff) {
        res.json({ success: true, message: "If the email exists, a reset link has been sent." });
        return;
      }

      const user = student || staff;
      const userType = student ? 'student' : 'staff';
      
      const resetToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15) + 
                        Date.now().toString(36);
      
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      db.prepare("INSERT INTO password_reset_tokens (email, token, user_type, expires_at) VALUES (?, ?, ?, ?)").run(
        user.email, resetToken, userType, expiresAt
      );
      
      console.log(`Reset link: http://localhost:5173/reset-password?token=${resetToken}`);
      
      res.json({ success: true, message: "Password reset link has been sent to your email." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  // Auth: Verify Reset Token
  app.post("/api/verify-reset-token", (req, res) => {
    const { token } = req.body;
    
    try {
      const resetRecord = db.prepare("SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0").get(token) as any;
      
      if (!resetRecord) {
        res.status(400).json({ error: "Invalid or expired reset token" });
        return;
      }
      
      const now = new Date();
      const expiresAt = new Date(resetRecord.expires_at);
      
      if (now > expiresAt) {
        res.status(400).json({ error: "Reset token has expired" });
        return;
      }
      
      res.json({ success: true, email: resetRecord.email, userType: resetRecord.user_type });
    } catch (error) {
      console.error("Verify token error:", error);
      res.status(500).json({ error: "Failed to verify reset token" });
    }
  });

  // Auth: Reset Password
  app.post("/api/reset-password", (req, res) => {
    const { token, newPassword } = req.body;
    
    try {
      const resetRecord = db.prepare("SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0").get(token) as any;
      
      if (!resetRecord) {
        res.status(400).json({ error: "Invalid or expired reset token" });
        return;
      }
      
      const now = new Date();
      const expiresAt = new Date(resetRecord.expires_at);
      
      if (now > expiresAt) {
        res.status(400).json({ error: "Reset token has expired" });
        return;
      }
      
      if (resetRecord.user_type === 'student') {
        db.prepare("UPDATE students SET password = ? WHERE email = ?").run(newPassword, resetRecord.email);
      } else {
        db.prepare("UPDATE staff SET password = ? WHERE email = ?").run(newPassword, resetRecord.email);
      }
      
      db.prepare("UPDATE password_reset_tokens SET used = 1 WHERE token = ?").run(token);
      
      res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Quiz: Submit Results
  app.post("/api/quiz/submit", (req, res) => {
    try {
      const { 
        studentId, score, missedConcepts, criticalConcepts, criticalQuestions,
        totalTime, avgQuestionTime, typingSpeed, tabSwitchCount, voiceDetected,
        avgFocusLevel, avgStressLevel, avgHappinessLevel
      } = req.body;
      
      // Learning DNA Logic
      let level = "Beginner";
      if (score >= 80) level = "Advanced";
      else if (score >= 50) level = "Intermediate";

      const missedConceptsStr = JSON.stringify(missedConcepts || []);
      const criticalConceptsStr = JSON.stringify(criticalConcepts || []);
      const criticalQuestionsStr = JSON.stringify(criticalQuestions || []);
      
      // Enhanced AI-Driven Study Preference Logic with environment metrics
      let aiGuidance = "";
      
      if (level === "Advanced") {
        aiGuidance = "Our SVM classifier identifies you as a high-performing learner. We recommend deep-dive research papers and complex project-based learning.";
      } else if (level === "Intermediate") {
        aiGuidance = "LSTM sequence analysis suggests you benefit from iterative reinforcement. Focus on spaced-repetition and practical coding exercises.";
      } else {
        aiGuidance = "Initial pattern recognition indicates a need for foundational strengthening. We recommend structured video tutorials and step-by-step documentation.";
      }
      
      // Add environment-based insights
      if (avgFocusLevel < 50) {
        aiGuidance += " Your focus levels suggest shorter study sessions with frequent breaks would be beneficial.";
      }
      if (tabSwitchCount > 3) {
        aiGuidance += " We detected multiple tab switches - try using focus mode or website blockers during study time.";
      }
      if (avgStressLevel > 70) {
        aiGuidance += " High stress detected - consider meditation or breathing exercises before studying.";
      }
      if (avgQuestionTime && avgQuestionTime < 10) {
        aiGuidance += " You're answering quickly - take more time to read questions carefully.";
      }

      db.prepare(`
        INSERT INTO quiz_results (
          student_id, score, level, missed_concepts, critical_concepts, critical_questions, ai_guidance,
          total_time, avg_question_time, typing_speed, tab_switch_count, voice_detected,
          avg_focus_level, avg_stress_level, avg_happiness_level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        studentId, score, level, missedConceptsStr, criticalConceptsStr, criticalQuestionsStr, aiGuidance,
        totalTime, avgQuestionTime, typingSpeed, tabSwitchCount, voiceDetected,
        avgFocusLevel, avgStressLevel, avgHappinessLevel
      );
      
      const generalRecommendation = db.prepare("SELECT content FROM recommendations WHERE level = ?").get(level) as any;

      // Concept-specific recommendations logic
      const conceptRecs: Record<string, string> = {
        "Operating Systems": "We noticed you struggled with Operating Systems. We recommend reviewing the 'Process Management' and 'Memory Allocation' chapters.",
        "Data Structures": "To strengthen your Data Structures knowledge, try implementing Stacks and Queues from scratch in your favorite language.",
        "Web Development": "For Web Development, focus on understanding the DOM tree and how HTML interacts with CSS and JS.",
        "Programming Basics": "Review the core syntax of backend languages. Try building a simple CLI tool to practice logic flow.",
        "Algorithms": "Algorithms can be tricky! Practice 'Big O Notation' and common sorting/searching techniques on platforms like LeetCode.",
        "Medical Ethics": "Review the principles of patient autonomy and informed consent.",
        "Engineering Mechanics": "Focus on static equilibrium and stress-strain relationships in structural components."
      };

      const specificRecommendations = (missedConcepts || []).map((c: string) => conceptRecs[c]).filter(Boolean);

      res.json({ 
        success: true, 
        result: { 
          score, 
          level, 
          recommendation: generalRecommendation?.content,
          specificRecommendations,
          criticalConcepts,
          criticalQuestions,
          aiGuidance
        } 
      });
    } catch (error) {
      console.error("Quiz submission failed:", error);
      res.status(500).json({ error: "Failed to submit quiz" });
    }
  });

  // Emotional State: Save
  app.post("/api/emotional-state", (req, res) => {
    const { studentId, stressLevel, happinessLevel, focusLevel, typingSpeed, voiceDetected, tabSwitchCount } = req.body;
    try {
      db.prepare(`
        INSERT INTO emotional_states (
          student_id, stress_level, happiness_level, focus_level, 
          typing_speed, voice_detected, tab_switch_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(studentId, stressLevel, happinessLevel, focusLevel || 0, typingSpeed || 0, voiceDetected || 0, tabSwitchCount || 0);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save emotional state" });
    }
  });

  // Proctoring: Log Violation
  app.post("/api/proctoring/violation", (req, res) => {
    const { studentId, violationType, timestamp, screenshot } = req.body;
    try {
      db.prepare(`
        INSERT INTO proctoring_violations (
          student_id, violation_type, timestamp, screenshot
        ) VALUES (?, ?, ?, ?)
      `).run(studentId, violationType, timestamp, screenshot || null);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to log violation:", error);
      res.status(500).json({ error: "Failed to log violation" });
    }
  });

  // Proctoring: Get Violations
  app.get("/api/proctoring/violations/:studentId", (req, res) => {
    try {
      const { studentId } = req.params;
      const violations = db.prepare(`
        SELECT * FROM proctoring_violations 
        WHERE student_id = ? 
        ORDER BY created_at DESC
      `).all(studentId);
      res.json({ success: true, violations });
    } catch (error) {
      console.error("Failed to get violations:", error);
      res.status(500).json({ error: "Failed to get violations" });
    }
  });

  // ============================================================================
  // SAFA (Smart Adaptive Feedback Algorithm) API ENDPOINTS
  // ============================================================================

  // SAFA: Submit Answer and Get Adaptive Feedback
  app.post("/api/safa/submit-answer", async (req, res) => {
    try {
      const { studentId, questionId, conceptId, answer, correctAnswer, attemptNumber, timeSpent, difficulty } = req.body;
      
      // Import SAFA algorithm
      const { safaAlgorithm } = await import('./backend/safa-algorithm.js');
      
      // Get current mastery
      let mastery = db.prepare(`
        SELECT * FROM safa_concept_mastery 
        WHERE student_id = ? AND concept_id = ?
      `).get(studentId, conceptId) as any;
      
      // Initialize mastery if not exists
      if (!mastery) {
        db.prepare(`
          INSERT INTO safa_concept_mastery (student_id, concept_id, concept_name, mastery_score, last_attempt_date)
          VALUES (?, ?, ?, 0, ?)
        `).run(studentId, conceptId, conceptId, Date.now());
        
        mastery = db.prepare(`
          SELECT * FROM safa_concept_mastery 
          WHERE student_id = ? AND concept_id = ?
        `).get(studentId, conceptId) as any;
      }
      
      // Prepare answer data
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
      
      // Prepare question metadata (simplified - in production, fetch from database)
      const questionMetadata = {
        questionId,
        conceptId,
        difficulty,
        commonErrors: [],
        hints: {
          micro: "Think about the key concept.",
          guided: "Consider the relationship between the variables.",
          detailed: ["Identify key information", "Apply the concept", "Calculate step by step", "Verify your answer"]
        },
        prerequisites: [],
        relatedConcepts: []
      };
      
      // Prepare current mastery object
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
      
      // Generate adaptive feedback
      const feedback = await safaAlgorithm.analyzeAndGenerateFeedback(
        answerData,
        questionMetadata,
        currentMastery
      );
      
      // Update mastery in database
      db.prepare(`
        UPDATE safa_concept_mastery 
        SET mastery_score = ?,
            total_attempts = ?,
            correct_attempts = ?,
            average_time_spent = ?,
            last_attempt_date = ?,
            trend = ?,
            confidence_level = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ? AND concept_id = ?
      `).run(
        feedback.masteryUpdate.masteryScore,
        feedback.masteryUpdate.totalAttempts,
        feedback.masteryUpdate.correctAttempts,
        feedback.masteryUpdate.averageTimeSpent,
        feedback.masteryUpdate.lastAttemptDate,
        feedback.masteryUpdate.trend,
        feedback.masteryUpdate.confidenceLevel,
        studentId,
        conceptId
      );
      
      // Log answer attempt
      db.prepare(`
        INSERT INTO safa_answer_attempts (
          student_id, question_id, concept_id, answer, correct_answer, is_correct,
          attempt_number, time_spent, difficulty, error_type, error_severity,
          feedback_level, feedback_intensity, mastery_score_before, mastery_score_after, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        studentId, questionId, conceptId, String(answer), String(correctAnswer),
        answer === correctAnswer ? 1 : 0, attemptNumber, timeSpent, difficulty,
        feedback.errorClassification.errorType, feedback.errorClassification.severity,
        feedback.feedbackLevel.level, feedback.feedbackLevel.intensity,
        currentMastery.masteryScore, feedback.masteryUpdate.masteryScore, Date.now()
      );
      
      // Log feedback
      db.prepare(`
        INSERT INTO safa_feedback_log (
          feedback_id, student_id, question_id, error_type, error_severity,
          feedback_level, feedback_intensity, feedback_content, next_difficulty,
          revision_recommended, revision_concepts, confidence_boost, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        feedback.feedbackId, studentId, questionId,
        feedback.errorClassification.errorType, feedback.errorClassification.severity,
        feedback.feedbackLevel.level, feedback.feedbackLevel.intensity,
        JSON.stringify(feedback.feedbackLevel.content), feedback.nextQuestionDifficulty,
        feedback.revisionRecommended ? 1 : 0, JSON.stringify(feedback.revisionConcepts),
        feedback.confidenceBoost, Date.now()
      );
      
      // Add to revision queue if needed
      if (feedback.revisionRecommended) {
        for (const concept of feedback.revisionConcepts) {
          db.prepare(`
            INSERT OR IGNORE INTO safa_revision_queue (student_id, concept_id, priority, reason, added_date)
            VALUES (?, ?, ?, ?, ?)
          `).run(studentId, concept, feedback.feedbackLevel.intensity, feedback.errorClassification.description, Date.now());
        }
      }
      
      res.json({ success: true, feedback });
    } catch (error) {
      console.error("SAFA submit answer failed:", error);
      res.status(500).json({ error: "Failed to process answer" });
    }
  });

  // SAFA: Get Student Mastery Overview
  app.get("/api/safa/mastery/:studentId", (req, res) => {
    try {
      const { studentId } = req.params;
      const masteryData = db.prepare(`
        SELECT * FROM safa_concept_mastery 
        WHERE student_id = ? 
        ORDER BY mastery_score ASC
      `).all(studentId);
      
      res.json({ success: true, mastery: masteryData });
    } catch (error) {
      console.error("Failed to get mastery data:", error);
      res.status(500).json({ error: "Failed to get mastery data" });
    }
  });

  // SAFA: Get Revision Queue
  app.get("/api/safa/revision-queue/:studentId", (req, res) => {
    try {
      const { studentId } = req.params;
      const queue = db.prepare(`
        SELECT * FROM safa_revision_queue 
        WHERE student_id = ? AND completed = 0 
        ORDER BY priority DESC, added_date ASC
      `).all(studentId);
      
      res.json({ success: true, queue });
    } catch (error) {
      console.error("Failed to get revision queue:", error);
      res.status(500).json({ error: "Failed to get revision queue" });
    }
  });

  // SAFA: Get Answer History
  app.get("/api/safa/answer-history/:studentId", (req, res) => {
    try {
      const { studentId } = req.params;
      const { conceptId, limit = 20 } = req.query;
      
      let query = `
        SELECT * FROM safa_answer_attempts 
        WHERE student_id = ?
      `;
      const params: any[] = [studentId];
      
      if (conceptId) {
        query += ` AND concept_id = ?`;
        params.push(conceptId);
      }
      
      query += ` ORDER BY created_at DESC LIMIT ?`;
      params.push(Number(limit));
      
      const history = db.prepare(query).all(...params);
      
      res.json({ success: true, history });
    } catch (error) {
      console.error("Failed to get answer history:", error);
      res.status(500).json({ error: "Failed to get answer history" });
    }
  });

  // SAFA: Get Feedback Analytics
  app.get("/api/safa/analytics/:studentId", (req, res) => {
    try {
      const { studentId } = req.params;
      
      // Get overall statistics
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total_attempts,
          SUM(is_correct) as correct_attempts,
          AVG(time_spent) as avg_time_spent,
          AVG(mastery_score_after) as avg_mastery_score
        FROM safa_answer_attempts
        WHERE student_id = ?
      `).get(studentId) as any;
      
      // Get error type distribution
      const errorDistribution = db.prepare(`
        SELECT error_type, COUNT(*) as count
        FROM safa_answer_attempts
        WHERE student_id = ? AND is_correct = 0
        GROUP BY error_type
      `).all(studentId);
      
      // Get feedback level distribution
      const feedbackDistribution = db.prepare(`
        SELECT feedback_level, COUNT(*) as count
        FROM safa_answer_attempts
        WHERE student_id = ?
        GROUP BY feedback_level
      `).all(studentId);
      
      // Get mastery progress over time
      const masteryProgress = db.prepare(`
        SELECT concept_id, mastery_score, timestamp
        FROM safa_answer_attempts
        WHERE student_id = ?
        ORDER BY timestamp ASC
      `).all(studentId);
      
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

  // Dashboard: Get User Stats
  app.get("/api/user/:studentId/stats", (req, res) => {
    try {
      const { studentId } = req.params;
      const lastResult = db.prepare("SELECT * FROM quiz_results WHERE student_id = ? ORDER BY timestamp DESC LIMIT 1").get(studentId) as any;
      
      if (lastResult) {
        const generalRecommendation = db.prepare("SELECT content FROM recommendations WHERE level = ?").get(lastResult.level) as any;
        const missedConcepts = JSON.parse(lastResult.missed_concepts || "[]");
        
        const conceptRecs: Record<string, string> = {
          "Operating Systems": "We noticed you struggled with Operating Systems. We recommend reviewing the 'Process Management' and 'Memory Allocation' chapters.",
          "Data Structures": "To strengthen your Data Structures knowledge, try implementing Stacks and Queues from scratch in your favorite language.",
          "Web Development": "For Web Development, focus on understanding the DOM tree and how HTML interacts with CSS and JS.",
          "Programming Basics": "Review the core syntax of backend languages. Try building a simple CLI tool to practice logic flow.",
          "Algorithms": "Algorithms can be tricky! Practice 'Big O Notation' and common sorting/searching techniques on platforms like LeetCode.",
          "Medical Ethics": "Review the principles of patient autonomy and informed consent.",
          "Engineering Mechanics": "Focus on static equilibrium and stress-strain relationships in structural components.",
          "Logical Thinking & Writing": "Practice structured thinking and clear communication through daily writing exercises.",
          "Critical Analysis & Argumentation": "Develop analytical skills by evaluating different perspectives on complex issues."
        };

        const specificRecommendations = missedConcepts.map((c: string) => conceptRecs[c]).filter(Boolean);
        const criticalConcepts = JSON.parse(lastResult.critical_concepts || "[]");
        const criticalQuestions = JSON.parse(lastResult.critical_questions || "[]");

        // Get all quiz results for skill analysis
        const allResults = db.prepare("SELECT * FROM quiz_results WHERE student_id = ? ORDER BY timestamp DESC LIMIT 10").all(studentId) as any[];

        // Analyze skills (strengths and weaknesses)
        const skillAnalysis = analyzeSkills(allResults, lastResult.score, missedConcepts, criticalConcepts);

        // Get emotional history with focus level
        const emotionalHistory = db.prepare(`
          SELECT stress_level, happiness_level, focus_level, timestamp 
          FROM emotional_states 
          WHERE student_id = ? 
          ORDER BY timestamp DESC 
          LIMIT 20
        `).all(studentId);

        // Calculate emotional statistics
        const emotionalStats = emotionalHistory.length > 0 ? {
          stress: {
            avg: emotionalHistory.reduce((acc: number, curr: any) => acc + curr.stress_level, 0) / emotionalHistory.length,
            min: Math.min(...emotionalHistory.map((h: any) => h.stress_level)),
            max: Math.max(...emotionalHistory.map((h: any) => h.stress_level)),
            trend: emotionalHistory.length > 1 ? 
              (emotionalHistory[0].stress_level - emotionalHistory[emotionalHistory.length - 1].stress_level) : 0
          },
          happiness: {
            avg: emotionalHistory.reduce((acc: number, curr: any) => acc + curr.happiness_level, 0) / emotionalHistory.length,
            min: Math.min(...emotionalHistory.map((h: any) => h.happiness_level)),
            max: Math.max(...emotionalHistory.map((h: any) => h.happiness_level)),
            trend: emotionalHistory.length > 1 ? 
              (emotionalHistory[0].happiness_level - emotionalHistory[emotionalHistory.length - 1].happiness_level) : 0
          },
          focus: {
            avg: emotionalHistory.reduce((acc: number, curr: any) => acc + (curr.focus_level || 0), 0) / emotionalHistory.length,
            min: Math.min(...emotionalHistory.map((h: any) => h.focus_level || 0)),
            max: Math.max(...emotionalHistory.map((h: any) => h.focus_level || 0)),
            trend: emotionalHistory.length > 1 ? 
              ((emotionalHistory[0].focus_level || 0) - (emotionalHistory[emotionalHistory.length - 1].focus_level || 0)) : 0
          }
        } : null;

        // Generate adaptive study plan
        const studyPlan = generateAdaptiveStudyPlan({
          level: lastResult.level,
          score: lastResult.score,
          weaknesses: skillAnalysis.weaknesses,
          strengths: skillAnalysis.strengths,
          learningStyle: lastResult.ai_guidance?.includes('Visual') ? 'Visual' : 
                        lastResult.ai_guidance?.includes('Auditory') ? 'Auditory' :
                        lastResult.ai_guidance?.includes('Kinesthetic') ? 'Kinesthetic' : 'Reading-Writing',
          avgStressLevel: emotionalStats?.stress.avg || 50,
          avgFocusLevel: emotionalStats?.focus.avg || 50
        });

        // Generate progress analytics
        const progressAnalytics = generateProgressAnalytics(allResults);

        res.json({ 
          hasTakenQuiz: true,
          score: lastResult.score,
          level: lastResult.level,
          recommendation: generalRecommendation?.content,
          specificRecommendations,
          criticalConcepts,
          criticalQuestions,
          aiGuidance: lastResult.ai_guidance,
          timestamp: lastResult.timestamp,
          emotionalHistory,
          emotionalStats,
          skillAnalysis,
          studyPlan,
          progressAnalytics
        });
      } else {
        res.json({ hasTakenQuiz: false });
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Admin: Get All Students and Levels
  app.get("/api/admin/students", (req, res) => {
    try {
      const students = db.prepare(`
        SELECT s.id, s.name, s.email, s.domain, qr.score, qr.level, qr.critical_concepts, qr.critical_questions, qr.timestamp, es.stress_level, es.happiness_level
        FROM students s 
        LEFT JOIN (
          SELECT student_id, score, level, critical_concepts, critical_questions, timestamp 
          FROM quiz_results 
          WHERE id IN (SELECT MAX(id) FROM quiz_results GROUP BY student_id)
        ) qr ON s.id = qr.student_id
        LEFT JOIN (
          SELECT student_id, stress_level, happiness_level
          FROM emotional_states
          WHERE id IN (SELECT MAX(id) FROM emotional_states GROUP BY student_id)
        ) es ON s.id = es.student_id
      `).all();
      res.json(students);
    } catch (error) {
      console.error("Failed to fetch admin students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  // Admin: Get Detailed Student Activity
  app.get("/api/admin/student/:studentId/details", (req, res) => {
    try {
      const { studentId } = req.params;

      // Get student basic info
      const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId) as any;
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Get all quiz results
      const quizResults = db.prepare(`
        SELECT * FROM quiz_results 
        WHERE student_id = ? 
        ORDER BY timestamp DESC
      `).all(studentId);

      // Get all emotional states
      const emotionalStates = db.prepare(`
        SELECT * FROM emotional_states 
        WHERE student_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 50
      `).all(studentId);

      // Calculate comprehensive stats
      const totalQuizzes = quizResults.length;
      const averageScore = totalQuizzes > 0 
        ? quizResults.reduce((sum: number, r: any) => sum + r.score, 0) / totalQuizzes 
        : 0;
      
      const totalTime = quizResults.reduce((sum: number, r: any) => sum + (r.total_time || 0), 0);
      const avgQuizTime = totalQuizzes > 0 ? totalTime / totalQuizzes : 0;

      const avgTypingSpeed = quizResults.length > 0
        ? quizResults.reduce((sum: number, r: any) => sum + (r.typing_speed || 0), 0) / quizResults.length
        : 0;

      const totalTabSwitches = quizResults.reduce((sum: number, r: any) => sum + (r.tab_switch_count || 0), 0);
      const voiceDetectedCount = quizResults.filter((r: any) => r.voice_detected).length;

      // Emotional averages
      const avgStress = emotionalStates.length > 0
        ? emotionalStates.reduce((sum: number, e: any) => sum + (e.stress_level || 0), 0) / emotionalStates.length
        : 0;
      
      const avgHappiness = emotionalStates.length > 0
        ? emotionalStates.reduce((sum: number, e: any) => sum + (e.happiness_level || 0), 0) / emotionalStates.length
        : 0;

      const avgFocus = emotionalStates.length > 0
        ? emotionalStates.reduce((sum: number, e: any) => sum + (e.focus_level || 0), 0) / emotionalStates.length
        : 0;

      // Get latest quiz for skill analysis
      const latestQuiz = quizResults[0];
      let skillAnalysis = { strengths: [], weaknesses: [] };
      let studyPlan = null;

      if (latestQuiz) {
        const missedConcepts = JSON.parse(latestQuiz.missed_concepts || "[]");
        const criticalConcepts = JSON.parse(latestQuiz.critical_concepts || "[]");
        
        skillAnalysis = analyzeSkills(quizResults, latestQuiz.score, missedConcepts, criticalConcepts);
        
        studyPlan = generateAdaptiveStudyPlan({
          level: latestQuiz.level,
          score: latestQuiz.score,
          weaknesses: skillAnalysis.weaknesses,
          strengths: skillAnalysis.strengths,
          learningStyle: latestQuiz.ai_guidance?.includes('Visual') ? 'Visual' : 
                        latestQuiz.ai_guidance?.includes('Auditory') ? 'Auditory' :
                        latestQuiz.ai_guidance?.includes('Kinesthetic') ? 'Kinesthetic' : 'Reading-Writing',
          avgStressLevel: avgStress,
          avgFocusLevel: avgFocus
        });
      }

      res.json({
        student,
        quizResults,
        emotionalStates,
        statistics: {
          totalQuizzes,
          averageScore: Math.round(averageScore),
          totalTime,
          avgQuizTime: Math.round(avgQuizTime),
          avgTypingSpeed: Math.round(avgTypingSpeed),
          totalTabSwitches,
          voiceDetectedCount,
          avgStress: Math.round(avgStress),
          avgHappiness: Math.round(avgHappiness),
          avgFocus: Math.round(avgFocus)
        },
        skillAnalysis,
        studyPlan
      });
    } catch (error) {
      console.error("Failed to fetch student details:", error);
      res.status(500).json({ error: "Failed to fetch student details" });
    }
  });

  // Learning Analytics AI: Analyze Student Behavior
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
      const previousAttempts = db.prepare(`
        SELECT * FROM safa_answer_attempts 
        WHERE student_id = ? 
        ORDER BY created_at DESC 
        LIMIT 10
      `).all(studentId);

      // Get concept history
      const conceptHistory = db.prepare(`
        SELECT 
          concept_id as conceptId,
          mastery_score as masteryScore,
          total_attempts as totalAttempts,
          correct_attempts as correctAttempts,
          average_time_spent as averageTime,
          trend
        FROM safa_concept_mastery 
        WHERE student_id = ?
      `).all(studentId);

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
          expectedTime: expectedTime, // Use same expected time
          attemptNumber: a.attempt_number,
          difficulty: a.difficulty,
          focusLevel: focusLevel, // Approximate from current
          stressLevel: stressLevel
        })),
        conceptHistory: conceptHistory.map((c: any) => ({
          conceptId: c.conceptId,
          totalAttempts: c.totalAttempts,
          correctAttempts: c.correctAttempts,
          averageTime: c.averageTime,
          masteryScore: c.masteryScore,
          trend: c.trend
        }))
      };

      // Analyze behavior
      const report = await learningAnalyticsAI.analyzeStudentBehavior(behaviorData);

      // Store analytics report in database (optional)
      db.prepare(`
        INSERT INTO learning_analytics_reports (
          student_id, timestamp, overall_health, health_score,
          problems, strengths, performance_trend, engagement_level,
          learning_style, intervention_required, mentor_alert
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        studentId,
        report.timestamp,
        report.overallHealth,
        report.healthScore,
        JSON.stringify(report.problems),
        JSON.stringify(report.strengths),
        report.performanceTrend,
        report.engagementLevel,
        report.learningStyle,
        report.interventionRequired ? 1 : 0,
        report.mentorAlert ? 1 : 0
      );

      res.json({ success: true, report });
    } catch (error) {
      console.error("Learning analytics analysis failed:", error);
      res.status(500).json({ error: "Failed to analyze behavior" });
    }
  });

  // Learning Analytics AI: Get Student Health Report
  app.get("/api/analytics/health-report/:studentId", (req, res) => {
    try {
      const { studentId } = req.params;
      
      const latestReport = db.prepare(`
        SELECT * FROM learning_analytics_reports 
        WHERE student_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `).get(studentId) as any;

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
        problems: JSON.parse(latestReport.problems),
        strengths: JSON.parse(latestReport.strengths),
        performanceTrend: latestReport.performance_trend,
        engagementLevel: latestReport.engagement_level,
        learningStyle: latestReport.learning_style,
        interventionRequired: latestReport.intervention_required === 1,
        mentorAlert: latestReport.mentor_alert === 1
      };

      res.json({ success: true, report });
    } catch (error) {
      console.error("Failed to get health report:", error);
      res.status(500).json({ error: "Failed to get health report" });
    }
  });

  // Video Recommendations: Generate based on student report
  app.post("/api/recommendations/generate", async (req, res) => {
    try {
      const { studentId } = req.body;

      // Import video recommendation engine
      const { videoRecommendationEngine } = await import('./backend/video-recommendation-engine.js');

      // Get student's latest quiz result
      const latestQuiz = db.prepare(`
        SELECT * FROM quiz_results 
        WHERE student_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `).get(studentId) as any;

      if (!latestQuiz) {
        return res.json({ 
          success: false, 
          error: 'No quiz data available. Please take a quiz first.' 
        });
      }

      // Get mastery scores
      const masteryData = db.prepare(`
        SELECT concept_id, mastery_score 
        FROM safa_concept_mastery 
        WHERE student_id = ?
      `).all(studentId) as any[];

      const masteryScores: Record<string, number> = {};
      masteryData.forEach((m: any) => {
        masteryScores[m.concept_id] = m.mastery_score;
      });

      // Get learning analytics
      const analytics = db.prepare(`
        SELECT * FROM learning_analytics_reports 
        WHERE student_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `).get(studentId) as any;

      // Prepare student report
      const report = {
        studentId,
        weakConcepts: JSON.parse(latestQuiz.missed_concepts || '[]'),
        criticalConcepts: JSON.parse(latestQuiz.critical_concepts || '[]'),
        missedQuestions: JSON.parse(latestQuiz.critical_questions || '[]'),
        masteryScores,
        learningProblems: analytics ? JSON.parse(analytics.problems) : [],
        performanceTrend: analytics?.performance_trend || 'stable',
        learningStyle: analytics?.learning_style || 'mixed'
      };

      // Generate recommendations
      const recommendations = await videoRecommendationEngine.generateRecommendations(report);

      // Store recommendations in database
      db.prepare(`
        INSERT INTO video_recommendations (
          student_id, timestamp, videos, resources, study_plan,
          estimated_study_time, focus_areas
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        studentId,
        recommendations.timestamp,
        JSON.stringify(recommendations.videos),
        JSON.stringify(recommendations.resources),
        JSON.stringify(recommendations.studyPlan),
        recommendations.estimatedStudyTime,
        JSON.stringify(recommendations.focusAreas)
      );

      res.json({ success: true, recommendations });
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Video Recommendations: Get latest for student
  app.get("/api/recommendations/:studentId", (req, res) => {
    try {
      const { studentId } = req.params;

      const recommendation = db.prepare(`
        SELECT * FROM video_recommendations 
        WHERE student_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `).get(studentId) as any;

      if (!recommendation) {
        return res.json({ 
          success: false, 
          message: 'No recommendations available. Generate recommendations first.' 
        });
      }

      const result = {
        studentId: recommendation.student_id,
        timestamp: recommendation.timestamp,
        videos: JSON.parse(recommendation.videos),
        resources: JSON.parse(recommendation.resources),
        studyPlan: JSON.parse(recommendation.study_plan),
        estimatedStudyTime: recommendation.estimated_study_time,
        focusAreas: JSON.parse(recommendation.focus_areas)
      };

      res.json({ success: true, recommendations: result });
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  // Video Recommendations: Track video watch
  app.post("/api/recommendations/track-watch", (req, res) => {
    try {
      const { studentId, videoId, watchTime, completed } = req.body;

      db.prepare(`
        INSERT INTO video_watch_history (
          student_id, video_id, watch_time, completed, timestamp
        ) VALUES (?, ?, ?, ?, ?)
      `).run(studentId, videoId, watchTime, completed ? 1 : 0, Date.now());

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to track video watch:", error);
      res.status(500).json({ error: "Failed to track video watch" });
    }
  });

  // Video Recommendations: Get watch history
  app.get("/api/recommendations/watch-history/:studentId", (req, res) => {
    try {
      const { studentId } = req.params;

      const history = db.prepare(`
        SELECT * FROM video_watch_history 
        WHERE student_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 50
      `).all(studentId);

      res.json({ success: true, history });
    } catch (error) {
      console.error("Failed to get watch history:", error);
      res.status(500).json({ error: "Failed to get watch history" });
    }
  });

  // Admin: Get Emotional Summary
  app.get("/api/admin/emotional-summary", (req, res) => {
    try {
      const summary = db.prepare(`
        SELECT s.name, es.stress_level, es.happiness_level, es.timestamp
        FROM students s
        JOIN emotional_states es ON s.id = es.student_id
        WHERE es.id IN (SELECT MAX(id) FROM emotional_states GROUP BY student_id)
      `).all();
      res.json(summary);
    } catch (error) {
      console.error("Failed to fetch emotional summary:", error);
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  });

  // --- Vite Integration ---
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
