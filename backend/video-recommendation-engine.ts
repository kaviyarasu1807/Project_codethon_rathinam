/**
 * Video Recommendation Engine
 * Analyzes student performance and suggests relevant YouTube videos
 */

import YoutubeSearchApi from 'youtube-search-api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface StudentReport {
  studentId: number;
  weakConcepts: string[];
  criticalConcepts: string[];
  missedQuestions: string[];
  masteryScores: Record<string, number>;
  learningProblems: {
    type: string;
    severity: string;
    affectedConcepts: string[];
  }[];
  performanceTrend: 'improving' | 'declining' | 'stable';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing' | 'mixed';
}

export interface VideoRecommendation {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
  relevanceScore: number;
  recommendationReason: string;
  conceptsCovered: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  priority: 'high' | 'medium' | 'low';
}

export interface LearningResource {
  type: 'video' | 'article' | 'practice' | 'interactive';
  title: string;
  url: string;
  description: string;
  estimatedTime: string;
  difficulty: string;
  priority: number;
}

export interface RecommendationReport {
  studentId: number;
  timestamp: number;
  videos: VideoRecommendation[];
  resources: LearningResource[];
  studyPlan: {
    immediate: string[];
    thisWeek: string[];
    thisMonth: string[];
  };
  estimatedStudyTime: string;
  focusAreas: string[];
}

// ============================================================================
// VIDEO RECOMMENDATION ENGINE
// ============================================================================

export class VideoRecommendationEngine {
  private conceptKeywords: Record<string, string[]> = {
    'Operating Systems': ['operating system basics', 'OS fundamentals', 'process management', 'memory management'],
    'Data Structures': ['data structures tutorial', 'arrays linked lists', 'stacks queues', 'trees graphs'],
    'Algorithms': ['algorithm tutorial', 'sorting algorithms', 'searching algorithms', 'algorithm complexity'],
    'Computer Hardware': ['computer hardware basics', 'CPU architecture', 'computer components'],
    'Computer Memory': ['computer memory types', 'RAM ROM', 'cache memory', 'memory hierarchy'],
    'Binary Systems': ['binary number system', 'binary conversion', 'binary arithmetic'],
    'Engineering Mechanics': ['engineering mechanics basics', 'stress strain', 'Hookes law'],
    'Thermodynamics': ['thermodynamics basics', 'heat transfer', 'thermal conductivity'],
    'Electrical Engineering': ['electrical engineering basics', 'circuits', 'transformers'],
    'Medical Anatomy': ['human anatomy', 'organ systems', 'body systems'],
    'Medical Ethics': ['medical ethics', 'bioethics', 'healthcare ethics'],
    'Human Physiology': ['human physiology', 'body functions', 'physiological systems'],
    'Databases': ['database tutorial', 'SQL basics', 'database design'],
    'Networking': ['computer networking', 'network protocols', 'HTTPS SSL'],
    'Programming Basics': ['programming fundamentals', 'coding basics', 'programming concepts']
  };

  private qualityChannels = [
    'Khan Academy',
    'Crash Course',
    'MIT OpenCourseWare',
    'Stanford Online',
    'freeCodeCamp.org',
    'Traversy Media',
    'The Organic Chemistry Tutor',
    'Professor Leonard',
    'Computerphile',
    'Numberphile',
    '3Blue1Brown',
    'TED-Ed',
    'Kurzgesagt'
  ];

  /**
   * Main entry point: Generate video recommendations based on student report
   */
  async generateRecommendations(report: StudentReport): Promise<RecommendationReport> {
    // Step 1: Identify focus areas
    const focusAreas = this.identifyFocusAreas(report);

    // Step 2: Search for relevant videos
    const videos = await this.searchVideos(focusAreas, report);

    // Step 3: Rank and filter videos
    const rankedVideos = this.rankVideos(videos, report);

    // Step 4: Generate additional resources
    const resources = this.generateAdditionalResources(focusAreas, report);

    // Step 5: Create study plan
    const studyPlan = this.createStudyPlan(focusAreas, rankedVideos, report);

    // Step 6: Calculate estimated study time
    const estimatedStudyTime = this.calculateStudyTime(rankedVideos, resources);

    return {
      studentId: report.studentId,
      timestamp: Date.now(),
      videos: rankedVideos.slice(0, 15), // Top 15 videos
      resources,
      studyPlan,
      estimatedStudyTime,
      focusAreas
    };
  }

  /**
   * Step 1: Identify focus areas based on performance
   */
  private identifyFocusAreas(report: StudentReport): string[] {
    const focusAreas: string[] = [];

    // Add critical concepts (highest priority)
    focusAreas.push(...report.criticalConcepts);

    // Add weak concepts (mastery < 50%)
    Object.entries(report.masteryScores).forEach(([concept, score]) => {
      if (score < 50 && !focusAreas.includes(concept)) {
        focusAreas.push(concept);
      }
    });

    // Add concepts from learning problems
    report.learningProblems.forEach(problem => {
      if (problem.severity === 'critical' || problem.severity === 'high') {
        problem.affectedConcepts.forEach(concept => {
          if (!focusAreas.includes(concept)) {
            focusAreas.push(concept);
          }
        });
      }
    });

    // Add weak concepts
    focusAreas.push(...report.weakConcepts.filter(c => !focusAreas.includes(c)));

    return focusAreas.slice(0, 5); // Top 5 focus areas
  }

  /**
   * Step 2: Search for relevant videos
   */
  private async searchVideos(
    focusAreas: string[],
    report: StudentReport
  ): Promise<VideoRecommendation[]> {
    const allVideos: VideoRecommendation[] = [];

    for (const concept of focusAreas) {
      const keywords = this.conceptKeywords[concept] || [concept];
      
      for (const keyword of keywords) {
        try {
          // Adjust search query based on learning style
          let searchQuery = keyword;
          if (report.learningStyle === 'visual') {
            searchQuery += ' animation visualization';
          } else if (report.learningStyle === 'auditory') {
            searchQuery += ' lecture explanation';
          } else if (report.learningStyle === 'kinesthetic') {
            searchQuery += ' hands-on practical';
          }

          // Add difficulty level
          const avgMastery = Object.values(report.masteryScores).reduce((a, b) => a + b, 0) / 
                            Object.values(report.masteryScores).length;
          if (avgMastery < 40) {
            searchQuery += ' beginner tutorial';
          } else if (avgMastery < 70) {
            searchQuery += ' intermediate';
          }

          const results = await YoutubeSearchApi.GetListByKeyword(
            searchQuery,
            false,
            5,
            [{ type: 'video' }]
          );

          if (results && results.items) {
            results.items.forEach((item: any) => {
              allVideos.push({
                videoId: item.id,
                title: item.title,
                description: item.description || '',
                thumbnail: item.thumbnail?.url || '',
                channelTitle: item.channelTitle || '',
                duration: this.formatDuration(item.length?.simpleText || ''),
                viewCount: item.viewCount || '0',
                publishedAt: item.publishedTime || '',
                relevanceScore: 0, // Will be calculated later
                recommendationReason: `Recommended for ${concept}`,
                conceptsCovered: [concept],
                difficulty: this.determineDifficulty(item.title, item.description),
                priority: 'medium'
              });
            });
          }

          // Rate limit: wait 500ms between searches
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error searching for ${keyword}:`, error);
        }
      }
    }

    return allVideos;
  }

  /**
   * Step 3: Rank videos by relevance
   */
  private rankVideos(
    videos: VideoRecommendation[],
    report: StudentReport
  ): VideoRecommendation[] {
    return videos.map(video => {
      let score = 0;

      // Quality channel bonus
      if (this.qualityChannels.some(channel => 
        video.channelTitle.toLowerCase().includes(channel.toLowerCase())
      )) {
        score += 30;
      }

      // View count bonus (normalized)
      const views = parseInt(video.viewCount.replace(/,/g, '')) || 0;
      if (views > 1000000) score += 20;
      else if (views > 100000) score += 15;
      else if (views > 10000) score += 10;

      // Duration bonus (prefer 10-30 minute videos)
      const duration = this.parseDuration(video.duration);
      if (duration >= 10 && duration <= 30) score += 15;
      else if (duration >= 5 && duration <= 45) score += 10;

      // Recency bonus
      if (video.publishedAt.includes('day') || video.publishedAt.includes('week')) {
        score += 10;
      } else if (video.publishedAt.includes('month')) {
        score += 5;
      }

      // Learning style match
      if (report.learningStyle === 'visual' && 
          (video.title.toLowerCase().includes('animation') || 
           video.title.toLowerCase().includes('visual'))) {
        score += 15;
      }

      // Difficulty match
      const avgMastery = Object.values(report.masteryScores).reduce((a, b) => a + b, 0) / 
                        Object.values(report.masteryScores).length;
      if (avgMastery < 40 && video.difficulty === 'beginner') score += 20;
      else if (avgMastery >= 40 && avgMastery < 70 && video.difficulty === 'intermediate') score += 20;
      else if (avgMastery >= 70 && video.difficulty === 'advanced') score += 20;

      // Critical concept bonus
      if (video.conceptsCovered.some(c => report.criticalConcepts.includes(c))) {
        score += 25;
        video.priority = 'high';
      }

      // Weak concept bonus
      if (video.conceptsCovered.some(c => report.weakConcepts.includes(c))) {
        score += 15;
        if (video.priority !== 'high') video.priority = 'medium';
      }

      video.relevanceScore = score;
      return video;
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Step 4: Generate additional learning resources
   */
  private generateAdditionalResources(
    focusAreas: string[],
    report: StudentReport
  ): LearningResource[] {
    const resources: LearningResource[] = [];

    focusAreas.forEach(concept => {
      // Practice problems
      resources.push({
        type: 'practice',
        title: `${concept} - Practice Problems`,
        url: `/practice/${concept.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Solve practice problems to reinforce ${concept} concepts`,
        estimatedTime: '30-45 minutes',
        difficulty: 'varies',
        priority: report.criticalConcepts.includes(concept) ? 3 : 2
      });

      // Interactive tutorials
      resources.push({
        type: 'interactive',
        title: `${concept} - Interactive Tutorial`,
        url: `/interactive/${concept.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Hands-on interactive learning for ${concept}`,
        estimatedTime: '20-30 minutes',
        difficulty: 'beginner-friendly',
        priority: 2
      });

      // Articles
      resources.push({
        type: 'article',
        title: `${concept} - Comprehensive Guide`,
        url: `https://www.google.com/search?q=${encodeURIComponent(concept + ' tutorial')}`,
        description: `Read in-depth articles about ${concept}`,
        estimatedTime: '15-20 minutes',
        difficulty: 'intermediate',
        priority: 1
      });
    });

    return resources.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Step 5: Create personalized study plan
   */
  private createStudyPlan(
    focusAreas: string[],
    videos: VideoRecommendation[],
    report: StudentReport
  ): { immediate: string[]; thisWeek: string[]; thisMonth: string[] } {
    const immediate: string[] = [];
    const thisWeek: string[] = [];
    const thisMonth: string[] = [];

    // Immediate actions (today)
    if (report.criticalConcepts.length > 0) {
      immediate.push(`🚨 URGENT: Review ${report.criticalConcepts[0]} immediately`);
      const criticalVideo = videos.find(v => 
        v.conceptsCovered.includes(report.criticalConcepts[0])
      );
      if (criticalVideo) {
        immediate.push(`📺 Watch: "${criticalVideo.title}" (${criticalVideo.duration})`);
      }
      immediate.push(`📝 Complete 5 practice problems on ${report.criticalConcepts[0]}`);
    }

    // This week (next 7 days)
    focusAreas.slice(0, 3).forEach((concept, idx) => {
      thisWeek.push(`Day ${idx + 1}: Focus on ${concept}`);
      const conceptVideos = videos.filter(v => v.conceptsCovered.includes(concept)).slice(0, 2);
      conceptVideos.forEach(video => {
        thisWeek.push(`  📺 Watch: "${video.title}"`);
      });
      thisWeek.push(`  📝 Practice: Complete ${concept} exercises`);
      thisWeek.push(`  ✅ Quiz: Test your understanding`);
    });

    // This month (next 30 days)
    thisMonth.push('Week 1: Master critical concepts');
    thisMonth.push('Week 2: Strengthen weak areas');
    thisMonth.push('Week 3: Practice and review');
    thisMonth.push('Week 4: Comprehensive assessment');
    
    focusAreas.forEach(concept => {
      thisMonth.push(`📚 Achieve 80%+ mastery in ${concept}`);
    });

    return { immediate, thisWeek, thisMonth };
  }

  /**
   * Step 6: Calculate estimated study time
   */
  private calculateStudyTime(
    videos: VideoRecommendation[],
    resources: LearningResource[]
  ): string {
    let totalMinutes = 0;

    // Video time
    videos.slice(0, 10).forEach(video => {
      totalMinutes += this.parseDuration(video.duration);
    });

    // Resource time
    resources.slice(0, 5).forEach(resource => {
      const time = resource.estimatedTime.match(/\d+/);
      if (time) {
        totalMinutes += parseInt(time[0]);
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private formatDuration(duration: string): string {
    // Convert YouTube duration format to readable format
    return duration || 'Unknown';
  }

  private parseDuration(duration: string): number {
    // Parse duration string to minutes
    const match = duration.match(/(\d+):(\d+)/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return 15; // Default 15 minutes
  }

  private determineDifficulty(title: string, description: string): 'beginner' | 'intermediate' | 'advanced' {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('beginner') || text.includes('introduction') || 
        text.includes('basics') || text.includes('101')) {
      return 'beginner';
    }
    
    if (text.includes('advanced') || text.includes('expert') || 
        text.includes('deep dive') || text.includes('mastery')) {
      return 'advanced';
    }
    
    return 'intermediate';
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const videoRecommendationEngine = new VideoRecommendationEngine();
