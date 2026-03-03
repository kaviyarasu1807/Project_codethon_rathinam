/**
 * User Report Generation Backend
 * Generates comprehensive analysis reports for students
 */

import { Request, Response } from 'express';

export interface UserReport {
  overview: {
    totalQuizzes: number;
    averageScore: number;
    totalTimeSpent: number;
    completionRate: number;
    improvement: number;
  };
  performance: {
    scores: Array<{ date: string; score: number; level: string }>;
    timeAnalysis: Array<{ date: string; time: number }>;
    conceptMastery: Array<{ concept: string; mastery: number; questions: number }>;
  };
  emotional: {
    avgStress: number;
    avgHappiness: number;
    avgFocus: number;
    trends: Array<{ date: string; stress: number; happiness: number; focus: number }>;
  };
  behavioral: {
    tabSwitches: number;
    voiceAlerts: number;
    typingSpeed: number;
    attentionScore: number;
  };
  strengths: Array<{ concept: string; score: number }>;
  weaknesses: Array<{ concept: string; score: number }>;
  recommendations: string[];
  badges: Array<{ name: string; icon: string; earned: boolean; date?: string }>;
}

/**
 * Generate comprehensive user report
 */
export async function generateUserReport(
  db: any,
  userId: number,
  timeRange: 'week' | 'month' | 'all' = 'month'
): Promise<UserReport> {
  const dateFilter = getDateFilter(timeRange);

  // Overview metrics
  const overview = await getOverviewMetrics(db, userId, dateFilter);

  // Performance data
  const performance = await getPerformanceData(db, userId, dateFilter);

  // Emotional intelligence data
  const emotional = await getEmotionalData(db, userId, dateFilter);

  // Behavioral data
  const behavioral = await getBehavioralData(db, userId, dateFilter);

  // Strengths and weaknesses
  const { strengths, weaknesses } = await getStrengthsWeaknesses(db, userId, dateFilter);

  // AI recommendations
  const recommendations = generateRecommendations(overview, performance, emotional, behavioral);

  // Badges
  const badges = await getBadges(db, userId);

  return {
    overview,
    performance,
    emotional,
    behavioral,
    strengths,
    weaknesses,
    recommendations,
    badges
  };
}

function getDateFilter(timeRange: 'week' | 'month' | 'all'): string {
  switch (timeRange) {
    case 'week':
      return "datetime('now', '-7 days')";
    case 'month':
      return "datetime('now', '-30 days')";
    case 'all':
    default:
      return "datetime('1970-01-01')";
  }
}

async function getOverviewMetrics(db: any, userId: number, dateFilter: string) {
  const query = `
    SELECT 
      COUNT(*) as total_quizzes,
      AVG(score) as average_score,
      SUM(time_spent) as total_time_spent,
      COUNT(CASE WHEN score >= 60 THEN 1 END) * 100.0 / COUNT(*) as completion_rate
    FROM quiz_results
    WHERE user_id = ? AND timestamp > ${dateFilter}
  `;

  const result = await db.get(query, userId);

  // Calculate improvement (compare last 2 quizzes)
  const improvementQuery = `
    SELECT score FROM quiz_results
    WHERE user_id = ? AND timestamp > ${dateFilter}
    ORDER BY timestamp DESC
    LIMIT 2
  `;
  const recentScores = await db.all(improvementQuery, userId);
  const improvement = recentScores.length === 2
    ? recentScores[0].score - recentScores[1].score
    : 0;

  return {
    totalQuizzes: result.total_quizzes || 0,
    averageScore: Math.round(result.average_score || 0),
    totalTimeSpent: result.total_time_spent || 0,
    completionRate: Math.round(result.completion_rate || 0),
    improvement: Math.round(improvement)
  };
}

async function getPerformanceData(db: any, userId: number, dateFilter: string) {
  // Score trends
  const scoresQuery = `
    SELECT 
      DATE(timestamp) as date,
      AVG(score) as score,
      level
    FROM quiz_results
    WHERE user_id = ? AND timestamp > ${dateFilter}
    GROUP BY DATE(timestamp)
    ORDER BY timestamp
  `;
  const scores = await db.all(scoresQuery, userId);

  // Time analysis
  const timeQuery = `
    SELECT 
      DATE(timestamp) as date,
      SUM(time_spent) / 60 as time
    FROM quiz_results
    WHERE user_id = ? AND timestamp > ${dateFilter}
    GROUP BY DATE(timestamp)
    ORDER BY timestamp
  `;
  const timeAnalysis = await db.all(timeQuery, userId);

  // Concept mastery
  const conceptQuery = `
    SELECT 
      concept,
      AVG(CASE WHEN correct = 1 THEN 100 ELSE 0 END) as mastery,
      COUNT(*) as questions
    FROM quiz_results
    WHERE user_id = ? AND timestamp > ${dateFilter}
    GROUP BY concept
    ORDER BY mastery DESC
  `;
  const conceptMastery = await db.all(conceptQuery, userId);

  return {
    scores: scores.map((s: any) => ({
      date: s.date,
      score: Math.round(s.score),
      level: s.level
    })),
    timeAnalysis: timeAnalysis.map((t: any) => ({
      date: t.date,
      time: Math.round(t.time)
    })),
    conceptMastery: conceptMastery.map((c: any) => ({
      concept: c.concept,
      mastery: Math.round(c.mastery),
      questions: c.questions
    }))
  };
}

async function getEmotionalData(db: any, userId: number, dateFilter: string) {
  const query = `
    SELECT 
      AVG(stress_level) as avg_stress,
      AVG(happiness_level) as avg_happiness,
      AVG(focus_level) as avg_focus
    FROM quiz_results
    WHERE user_id = ? AND timestamp > ${dateFilter}
  `;
  const result = await db.get(query, userId);

  // Emotional trends
  const trendsQuery = `
    SELECT 
      DATE(timestamp) as date,
      AVG(stress_level) as stress,
      AVG(happiness_level) as happiness,
      AVG(focus_level) as focus
    FROM quiz_results
    WHERE user_id = ? AND timestamp > ${dateFilter}
    GROUP BY DATE(timestamp)
    ORDER BY timestamp
  `;
  const trends = await db.all(trendsQuery, userId);

  return {
    avgStress: Math.round(result.avg_stress || 0),
    avgHappiness: Math.round(result.avg_happiness || 0),
    avgFocus: Math.round(result.avg_focus || 0),
    trends: trends.map((t: any) => ({
      date: t.date,
      stress: Math.round(t.stress),
      happiness: Math.round(t.happiness),
      focus: Math.round(t.focus)
    }))
  };
}

async function getBehavioralData(db: any, userId: number, dateFilter: string) {
  const query = `
    SELECT 
      SUM(tab_switches) as tab_switches,
      AVG(typing_speed) as typing_speed
    FROM quiz_results
    WHERE user_id = ? AND timestamp > ${dateFilter}
  `;
  const result = await db.get(query, userId);

  // Voice alerts
  const voiceQuery = `
    SELECT COUNT(*) as voice_alerts
    FROM voice_analysis
    WHERE student_id = ? AND is_correct_voice = 0 AND timestamp > ${dateFilter}
  `;
  const voiceResult = await db.get(voiceQuery, userId);

  // Calculate attention score
  const attentionScore = Math.max(0, 100 - (result.tab_switches || 0) * 2 - (voiceResult.voice_alerts || 0) * 5);

  return {
    tabSwitches: result.tab_switches || 0,
    voiceAlerts: voiceResult.voice_alerts || 0,
    typingSpeed: Math.round(result.typing_speed || 0),
    attentionScore: Math.round(attentionScore)
  };
}

async function getStrengthsWeaknesses(db: any, userId: number, dateFilter: string) {
  const query = `
    SELECT 
      concept,
      AVG(CASE WHEN correct = 1 THEN 100 ELSE 0 END) as score
    FROM quiz_results
    WHERE user_id = ? AND timestamp > ${dateFilter}
    GROUP BY concept
    HAVING COUNT(*) >= 3
    ORDER BY score DESC
  `;
  const concepts = await db.all(query, userId);

  const strengths = concepts
    .filter((c: any) => c.score >= 70)
    .slice(0, 5)
    .map((c: any) => ({
      concept: c.concept,
      score: Math.round(c.score)
    }));

  const weaknesses = concepts
    .filter((c: any) => c.score < 70)
    .sort((a: any, b: any) => a.score - b.score)
    .slice(0, 5)
    .map((c: any) => ({
      concept: c.concept,
      score: Math.round(c.score)
    }));

  return { strengths, weaknesses };
}

function generateRecommendations(
  overview: any,
  performance: any,
  emotional: any,
  behavioral: any
): string[] {
  const recommendations: string[] = [];

  // Score-based recommendations
  if (overview.averageScore < 60) {
    recommendations.push('Focus on fundamental concepts. Consider reviewing basic materials before attempting advanced topics.');
  } else if (overview.averageScore < 80) {
    recommendations.push('Good progress! Practice more challenging problems to reach the next level.');
  } else {
    recommendations.push('Excellent performance! Consider mentoring other students or exploring advanced topics.');
  }

  // Stress-based recommendations
  if (emotional.avgStress > 70) {
    recommendations.push('High stress levels detected. Take regular breaks, practice relaxation techniques, and ensure adequate sleep.');
  }

  // Focus-based recommendations
  if (emotional.avgFocus < 60) {
    recommendations.push('Improve focus by eliminating distractions, using the Pomodoro technique, and studying in a quiet environment.');
  }

  // Behavioral recommendations
  if (behavioral.tabSwitches > 20) {
    recommendations.push('Minimize tab switching during assessments. Close unnecessary browser tabs and focus on one task at a time.');
  }

  // Improvement recommendations
  if (overview.improvement < 0) {
    recommendations.push('Recent performance has declined. Review your study habits, get adequate rest, and seek help if needed.');
  }

  return recommendations;
}

async function getBadges(db: any, userId: number) {
  // Define available badges
  const allBadges = [
    { name: 'First Quiz', icon: '🎯', condition: (stats: any) => stats.totalQuizzes >= 1 },
    { name: 'Quiz Master', icon: '🏆', condition: (stats: any) => stats.totalQuizzes >= 10 },
    { name: 'Perfect Score', icon: '💯', condition: (stats: any) => stats.perfectScores >= 1 },
    { name: 'Consistent', icon: '📈', condition: (stats: any) => stats.consecutiveDays >= 7 },
    { name: 'Fast Learner', icon: '⚡', condition: (stats: any) => stats.avgScore >= 90 },
    { name: 'Dedicated', icon: '💪', condition: (stats: any) => stats.totalTimeSpent >= 3600 }
  ];

  // Get user stats
  const statsQuery = `
    SELECT 
      COUNT(*) as total_quizzes,
      SUM(CASE WHEN score = 100 THEN 1 ELSE 0 END) as perfect_scores,
      AVG(score) as avg_score,
      SUM(time_spent) as total_time_spent
    FROM quiz_results
    WHERE user_id = ?
  `;
  const stats = await db.get(statsQuery, userId);

  // Check consecutive days
  const consecutiveQuery = `
    SELECT COUNT(DISTINCT DATE(timestamp)) as consecutive_days
    FROM quiz_results
    WHERE user_id = ?
      AND timestamp > datetime('now', '-7 days')
  `;
  const consecutive = await db.get(consecutiveQuery, userId);
  stats.consecutiveDays = consecutive.consecutive_days;

  // Evaluate badges
  return allBadges.map(badge => ({
    name: badge.name,
    icon: badge.icon,
    earned: badge.condition(stats),
    date: badge.condition(stats) ? new Date().toLocaleDateString() : undefined
  }));
}

/**
 * Express route handler
 */
export async function handleGetUserReport(req: Request, res: Response, db: any) {
  try {
    const userId = parseInt(req.params.userId);
    const timeRange = (req.query.range as 'week' | 'month' | 'all') || 'month';

    const report = await generateUserReport(db, userId, timeRange);

    res.json(report);
  } catch (error) {
    console.error('Error generating user report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
}
