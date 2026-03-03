/**
 * Intelligent Learning Analytics AI
 * Analyzes student quiz behavior to identify root learning problems
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface StudentBehaviorData {
  studentId: number;
  questionId: string;
  conceptId: string;
  answer: string | number;
  correctAnswer: string | number;
  timeSpent: number;
  expectedTime: number;
  attemptNumber: number;
  difficulty: 'easy' | 'medium' | 'hard';
  confidenceLevel?: number; // 1-5 scale
  hesitationTime?: number; // Time before first interaction
  revisionCount?: number; // Times answer was changed
  focusLevel?: number; // 0-100 from proctoring
  stressLevel?: number; // 0-100 from emotion tracking
  previousAttempts?: StudentBehaviorData[];
  conceptHistory?: ConceptPerformance[];
}

export interface ConceptPerformance {
  conceptId: string;
  totalAttempts: number;
  correctAttempts: number;
  averageTime: number;
  masteryScore: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface LearningProblem {
  type: 'concept_gap' | 'speed_issue' | 'guessing_habit' | 'confidence_issue' | 'engagement_issue' | 'foundation_weakness';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100% confidence in diagnosis
  description: string;
  indicators: string[];
  rootCause: string;
  impact: string;
  recommendations: string[];
  actionPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  affectedConcepts: string[];
  estimatedRecoveryTime: string;
}

export interface AnalyticsReport {
  studentId: number;
  timestamp: number;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  healthScore: number; // 0-100
  problems: LearningProblem[];
  strengths: string[];
  performanceTrend: 'improving' | 'declining' | 'stable' | 'fluctuating';
  engagementLevel: 'high' | 'medium' | 'low';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing' | 'mixed';
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    reason: string;
  }[];
  interventionRequired: boolean;
  mentorAlert: boolean;
}

// ============================================================================
// LEARNING ANALYTICS AI ENGINE
// ============================================================================

export class LearningAnalyticsAI {
  private problemThresholds = {
    concept_gap: { accuracy: 0.4, attempts: 3 },
    speed_issue: { timeRatio: 2.0, consistentSlow: 3 },
    guessing_habit: { quickWrong: 0.3, lowConfidence: 2 },
    confidence_issue: { hesitation: 10, revisions: 3 },
    engagement_issue: { focusLevel: 40, stressLevel: 75 },
    foundation_weakness: { relatedConceptsFailing: 3, masteryBelow: 30 }
  };

  /**
   * Main analysis entry point
   */
  async analyzeStudentBehavior(
    behaviorData: StudentBehaviorData
  ): Promise<AnalyticsReport> {
    // Step 1: Detect all learning problems
    const problems = await this.detectLearningProblems(behaviorData);

    // Step 2: Calculate overall health score
    const healthScore = this.calculateHealthScore(behaviorData, problems);
    const overallHealth = this.categorizeHealth(healthScore);

    // Step 3: Identify strengths
    const strengths = this.identifyStrengths(behaviorData);

    // Step 4: Analyze performance trend
    const performanceTrend = this.analyzePerformanceTrend(behaviorData);

    // Step 5: Determine engagement level
    const engagementLevel = this.determineEngagementLevel(behaviorData);

    // Step 6: Identify learning style
    const learningStyle = this.identifyLearningStyle(behaviorData);

    // Step 7: Generate prioritized recommendations
    const recommendations = this.generateRecommendations(problems, behaviorData);

    // Step 8: Determine if intervention is needed
    const interventionRequired = this.requiresIntervention(problems, healthScore);
    const mentorAlert = this.shouldAlertMentor(problems, healthScore);

    return {
      studentId: behaviorData.studentId,
      timestamp: Date.now(),
      overallHealth,
      healthScore,
      problems,
      strengths,
      performanceTrend,
      engagementLevel,
      learningStyle,
      recommendations,
      interventionRequired,
      mentorAlert
    };
  }

  /**
   * Detect all learning problems from behavior patterns
   */
  private async detectLearningProblems(
    data: StudentBehaviorData
  ): Promise<LearningProblem[]> {
    const problems: LearningProblem[] = [];

    // Check for Concept Gap
    const conceptGap = this.detectConceptGap(data);
    if (conceptGap) problems.push(conceptGap);

    // Check for Speed Issue
    const speedIssue = this.detectSpeedIssue(data);
    if (speedIssue) problems.push(speedIssue);

    // Check for Guessing Habit
    const guessingHabit = this.detectGuessingHabit(data);
    if (guessingHabit) problems.push(guessingHabit);

    // Check for Confidence Issue
    const confidenceIssue = this.detectConfidenceIssue(data);
    if (confidenceIssue) problems.push(confidenceIssue);

    // Check for Engagement Issue
    const engagementIssue = this.detectEngagementIssue(data);
    if (engagementIssue) problems.push(engagementIssue);

    // Check for Foundation Weakness
    const foundationWeakness = this.detectFoundationWeakness(data);
    if (foundationWeakness) problems.push(foundationWeakness);

    // Sort by severity
    return problems.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Problem 1: Concept Gap Detection
   * Indicators: Low accuracy, multiple attempts, consistent errors
   */
  private detectConceptGap(data: StudentBehaviorData): LearningProblem | null {
    const isIncorrect = data.answer !== data.correctAnswer;
    const conceptHistory = data.conceptHistory?.find(c => c.conceptId === data.conceptId);
    
    if (!conceptHistory) return null;

    const accuracy = conceptHistory.correctAttempts / conceptHistory.totalAttempts;
    const multipleAttempts = data.attemptNumber >= this.problemThresholds.concept_gap.attempts;
    const lowMastery = conceptHistory.masteryScore < 50;

    if (isIncorrect && (accuracy < this.problemThresholds.concept_gap.accuracy || (multipleAttempts && lowMastery))) {
      const severity = this.calculateSeverity({
        accuracy,
        attempts: data.attemptNumber,
        mastery: conceptHistory.masteryScore
      }, 'concept_gap');

      return {
        type: 'concept_gap',
        severity,
        confidence: 85,
        description: `Student shows fundamental misunderstanding of ${data.conceptId}`,
        indicators: [
          `Accuracy: ${(accuracy * 100).toFixed(0)}% (below ${this.problemThresholds.concept_gap.accuracy * 100}%)`,
          `Attempt #${data.attemptNumber} on same concept`,
          `Mastery score: ${conceptHistory.masteryScore}%`,
          `Consistent errors across ${conceptHistory.totalAttempts} attempts`
        ],
        rootCause: 'Incomplete or incorrect understanding of core concept principles',
        impact: 'Unable to solve problems correctly despite multiple attempts. Will struggle with related concepts.',
        recommendations: [
          'Review fundamental concepts with visual aids and examples',
          'Break down complex topics into smaller, manageable chunks',
          'Use analogies and real-world examples to build understanding',
          'Practice with guided problems before attempting independently'
        ],
        actionPlan: {
          immediate: [
            'Pause current topic and review prerequisites',
            'Watch concept explanation video',
            'Complete 3-5 guided practice problems'
          ],
          shortTerm: [
            'Daily 15-minute concept review sessions',
            'Work through concept map with mentor',
            'Complete practice problems with increasing difficulty'
          ],
          longTerm: [
            'Build strong foundation in related concepts',
            'Regular spaced repetition reviews',
            'Apply concept to real-world scenarios'
          ]
        },
        affectedConcepts: [data.conceptId, ...(conceptHistory.trend === 'declining' ? ['Related prerequisites'] : [])],
        estimatedRecoveryTime: severity === 'critical' ? '2-3 weeks' : severity === 'high' ? '1-2 weeks' : '3-7 days'
      };
    }

    return null;
  }

  /**
   * Problem 2: Speed Issue Detection
   * Indicators: Consistently taking too long, time pressure errors
   */
  private detectSpeedIssue(data: StudentBehaviorData): LearningProblem | null {
    const timeRatio = data.timeSpent / data.expectedTime;
    const isSlow = timeRatio > this.problemThresholds.speed_issue.timeRatio;
    
    const previousSlowAttempts = data.previousAttempts?.filter(
      a => (a.timeSpent / a.expectedTime) > 1.5
    ).length || 0;

    const consistentlySlow = previousSlowAttempts >= this.problemThresholds.speed_issue.consistentSlow;

    if (isSlow && consistentlySlow) {
      const severity = this.calculateSeverity({
        timeRatio,
        consistency: previousSlowAttempts,
        difficulty: data.difficulty
      }, 'speed_issue');

      return {
        type: 'speed_issue',
        severity,
        confidence: 78,
        description: 'Student consistently takes excessive time to answer questions',
        indicators: [
          `Time taken: ${data.timeSpent}s (expected: ${data.expectedTime}s)`,
          `${(timeRatio * 100).toFixed(0)}% over expected time`,
          `Slow on ${previousSlowAttempts} of last ${data.previousAttempts?.length || 0} questions`,
          `Difficulty level: ${data.difficulty}`
        ],
        rootCause: 'Lack of procedural fluency or overthinking. May indicate incomplete concept mastery or test anxiety.',
        impact: 'Will struggle to complete timed assessments. May experience increased stress and reduced confidence.',
        recommendations: [
          'Practice timed drills to build speed and confidence',
          'Learn to identify question patterns quickly',
          'Use elimination strategies for multiple choice',
          'Practice mental math and quick estimation techniques'
        ],
        actionPlan: {
          immediate: [
            'Set timer for practice problems (start with 1.5x expected time)',
            'Focus on accuracy first, then gradually reduce time',
            'Identify and skip difficult questions, return later'
          ],
          shortTerm: [
            'Daily 10-minute speed practice sessions',
            'Learn shortcut methods and tricks',
            'Practice under simulated test conditions'
          ],
          longTerm: [
            'Build automatic recall of key formulas and concepts',
            'Develop pattern recognition skills',
            'Regular timed practice to build confidence'
          ]
        },
        affectedConcepts: [data.conceptId],
        estimatedRecoveryTime: '2-4 weeks with consistent practice'
      };
    }

    return null;
  }

  /**
   * Problem 3: Guessing Habit Detection
   * Indicators: Quick wrong answers, low confidence, random pattern
   */
  private detectGuessingHabit(data: StudentBehaviorData): LearningProblem | null {
    const isIncorrect = data.answer !== data.correctAnswer;
    const isQuick = data.timeSpent < (data.expectedTime * 0.5);
    const lowConfidence = (data.confidenceLevel || 3) <= this.problemThresholds.guessing_habit.lowConfidence;
    const noHesitation = (data.hesitationTime || 0) < 3;

    const quickWrongCount = data.previousAttempts?.filter(
      a => a.answer !== a.correctAnswer && a.timeSpent < (a.expectedTime * 0.5)
    ).length || 0;

    const hasGuessingPattern = quickWrongCount >= 2;

    if (isIncorrect && isQuick && (lowConfidence || noHesitation || hasGuessingPattern)) {
      const severity = this.calculateSeverity({
        speed: data.timeSpent / data.expectedTime,
        confidence: data.confidenceLevel || 1,
        pattern: quickWrongCount
      }, 'guessing_habit');

      return {
        type: 'guessing_habit',
        severity,
        confidence: 82,
        description: 'Student shows pattern of guessing without proper analysis',
        indicators: [
          `Answered in ${data.timeSpent}s (${((data.timeSpent / data.expectedTime) * 100).toFixed(0)}% of expected time)`,
          `Confidence level: ${data.confidenceLevel || 'Unknown'}/5`,
          `Hesitation time: ${data.hesitationTime || 0}s`,
          `${quickWrongCount} quick incorrect answers in recent history`,
          `No answer revision (changed ${data.revisionCount || 0} times)`
        ],
        rootCause: 'Lack of engagement, test anxiety, or learned helplessness. Student may feel overwhelmed and resort to random guessing.',
        impact: 'Poor learning outcomes, reinforces incorrect knowledge, builds bad study habits.',
        recommendations: [
          'Encourage reading questions carefully and completely',
          'Teach systematic elimination strategies',
          'Build confidence through easier problems first',
          'Reward thoughtful attempts over quick answers'
        ],
        actionPlan: {
          immediate: [
            'Require minimum time per question (e.g., 30 seconds)',
            'Add "explain your reasoning" prompts',
            'Provide partial credit for showing work'
          ],
          shortTerm: [
            'Practice with untimed questions to build confidence',
            'Learn to identify keywords and question patterns',
            'Develop systematic problem-solving approach'
          ],
          longTerm: [
            'Build intrinsic motivation through achievable goals',
            'Celebrate thoughtful attempts and learning from mistakes',
            'Develop metacognitive skills (thinking about thinking)'
          ]
        },
        affectedConcepts: [data.conceptId, 'Study Skills', 'Test-Taking Strategies'],
        estimatedRecoveryTime: '1-2 weeks with behavioral intervention'
      };
    }

    return null;
  }

  /**
   * Problem 4: Confidence Issue Detection
   * Indicators: High hesitation, frequent revisions, anxiety markers
   */
  private detectConfidenceIssue(data: StudentBehaviorData): LearningProblem | null {
    const highHesitation = (data.hesitationTime || 0) > this.problemThresholds.confidence_issue.hesitation;
    const frequentRevisions = (data.revisionCount || 0) >= this.problemThresholds.confidence_issue.revisions;
    const lowConfidence = (data.confidenceLevel || 3) <= 2;
    const highStress = (data.stressLevel || 0) > 70;

    const isCorrect = data.answer === data.correctAnswer;
    const hasKnowledge = isCorrect || (data.conceptHistory?.find(c => c.conceptId === data.conceptId)?.masteryScore || 0) > 60;

    if ((highHesitation || frequentRevisions || lowConfidence) && hasKnowledge) {
      const severity = this.calculateSeverity({
        hesitation: data.hesitationTime || 0,
        revisions: data.revisionCount || 0,
        stress: data.stressLevel || 0
      }, 'confidence_issue');

      return {
        type: 'confidence_issue',
        severity,
        confidence: 75,
        description: 'Student lacks confidence despite having adequate knowledge',
        indicators: [
          `Hesitation time: ${data.hesitationTime || 0}s before answering`,
          `Changed answer ${data.revisionCount || 0} times`,
          `Self-reported confidence: ${data.confidenceLevel || 'Unknown'}/5`,
          `Stress level: ${data.stressLevel || 'Unknown'}%`,
          `Actual mastery: ${data.conceptHistory?.find(c => c.conceptId === data.conceptId)?.masteryScore || 'Unknown'}%`
        ],
        rootCause: 'Test anxiety, perfectionism, or past negative experiences. Student second-guesses correct instincts.',
        impact: 'Wastes time, increases stress, may change correct answers to incorrect ones.',
        recommendations: [
          'Build confidence through positive reinforcement',
          'Practice trusting first instinct on familiar topics',
          'Use relaxation techniques before assessments',
          'Celebrate successes and reframe mistakes as learning opportunities'
        ],
        actionPlan: {
          immediate: [
            'Acknowledge correct answers and good reasoning',
            'Reduce time pressure on practice problems',
            'Use confidence-building affirmations'
          ],
          shortTerm: [
            'Practice mindfulness and stress-reduction techniques',
            'Keep success journal to track progress',
            'Work with mentor on test-taking strategies'
          ],
          longTerm: [
            'Build growth mindset through consistent positive experiences',
            'Gradually increase challenge level as confidence grows',
            'Develop self-assessment skills to calibrate confidence'
          ]
        },
        affectedConcepts: ['All concepts', 'Test-Taking Skills', 'Emotional Regulation'],
        estimatedRecoveryTime: '3-6 weeks with consistent support'
      };
    }

    return null;
  }

  /**
   * Problem 5: Engagement Issue Detection
   * Indicators: Low focus, high stress, distraction patterns
   */
  private detectEngagementIssue(data: StudentBehaviorData): LearningProblem | null {
    const lowFocus = (data.focusLevel || 100) < this.problemThresholds.engagement_issue.focusLevel;
    const highStress = (data.stressLevel || 0) > this.problemThresholds.engagement_issue.stressLevel;
    const inconsistentPerformance = data.conceptHistory?.some(c => c.trend === 'stable' || c.trend === 'declining');

    const recentLowFocus = data.previousAttempts?.filter(
      a => (a.focusLevel || 100) < 50
    ).length || 0;

    const engagementPattern = recentLowFocus >= 3;

    if (lowFocus || (highStress && engagementPattern)) {
      const severity = this.calculateSeverity({
        focus: data.focusLevel || 0,
        stress: data.stressLevel || 0,
        consistency: recentLowFocus
      }, 'engagement_issue');

      return {
        type: 'engagement_issue',
        severity,
        confidence: 88,
        description: 'Student shows signs of disengagement or distraction',
        indicators: [
          `Focus level: ${data.focusLevel || 'Unknown'}% (below ${this.problemThresholds.engagement_issue.focusLevel}%)`,
          `Stress level: ${data.stressLevel || 'Unknown'}%`,
          `Low focus on ${recentLowFocus} of last ${data.previousAttempts?.length || 0} questions`,
          `Performance trend: ${inconsistentPerformance ? 'Fluctuating' : 'Stable'}`,
          `Time of day: ${new Date().getHours()}:00 (may affect engagement)`
        ],
        rootCause: 'External distractions, lack of interest, fatigue, or overwhelming difficulty. May indicate burnout or personal issues.',
        impact: 'Poor retention, incomplete learning, increased frustration, potential dropout risk.',
        recommendations: [
          'Take regular breaks (Pomodoro technique: 25 min work, 5 min break)',
          'Study in distraction-free environment',
          'Connect learning material to personal interests',
          'Use gamification and interactive elements'
        ],
        actionPlan: {
          immediate: [
            'Take 5-minute break to reset focus',
            'Remove distractions (phone, notifications)',
            'Try standing or changing study location'
          ],
          shortTerm: [
            'Establish consistent study routine',
            'Set small, achievable daily goals',
            'Use active learning techniques (teach-back, practice problems)',
            'Track and reward focus improvements'
          ],
          longTerm: [
            'Develop intrinsic motivation through goal-setting',
            'Build sustainable study habits',
            'Address underlying issues (sleep, nutrition, stress)',
            'Consider learning style preferences'
          ]
        },
        affectedConcepts: ['All concepts', 'Study Habits', 'Time Management'],
        estimatedRecoveryTime: '1-3 weeks with environmental and behavioral changes'
      };
    }

    return null;
  }

  /**
   * Problem 6: Foundation Weakness Detection
   * Indicators: Struggling with multiple related concepts, low prerequisite mastery
   */
  private detectFoundationWeakness(data: StudentBehaviorData): LearningProblem | null {
    const conceptHistory = data.conceptHistory || [];
    const relatedConcepts = conceptHistory.filter(c => 
      c.conceptId !== data.conceptId && c.masteryScore < this.problemThresholds.foundation_weakness.masteryBelow
    );

    const multipleWeakConcepts = relatedConcepts.length >= this.problemThresholds.foundation_weakness.relatedConceptsFailing;
    const currentConceptWeak = (conceptHistory.find(c => c.conceptId === data.conceptId)?.masteryScore || 0) < 40;

    if (multipleWeakConcepts && currentConceptWeak) {
      const severity = this.calculateSeverity({
        weakConcepts: relatedConcepts.length,
        averageMastery: relatedConcepts.reduce((sum, c) => sum + c.masteryScore, 0) / relatedConcepts.length,
        currentMastery: conceptHistory.find(c => c.conceptId === data.conceptId)?.masteryScore || 0
      }, 'foundation_weakness');

      return {
        type: 'foundation_weakness',
        severity,
        confidence: 90,
        description: 'Student has gaps in foundational knowledge affecting multiple concepts',
        indicators: [
          `${relatedConcepts.length} related concepts below 30% mastery`,
          `Current concept (${data.conceptId}): ${conceptHistory.find(c => c.conceptId === data.conceptId)?.masteryScore || 0}% mastery`,
          `Average mastery across weak concepts: ${(relatedConcepts.reduce((sum, c) => sum + c.masteryScore, 0) / relatedConcepts.length).toFixed(0)}%`,
          `Weak concepts: ${relatedConcepts.map(c => c.conceptId).join(', ')}`
        ],
        rootCause: 'Missing or incomplete prerequisite knowledge. Student may have advanced too quickly or missed key foundational lessons.',
        impact: 'Cascading failures across related topics. Unable to build on weak foundation. Increasing frustration and potential disengagement.',
        recommendations: [
          'STOP current progression and return to fundamentals',
          'Complete diagnostic assessment to identify specific gaps',
          'Work with tutor on prerequisite concepts',
          'Use scaffolded learning approach with gradual complexity increase'
        ],
        actionPlan: {
          immediate: [
            'Pause current topic immediately',
            'Take diagnostic test to map knowledge gaps',
            'Create personalized remediation plan'
          ],
          shortTerm: [
            'Dedicate 2-3 weeks to foundation building',
            'Master one prerequisite concept at a time',
            'Use multiple learning modalities (video, practice, tutoring)',
            'Regular check-ins with mentor'
          ],
          longTerm: [
            'Build comprehensive understanding of fundamentals',
            'Ensure 80%+ mastery before advancing',
            'Regular review of prerequisite concepts',
            'Develop strong study habits and learning strategies'
          ]
        },
        affectedConcepts: [data.conceptId, ...relatedConcepts.map(c => c.conceptId)],
        estimatedRecoveryTime: '4-8 weeks with intensive remediation'
      };
    }

    return null;
  }

  /**
   * Calculate severity level based on problem-specific metrics
   */
  private calculateSeverity(
    metrics: Record<string, any>,
    problemType: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    switch (problemType) {
      case 'concept_gap':
        if (metrics.accuracy < 0.2 || metrics.mastery < 20) return 'critical';
        if (metrics.accuracy < 0.3 || metrics.mastery < 35) return 'high';
        if (metrics.accuracy < 0.4 || metrics.mastery < 50) return 'medium';
        return 'low';

      case 'speed_issue':
        if (metrics.timeRatio > 3 || metrics.consistency > 5) return 'high';
        if (metrics.timeRatio > 2.5 || metrics.consistency > 3) return 'medium';
        return 'low';

      case 'guessing_habit':
        if (metrics.pattern >= 4 || metrics.confidence <= 1) return 'high';
        if (metrics.pattern >= 2 || metrics.confidence <= 2) return 'medium';
        return 'low';

      case 'confidence_issue':
        if (metrics.stress > 85 || metrics.revisions > 5) return 'high';
        if (metrics.stress > 70 || metrics.revisions > 3) return 'medium';
        return 'low';

      case 'engagement_issue':
        if (metrics.focus < 30 || metrics.stress > 85) return 'critical';
        if (metrics.focus < 40 || metrics.stress > 75) return 'high';
        if (metrics.focus < 50 || metrics.consistency >= 3) return 'medium';
        return 'low';

      case 'foundation_weakness':
        if (metrics.weakConcepts >= 5 || metrics.averageMastery < 20) return 'critical';
        if (metrics.weakConcepts >= 3 || metrics.averageMastery < 30) return 'high';
        return 'medium';

      default:
        return 'medium';
    }
  }

  /**
   * Calculate overall health score (0-100)
   */
  private calculateHealthScore(
    data: StudentBehaviorData,
    problems: LearningProblem[]
  ): number {
    let score = 100;

    // Deduct points for each problem based on severity
    problems.forEach(problem => {
      const deduction = {
        critical: 30,
        high: 20,
        medium: 10,
        low: 5
      }[problem.severity];
      score -= deduction;
    });

    // Bonus for good performance indicators
    const conceptHistory = data.conceptHistory?.find(c => c.conceptId === data.conceptId);
    if (conceptHistory) {
      if (conceptHistory.masteryScore > 80) score += 10;
      if (conceptHistory.trend === 'improving') score += 5;
    }

    if ((data.focusLevel || 0) > 80) score += 5;
    if ((data.stressLevel || 100) < 40) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Categorize health score into levels
   */
  private categorizeHealth(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    if (score >= 30) return 'poor';
    return 'critical';
  }

  /**
   * Identify student strengths
   */
  private identifyStrengths(data: StudentBehaviorData): string[] {
    const strengths: string[] = [];
    const conceptHistory = data.conceptHistory || [];

    // High mastery concepts
    const strongConcepts = conceptHistory.filter(c => c.masteryScore > 80);
    if (strongConcepts.length > 0) {
      strengths.push(`Strong mastery in: ${strongConcepts.map(c => c.conceptId).join(', ')}`);
    }

    // Improving trends
    const improvingConcepts = conceptHistory.filter(c => c.trend === 'improving');
    if (improvingConcepts.length > 0) {
      strengths.push(`Showing improvement in: ${improvingConcepts.map(c => c.conceptId).join(', ')}`);
    }

    // Good time management
    if (data.timeSpent <= data.expectedTime * 1.2 && data.answer === data.correctAnswer) {
      strengths.push('Efficient time management');
    }

    // High engagement
    if ((data.focusLevel || 0) > 80) {
      strengths.push('High focus and engagement');
    }

    // Low stress
    if ((data.stressLevel || 100) < 40) {
      strengths.push('Good stress management');
    }

    // Confidence
    if ((data.confidenceLevel || 0) >= 4) {
      strengths.push('Strong self-confidence');
    }

    return strengths.length > 0 ? strengths : ['Persistent effort', 'Willingness to learn'];
  }

  /**
   * Analyze performance trend
   */
  private analyzePerformanceTrend(data: StudentBehaviorData): 'improving' | 'declining' | 'stable' | 'fluctuating' {
    const conceptHistory = data.conceptHistory || [];
    
    const improvingCount = conceptHistory.filter(c => c.trend === 'improving').length;
    const decliningCount = conceptHistory.filter(c => c.trend === 'declining').length;
    const stableCount = conceptHistory.filter(c => c.trend === 'stable').length;

    if (improvingCount > decliningCount && improvingCount > stableCount) return 'improving';
    if (decliningCount > improvingCount && decliningCount > stableCount) return 'declining';
    if (improvingCount === decliningCount && improvingCount > 0) return 'fluctuating';
    return 'stable';
  }

  /**
   * Determine engagement level
   */
  private determineEngagementLevel(data: StudentBehaviorData): 'high' | 'medium' | 'low' {
    const focus = data.focusLevel || 50;
    const stress = data.stressLevel || 50;
    const timeRatio = data.timeSpent / data.expectedTime;

    const engagementScore = (focus * 0.5) + ((100 - stress) * 0.3) + (Math.min(timeRatio, 1.5) * 20);

    if (engagementScore > 70) return 'high';
    if (engagementScore > 40) return 'medium';
    return 'low';
  }

  /**
   * Identify learning style
   */
  private identifyLearningStyle(data: StudentBehaviorData): 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing' | 'mixed' {
    // This is a simplified heuristic - in production, use more sophisticated analysis
    const timeRatio = data.timeSpent / data.expectedTime;
    const revisions = data.revisionCount || 0;

    if (timeRatio > 1.5 && revisions > 2) return 'reading-writing';
    if (timeRatio < 0.8) return 'visual';
    if (revisions > 3) return 'kinesthetic';
    return 'mixed';
  }

  /**
   * Generate prioritized recommendations
   */
  private generateRecommendations(
    problems: LearningProblem[],
    data: StudentBehaviorData
  ): { priority: 'high' | 'medium' | 'low'; action: string; reason: string }[] {
    const recommendations: { priority: 'high' | 'medium' | 'low'; action: string; reason: string }[] = [];

    // Add problem-specific recommendations
    problems.forEach(problem => {
      const priority = problem.severity === 'critical' || problem.severity === 'high' ? 'high' : 
                      problem.severity === 'medium' ? 'medium' : 'low';
      
      problem.actionPlan.immediate.forEach(action => {
        recommendations.push({
          priority,
          action,
          reason: `Addresses ${problem.type.replace('_', ' ')}: ${problem.description}`
        });
      });
    });

    // Add general recommendations
    if ((data.focusLevel || 100) < 60) {
      recommendations.push({
        priority: 'medium',
        action: 'Take a 10-minute break to refresh focus',
        reason: 'Current focus level is below optimal'
      });
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Determine if intervention is required
   */
  private requiresIntervention(problems: LearningProblem[], healthScore: number): boolean {
    const hasCriticalProblem = problems.some(p => p.severity === 'critical');
    const hasMultipleHighProblems = problems.filter(p => p.severity === 'high').length >= 2;
    const lowHealth = healthScore < 40;

    return hasCriticalProblem || hasMultipleHighProblems || lowHealth;
  }

  /**
   * Determine if mentor should be alerted
   */
  private shouldAlertMentor(problems: LearningProblem[], healthScore: number): boolean {
    const hasCriticalProblem = problems.some(p => p.severity === 'critical');
    const hasFoundationWeakness = problems.some(p => p.type === 'foundation_weakness');
    const criticalHealth = healthScore < 30;

    return hasCriticalProblem || hasFoundationWeakness || criticalHealth;
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const learningAnalyticsAI = new LearningAnalyticsAI();
