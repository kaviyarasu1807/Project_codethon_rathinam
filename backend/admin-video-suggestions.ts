/**
 * Admin Video Suggestions System
 * Allows admins to add custom video recommendations for students
 */

import { Request, Response } from 'express';

// MongoDB models (if using MongoDB)
export interface AdminVideoSuggestion {
  id?: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  concepts: string[]; // Related concepts
  domain: string; // Engineering, Medical, etc.
  category: string; // Tutorial, Explanation, Practice, etc.
  tags: string[];
  created_by: string; // Admin ID
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  view_count: number;
  rating: number;
}

export interface VideoView {
  id?: string;
  student_id: string;
  video_id: string;
  watched_duration: number;
  completed: boolean;
  rating?: number;
  feedback?: string;
  timestamp: Date;
}

/**
 * Add new video suggestion (Admin only)
 */
export async function addVideoSuggestion(req: Request, res: Response, db: any) {
  try {
    const {
      title,
      description,
      video_url,
      thumbnail_url,
      duration,
      difficulty_level,
      concepts,
      domain,
      category,
      tags,
      created_by
    } = req.body;

    // Validate required fields
    if (!title || !description || !video_url || !difficulty_level || !domain) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, video_url, difficulty_level, domain'
      });
    }

    // For SQLite
    if (db.prepare) {
      const result = db.prepare(`
        INSERT INTO admin_video_suggestions (
          title, description, video_url, thumbnail_url, duration,
          difficulty_level, concepts, domain, category, tags,
          created_by, is_active, view_count, rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0)
      `).run(
        title,
        description,
        video_url,
        thumbnail_url || null,
        duration || null,
        difficulty_level,
        JSON.stringify(concepts || []),
        domain,
        category || 'Tutorial',
        JSON.stringify(tags || []),
        created_by
      );

      return res.json({
        success: true,
        videoId: result.lastInsertRowid,
        message: 'Video suggestion added successfully'
      });
    }

    // For MongoDB
    const AdminVideoSuggestionModel = db.model('AdminVideoSuggestion');
    const videoSuggestion = new AdminVideoSuggestionModel({
      title,
      description,
      video_url,
      thumbnail_url,
      duration,
      difficulty_level,
      concepts: concepts || [],
      domain,
      category: category || 'Tutorial',
      tags: tags || [],
      created_by,
      is_active: true,
      view_count: 0,
      rating: 0,
      created_at: new Date(),
      updated_at: new Date()
    });

    await videoSuggestion.save();

    return res.json({
      success: true,
      videoId: videoSuggestion._id,
      message: 'Video suggestion added successfully'
    });

  } catch (error) {
    console.error('Error adding video suggestion:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add video suggestion'
    });
  }
}

/**
 * Get all video suggestions (Admin)
 */
export async function getAllVideoSuggestions(req: Request, res: Response, db: any) {
  try {
    const { domain, difficulty_level, category, is_active } = req.query;

    // For SQLite
    if (db.prepare) {
      let query = 'SELECT * FROM admin_video_suggestions WHERE 1=1';
      const params: any[] = [];

      if (domain) {
        query += ' AND domain = ?';
        params.push(domain);
      }
      if (difficulty_level) {
        query += ' AND difficulty_level = ?';
        params.push(difficulty_level);
      }
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      if (is_active !== undefined) {
        query += ' AND is_active = ?';
        params.push(is_active === 'true' ? 1 : 0);
      }

      query += ' ORDER BY created_at DESC';

      const videos = db.prepare(query).all(...params);

      // Parse JSON fields
      const parsedVideos = videos.map((v: any) => ({
        ...v,
        concepts: JSON.parse(v.concepts || '[]'),
        tags: JSON.parse(v.tags || '[]')
      }));

      return res.json({
        success: true,
        videos: parsedVideos,
        total: parsedVideos.length
      });
    }

    // For MongoDB
    const AdminVideoSuggestionModel = db.model('AdminVideoSuggestion');
    const filter: any = {};

    if (domain) filter.domain = domain;
    if (difficulty_level) filter.difficulty_level = difficulty_level;
    if (category) filter.category = category;
    if (is_active !== undefined) filter.is_active = is_active === 'true';

    const videos = await AdminVideoSuggestionModel.find(filter)
      .sort({ created_at: -1 });

    return res.json({
      success: true,
      videos,
      total: videos.length
    });

  } catch (error) {
    console.error('Error fetching video suggestions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch video suggestions'
    });
  }
}

/**
 * Get video suggestions for a specific student
 * Based on their weak concepts, domain, and level
 */
export async function getStudentVideoSuggestions(req: Request, res: Response, db: any) {
  try {
    const { studentId } = req.params;

    // Get student info
    let student: any;
    if (db.prepare) {
      student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    } else {
      const StudentModel = db.model('Student');
      student = await StudentModel.findById(studentId);
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Get student's latest quiz result to find weak concepts
    let weakConcepts: string[] = [];
    let level = 'beginner';

    if (db.prepare) {
      const latestQuiz = db.prepare(`
        SELECT * FROM quiz_results 
        WHERE student_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `).get(studentId);

      if (latestQuiz) {
        weakConcepts = JSON.parse(latestQuiz.missed_concepts || '[]');
        level = latestQuiz.level?.toLowerCase() || 'beginner';
      }
    } else {
      const QuizResultModel = db.model('QuizResult');
      const latestQuiz = await QuizResultModel.findOne({ student_id: studentId })
        .sort({ timestamp: -1 });

      if (latestQuiz) {
        weakConcepts = latestQuiz.missed_concepts || [];
        level = latestQuiz.level?.toLowerCase() || 'beginner';
      }
    }

    // Get video suggestions matching student's needs
    let videos: any[] = [];

    if (db.prepare) {
      // Get videos for student's domain and level
      const allVideos = db.prepare(`
        SELECT * FROM admin_video_suggestions 
        WHERE domain = ? 
        AND difficulty_level = ? 
        AND is_active = 1
        ORDER BY rating DESC, view_count DESC
      `).all(student.domain, level);

      // Parse and filter by concepts
      videos = allVideos
        .map((v: any) => ({
          ...v,
          concepts: JSON.parse(v.concepts || '[]'),
          tags: JSON.parse(v.tags || '[]')
        }))
        .filter((v: any) => {
          // Prioritize videos that match weak concepts
          if (weakConcepts.length === 0) return true;
          return v.concepts.some((c: string) => weakConcepts.includes(c));
        })
        .slice(0, 10); // Limit to 10 videos

    } else {
      const AdminVideoSuggestionModel = db.model('AdminVideoSuggestion');
      
      const filter: any = {
        domain: student.domain,
        difficulty_level: level,
        is_active: true
      };

      // If student has weak concepts, prioritize those
      if (weakConcepts.length > 0) {
        filter.concepts = { $in: weakConcepts };
      }

      videos = await AdminVideoSuggestionModel.find(filter)
        .sort({ rating: -1, view_count: -1 })
        .limit(10);
    }

    return res.json({
      success: true,
      videos,
      student: {
        id: student.id || student._id,
        name: student.name,
        domain: student.domain,
        level
      },
      weakConcepts,
      total: videos.length
    });

  } catch (error) {
    console.error('Error fetching student video suggestions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch video suggestions'
    });
  }
}

/**
 * Update video suggestion (Admin)
 */
export async function updateVideoSuggestion(req: Request, res: Response, db: any) {
  try {
    const { videoId } = req.params;
    const updates = req.body;

    if (db.prepare) {
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(updates)) {
        if (key === 'concepts' || key === 'tags') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      values.push(videoId);

      db.prepare(`
        UPDATE admin_video_suggestions 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values);

      return res.json({
        success: true,
        message: 'Video suggestion updated successfully'
      });
    }

    // For MongoDB
    const AdminVideoSuggestionModel = db.model('AdminVideoSuggestion');
    updates.updated_at = new Date();
    
    await AdminVideoSuggestionModel.findByIdAndUpdate(videoId, updates);

    return res.json({
      success: true,
      message: 'Video suggestion updated successfully'
    });

  } catch (error) {
    console.error('Error updating video suggestion:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update video suggestion'
    });
  }
}

/**
 * Delete video suggestion (Admin)
 */
export async function deleteVideoSuggestion(req: Request, res: Response, db: any) {
  try {
    const { videoId } = req.params;

    if (db.prepare) {
      db.prepare('DELETE FROM admin_video_suggestions WHERE id = ?').run(videoId);
    } else {
      const AdminVideoSuggestionModel = db.model('AdminVideoSuggestion');
      await AdminVideoSuggestionModel.findByIdAndDelete(videoId);
    }

    return res.json({
      success: true,
      message: 'Video suggestion deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video suggestion:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete video suggestion'
    });
  }
}

/**
 * Track video view (Student)
 */
export async function trackVideoView(req: Request, res: Response, db: any) {
  try {
    const { studentId, videoId, watchedDuration, completed, rating, feedback } = req.body;

    if (db.prepare) {
      // Insert view record
      db.prepare(`
        INSERT INTO video_views (
          student_id, video_id, watched_duration, completed, rating, feedback
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(studentId, videoId, watchedDuration, completed ? 1 : 0, rating || null, feedback || null);

      // Update video view count
      db.prepare(`
        UPDATE admin_video_suggestions 
        SET view_count = view_count + 1 
        WHERE id = ?
      `).run(videoId);

      // Update rating if provided
      if (rating) {
        const video = db.prepare('SELECT rating, view_count FROM admin_video_suggestions WHERE id = ?').get(videoId);
        const newRating = ((video.rating * video.view_count) + rating) / (video.view_count + 1);
        db.prepare('UPDATE admin_video_suggestions SET rating = ? WHERE id = ?').run(newRating, videoId);
      }

    } else {
      const VideoViewModel = db.model('VideoView');
      const videoView = new VideoViewModel({
        student_id: studentId,
        video_id: videoId,
        watched_duration: watchedDuration,
        completed,
        rating,
        feedback,
        timestamp: new Date()
      });
      await videoView.save();

      // Update video stats
      const AdminVideoSuggestionModel = db.model('AdminVideoSuggestion');
      const video = await AdminVideoSuggestionModel.findById(videoId);
      
      if (video) {
        video.view_count += 1;
        if (rating) {
          video.rating = ((video.rating * video.view_count) + rating) / (video.view_count + 1);
        }
        await video.save();
      }
    }

    return res.json({
      success: true,
      message: 'Video view tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking video view:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to track video view'
    });
  }
}

/**
 * Get video analytics (Admin)
 */
export async function getVideoAnalytics(req: Request, res: Response, db: any) {
  try {
    const { videoId } = req.params;

    if (db.prepare) {
      const video = db.prepare('SELECT * FROM admin_video_suggestions WHERE id = ?').get(videoId);
      const views = db.prepare('SELECT * FROM video_views WHERE video_id = ?').all(videoId);
      
      const totalViews = views.length;
      const completedViews = views.filter((v: any) => v.completed).length;
      const avgWatchDuration = views.reduce((sum: number, v: any) => sum + v.watched_duration, 0) / totalViews || 0;
      const ratings = views.filter((v: any) => v.rating).map((v: any) => v.rating);
      const avgRating = ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length || 0;

      return res.json({
        success: true,
        analytics: {
          video,
          totalViews,
          completedViews,
          completionRate: totalViews > 0 ? (completedViews / totalViews) * 100 : 0,
          avgWatchDuration,
          avgRating,
          totalRatings: ratings.length
        }
      });
    }

    // For MongoDB
    const AdminVideoSuggestionModel = db.model('AdminVideoSuggestion');
    const VideoViewModel = db.model('VideoView');

    const video = await AdminVideoSuggestionModel.findById(videoId);
    const views = await VideoViewModel.find({ video_id: videoId });

    const totalViews = views.length;
    const completedViews = views.filter(v => v.completed).length;
    const avgWatchDuration = views.reduce((sum, v) => sum + v.watched_duration, 0) / totalViews || 0;
    const ratings = views.filter(v => v.rating).map(v => v.rating);
    const avgRating = ratings.reduce((sum, r) => sum + (r || 0), 0) / ratings.length || 0;

    return res.json({
      success: true,
      analytics: {
        video,
        totalViews,
        completedViews,
        completionRate: totalViews > 0 ? (completedViews / totalViews) * 100 : 0,
        avgWatchDuration,
        avgRating,
        totalRatings: ratings.length
      }
    });

  } catch (error) {
    console.error('Error fetching video analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch video analytics'
    });
  }
}
