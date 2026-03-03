/**
 * Student Struggle Detection System
 * Automatically detects when students are struggling with questions
 * and alerts administrators
 */

import { Request, Response } from 'express';

export interface StruggleMetrics {
  student_id: number;
  student_name: string;
  total_questions_attempted: number;
  questions_struggled: number;
  struggle_percentage: number;
  avg_time_per_question: number;
  high_stress_questions: number;
  tab_switches: number;
  voice_alerts: number;
  last_activity: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface StruggleAlert {
  id?: number;
  student_id: number;
  alert_type: 'struggle' | 'stress' | 'cheating' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metrics: string; // JSON string
  timestamp: string;
  acknowledged: boolean;
  acknowledged_by?: number;
  acknowledged_at?: string;
}

export interface QuestionStruggleData {
  question_id: string;
  question_text: string;
  students_struggled: number;
  avg_time_spent: number;
  avg_stress_level: number;
  common_mistakes: string[];
}

/**
 * Detect if a student is struggling based on multiple factors
 */
export function detectStruggle(metrics: {
  timeSpent: number;
  stressLevel: number;
  tabSwitches: number;
  attempts: number;
  correctAnswer: boolean;
}): boolean {
  let struggleScore = 0;

  // Time spent (too long indicates struggle)
  if (metrics.timeSpent > 180) struggleScore += 2; // > 3 minutes
  else if (metrics.timeSpent > 120) struggleScore += 1; // > 2 minutes

  // Stress level
  if (metrics.stressLevel > 75) struggleScore += 3;
  else if (metrics.stressLevel > 60) struggleScore += 2;
  else if (metrics.stressLevel > 45) struggleScore += 1;

  // Tab switches (potential cheating or confusion)
  if (metrics.tabSwitches > 5) struggleScore += 2;
  else if (metrics.tabSwitches > 2) struggleScore += 1;

  // Multiple attempts
  if (metrics.attempts > 3) struggleScore += 2;
  else if (metrics.attempts > 1) struggleScore += 1;

  // Wrong answer
  if (!metrics.correctAnswer) struggleScore += 2;

  // Struggle threshold: score >= 5
  return struggleScore >= 5;
}

/**
 * Calculate severity level based on struggle metrics
 */
export function calculateSeverity(metrics: StruggleMetrics): 'low' | 'medium' | 'high' | 'critical' {
  const { struggle_percentage, high_stress_questions, tab_switches, voice_alerts } = metrics;

  let severityScore = 0;

  // Struggle percentage
  if (struggle_percentage > 70) severityScore += 4;
  else if (struggle_percentage > 50) severityScore += 3;
  else if (struggle_percentage > 30) severityScore += 2;
  else if (struggle_percentage > 15) severityScore += 1;

  // High stress questions
  if (high_stress_questions > 10) severityScore += 3;
  else if (high_stress_questions > 5) severityScore += 2;
  else if (high_stress_questions > 2) severityScore += 1;

  // Tab switches (cheating indicator)
  if (tab_switches > 20) severityScore += 3;
  else if (tab_switches > 10) severityScore += 2;
  else if (tab_switches > 5) severityScore += 1;

  // Voice alerts
  if (voice_alerts > 5) severityScore += 3;
  else if (voice_alerts > 2) severityScore += 2;
  else if (voice_alerts > 0) severityScore += 1;

  // Determine severity
  if (severityScore >= 10) return 'critical';
  if (severityScore >= 7) return 'high';
  if (severityScore >= 4) return 'medium';
  return 'low';
}

/**
 * Get struggle metrics for all students
 */
export async function getStudentStruggleMetrics(db: any): Promise<StruggleMetrics[]> {
  const query = `
    SELECT 
      u.id as student_id,
      u.name as student_name,
      COUNT(DISTINCT qr.id) as total_questions_attempted,
      SUM(CASE WHEN qr.time_spent > 120 OR qr.stress_level > 60 THEN 1 ELSE 0 END) as questions_struggled,
      AVG(qr.time_spent) as avg_time_per_question,
      SUM(CASE WHEN qr.stress_level > 75 THEN 1 ELSE 0 END) as high_stress_questions,
      COALESCE(SUM(qr.tab_switches), 0) as tab_switches,
      COALESCE(va.voice_alert_count, 0) as voice_alerts,
      MAX(qr.timestamp) as last_activity
    FROM users u
    LEFT JOIN quiz_results qr ON u.id = qr.user_id
    LEFT JOIN (
      SELECT student_id, COUNT(*) as voice_alert_count
      FROM voice_analysis
      WHERE is_correct_voice = 0
      GROUP BY student_id
    ) va ON u.id = va.student_id
    WHERE u.role = 'student'
      AND qr.timestamp > datetime('now', '-7 days')
    GROUP BY u.id, u.name
    HAVING total_questions_attempted > 0
    ORDER BY questions_struggled DESC
  `;

  const rows = await db.all(query);

  return rows.map((row: any) => {
    const strugglePercentage = row.total_questions_attempted > 0
      ? (row.questions_struggled / row.total_questions_attempted) * 100
      : 0;

    const metrics: StruggleMetrics = {
      student_id: row.student_id,
      student_name: row.student_name,
      total_questions_attempted: row.total_questions_attempted,
      questions_struggled: row.questions_struggled,
      struggle_percentage: Math.round(strugglePercentage * 10) / 10,
      avg_time_per_question: Math.round(row.avg_time_per_question),
      high_stress_questions: row.high_stress_questions,
      tab_switches: row.tab_switches,
      voice_alerts: row.voice_alerts,
      last_activity: row.last_activity,
      severity: 'low'
    };

    metrics.severity = calculateSeverity(metrics);

    return metrics;
  });
}

/**
 * Get students who need immediate attention
 */
export async function getCriticalStudents(db: any): Promise<StruggleMetrics[]> {
  const allMetrics = await getStudentStruggleMetrics(db);
  return allMetrics.filter(m => m.severity === 'critical' || m.severity === 'high');
}

/**
 * Create struggle alert
 */
export async function createStruggleAlert(db: any, alert: StruggleAlert): Promise<number> {
  const query = `
    INSERT INTO struggle_alerts (
      student_id, alert_type, severity, message, metrics, timestamp, acknowledged
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await db.run(
    query,
    alert.student_id,
    alert.alert_type,
    alert.severity,
    alert.message,
    alert.metrics,
    alert.timestamp,
    alert.acknowledged ? 1 : 0
  );

  return result.lastID;
}

/**
 * Get unacknowledged alerts
 */
export async function getUnacknowledgedAlerts(db: any): Promise<StruggleAlert[]> {
  const query = `
    SELECT sa.*, u.name as student_name
    FROM struggle_alerts sa
    JOIN users u ON sa.student_id = u.id
    WHERE sa.acknowledged = 0
    ORDER BY 
      CASE sa.severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      sa.timestamp DESC
  `;

  const rows = await db.all(query);

  return rows.map((row: any) => ({
    id: row.id,
    student_id: row.student_id,
    alert_type: row.alert_type,
    severity: row.severity,
    message: row.message,
    metrics: row.metrics,
    timestamp: row.timestamp,
    acknowledged: row.acknowledged === 1,
    acknowledged_by: row.acknowledged_by,
    acknowledged_at: row.acknowledged_at
  }));
}

/**
 * Acknowledge alert
 */
export async function acknowledgeAlert(
  db: any,
  alertId: number,
  adminId: number
): Promise<void> {
  const query = `
    UPDATE struggle_alerts
    SET acknowledged = 1, acknowledged_by = ?, acknowledged_at = ?
    WHERE id = ?
  `;

  await db.run(query, adminId, new Date().toISOString(), alertId);
}

/**
 * Get alert statistics
 */
export async function getAlertStatistics(db: any): Promise<any> {
  const query = `
    SELECT 
      COUNT(*) as total_alerts,
      SUM(CASE WHEN acknowledged = 0 THEN 1 ELSE 0 END) as unacknowledged,
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_count,
      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_count,
      SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_count,
      SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_count,
      SUM(CASE WHEN alert_type = 'struggle' THEN 1 ELSE 0 END) as struggle_alerts,
      SUM(CASE WHEN alert_type = 'stress' THEN 1 ELSE 0 END) as stress_alerts,
      SUM(CASE WHEN alert_type = 'cheating' THEN 1 ELSE 0 END) as cheating_alerts
    FROM struggle_alerts
    WHERE timestamp > datetime('now', '-7 days')
  `;

  return await db.get(query);
}

/**
 * Get questions that students struggle with most
 */
export async function getMostDifficultQuestions(db: any, limit: number = 10): Promise<QuestionStruggleData[]> {
  const query = `
    SELECT 
      question_id,
      question_text,
      COUNT(DISTINCT user_id) as students_struggled,
      AVG(time_spent) as avg_time_spent,
      AVG(stress_level) as avg_stress_level
    FROM quiz_results
    WHERE time_spent > 120 OR stress_level > 60
    GROUP BY question_id, question_text
    ORDER BY students_struggled DESC, avg_stress_level DESC
    LIMIT ?
  `;

  const rows = await db.all(query, limit);

  return rows.map((row: any) => ({
    question_id: row.question_id,
    question_text: row.question_text,
    students_struggled: row.students_struggled,
    avg_time_spent: Math.round(row.avg_time_spent),
    avg_stress_level: Math.round(row.avg_stress_level),
    common_mistakes: []
  }));
}

/**
 * Automated alert generation (run periodically)
 */
export async function generateAutomatedAlerts(db: any): Promise<number> {
  const metrics = await getStudentStruggleMetrics(db);
  let alertsCreated = 0;

  for (const metric of metrics) {
    // Check if alert already exists for this student recently
    const existingAlert = await db.get(
      `SELECT id FROM struggle_alerts 
       WHERE student_id = ? 
         AND timestamp > datetime('now', '-1 hour')
       LIMIT 1`,
      metric.student_id
    );

    if (existingAlert) continue; // Skip if recent alert exists

    // Generate alert based on severity
    if (metric.severity === 'critical' || metric.severity === 'high') {
      let message = '';
      let alertType: 'struggle' | 'stress' | 'cheating' | 'performance' = 'struggle';

      if (metric.struggle_percentage > 70) {
        message = `${metric.student_name} is struggling with ${metric.struggle_percentage}% of questions (${metric.questions_struggled}/${metric.total_questions_attempted})`;
        alertType = 'struggle';
      } else if (metric.high_stress_questions > 5) {
        message = `${metric.student_name} shows high stress on ${metric.high_stress_questions} questions`;
        alertType = 'stress';
      } else if (metric.tab_switches > 15 || metric.voice_alerts > 3) {
        message = `${metric.student_name} has suspicious activity: ${metric.tab_switches} tab switches, ${metric.voice_alerts} voice alerts`;
        alertType = 'cheating';
      } else {
        message = `${metric.student_name} needs attention: struggling with multiple questions`;
        alertType = 'performance';
      }

      await createStruggleAlert(db, {
        student_id: metric.student_id,
        alert_type: alertType,
        severity: metric.severity,
        message,
        metrics: JSON.stringify(metric),
        timestamp: new Date().toISOString(),
        acknowledged: false
      });

      alertsCreated++;
    }
  }

  return alertsCreated;
}

/**
 * Express route handlers
 */

// GET /api/admin/struggle-metrics - Get all student struggle metrics
export async function handleGetStruggleMetrics(req: Request, res: Response, db: any) {
  try {
    const metrics = await getStudentStruggleMetrics(db);
    const criticalStudents = metrics.filter(m => m.severity === 'critical' || m.severity === 'high');

    res.json({
      metrics,
      criticalStudents,
      summary: {
        totalStudents: metrics.length,
        criticalCount: metrics.filter(m => m.severity === 'critical').length,
        highCount: metrics.filter(m => m.severity === 'high').length,
        mediumCount: metrics.filter(m => m.severity === 'medium').length,
        lowCount: metrics.filter(m => m.severity === 'low').length
      }
    });
  } catch (error) {
    console.error('Error fetching struggle metrics:', error);
    res.status(500).json({ error: 'Failed to fetch struggle metrics' });
  }
}

// GET /api/admin/alerts - Get all alerts
export async function handleGetAlerts(req: Request, res: Response, db: any) {
  try {
    const unacknowledged = await getUnacknowledgedAlerts(db);
    const stats = await getAlertStatistics(db);

    res.json({
      alerts: unacknowledged,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}

// POST /api/admin/alerts/:id/acknowledge - Acknowledge an alert
export async function handleAcknowledgeAlert(req: Request, res: Response, db: any) {
  try {
    const alertId = parseInt(req.params.id);
    const adminId = req.body.adminId;

    if (!adminId) {
      return res.status(400).json({ error: 'Admin ID required' });
    }

    await acknowledgeAlert(db, alertId, adminId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
}

// GET /api/admin/difficult-questions - Get most difficult questions
export async function handleGetDifficultQuestions(req: Request, res: Response, db: any) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const questions = await getMostDifficultQuestions(db, limit);

    res.json({ questions });
  } catch (error) {
    console.error('Error fetching difficult questions:', error);
    res.status(500).json({ error: 'Failed to fetch difficult questions' });
  }
}

// POST /api/admin/generate-alerts - Manually trigger alert generation
export async function handleGenerateAlerts(req: Request, res: Response, db: any) {
  try {
    const alertsCreated = await generateAutomatedAlerts(db);

    res.json({
      success: true,
      alertsCreated
    });
  } catch (error) {
    console.error('Error generating alerts:', error);
    res.status(500).json({ error: 'Failed to generate alerts' });
  }
}

/**
 * Database schema for struggle detection
 */
export const STRUGGLE_DETECTION_SCHEMA = `
  -- Struggle Alerts Table
  CREATE TABLE IF NOT EXISTS struggle_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    metrics TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    acknowledged INTEGER DEFAULT 0,
    acknowledged_by INTEGER,
    acknowledged_at TEXT,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (acknowledged_by) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_struggle_alerts_student 
    ON struggle_alerts(student_id);
  CREATE INDEX IF NOT EXISTS idx_struggle_alerts_acknowledged 
    ON struggle_alerts(acknowledged);
  CREATE INDEX IF NOT EXISTS idx_struggle_alerts_severity 
    ON struggle_alerts(severity);
  CREATE INDEX IF NOT EXISTS idx_struggle_alerts_timestamp 
    ON struggle_alerts(timestamp);
`;
