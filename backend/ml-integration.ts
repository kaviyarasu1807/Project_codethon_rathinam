/**
 * ML Model Integration for NeuroPath
 * Connects Express.js backend with Python ML API
 */

import axios from 'axios';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

interface StudentMLData {
  student_id?: number;
  avg_quiz_score: number;
  assignment_completion_rate: number;
  avg_session_time: number;
  mistakes_per_topic: number;
  revision_frequency: number;
  attention_score: number;
  confidence_score: number;
  stress_index: number;
}

interface CognitiveTwinPrediction {
  student_id: number | null;
  predicted_category: 'Strong' | 'Moderate' | 'Weak';
  confidence_probability: number;
  probabilities: {
    weak: number;
    moderate: number;
    strong: number;
  };
  risk_level: 'Low' | 'Medium' | 'High';
  key_weakness_factors: string[];
  detailed_weaknesses: string[];
  recommended_actions: string[];
  feature_contributions: Record<string, number>;
  timestamp: string;
}

/**
 * Get ML prediction for a single student
 */
export async function predictStudentCategory(
  studentData: StudentMLData
): Promise<CognitiveTwinPrediction> {
  try {
    const response = await axios.post(`${ML_API_URL}/api/ml/predict`, studentData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.prediction;
    } else {
      throw new Error(response.data.error || 'ML prediction failed');
    }
  } catch (error: any) {
    console.error('ML API Error:', error.message);
    throw new Error(`ML prediction failed: ${error.message}`);
  }
}

/**
 * Get ML predictions for multiple students
 */
export async function batchPredictStudents(
  students: StudentMLData[]
): Promise<CognitiveTwinPrediction[]> {
  try {
    const response = await axios.post(
      `${ML_API_URL}/api/ml/batch-predict`,
      { students },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      return response.data.predictions;
    } else {
      throw new Error(response.data.error || 'Batch prediction failed');
    }
  } catch (error: any) {
    console.error('ML API Error:', error.message);
    throw new Error(`Batch prediction failed: ${error.message}`);
  }
}

/**
 * Get model information and metrics
 */
export async function getModelInfo() {
  try {
    const response = await axios.get(`${ML_API_URL}/api/ml/model-info`, {
      timeout: 5000
    });

    if (response.data.success) {
      return response.data.info;
    } else {
      throw new Error(response.data.error || 'Failed to get model info');
    }
  } catch (error: any) {
    console.error('ML API Error:', error.message);
    throw new Error(`Failed to get model info: ${error.message}`);
  }
}

/**
 * Get feature importance rankings
 */
export async function getFeatureImportance() {
  try {
    const response = await axios.get(`${ML_API_URL}/api/ml/feature-importance`, {
      timeout: 5000
    });

    if (response.data.success) {
      return response.data.feature_importance;
    } else {
      throw new Error(response.data.error || 'Failed to get feature importance');
    }
  } catch (error: any) {
    console.error('ML API Error:', error.message);
    throw new Error(`Failed to get feature importance: ${error.message}`);
  }
}

/**
 * Check if ML API is healthy
 */
export async function checkMLHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${ML_API_URL}/health`, {
      timeout: 3000
    });
    return response.data.status === 'healthy' && response.data.model_loaded;
  } catch (error) {
    console.error('ML API health check failed');
    return false;
  }
}

/**
 * Prepare student data from database for ML prediction
 */
export function prepareStudentDataForML(studentData: any): StudentMLData {
  return {
    student_id: studentData.student_id || studentData._id,
    avg_quiz_score: studentData.avg_quiz_score || 0,
    assignment_completion_rate: studentData.assignment_completion_rate || 0,
    avg_session_time: studentData.avg_session_time || 0,
    mistakes_per_topic: studentData.mistakes_per_topic || 0,
    revision_frequency: studentData.revision_frequency || 0,
    attention_score: studentData.attention_score || 0.5,
    confidence_score: studentData.confidence_score || 0.5,
    stress_index: studentData.stress_index || 0.5
  };
}

/**
 * Calculate ML features from quiz and analytics data
 */
export function calculateMLFeatures(quizResults: any[], emotionalStates: any[], masteryData: any[]) {
  // Calculate average quiz score
  const avg_quiz_score = quizResults.length > 0
    ? quizResults.reduce((sum, q) => sum + q.score, 0) / quizResults.length
    : 0;

  // Calculate assignment completion rate (based on quiz completion)
  const assignment_completion_rate = quizResults.length > 0
    ? (quizResults.filter(q => q.score !== null).length / quizResults.length) * 100
    : 0;

  // Calculate average session time
  const avg_session_time = quizResults.length > 0
    ? quizResults.reduce((sum, q) => sum + (q.total_time || 0), 0) / quizResults.length / 60
    : 0;

  // Calculate mistakes per topic
  const mistakes_per_topic = masteryData.length > 0
    ? masteryData.reduce((sum, m) => sum + (m.total_attempts - m.correct_attempts), 0) / masteryData.length
    : 0;

  // Calculate revision frequency
  const revision_frequency = masteryData.length > 0
    ? masteryData.reduce((sum, m) => sum + m.total_attempts, 0) / masteryData.length
    : 0;

  // Calculate attention score (from focus level)
  const attention_score = emotionalStates.length > 0
    ? emotionalStates.reduce((sum, e) => sum + (e.focus_level || 0.5), 0) / emotionalStates.length / 100
    : 0.5;

  // Calculate confidence score (inverse of stress)
  const confidence_score = emotionalStates.length > 0
    ? 1 - (emotionalStates.reduce((sum, e) => sum + (e.stress_level || 50), 0) / emotionalStates.length / 100)
    : 0.5;

  // Calculate stress index
  const stress_index = emotionalStates.length > 0
    ? emotionalStates.reduce((sum, e) => sum + (e.stress_level || 50), 0) / emotionalStates.length / 100
    : 0.5;

  return {
    avg_quiz_score,
    assignment_completion_rate,
    avg_session_time,
    mistakes_per_topic,
    revision_frequency,
    attention_score,
    confidence_score,
    stress_index
  };
}
