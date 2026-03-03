/**
 * Quick Database Seeding Script
 * Creates minimal test data for immediate testing
 * 
 * Usage: npx ts-node scripts/quick-seed.ts
 */

import mongoose from 'mongoose';
import { connectMongoDB, Student, QuizResult, EmotionalState } from '../backend/mongodb';

async function quickSeed() {
  try {
    console.log('🚀 Quick Seed - Creating minimal test data...\n');
    
    await connectMongoDB();
    
    // Clear existing data
    await Student.deleteMany({});
    await QuizResult.deleteMany({});
    await EmotionalState.deleteMany({});
    
    // Create 3 students
    const students = await Student.insertMany([
      {
        name: 'Test Student',
        email: 'student@test.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        role: 'student',
        domain: 'Computer Science',
        department: 'Software Engineering',
        mobile_number: '+1 555-0100',
        address: '123 Test St, Boston, MA 02101',
        college_name: 'Test University'
      },
      {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        role: 'admin',
        domain: 'Administration',
        department: 'Academic Affairs',
        mobile_number: '+1 555-0200',
        address: '456 Admin Ave, Boston, MA 02102',
        college_name: 'Test University'
      },
      {
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        role: 'student',
        domain: 'Engineering',
        department: 'Mechanical',
        mobile_number: '+1 555-0300',
        address: '789 Student Ln, Boston, MA 02103',
        college_name: 'Test University'
      }
    ]);
    
    console.log(`✅ Created ${students.length} users`);
    
    // Create quiz results for students
    const studentUsers = students.filter(s => s.role === 'student');
    const quizResults = await QuizResult.insertMany(
      studentUsers.map(student => ({
        student_id: student._id,
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        level: 'Intermediate',
        missed_concepts: ['Algorithms', 'Data Structures'],
        critical_concepts: ['Binary Trees'],
        critical_questions: ['Question about tree traversal'],
        ai_guidance: 'Focus on practicing tree algorithms daily.',
        total_time: 1200,
        avg_question_time: 60,
        question_times: [45, 60, 75, 50, 65, 70, 55, 60, 80, 50, 65, 55],
        typing_speed: 45,
        tab_switch_count: 2,
        voice_detected: 0,
        avg_focus_level: 75,
        avg_stress_level: 45,
        avg_happiness_level: 70,
        timestamp: new Date()
      }))
    );
    
    console.log(`✅ Created ${quizResults.length} quiz results`);
    
    // Create emotional states
    const emotionalStates = [];
    for (const student of studentUsers) {
      for (let i = 0; i < 5; i++) {
        emotionalStates.push({
          student_id: student._id,
          stress_level: Math.floor(Math.random() * 40) + 30,
          happiness_level: Math.floor(Math.random() * 30) + 60,
          focus_level: Math.floor(Math.random() * 30) + 60,
          typing_speed: Math.floor(Math.random() * 30) + 30,
          voice_detected: false,
          tab_switch_count: Math.floor(Math.random() * 3),
          timestamp: new Date(Date.now() - i * 60000) // Every minute
        });
      }
    }
    
    await EmotionalState.insertMany(emotionalStates);
    console.log(`✅ Created ${emotionalStates.length} emotional states`);
    
    console.log('\n✅ Quick seed completed!');
    console.log('\n📝 Test Credentials:');
    console.log('Student: student@test.com / password123');
    console.log('Admin: admin@test.com / password123');
    console.log('Student 2: jane@test.com / password123');
    
  } catch (error) {
    console.error('❌ Quick seed error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  quickSeed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default quickSeed;
