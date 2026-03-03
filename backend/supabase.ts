import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database Types
export interface Student {
  id: number;
  name: string;
  email: string;
  password: string;
  domain: string;
  face_descriptor?: string;
  created_at?: string;
}

export interface Staff {
  id: number;
  name: string;
  email: string;
  password: string;
  department?: string;
  created_at?: string;
}

export interface QuizResult {
  id: number;
  student_id: number;
  score: number;
  level: string;
  missed_concepts?: string;
  critical_concepts?: string;
  critical_questions?: string;
  ai_guidance?: string;
  timestamp?: string;
}

export interface Recommendation {
  id: number;
  level: string;
  content: string;
}

export interface EmotionalState {
  id: number;
  student_id: number;
  stress_level: number;
  happiness_level: number;
  timestamp?: string;
}
