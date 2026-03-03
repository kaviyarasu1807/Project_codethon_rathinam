/**
 * Database Seeding Script
 * Populates the database with realistic sample data
 * 
 * Usage: npx ts-node scripts/seed-database.ts
 */

import mongoose from 'mongoose';
import {
  connectMongoDB,
  Student,
  QuizResult,
  EmotionalState,
  ProctoringViolation,
  SafaConceptMastery,
  SafaAnswerAttempt,
  LearningAnalyticsReport,
  VideoRecommendation,
  VideoWatchHistory
} from '../backend/mongodb';

// ============================================================================
// SAMPLE DATA GENERATORS
// ============================================================================

const domains = ['Engineering', 'Medical', 'Computer Science', 'Arts'];
const departments = {
  'Engineering': ['Mechanical', 'Civil', 'Electrical', 'Chemical'],
  'Medical': ['General Medicine', 'Surgery', 'Pediatrics', 'Cardiology'],
  'Computer Science': ['Software Engineering', 'Data Science', 'AI/ML', 'Cybersecurity'],
  'Arts': ['Literature', 'History', 'Philosophy', 'Fine Arts']
};

const colleges = [
  'MIT - Massachusetts Institute of Technology',
  'Stanford University',
  'Harvard University',
  'UC Berkeley',
  'Carnegie Mellon University',
  'Oxford University',
  'Cambridge University',
  'IIT Bombay',
  'IIT Delhi',
  'National University of Singapore'
];

const concepts = {
  'Engineering': ['Thermodynamics', 'Fluid Mechanics', 'Statics', 'Dynamics', 'Material Science'],
  'Medical': ['Anatomy', 'Physiology', 'Pharmacology', 'Pathology', 'Biochemistry'],
  'Computer Science': ['Data Structures', 'Algorithms', 'Databases', 'Operating Systems', 'Networking'],
  'Arts': ['Critical Thinking', 'Essay Writing', 'Historical Analysis', 'Literary Theory', 'Philosophy']
};

function generateFaceDescriptor(): string {
  return Array.from({ length: 128 }, () => (Math.random() * 2 - 1).toFixed(4)).join(',');
}

function generatePhoneNumber(): string {
  return `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

function generateAddress(): string {
  const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Pine Rd', 'Cedar Ln'];
  const cities = ['Boston', 'San Francisco', 'New York', 'Seattle', 'Austin'];
  const states = ['MA', 'CA', 'NY', 'WA', 'TX'];
  
  const num = Math.floor(Math.random() * 9000 + 1000);
  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const zip = Math.floor(Math.random() * 90000 + 10000);
  
  return `${num} ${street}, ${city}, ${state} ${zip}`;
}

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedStudents() {
  console.log('📚 Seeding students...');
  
  const students = [
    {
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // hashed "password123"
      role: 'student',
      domain: 'Computer Science',
      department: 'Software Engineering',
      face_descriptor: generateFaceDescriptor(),
      mobile_number: generatePhoneNumber(),
      address: generateAddress(),
      college_name: 'MIT - Massachusetts Institute of Technology'
    },
    {
      name: 'Bob Smith',
      email: 'bob.smith@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'student',
      domain: 'Engineering',
      department: 'Mechanical',
      face_descriptor: generateFaceDescriptor(),
      mobile_number: generatePhoneNumber(),
      address: generateAddress(),
      college_name: 'Stanford University'
    },
    {
      name: 'Carol Williams',
      email: 'carol.williams@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'student',
      domain: 'Medical',
      department: 'General Medicine',
      face_descriptor: generateFaceDescriptor(),
      mobile_number: generatePhoneNumber(),
      address: generateAddress(),
      college_name: 'Harvard University'
    },
    {
      name: 'David Brown',
      email: 'david.brown@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'student',
      domain: 'Computer Science',
      department: 'Data Science',
      face_descriptor: generateFaceDescriptor(),
      mobile_number: generatePhoneNumber(),
      address: generateAddress(),
      college_name: 'UC Berkeley'
    },
    {
      name: 'Emma Davis',
      email: 'emma.davis@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'student',
      domain: 'Engineering',
      department: 'Electrical',
      face_descriptor: generateFaceDescriptor(),
      mobile_number: generatePhoneNumber(),
      address: generateAddress(),
      college_name: 'Carnegie Mellon University'
    },
    {
      name: 'Frank Miller',
      email: 'frank.miller@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'student',
      domain: 'Medical',
      department: 'Surgery',
      face_descriptor: generateFaceDescriptor(),
      mobile_number: generatePhoneNumber(),
      address: generateAddress(),
      college_name: 'Oxford University'
    },
    {
      name: 'Grace Wilson',
      email: 'grace.wilson@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'student',
      domain: 'Computer Science',
      department: 'AI/ML',
      face_descriptor: generateFaceDescriptor(),
      mobile_number: generatePhoneNumber(),
      address: generateAddress(),
      college_name: 'Stanford University'
    },
    {
      name: 'Henry Moore',
      email: 'henry.moore@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'student',
      domain: 'Engineering',
      department: 'Civil',
      face_descriptor: generateFaceDescriptor(),
      mobile_number: generatePhoneNumber(),
      address: generateAddress(),
      college_name: 'IIT Bombay'
    },
    {
      name: 'Ivy Taylor',
      email: 'ivy.taylor@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'student',
      domain: 'Arts',
      department: 'Literature',
      face_descriptor: generateFaceDescriptor(),
      mobile_number: generatePhoneNumber(),
      address: generateAddress(),
      college_name: 'Cambridge University'
    },
    {
      name: 'Jack Anderson',
      email: 'jack.anderson@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'student',
      domain: 'Computer Science',
      department: 'Cybersecurity',
      face_descriptor: generateFaceDescriptor(),
      mobile_number: generatePhoneNumber(),
      address: generateAddress(),
      college_name: 'MIT - Massachusetts Institute of Technology'
    },
    // Admin user
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'admin',
      domain: 'Administration',
      department: 'Academic Affairs',
      mobile_number: generatePhoneNumber(),
      address: generateAddress(),
      college_name: 'MIT - Massachusetts Institute of Technology'
    }
  ];
  
  const createdStudents = await Student.insertMany(students);
  console.log(`✅ Created ${createdStudents.length} students`);
  
  return createdStudents.filter(s => s.role === 'student');
}

async function seedQuizResults(students: any[]) {
  console.log('📝 Seeding quiz results...');
  
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const quizResults = [];
  
  for (const student of students) {
    const numQuizzes = Math.floor(Math.random() * 3) + 1; // 1-3 quizzes per student
    const studentConcepts = concepts[student.domain as keyof typeof concepts] || concepts['Computer Science'];
    
    for (let i = 0; i < numQuizzes; i++) {
      const score = Math.floor(Math.random() * 60) + 40; // 40-100
      const level = score >= 80 ? 'Advanced' : score >= 60 ? 'Intermediate' : 'Beginner';
      
      const missedCount = Math.floor((100 - score) / 20);
      const missedConcepts = studentConcepts.slice(0, missedCount);
      
      const criticalCount = Math.floor(Math.random() * 3);
      const criticalConcepts = studentConcepts.slice(0, criticalCount);
      
      quizResults.push({
        student_id: student._id,
        score,
        level,
        missed_concepts: missedConcepts,
        critical_concepts: criticalConcepts,
        critical_questions: [
          `Question about ${criticalConcepts[0] || 'general topic'}`,
          `Advanced problem in ${criticalConcepts[1] || 'core concepts'}`
        ],
        ai_guidance: `Focus on ${missedConcepts.join(', ')}. Practice daily for 30 minutes.`,
        total_time: Math.floor(Math.random() * 1200) + 600, // 10-30 minutes
        avg_question_time: Math.floor(Math.random() * 60) + 30, // 30-90 seconds
        question_times: Array.from({ length: 12 }, () => Math.floor(Math.random() * 60) + 30),
        typing_speed: Math.floor(Math.random() * 50) + 20,
        tab_switch_count: Math.floor(Math.random() * 5),
        voice_detected: Math.random() > 0.7 ? 1 : 0,
        avg_focus_level: Math.floor(Math.random() * 30) + 60,
        avg_stress_level: Math.floor(Math.random() * 40) + 30,
        avg_happiness_level: Math.floor(Math.random() * 30) + 60,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
      });
    }
  }
  
  const createdResults = await QuizResult.insertMany(quizResults);
  console.log(`✅ Created ${createdResults.length} quiz results`);
  
  return createdResults;
}

async function seedEmotionalStates(students: any[]) {
  console.log('😊 Seeding emotional states...');
  
  const emotionalStates = [];
  
  for (const student of students) {
    const numStates = Math.floor(Math.random() * 20) + 10; // 10-30 states per student
    
    for (let i = 0; i < numStates; i++) {
      emotionalStates.push({
        student_id: student._id,
        stress_level: Math.floor(Math.random() * 60) + 20, // 20-80
        happiness_level: Math.floor(Math.random() * 50) + 40, // 40-90
        focus_level: Math.floor(Math.random() * 40) + 50, // 50-90
        typing_speed: Math.floor(Math.random() * 50) + 20,
        voice_detected: Math.random() > 0.8,
        tab_switch_count: Math.floor(Math.random() * 3),
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
  }
  
  const createdStates = await EmotionalState.insertMany(emotionalStates);
  console.log(`✅ Created ${createdStates.length} emotional states`);
  
  return createdStates;
}

async function seedSafaData(students: any[]) {
  console.log('🎯 Seeding SAFA data...');
  
  const conceptMasteries = [];
  const answerAttempts = [];
  
  for (const student of students) {
    const studentConcepts = concepts[student.domain as keyof typeof concepts] || concepts['Computer Science'];
    
    // Create concept mastery records
    for (const concept of studentConcepts) {
      const totalAttempts = Math.floor(Math.random() * 20) + 5;
      const correctAttempts = Math.floor(totalAttempts * (Math.random() * 0.5 + 0.3)); // 30-80% correct
      const masteryScore = Math.floor((correctAttempts / totalAttempts) * 100);
      
      conceptMasteries.push({
        student_id: student._id,
        concept_id: concept.toLowerCase().replace(/\s+/g, '_'),
        concept_name: concept,
        mastery_score: masteryScore,
        total_attempts: totalAttempts,
        correct_attempts: correctAttempts,
        average_time_spent: Math.floor(Math.random() * 60) + 30,
        last_attempt_date: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        trend: masteryScore > 70 ? 'improving' : masteryScore < 40 ? 'declining' : 'stable',
        confidence_level: masteryScore > 70 ? 'high' : masteryScore > 40 ? 'medium' : 'low'
      });
      
      // Create answer attempts for this concept
      for (let i = 0; i < Math.min(totalAttempts, 5); i++) {
        const isCorrect = Math.random() < (correctAttempts / totalAttempts);
        
        answerAttempts.push({
          student_id: student._id,
          question_id: `q_${concept.toLowerCase()}_${i}`,
          concept_id: concept.toLowerCase().replace(/\s+/g, '_'),
          answer: isCorrect ? 'correct_answer' : 'wrong_answer',
          correct_answer: 'correct_answer',
          is_correct: isCorrect,
          attempt_number: i + 1,
          time_spent: Math.floor(Math.random() * 120) + 30,
          difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any,
          error_type: isCorrect ? undefined : ['conceptual', 'procedural', 'careless'][Math.floor(Math.random() * 3)],
          error_severity: isCorrect ? undefined : ['minor', 'moderate', 'major'][Math.floor(Math.random() * 3)],
          feedback_level: ['minimal', 'moderate', 'detailed'][Math.floor(Math.random() * 3)],
          feedback_intensity: Math.floor(Math.random() * 5) + 1,
          mastery_score_before: masteryScore - 10,
          mastery_score_after: masteryScore,
          timestamp: Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000
        });
      }
    }
  }
  
  const createdMasteries = await SafaConceptMastery.insertMany(conceptMasteries);
  const createdAttempts = await SafaAnswerAttempt.insertMany(answerAttempts);
  
  console.log(`✅ Created ${createdMasteries.length} concept masteries`);
  console.log(`✅ Created ${createdAttempts.length} answer attempts`);
  
  return { masteries: createdMasteries, attempts: createdAttempts };
}

async function seedLearningAnalytics(students: any[]) {
  console.log('📊 Seeding learning analytics...');
  
  const reports = [];
  const healthLevels = ['excellent', 'good', 'fair', 'poor', 'critical'];
  const trends = ['improving', 'declining', 'stable', 'fluctuating'];
  const engagementLevels = ['high', 'medium', 'low'];
  const learningStyles = ['visual', 'auditory', 'kinesthetic', 'reading-writing', 'mixed'];
  
  for (const student of students) {
    const numReports = Math.floor(Math.random() * 3) + 1;
    const studentConcepts = concepts[student.domain as keyof typeof concepts] || concepts['Computer Science'];
    
    for (let i = 0; i < numReports; i++) {
      const healthScore = Math.floor(Math.random() * 100);
      const overallHealth = healthScore >= 80 ? 'excellent' : 
                           healthScore >= 60 ? 'good' : 
                           healthScore >= 40 ? 'fair' : 
                           healthScore >= 20 ? 'poor' : 'critical';
      
      const weakConcepts = studentConcepts.slice(0, Math.floor(Math.random() * 3) + 1);
      const strongConcepts = studentConcepts.slice(-2);
      
      reports.push({
        student_id: student._id,
        timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        overall_health: overallHealth,
        health_score: healthScore,
        problems: {
          weak_concepts: weakConcepts.map(c => ({
            concept: c,
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            attempts: Math.floor(Math.random() * 10) + 1,
            success_rate: Math.floor(Math.random() * 50) + 20
          })),
          stress_indicators: healthScore < 50 ? ['High stress during assessments', 'Low focus levels'] : [],
          engagement_issues: healthScore < 40 ? ['Low participation', 'Irregular attendance'] : []
        },
        strengths: strongConcepts,
        performance_trend: trends[Math.floor(Math.random() * trends.length)] as any,
        engagement_level: engagementLevels[Math.floor(Math.random() * engagementLevels.length)] as any,
        learning_style: learningStyles[Math.floor(Math.random() * learningStyles.length)] as any,
        intervention_required: healthScore < 50,
        mentor_alert: healthScore < 30,
        created_at: new Date()
      });
    }
  }
  
  const createdReports = await LearningAnalyticsReport.insertMany(reports);
  console.log(`✅ Created ${createdReports.length} learning analytics reports`);
  
  return createdReports;
}

async function seedVideoRecommendations(students: any[]) {
  console.log('🎥 Seeding video recommendations...');
  
  const recommendations = [];
  const watchHistory = [];
  
  for (const student of students) {
    const studentConcepts = concepts[student.domain as keyof typeof concepts] || concepts['Computer Science'];
    const focusAreas = studentConcepts.slice(0, 3);
    
    // Create video recommendations
    recommendations.push({
      student_id: student._id,
      timestamp: Date.now(),
      videos: focusAreas.map((concept, idx) => ({
        id: `video_${concept.toLowerCase().replace(/\s+/g, '_')}_${idx}`,
        title: `Mastering ${concept}: Complete Guide`,
        url: `https://youtube.com/watch?v=${Math.random().toString(36).substring(7)}`,
        duration: Math.floor(Math.random() * 1800) + 600, // 10-40 minutes
        difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
        relevance_score: Math.floor(Math.random() * 30) + 70,
        concept: concept,
        thumbnail: `https://img.youtube.com/vi/${Math.random().toString(36).substring(7)}/maxresdefault.jpg`
      })),
      resources: [
        {
          type: 'article',
          title: `${focusAreas[0]} - In-Depth Tutorial`,
          url: `https://example.com/tutorial/${focusAreas[0].toLowerCase()}`,
          estimated_time: '15 min read'
        },
        {
          type: 'practice',
          title: `${focusAreas[1]} Practice Problems`,
          url: `https://example.com/practice/${focusAreas[1].toLowerCase()}`,
          estimated_time: '30 min'
        }
      ],
      study_plan: {
        immediate: [`Watch video on ${focusAreas[0]}`, `Complete practice quiz`],
        thisWeek: [`Deep dive into ${focusAreas[1]}`, `Work on project`],
        thisMonth: [`Master ${focusAreas[2]}`, `Take comprehensive assessment`]
      },
      estimated_study_time: '8-10 hours',
      focus_areas: focusAreas
    });
    
    // Create watch history
    const numWatched = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < numWatched; i++) {
      const concept = studentConcepts[i % studentConcepts.length];
      const duration = Math.floor(Math.random() * 1800) + 600;
      const watchTime = Math.floor(duration * (Math.random() * 0.5 + 0.3)); // 30-80% watched
      
      watchHistory.push({
        student_id: student._id,
        video_id: `video_${concept.toLowerCase().replace(/\s+/g, '_')}_${i}`,
        watch_time: watchTime,
        completed: watchTime >= duration * 0.9,
        timestamp: Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000
      });
    }
  }
  
  const createdRecommendations = await VideoRecommendation.insertMany(recommendations);
  const createdHistory = await VideoWatchHistory.insertMany(watchHistory);
  
  console.log(`✅ Created ${createdRecommendations.length} video recommendations`);
  console.log(`✅ Created ${createdHistory.length} watch history entries`);
  
  return { recommendations: createdRecommendations, history: createdHistory };
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to database
    await connectMongoDB();
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Student.deleteMany({}),
      QuizResult.deleteMany({}),
      EmotionalState.deleteMany({}),
      ProctoringViolation.deleteMany({}),
      SafaConceptMastery.deleteMany({}),
      SafaAnswerAttempt.deleteMany({}),
      LearningAnalyticsReport.deleteMany({}),
      VideoRecommendation.deleteMany({}),
      VideoWatchHistory.deleteMany({})
    ]);
    console.log('✅ Existing data cleared\n');
    
    // Seed data
    const students = await seedStudents();
    await seedQuizResults(students);
    await seedEmotionalStates(students);
    await seedSafaData(students);
    await seedLearningAnalytics(students);
    await seedVideoRecommendations(students);
    
    // Summary
    console.log('\n📈 Database Seeding Summary:');
    console.log('================================');
    console.log(`Students: ${await Student.countDocuments()}`);
    console.log(`Quiz Results: ${await QuizResult.countDocuments()}`);
    console.log(`Emotional States: ${await EmotionalState.countDocuments()}`);
    console.log(`SAFA Concept Masteries: ${await SafaConceptMastery.countDocuments()}`);
    console.log(`SAFA Answer Attempts: ${await SafaAnswerAttempt.countDocuments()}`);
    console.log(`Learning Analytics Reports: ${await LearningAnalyticsReport.countDocuments()}`);
    console.log(`Video Recommendations: ${await VideoRecommendation.countDocuments()}`);
    console.log(`Video Watch History: ${await VideoWatchHistory.countDocuments()}`);
    console.log('================================\n');
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Student: alice.johnson@example.com / password123');
    console.log('Admin: admin@example.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run seeding
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedDatabase;
