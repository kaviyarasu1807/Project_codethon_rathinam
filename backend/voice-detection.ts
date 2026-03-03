/**
 * Voice Detection Backend Module
 * Handles voice analysis data storage and retrieval
 */

import { Request, Response } from 'express';

export interface VoiceAnalysisRecord {
  id?: number;
  student_id: number;
  is_correct_voice: boolean;
  confidence: number;
  timestamp: string;
  session_type: 'quiz' | 'coding' | 'exam';
  alert_triggered: boolean;
}

export interface VoiceEnrollment {
  id?: number;
  student_id: number;
  voice_fingerprint: string; // Base64 encoded voice features
  enrollment_date: string;
  sample_count: number;
}

/**
 * Save voice analysis result
 */
export async function saveVoiceAnalysis(db: any, data: VoiceAnalysisRecord): Promise<number> {
  const query = `
    INSERT INTO voice_analysis (
      student_id, is_correct_voice, confidence, timestamp, 
      session_type, alert_triggered
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const result = await db.run(
    query,
    data.student_id,
    data.is_correct_voice ? 1 : 0,
    data.confidence,
    data.timestamp,
    data.session_type || 'quiz',
    data.alert_triggered ? 1 : 0
  );

  return result.lastID;
}

/**
 * Get voice analysis history for a student
 */
export async function getVoiceAnalysisHistory(
  db: any,
  studentId: number,
  limit: number = 50
): Promise<VoiceAnalysisRecord[]> {
  const query = `
    SELECT * FROM voice_analysis
    WHERE student_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `;

  const rows = await db.all(query, studentId, limit);
  
  return rows.map((row: any) => ({
    id: row.id,
    student_id: row.student_id,
    is_correct_voice: row.is_correct_voice === 1,
    confidence: row.confidence,
    timestamp: row.timestamp,
    session_type: row.session_type,
    alert_triggered: row.alert_triggered === 1
  }));
}

/**
 * Get voice analysis statistics
 */
export async function getVoiceAnalysisStats(db: any, studentId: number): Promise<any> {
  const query = `
    SELECT 
      COUNT(*) as total_checks,
      SUM(CASE WHEN is_correct_voice = 1 THEN 1 ELSE 0 END) as verified_count,
      SUM(CASE WHEN is_correct_voice = 0 THEN 1 ELSE 0 END) as unverified_count,
      AVG(confidence) as avg_confidence,
      SUM(CASE WHEN alert_triggered = 1 THEN 1 ELSE 0 END) as alert_count
    FROM voice_analysis
    WHERE student_id = ?
  `;

  const stats = await db.get(query, studentId);
  
  return {
    totalChecks: stats.total_checks || 0,
    verifiedCount: stats.verified_count || 0,
    unverifiedCount: stats.unverified_count || 0,
    avgConfidence: stats.avg_confidence || 0,
    alertCount: stats.alert_count || 0,
    verificationRate: stats.total_checks > 0 
      ? ((stats.verified_count / stats.total_checks) * 100).toFixed(2)
      : 0
  };
}

/**
 * Save voice enrollment data
 */
export async function saveVoiceEnrollment(db: any, data: VoiceEnrollment): Promise<number> {
  // Check if enrollment already exists
  const existing = await db.get(
    'SELECT id FROM voice_enrollment WHERE student_id = ?',
    data.student_id
  );

  if (existing) {
    // Update existing enrollment
    await db.run(
      `UPDATE voice_enrollment 
       SET voice_fingerprint = ?, enrollment_date = ?, sample_count = ?
       WHERE student_id = ?`,
      data.voice_fingerprint,
      data.enrollment_date,
      data.sample_count,
      data.student_id
    );
    return existing.id;
  } else {
    // Insert new enrollment
    const result = await db.run(
      `INSERT INTO voice_enrollment (student_id, voice_fingerprint, enrollment_date, sample_count)
       VALUES (?, ?, ?, ?)`,
      data.student_id,
      data.voice_fingerprint,
      data.enrollment_date,
      data.sample_count
    );
    return result.lastID;
  }
}

/**
 * Get voice enrollment for a student
 */
export async function getVoiceEnrollment(db: any, studentId: number): Promise<VoiceEnrollment | null> {
  const query = 'SELECT * FROM voice_enrollment WHERE student_id = ?';
  const row = await db.get(query, studentId);
  
  if (!row) return null;
  
  return {
    id: row.id,
    student_id: row.student_id,
    voice_fingerprint: row.voice_fingerprint,
    enrollment_date: row.enrollment_date,
    sample_count: row.sample_count
  };
}

/**
 * Check if voice verification is suspicious
 */
export async function checkSuspiciousVoiceActivity(
  db: any,
  studentId: number,
  timeWindowMinutes: number = 30
): Promise<boolean> {
  const query = `
    SELECT COUNT(*) as unverified_count
    FROM voice_analysis
    WHERE student_id = ?
      AND is_correct_voice = 0
      AND datetime(timestamp) > datetime('now', '-${timeWindowMinutes} minutes')
  `;

  const result = await db.get(query, studentId);
  
  // Flag as suspicious if more than 3 unverified attempts in time window
  return result.unverified_count > 3;
}

/**
 * Express route handlers
 */

// POST /api/voice-analysis - Save voice analysis
export async function handleSaveVoiceAnalysis(req: Request, res: Response, db: any) {
  try {
    const { studentId, isCorrectVoice, confidence, timestamp, sessionType, alertTriggered } = req.body;

    if (!studentId || confidence === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const analysisId = await saveVoiceAnalysis(db, {
      student_id: studentId,
      is_correct_voice: isCorrectVoice,
      confidence,
      timestamp: timestamp || new Date().toISOString(),
      session_type: sessionType || 'quiz',
      alert_triggered: alertTriggered || false
    });

    // Check for suspicious activity
    const isSuspicious = await checkSuspiciousVoiceActivity(db, studentId);

    res.json({
      success: true,
      analysisId,
      suspicious: isSuspicious
    });
  } catch (error) {
    console.error('Error saving voice analysis:', error);
    res.status(500).json({ error: 'Failed to save voice analysis' });
  }
}

// GET /api/voice-analysis/:studentId - Get voice analysis history
export async function handleGetVoiceAnalysis(req: Request, res: Response, db: any) {
  try {
    const studentId = parseInt(req.params.studentId);
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await getVoiceAnalysisHistory(db, studentId, limit);
    const stats = await getVoiceAnalysisStats(db, studentId);

    res.json({
      history,
      stats
    });
  } catch (error) {
    console.error('Error fetching voice analysis:', error);
    res.status(500).json({ error: 'Failed to fetch voice analysis' });
  }
}

// POST /api/voice-enrollment - Save voice enrollment
export async function handleSaveVoiceEnrollment(req: Request, res: Response, db: any) {
  try {
    const { studentId, voiceFingerprint, sampleCount } = req.body;

    if (!studentId || !voiceFingerprint) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const enrollmentId = await saveVoiceEnrollment(db, {
      student_id: studentId,
      voice_fingerprint: voiceFingerprint,
      enrollment_date: new Date().toISOString(),
      sample_count: sampleCount || 1
    });

    res.json({
      success: true,
      enrollmentId
    });
  } catch (error) {
    console.error('Error saving voice enrollment:', error);
    res.status(500).json({ error: 'Failed to save voice enrollment' });
  }
}

// GET /api/voice-enrollment/:studentId - Get voice enrollment
export async function handleGetVoiceEnrollment(req: Request, res: Response, db: any) {
  try {
    const studentId = parseInt(req.params.studentId);
    const enrollment = await getVoiceEnrollment(db, studentId);

    if (!enrollment) {
      return res.status(404).json({ error: 'Voice enrollment not found' });
    }

    res.json(enrollment);
  } catch (error) {
    console.error('Error fetching voice enrollment:', error);
    res.status(500).json({ error: 'Failed to fetch voice enrollment' });
  }
}

/**
 * Database schema for voice detection tables
 */
export const VOICE_DETECTION_SCHEMA = `
  -- Voice Analysis Table
  CREATE TABLE IF NOT EXISTS voice_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    is_correct_voice INTEGER NOT NULL,
    confidence REAL NOT NULL,
    timestamp TEXT NOT NULL,
    session_type TEXT DEFAULT 'quiz',
    alert_triggered INTEGER DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_voice_analysis_student 
    ON voice_analysis(student_id);
  CREATE INDEX IF NOT EXISTS idx_voice_analysis_timestamp 
    ON voice_analysis(timestamp);

  -- Voice Enrollment Table
  CREATE TABLE IF NOT EXISTS voice_enrollment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER UNIQUE NOT NULL,
    voice_fingerprint TEXT NOT NULL,
    enrollment_date TEXT NOT NULL,
    sample_count INTEGER DEFAULT 1,
    FOREIGN KEY (student_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_voice_enrollment_student 
    ON voice_enrollment(student_id);
`;
