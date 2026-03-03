/**
 * Video Upload API
 * Handles video file uploads, storage, and streaming
 */

import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow video files
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-flv',
    'video/webm',
    'video/x-matroska'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'));
  }
};

// Configure multer
export const videoUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  }
});

/**
 * Upload video file
 * POST /api/videos/upload
 */
export async function uploadVideo(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file uploaded'
      });
    }

    const videoUrl = `/api/videos/stream/${req.file.filename}`;
    const thumbnailUrl = `/api/videos/thumbnail/${req.file.filename}`;

    res.json({
      success: true,
      video: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        videoUrl,
        thumbnailUrl,
        path: req.file.path
      },
      message: 'Video uploaded successfully'
    });
  } catch (error: any) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload video'
    });
  }
}

/**
 * Stream video file
 * GET /api/videos/stream/:filename
 */
export async function streamVideo(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    const videoPath = path.join(process.cwd(), 'uploads', 'videos', filename);

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // No range, send entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error: any) {
    console.error('Video streaming error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to stream video'
    });
  }
}

/**
 * Generate and serve video thumbnail
 * GET /api/videos/thumbnail/:filename
 */
export async function getVideoThumbnail(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    const videoPath = path.join(process.cwd(), 'uploads', 'videos', filename);
    const thumbnailPath = path.join(process.cwd(), 'uploads', 'thumbnails', `${filename}.jpg`);

    // Check if thumbnail already exists
    if (fs.existsSync(thumbnailPath)) {
      return res.sendFile(thumbnailPath);
    }

    // Check if video exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // For now, return a placeholder
    // In production, you would use ffmpeg to generate thumbnail
    res.json({
      success: true,
      message: 'Thumbnail generation not implemented. Use ffmpeg in production.',
      placeholder: '/placeholder-video-thumbnail.jpg'
    });
  } catch (error: any) {
    console.error('Thumbnail generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate thumbnail'
    });
  }
}

/**
 * Delete video file
 * DELETE /api/videos/:filename
 */
export async function deleteVideo(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    const videoPath = path.join(process.cwd(), 'uploads', 'videos', filename);
    const thumbnailPath = path.join(process.cwd(), 'uploads', 'thumbnails', `${filename}.jpg`);

    // Delete video file
    if (fs.existsSync(videoPath)) {
      await unlinkAsync(videoPath);
    }

    // Delete thumbnail if exists
    if (fs.existsSync(thumbnailPath)) {
      await unlinkAsync(thumbnailPath);
    }

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error: any) {
    console.error('Video deletion error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete video'
    });
  }
}

/**
 * Get all uploaded videos
 * GET /api/videos/list
 */
export async function listVideos(req: Request, res: Response) {
  try {
    const videosDir = path.join(process.cwd(), 'uploads', 'videos');

    if (!fs.existsSync(videosDir)) {
      return res.json({
        success: true,
        videos: [],
        total: 0
      });
    }

    const files = fs.readdirSync(videosDir);
    const videos = files.map(filename => {
      const filePath = path.join(videosDir, filename);
      const stat = fs.statSync(filePath);
      
      return {
        filename,
        size: stat.size,
        uploadedAt: stat.birthtime,
        videoUrl: `/api/videos/stream/${filename}`,
        thumbnailUrl: `/api/videos/thumbnail/${filename}`
      };
    });

    res.json({
      success: true,
      videos,
      total: videos.length
    });
  } catch (error: any) {
    console.error('List videos error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list videos'
    });
  }
}

/**
 * Get video metadata
 * GET /api/videos/metadata/:filename
 */
export async function getVideoMetadata(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    const videoPath = path.join(process.cwd(), 'uploads', 'videos', filename);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    const stat = fs.statSync(videoPath);
    
    res.json({
      success: true,
      metadata: {
        filename,
        size: stat.size,
        sizeFormatted: formatBytes(stat.size),
        uploadedAt: stat.birthtime,
        modifiedAt: stat.mtime,
        videoUrl: `/api/videos/stream/${filename}`,
        thumbnailUrl: `/api/videos/thumbnail/${filename}`
      }
    });
  } catch (error: any) {
    console.error('Get metadata error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get video metadata'
    });
  }
}

/**
 * Helper function to format bytes
 */
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Middleware to handle multer errors
 */
export function handleMulterError(err: any, req: Request, res: Response, next: any) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 500MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next();
}
