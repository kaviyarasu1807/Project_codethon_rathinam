/**
 * Supabase Database Seeding Script
 * Populates Supabase database with sample data
 * 
 * Usage: npx ts-node scripts/seed-supabase.ts
 */

import { supabase } from '../backend/supabase';
import bcrypt from 'bcryptjs';

// ============================================================================
// SAMPLE DATA GENERATORS
// ============================================================================

const domains = ['Engineering', 'Medical', 'Computer Science', 'Arts'];
const departments: Record<string, string[]> = {
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
  'Carnegie Mellon University'
];

const concepts: Record<string, string[]> = {
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

async function clearExistingData() {
  console.log('🗑️  Clearing existing data...');
  
  // Delete in correct order (respecting foreign keys)
  await supabase.from('emotional_states').delete().neq('id', 0);
  await supabase.from('quiz_results').delete().neq('id', 0);
  await supabase.from('video_watch_history').delete().neq('id', 0);
  await supabase.from('video_recommendations').delete().neq('id', 0);
  await supabase.from('learning_analytics_reports').delete().neq('id', 0);
  await supabase.from('students').delete().neq('id', 0);
  await supabase.from('staff').delete().neq('id', 0);
  
  console.log('✅ Existing data cleared\n');
}

async function seedStudents() {
  console.log('📚 Seeding students...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const students = [
    {
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      password: hashedPassword,
      domain: 'Computer Science',
      face_descriptor: generateFaceDescriptor()
    },
    {
      name: 'Bob Smith',
      email: 'bob.smith@example.com',
      password: hashedPassword,
      domain: 'Engineering',
      face_descriptor: generateFaceDescriptor()
    },
    {
      name: 'Carol Williams',
      email: 'carol.williams@example.com',
      password: hashedPassword,
      domain: 'Medical',
      face_descriptor: generateFaceDescriptor()
    },
    {
      name: 'David Brown',
      email: 'david.brown@example.com',
      password: hashedPassword,
      domain: 'Computer Science',
      face_descriptor: generateFaceDescriptor()
    },
    {
      name: 'Emma Davis',
      email: 'emma.davis@example.com',
      password: hashedPassword,
      domain: 'Engineering',
      face_descriptor: generateFaceDescriptor()
    },
    {
      name: 'Frank Miller',
      email: 'frank.miller@example.com',
      password: hashedPassword,
      domain: 'Medical',
      face_descriptor: generateFaceDescriptor()
    },
    {
      name: 'Grace Wilson',
      email: 'grace.wilson@example.com',
      password: hashedPassword,
      domain: 'Computer Science',
      face_descriptor: generateFaceDescriptor()
    },
    {
      name: 'Henry Moore',
      email: 'henry.moore@example.com',
      password: hashedPassword,
      domain: 'Engineering',
      face_descriptor: generateFaceDescriptor()
    }
  ];
  
  const { data, error } = await supabase
    .from('students')
    .insert(students)
    .select();
  
  if (error) {
    console.error('❌ Error seeding students:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} students`);
  return data || [];
}

async function seedStaff() {
  console.log('👨‍💼 Seeding staff...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const staff = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      department: 'Academic Affairs'
    }
  ];
  
  const { data, error } = await supabase
    .from('staff')
    .insert(staff)
    .select();
  
  if (error) {
    console.error('❌ Error seeding staff:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} staff members`);
  return data || [];
}

async function seedQuizResults(students: any[]) {
  console.log('📝 Seeding quiz results...');
  
  const quizResults = [];
  
  for (const student of students) {
    const numQuizzes = Math.floor(Math.random() * 3) + 1;
    const studentConcepts = concepts[student.domain as keyof typeof concepts] || concepts['Computer Science'];
    
    for (let i = 0; i < numQuizzes; i++) {
      const score = Math.floor(Math.random() * 60) + 40;
      const level = score >= 80 ? 'Advanced' : score >= 60 ? 'Intermediate' : 'Beginner';
      
      const missedCount = Math.floor((100 - score) / 20);
      const missedConcepts = studentConcepts.slice(0, missedCount).join(', ');
      
      const criticalCount = Math.floor(Math.random() * 3);
      const criticalConcepts = studentConcepts.slice(0, criticalCount).join(', ');
      
      quizResults.push({
        student_id: student.id,
        score,
        level,
        missed_concepts: missedConcepts,
        critical_concepts: criticalConcepts,
        critical_questions: `Question about ${criticalConcepts || 'general topics'}`,
        ai_guidance: `Focus on ${missedConcepts || 'core concepts'}. Practice daily for 30 minutes.`
      });
    }
  }
  
  const { data, error } = await supabase
    .from('quiz_results')
    .insert(quizResults)
    .select();
  
  if (error) {
    console.error('❌ Error seeding quiz results:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} quiz results`);
  return data || [];
}

async function seedEmotionalStates(students: any[]) {
  console.log('😊 Seeding emotional states...');
  
  const emotionalStates = [];
  
  for (const student of students) {
    const numStates = Math.floor(Math.random() * 15) + 5;
    
    for (let i = 0; i < numStates; i++) {
      emotionalStates.push({
        student_id: student.id,
        stress_level: Math.random() * 60 + 20,
        happiness_level: Math.random() * 50 + 40
      });
    }
  }
  
  const { data, error } = await supabase
    .from('emotional_states')
    .insert(emotionalStates)
    .select();
  
  if (error) {
    console.error('❌ Error seeding emotional states:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} emotional states`);
  return data || [];
}

async function seedLearningAnalytics(students: any[]) {
  console.log('📊 Seeding learning analytics...');
  
  const reports = [];
  const healthLevels = ['excellent', 'good', 'fair', 'poor', 'critical'];
  const trends = ['improving', 'declining', 'stable', 'fluctuating'];
  const engagementLevels = ['high', 'medium', 'low'];
  const learningStyles = ['visual', 'auditory', 'kinesthetic', 'reading-writing', 'mixed'];
  
  for (const student of students) {
    const healthScore = Math.floor(Math.random() * 100);
    const overallHealth = healthScore >= 80 ? 'excellent' : 
                         healthScore >= 60 ? 'good' : 
                         healthScore >= 40 ? 'fair' : 
                         healthScore >= 20 ? 'poor' : 'critical';
    
    const studentConcepts = concepts[student.domain as keyof typeof concepts] || concepts['Computer Science'];
    const weakConcepts = studentConcepts.slice(0, Math.floor(Math.random() * 3) + 1);
    const strongConcepts = studentConcepts.slice(-2);
    
    reports.push({
      student_id: student.id,
      timestamp: Date.now(),
      overall_health: overallHealth,
      health_score: healthScore,
      problems: JSON.stringify({
        weak_concepts: weakConcepts.map(c => ({
          concept: c,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          attempts: Math.floor(Math.random() * 10) + 1,
          success_rate: Math.floor(Math.random() * 50) + 20
        }))
      }),
      strengths: JSON.stringify(strongConcepts),
      performance_trend: trends[Math.floor(Math.random() * trends.length)],
      engagement_level: engagementLevels[Math.floor(Math.random() * engagementLevels.length)],
      learning_style: learningStyles[Math.floor(Math.random() * learningStyles.length)],
      intervention_required: healthScore < 50 ? 1 : 0,
      mentor_alert: healthScore < 30 ? 1 : 0
    });
  }
  
  const { data, error } = await supabase
    .from('learning_analytics_reports')
    .insert(reports)
    .select();
  
  if (error) {
    console.error('❌ Error seeding learning analytics:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} learning analytics reports`);
  return data || [];
}

async function seedVideoRecommendations(students: any[]) {
  console.log('🎥 Seeding video recommendations...');
  
  const recommendations = [];
  const watchHistory = [];
  
  for (const student of students) {
    const studentConcepts = concepts[student.domain as keyof typeof concepts] || concepts['Computer Science'];
    const focusAreas = studentConcepts.slice(0, 3);
    
    recommendations.push({
      student_id: student.id,
      timestamp: Date.now(),
      videos: JSON.stringify(focusAreas.map((concept, idx) => ({
        id: `video_${concept.toLowerCase().replace(/\s+/g, '_')}_${idx}`,
        title: `Mastering ${concept}: Complete Guide`,
        url: `https://youtube.com/watch?v=${Math.random().toString(36).substring(7)}`,
        duration: Math.floor(Math.random() * 1800) + 600,
        difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
        relevance_score: Math.floor(Math.random() * 30) + 70,
        concept: concept
      }))),
      resources: JSON.stringify([
        {
          type: 'article',
          title: `${focusAreas[0]} - In-Depth Tutorial`,
          url: `https://example.com/tutorial/${focusAreas[0].toLowerCase()}`,
          estimated_time: '15 min read'
        }
      ]),
      study_plan: JSON.stringify({
        immediate: [`Watch video on ${focusAreas[0]}`, `Complete practice quiz`],
        thisWeek: [`Deep dive into ${focusAreas[1]}`, `Work on project`],
        thisMonth: [`Master ${focusAreas[2]}`, `Take comprehensive assessment`]
      }),
      estimated_study_time: '8-10 hours',
      focus_areas: JSON.stringify(focusAreas)
    });
    
    // Create watch history
    const numWatched = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numWatched; i++) {
      const concept = studentConcepts[i % studentConcepts.length];
      const duration = Math.floor(Math.random() * 1800) + 600;
      const watchTime = Math.floor(duration * (Math.random() * 0.5 + 0.3));
      
      watchHistory.push({
        student_id: student.id,
        video_id: `video_${concept.toLowerCase().replace(/\s+/g, '_')}_${i}`,
        watch_time: watchTime,
        completed: watchTime >= duration * 0.9 ? 1 : 0,
        timestamp: Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000
      });
    }
  }
  
  const { data: recData, error: recError } = await supabase
    .from('video_recommendations')
    .insert(recommendations)
    .select();
  
  if (recError) {
    console.error('❌ Error seeding video recommendations:', recError);
  } else {
    console.log(`✅ Created ${recData?.length || 0} video recommendations`);
  }
  
  const { data: histData, error: histError } = await supabase
    .from('video_watch_history')
    .insert(watchHistory)
    .select();
  
  if (histError) {
    console.error('❌ Error seeding watch history:', histError);
  } else {
    console.log(`✅ Created ${histData?.length || 0} watch history entries`);
  }
  
  return { recommendations: recData || [], history: histData || [] };
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seedSupabase() {
  try {
    console.log('🌱 Starting Supabase database seeding...\n');
    
    // Clear existing data
    await clearExistingData();
    
    // Seed data
    const students = await seedStudents();
    const staff = await seedStaff();
    await seedQuizResults(students);
    await seedEmotionalStates(students);
    await seedLearningAnalytics(students);
    await seedVideoRecommendations(students);
    
    // Summary
    console.log('\n📈 Database Seeding Summary:');
    console.log('================================');
    
    const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const { count: staffCount } = await supabase.from('staff').select('*', { count: 'exact', head: true });
    const { count: quizCount } = await supabase.from('quiz_results').select('*', { count: 'exact', head: true });
    const { count: emotionCount } = await supabase.from('emotional_states').select('*', { count: 'exact', head: true });
    const { count: analyticsCount } = await supabase.from('learning_analytics_reports').select('*', { count: 'exact', head: true });
    const { count: videoCount } = await supabase.from('video_recommendations').select('*', { count: 'exact', head: true });
    const { count: watchCount } = await supabase.from('video_watch_history').select('*', { count: 'exact', head: true });
    
    console.log(`Students: ${studentCount || 0}`);
    console.log(`Staff: ${staffCount || 0}`);
    console.log(`Quiz Results: ${quizCount || 0}`);
    console.log(`Emotional States: ${emotionCount || 0}`);
    console.log(`Learning Analytics: ${analyticsCount || 0}`);
    console.log(`Video Recommendations: ${videoCount || 0}`);
    console.log(`Watch History: ${watchCount || 0}`);
    console.log('================================\n');
    
    console.log('✅ Supabase database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Student: alice.johnson@example.com / password123');
    console.log('Admin: admin@example.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

// Run seeding
if (require.main === module) {
  seedSupabase()
    .then(() => {
      console.log('\n✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

export default seedSupabase;
