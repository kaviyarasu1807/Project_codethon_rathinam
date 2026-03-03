/**
 * Smart Adaptive Feedback Algorithm (SAFA)
 * Real-time student performance analysis and adaptive feedback generation
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface StudentAnswer {
  studentId: number;
  questionId: string;
  conceptId: string;
  answer: string | number;
  correctAnswer: string | number;
  attemptNumber: number;
  timeSpent: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: number;
}

export interface ConceptMastery {
  conceptId: string;
  conceptName: string;
  masteryScore: number; // 0-100
  totalAttempts: number;
  correctAttempts: number;
  averageTimeSpent: number;
  lastAttemptDate: number;
  trend: 'improving' | 'declining' | 'stable';
  confidenceLevel: 'low' | 'medium' | 'high';
}

export interface ErrorClassification {
  errorType: 'conceptual' | 'procedural' | 'careless' | 'knowledge_gap' | 'time_pressure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedConcepts: string[];
  suggestedRemediation: string;
}

export interface FeedbackLevel {
  level: 'micro' | 'guided' | 'detailed' | 'comprehensive';
  intensity: number; // 1-10
  content: {
    hint?: string;
    explanation?: string;
    steps?: string[];
    examples?: string[];
    resources?: string[];
  };
}

export interface AdaptiveFeedback {
  feedbackId: string;
  studentId: number;
  questionId: string;
  errorClassification: ErrorClassification;
  feedbackLevel: FeedbackLevel;
  masteryUpdate: ConceptMastery;
  nextQuestionDifficulty: 'easier' | 'same' | 'harder';
  revisionRecommended: boolean;
  revisionConcepts: string[];
  confidenceBoost: string;
  timestamp: number;
}

export interface QuestionMetadata {
  questionId: string;
  conceptId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  commonErrors: string[];
  hints: {
    micro: string;
    guided: string;
    detailed: string[];
  };
  prerequisites: string[];
  relatedConcepts: string[];
}

// ============================================================================
// SAFA CORE ALGORITHM
// ============================================================================

export class SmartAdaptiveFeedbackAlgorithm {
  private masteryThresholds = {
    low: 40,
    medium: 70,
    high: 85
  };

  private errorWeights = {
    conceptual: 0.9,
    procedural: 0.7,
    careless: 0.3,
    knowledge_gap: 1.0,
    time_pressure: 0.5
  };

  /**
   * Main entry point: Analyze answer and generate adaptive feedback
   */
  async analyzeAndGenerateFeedback(
    answer: StudentAnswer,
    questionMetadata: QuestionMetadata,
    currentMastery: ConceptMastery
  ): Promise<AdaptiveFeedback> {
    // Step 1: Classify the error
    const errorClassification = this.classifyError(answer, questionMetadata, currentMastery);

    // Step 2: Update mastery score dynamically
    const updatedMastery = this.updateMasteryScore(
      currentMastery,
      answer,
      errorClassification
    );

    // Step 3: Calculate feedback intensity
    const feedbackIntensity = this.calculateFeedbackIntensity(
      errorClassification,
      updatedMastery,
      answer.difficulty,
      answer.attemptNumber
    );

    // Step 4: Generate personalized feedback
    const feedbackLevel = this.generateFeedbackLevel(
      feedbackIntensity,
      errorClassification,
      questionMetadata,
      answer.attemptNumber
    );

    // Step 5: Determine next question difficulty
    const nextDifficulty = this.adaptNextQuestionDifficulty(
      updatedMastery,
      errorClassification,
      answer.attemptNumber
    );

    // Step 6: Check if revision is needed
    const revisionCheck = this.checkRevisionNeeded(
      updatedMastery,
      errorClassification,
      answer.attemptNumber
    );

    // Step 7: Generate confidence boost message
    const confidenceBoost = this.generateConfidenceBoost(
      updatedMastery,
      errorClassification,
      answer.attemptNumber
    );

    return {
      feedbackId: `feedback_${answer.studentId}_${Date.now()}`,
      studentId: answer.studentId,
      questionId: answer.questionId,
      errorClassification,
      feedbackLevel,
      masteryUpdate: updatedMastery,
      nextQuestionDifficulty: nextDifficulty,
      revisionRecommended: revisionCheck.needed,
      revisionConcepts: revisionCheck.concepts,
      confidenceBoost,
      timestamp: Date.now()
    };
  }

  /**
   * Step 1: Classify the type and severity of error
   */
  private classifyError(
    answer: StudentAnswer,
    metadata: QuestionMetadata,
    mastery: ConceptMastery
  ): ErrorClassification {
    const isCorrect = answer.answer === answer.correctAnswer;
    
    if (isCorrect) {
      return {
        errorType: 'careless',
        severity: 'low',
        description: 'Answer is correct',
        affectedConcepts: [],
        suggestedRemediation: 'Continue practicing'
      };
    }

    // Analyze error patterns
    const timeRatio = answer.timeSpent / this.getExpectedTime(answer.difficulty);
    const attemptFactor = answer.attemptNumber;
    const masteryLevel = mastery.masteryScore;

    // Determine error type based on patterns
    let errorType: ErrorClassification['errorType'];
    let severity: ErrorClassification['severity'];
    let description: string;
    let remediation: string;

    if (attemptFactor === 1 && timeRatio < 0.5) {
      // Quick first attempt - likely careless
      errorType = 'careless';
      severity = 'low';
      description = 'Quick answer without careful consideration';
      remediation = 'Take more time to review the question carefully';
    } else if (masteryLevel < this.masteryThresholds.low) {
      // Low mastery - knowledge gap
      errorType = 'knowledge_gap';
      severity = 'critical';
      description = 'Fundamental understanding is missing';
      remediation = 'Review basic concepts and prerequisites';
    } else if (attemptFactor > 2 && masteryLevel < this.masteryThresholds.medium) {
      // Multiple attempts with medium mastery - conceptual error
      errorType = 'conceptual';
      severity = 'high';
      description = 'Misunderstanding of core concept';
      remediation = 'Focus on understanding the underlying principle';
    } else if (timeRatio > 2) {
      // Took too long - procedural error
      errorType = 'procedural';
      severity = 'medium';
      description = 'Difficulty applying the correct method';
      remediation = 'Practice step-by-step problem solving';
    } else if (timeRatio < 0.7) {
      // Time pressure
      errorType = 'time_pressure';
      severity = 'medium';
      description = 'Rushed answer due to time constraints';
      remediation = 'Practice time management and accuracy balance';
    } else {
      // Default to conceptual
      errorType = 'conceptual';
      severity = 'medium';
      description = 'Incorrect understanding of the concept';
      remediation = 'Review the concept with examples';
    }

    return {
      errorType,
      severity,
      description,
      affectedConcepts: [metadata.conceptId, ...metadata.relatedConcepts],
      suggestedRemediation: remediation
    };
  }

  /**
   * Step 2: Update mastery score dynamically
   */
  private updateMasteryScore(
    currentMastery: ConceptMastery,
    answer: StudentAnswer,
    error: ErrorClassification
  ): ConceptMastery {
    const isCorrect = answer.answer === answer.correctAnswer;
    const newTotalAttempts = currentMastery.totalAttempts + 1;
    const newCorrectAttempts = currentMastery.correctAttempts + (isCorrect ? 1 : 0);

    // Calculate base accuracy
    const accuracy = (newCorrectAttempts / newTotalAttempts) * 100;

    // Apply error weight penalty
    const errorPenalty = isCorrect ? 0 : this.errorWeights[error.errorType] * 10;

    // Apply difficulty bonus
    const difficultyBonus = this.getDifficultyBonus(answer.difficulty, isCorrect);

    // Apply time efficiency factor
    const timeEfficiency = this.calculateTimeEfficiency(answer.timeSpent, answer.difficulty);

    // Calculate new mastery score with weighted factors
    let newMasteryScore = 
      accuracy * 0.5 +                    // 50% weight on accuracy
      (100 - errorPenalty) * 0.2 +        // 20% weight on error type
      difficultyBonus * 0.2 +             // 20% weight on difficulty
      timeEfficiency * 0.1;               // 10% weight on time efficiency

    // Apply exponential moving average for smoothing
    newMasteryScore = currentMastery.masteryScore * 0.7 + newMasteryScore * 0.3;

    // Clamp between 0-100
    newMasteryScore = Math.max(0, Math.min(100, newMasteryScore));

    // Calculate trend
    const trend = this.calculateTrend(currentMastery.masteryScore, newMasteryScore);

    // Determine confidence level
    const confidenceLevel = this.determineConfidenceLevel(newMasteryScore, newTotalAttempts);

    // Update average time spent
    const newAvgTime = 
      (currentMastery.averageTimeSpent * currentMastery.totalAttempts + answer.timeSpent) / 
      newTotalAttempts;

    return {
      conceptId: currentMastery.conceptId,
      conceptName: currentMastery.conceptName,
      masteryScore: Math.round(newMasteryScore),
      totalAttempts: newTotalAttempts,
      correctAttempts: newCorrectAttempts,
      averageTimeSpent: Math.round(newAvgTime),
      lastAttemptDate: answer.timestamp,
      trend,
      confidenceLevel
    };
  }

  /**
   * Step 3: Calculate feedback intensity (1-10 scale)
   */
  private calculateFeedbackIntensity(
    error: ErrorClassification,
    mastery: ConceptMastery,
    difficulty: string,
    attemptNumber: number
  ): number {
    // Base intensity from error severity
    const severityIntensity = {
      low: 2,
      medium: 5,
      high: 7,
      critical: 10
    }[error.severity];

    // Mastery factor (lower mastery = higher intensity)
    const masteryFactor = (100 - mastery.masteryScore) / 10;

    // Attempt factor (more attempts = higher intensity)
    const attemptFactor = Math.min(attemptNumber * 1.5, 5);

    // Difficulty factor
    const difficultyFactor = {
      easy: 0.8,
      medium: 1.0,
      hard: 1.2
    }[difficulty];

    // Calculate weighted intensity
    let intensity = 
      severityIntensity * 0.4 +
      masteryFactor * 0.3 +
      attemptFactor * 0.2 +
      difficultyFactor * 0.1;

    // Clamp between 1-10
    return Math.max(1, Math.min(10, Math.round(intensity)));
  }

  /**
   * Step 4: Generate personalized feedback based on intensity
   */
  private generateFeedbackLevel(
    intensity: number,
    error: ErrorClassification,
    metadata: QuestionMetadata,
    attemptNumber: number
  ): FeedbackLevel {
    let level: FeedbackLevel['level'];
    let content: FeedbackLevel['content'] = {};

    if (intensity <= 3) {
      // Micro hint - minimal guidance
      level = 'micro';
      content.hint = metadata.hints.micro || 'Think about the key concept involved.';
    } else if (intensity <= 6) {
      // Guided hint - moderate guidance
      level = 'guided';
      content.hint = metadata.hints.guided || 'Consider the relationship between the variables.';
      content.explanation = `This question tests your understanding of ${metadata.conceptId}. ${error.suggestedRemediation}`;
    } else if (intensity <= 8) {
      // Detailed explanation - substantial guidance
      level = 'detailed';
      content.hint = metadata.hints.guided;
      content.explanation = `Let's break this down: ${error.description}. ${error.suggestedRemediation}`;
      content.steps = metadata.hints.detailed || [
        'Identify the key information',
        'Apply the relevant formula or concept',
        'Calculate step by step',
        'Verify your answer'
      ];
      content.examples = [`Similar example: Consider a related problem where...`];
    } else {
      // Comprehensive - maximum guidance
      level = 'comprehensive';
      content.hint = metadata.hints.guided;
      content.explanation = `Complete walkthrough: ${error.description}. This indicates ${error.errorType} error. ${error.suggestedRemediation}`;
      content.steps = metadata.hints.detailed || [
        'Step 1: Understand what the question is asking',
        'Step 2: Identify the relevant concept',
        'Step 3: Apply the method systematically',
        'Step 4: Check your work'
      ];
      content.examples = [
        'Example 1: Let\'s solve a similar problem together',
        'Example 2: Here\'s another way to think about it'
      ];
      content.resources = [
        `Review: ${metadata.conceptId} fundamentals`,
        `Practice: Additional ${metadata.conceptId} problems`,
        `Video: ${metadata.conceptId} explained`
      ];
    }

    return {
      level,
      intensity,
      content
    };
  }

  /**
   * Step 5: Adapt next question difficulty
   */
  private adaptNextQuestionDifficulty(
    mastery: ConceptMastery,
    error: ErrorClassification,
    attemptNumber: number
  ): 'easier' | 'same' | 'harder' {
    // If critical error or low mastery, go easier
    if (error.severity === 'critical' || mastery.masteryScore < this.masteryThresholds.low) {
      return 'easier';
    }

    // If multiple attempts on same question, stay at same level
    if (attemptNumber > 2) {
      return 'same';
    }

    // If high mastery and improving trend, go harder
    if (mastery.masteryScore > this.masteryThresholds.high && mastery.trend === 'improving') {
      return 'harder';
    }

    // If medium mastery and stable, stay same
    if (mastery.masteryScore > this.masteryThresholds.medium && mastery.trend === 'stable') {
      return 'same';
    }

    // If declining trend, go easier
    if (mastery.trend === 'declining') {
      return 'easier';
    }

    // Default: same difficulty
    return 'same';
  }

  /**
   * Step 6: Check if concept revision is needed
   */
  private checkRevisionNeeded(
    mastery: ConceptMastery,
    error: ErrorClassification,
    attemptNumber: number
  ): { needed: boolean; concepts: string[] } {
    const revisionNeeded = 
      mastery.masteryScore < this.masteryThresholds.medium ||
      error.severity === 'critical' ||
      (attemptNumber > 2 && error.errorType === 'conceptual') ||
      mastery.trend === 'declining';

    return {
      needed: revisionNeeded,
      concepts: revisionNeeded ? error.affectedConcepts : []
    };
  }

  /**
   * Step 7: Generate confidence boost message
   */
  private generateConfidenceBoost(
    mastery: ConceptMastery,
    error: ErrorClassification,
    attemptNumber: number
  ): string {
    if (mastery.masteryScore >= this.masteryThresholds.high) {
      return '🌟 Excellent! You\'re mastering this concept!';
    } else if (mastery.masteryScore >= this.masteryThresholds.medium) {
      return '👍 Good progress! Keep practicing to strengthen your understanding.';
    } else if (mastery.trend === 'improving') {
      return '📈 You\'re improving! Stay focused and you\'ll get there.';
    } else if (attemptNumber > 1) {
      return '💪 Don\'t give up! Learning takes time and practice.';
    } else {
      return '🎯 Let\'s work through this together. You can do it!';
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getExpectedTime(difficulty: string): number {
    return {
      easy: 30,    // 30 seconds
      medium: 60,  // 60 seconds
      hard: 120    // 120 seconds
    }[difficulty] || 60;
  }

  private getDifficultyBonus(difficulty: string, isCorrect: boolean): number {
    if (!isCorrect) return 0;
    
    return {
      easy: 5,
      medium: 10,
      hard: 15
    }[difficulty] || 0;
  }

  private calculateTimeEfficiency(timeSpent: number, difficulty: string): number {
    const expected = this.getExpectedTime(difficulty);
    const ratio = timeSpent / expected;
    
    if (ratio < 0.5) return 50; // Too fast, might be careless
    if (ratio <= 1.2) return 100; // Optimal time
    if (ratio <= 2) return 70; // Acceptable
    return 40; // Too slow
  }

  private calculateTrend(oldScore: number, newScore: number): 'improving' | 'declining' | 'stable' {
    const diff = newScore - oldScore;
    
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  private determineConfidenceLevel(score: number, attempts: number): 'low' | 'medium' | 'high' {
    // Need sufficient attempts for high confidence
    if (attempts < 3) return 'low';
    
    if (score >= this.masteryThresholds.high) return 'high';
    if (score >= this.masteryThresholds.medium) return 'medium';
    return 'low';
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const safaAlgorithm = new SmartAdaptiveFeedbackAlgorithm();
