import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get existing face descriptor for a student
 * Used as fallback when face enrollment has issues
 */
export async function getStudentFaceDescriptor(req: Request, res: Response) {
  try {
    const { id, email } = req.query;

    if (!id && !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student ID or email is required' 
      });
    }

    let query = supabase
      .from('students')
      .select('id, name, email, face_descriptor');

    if (id) {
      query = query.eq('id', id);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching student face descriptor:', error);
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }

    if (!data.face_descriptor) {
      return res.status(404).json({ 
        success: false, 
        error: 'No face descriptor found for this student' 
      });
    }

    return res.json({
      success: true,
      id: data.id,
      name: data.name,
      email: data.email,
      face_descriptor: data.face_descriptor
    });

  } catch (error) {
    console.error('Error in getStudentFaceDescriptor:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

/**
 * Verify face against stored descriptor
 * Returns match confidence score
 */
export async function verifyFaceMatch(req: Request, res: Response) {
  try {
    const { studentId, currentDescriptor } = req.body;

    if (!studentId || !currentDescriptor) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student ID and current descriptor are required' 
      });
    }

    // Fetch stored descriptor
    const { data, error } = await supabase
      .from('students')
      .select('face_descriptor')
      .eq('id', studentId)
      .single();

    if (error || !data?.face_descriptor) {
      return res.status(404).json({ 
        success: false, 
        error: 'No stored face descriptor found' 
      });
    }

    // Calculate similarity (this is a simple implementation)
    // In production, you'd use face-api.js euclidean distance
    const storedDesc = data.face_descriptor.split(',').map(Number);
    const currentDesc = currentDescriptor.split(',').map(Number);

    if (storedDesc.length !== currentDesc.length) {
      return res.status(400).json({ 
        success: false, 
        error: 'Descriptor length mismatch' 
      });
    }

    // Calculate Euclidean distance
    let sumSquaredDiff = 0;
    for (let i = 0; i < storedDesc.length; i++) {
      const diff = storedDesc[i] - currentDesc[i];
      sumSquaredDiff += diff * diff;
    }
    const distance = Math.sqrt(sumSquaredDiff);

    // Convert distance to confidence score (0-100)
    // Lower distance = higher confidence
    const confidence = Math.max(0, Math.min(100, (1 - distance / 2) * 100));
    const isMatch = distance < 0.6; // Threshold for face match

    return res.json({
      success: true,
      isMatch,
      confidence: Math.round(confidence),
      distance: distance.toFixed(4)
    });

  } catch (error) {
    console.error('Error in verifyFaceMatch:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

/**
 * Update face descriptor for a student
 * Used when re-enrolling or updating face data
 */
export async function updateFaceDescriptor(req: Request, res: Response) {
  try {
    const { studentId, faceDescriptor } = req.body;

    if (!studentId || !faceDescriptor) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student ID and face descriptor are required' 
      });
    }

    const { data, error } = await supabase
      .from('students')
      .update({ face_descriptor: faceDescriptor })
      .eq('id', studentId)
      .select();

    if (error) {
      console.error('Error updating face descriptor:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update face descriptor' 
      });
    }

    return res.json({
      success: true,
      message: 'Face descriptor updated successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('Error in updateFaceDescriptor:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
