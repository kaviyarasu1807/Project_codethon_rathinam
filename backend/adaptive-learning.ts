// Adaptive Learning System with Skill Analysis and Personalized Study Plans

interface SkillData {
  concept: string;
  strengthScore: number;
  attempts: number;
  lastPerformance: number;
  trend: 'improving' | 'declining' | 'stable';
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

interface StudyPlan {
  dailyGoals: string[];
  weeklySchedule: {
    day: string;
    topics: string[];
    duration: number;
    activities: string[];
  }[];
  microLearningModules: {
    title: string;
    duration: number;
    difficulty: string;
    concept: string;
  }[];
  revisionSchedule: {
    concept: string;
    nextReview: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  predictedPerformance: {
    nextQuizScore: number;
    improvementRate: number;
    timeToMastery: number;
  };
}

export function analyzeSkills(
  quizResults: any[],
  currentScore: number,
  missedConcepts: string[],
  criticalConcepts: string[]
): { strengths: SkillData[], weaknesses: SkillData[] } {
  
  const conceptPerformance: Map<string, { correct: number, total: number, recent: number[] }> = new Map();
  
  // Analyze historical performance
  quizResults.forEach((result, index) => {
    const missed = JSON.parse(result.missed_concepts || '[]');
    const critical = JSON.parse(result.critical_concepts || '[]');
    const allConcepts = [...new Set([...missed, ...critical])];
    
    allConcepts.forEach(concept => {
      if (!conceptPerformance.has(concept)) {
        conceptPerformance.set(concept, { correct: 0, total: 0, recent: [] });
      }
      const data = conceptPerformance.get(concept)!;
      data.total++;
      if (!missed.includes(concept)) data.correct++;
      data.recent.push(missed.includes(concept) ? 0 : 1);
    });
  });

  const strengths: SkillData[] = [];
  const weaknesses: SkillData[] = [];

  conceptPerformance.forEach((data, concept) => {
    const strengthScore = (data.correct / data.total) * 100;
    const recentPerf = data.recent.slice(-3);
    const avgRecent = recentPerf.reduce((a, b) => a + b, 0) / recentPerf.length * 100;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentPerf.length >= 2) {
      const first = recentPerf[0];
      const last = recentPerf[recentPerf.length - 1];
      if (last > first) trend = 'improving';
      else if (last < first) trend = 'declining';
    }

    const difficultyLevel = strengthScore >= 70 ? 'easy' : strengthScore >= 40 ? 'medium' : 'hard';

    const skillData: SkillData = {
      concept,
      strengthScore,
      attempts: data.total,
      lastPerformance: avgRecent,
      trend,
      difficultyLevel
    };

    if (strengthScore >= 70) {
      strengths.push(skillData);
    } else {
      weaknesses.push(skillData);
    }
  });

  return {
    strengths: strengths.sort((a, b) => b.strengthScore - a.strengthScore),
    weaknesses: weaknesses.sort((a, b) => a.strengthScore - b.strengthScore)
  };
}

export function generateAdaptiveStudyPlan(
  studentData: {
    level: string;
    score: number;
    weaknesses: SkillData[];
    strengths: SkillData[];
    learningStyle: string;
    avgStressLevel: number;
    avgFocusLevel: number;
  }
): StudyPlan {
  
  const { level, score, weaknesses, strengths, learningStyle, avgStressLevel, avgFocusLevel } = studentData;

  // Calculate optimal study duration based on focus level
  const optimalSessionDuration = avgFocusLevel > 70 ? 45 : avgFocusLevel > 40 ? 30 : 20;

  // Daily goals based on current level
  const dailyGoals = generateDailyGoals(level, score, weaknesses.length);

  // Weekly schedule with adaptive difficulty
  const weeklySchedule = generateWeeklySchedule(weaknesses, strengths, optimalSessionDuration, learningStyle);

  // Micro-learning modules (5-15 minute focused sessions)
  const microLearningModules = generateMicroModules(weaknesses, learningStyle);

  // Spaced repetition schedule
  const revisionSchedule = generateRevisionSchedule(weaknesses, strengths);

  // Predictive performance insights
  const predictedPerformance = predictFuturePerformance(score, weaknesses, strengths);

  return {
    dailyGoals,
    weeklySchedule,
    microLearningModules,
    revisionSchedule,
    predictedPerformance
  };
}

function generateDailyGoals(level: string, score: number, weaknessCount: number): string[] {
  const goals: string[] = [];

  if (level === 'Beginner') {
    goals.push('Complete 2 micro-learning modules (10 mins each)');
    goals.push('Review 3 fundamental concepts');
    goals.push('Practice 5 basic questions');
    goals.push('Watch 1 explanatory video');
  } else if (level === 'Intermediate') {
    goals.push('Complete 3 micro-learning modules (15 mins each)');
    goals.push('Solve 10 practice problems');
    goals.push('Review 2 weak concepts in depth');
    goals.push('Take 1 mini-quiz (5 questions)');
  } else {
    goals.push('Complete 4 advanced modules (20 mins each)');
    goals.push('Solve 15 challenging problems');
    goals.push('Teach 1 concept (Feynman technique)');
    goals.push('Create mind maps for complex topics');
  }

  if (weaknessCount > 3) {
    goals.push(`Focus on ${Math.min(weaknessCount, 3)} weak areas today`);
  }

  return goals;
}

function generateWeeklySchedule(
  weaknesses: SkillData[],
  strengths: SkillData[],
  sessionDuration: number,
  learningStyle: string
): StudyPlan['weeklySchedule'] {
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const schedule: StudyPlan['weeklySchedule'] = [];

  days.forEach((day, index) => {
    const topics: string[] = [];
    const activities: string[] = [];

    // Distribute weak concepts across the week
    const weaknessIndex = index % weaknesses.length;
    if (weaknesses[weaknessIndex]) {
      topics.push(weaknesses[weaknessIndex].concept);
    }

    // Add strength reinforcement every other day
    if (index % 2 === 0 && strengths[Math.floor(index / 2)]) {
      topics.push(strengths[Math.floor(index / 2)].concept);
    }

    // Activities based on learning style
    if (learningStyle === 'Visual') {
      activities.push('Watch video tutorials', 'Create diagrams', 'Use flashcards');
    } else if (learningStyle === 'Auditory') {
      activities.push('Listen to podcasts', 'Discuss with peers', 'Record voice notes');
    } else if (learningStyle === 'Kinesthetic') {
      activities.push('Hands-on practice', 'Build projects', 'Interactive simulations');
    } else {
      activities.push('Read articles', 'Take notes', 'Solve problems', 'Practice quizzes');
    }

    // Sunday is review day
    if (day === 'Sunday') {
      topics.push('Weekly Review & Assessment');
      activities.push('Review all topics', 'Take practice quiz', 'Identify gaps');
    }

    schedule.push({
      day,
      topics: topics.slice(0, 3),
      duration: sessionDuration,
      activities: activities.slice(0, 3)
    });
  });

  return schedule;
}

function generateMicroModules(weaknesses: SkillData[], learningStyle: string): StudyPlan['microLearningModules'] {
  const modules: StudyPlan['microLearningModules'] = [];

  weaknesses.slice(0, 10).forEach(weakness => {
    const duration = weakness.difficultyLevel === 'hard' ? 15 : weakness.difficultyLevel === 'medium' ? 10 : 5;
    
    modules.push({
      title: `Master ${weakness.concept}`,
      duration,
      difficulty: weakness.difficultyLevel,
      concept: weakness.concept
    });

    // Add practice module
    modules.push({
      title: `Practice: ${weakness.concept}`,
      duration: duration + 5,
      difficulty: weakness.difficultyLevel,
      concept: weakness.concept
    });
  });

  return modules.slice(0, 15); // Limit to 15 modules
}

function generateRevisionSchedule(
  weaknesses: SkillData[],
  strengths: SkillData[]
): StudyPlan['revisionSchedule'] {
  const schedule: StudyPlan['revisionSchedule'] = [];
  const now = new Date();

  // Spaced repetition intervals: 1 day, 3 days, 7 days, 14 days, 30 days
  weaknesses.forEach((weakness, index) => {
    let daysUntilReview = 1;
    
    if (weakness.trend === 'improving') {
      daysUntilReview = 3;
    } else if (weakness.trend === 'stable') {
      daysUntilReview = 2;
    }

    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + daysUntilReview);

    schedule.push({
      concept: weakness.concept,
      nextReview: nextReview.toISOString().split('T')[0],
      priority: weakness.strengthScore < 30 ? 'high' : weakness.strengthScore < 60 ? 'medium' : 'low'
    });
  });

  // Add strength reinforcement (longer intervals)
  strengths.slice(0, 5).forEach(strength => {
    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + 7);

    schedule.push({
      concept: strength.concept,
      nextReview: nextReview.toISOString().split('T')[0],
      priority: 'low'
    });
  });

  return schedule.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function predictFuturePerformance(
  currentScore: number,
  weaknesses: SkillData[],
  strengths: SkillData[]
): StudyPlan['predictedPerformance'] {
  
  // Calculate improvement rate based on trends
  const improvingCount = weaknesses.filter(w => w.trend === 'improving').length;
  const totalWeaknesses = weaknesses.length;
  const improvementRate = totalWeaknesses > 0 ? (improvingCount / totalWeaknesses) * 100 : 50;

  // Predict next quiz score
  const avgWeaknessScore = weaknesses.reduce((sum, w) => sum + w.strengthScore, 0) / (weaknesses.length || 1);
  const potentialImprovement = (100 - avgWeaknessScore) * 0.3; // 30% improvement potential
  const nextQuizScore = Math.min(100, Math.round(currentScore + potentialImprovement));

  // Estimate time to mastery (weeks)
  const conceptsToMaster = weaknesses.filter(w => w.strengthScore < 70).length;
  const timeToMastery = Math.ceil(conceptsToMaster * 1.5); // 1.5 weeks per concept

  return {
    nextQuizScore,
    improvementRate: Math.round(improvementRate),
    timeToMastery
  };
}

export function getAdaptiveDifficulty(studentLevel: string, conceptPerformance: number): string {
  if (studentLevel === 'Advanced' && conceptPerformance > 80) {
    return 'expert';
  } else if (studentLevel === 'Advanced' || (studentLevel === 'Intermediate' && conceptPerformance > 70)) {
    return 'hard';
  } else if (studentLevel === 'Intermediate' || (studentLevel === 'Beginner' && conceptPerformance > 60)) {
    return 'medium';
  } else {
    return 'easy';
  }
}

export function generateProgressAnalytics(quizResults: any[]) {
  const analytics = {
    totalQuizzes: quizResults.length,
    averageScore: 0,
    scoreProgression: [] as number[],
    conceptMastery: {} as Record<string, number>,
    studyStreak: 0,
    timeSpentLearning: 0,
    improvementRate: 0
  };

  if (quizResults.length === 0) return analytics;

  // Calculate average score
  const totalScore = quizResults.reduce((sum, r) => sum + r.score, 0);
  analytics.averageScore = Math.round(totalScore / quizResults.length);

  // Score progression
  analytics.scoreProgression = quizResults.map(r => r.score);

  // Calculate improvement rate
  if (quizResults.length >= 2) {
    const firstScore = quizResults[0].score;
    const lastScore = quizResults[quizResults.length - 1].score;
    analytics.improvementRate = Math.round(((lastScore - firstScore) / firstScore) * 100);
  }

  // Total time spent
  analytics.timeSpentLearning = quizResults.reduce((sum, r) => sum + (r.total_time || 0), 0);

  return analytics;
}
