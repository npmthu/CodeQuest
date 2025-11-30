import { Request, Response } from 'express';
import * as lessonService from '../services/lessonService';

export async function listLessonsHandler(req: Request, res: Response) {
  try {
    const { topicId, published } = req.query;
    const publishedOnly = published !== 'false';

    const lessons = await lessonService.listLessons(
      topicId as string | undefined,
      publishedOnly
    );

    return res.json({ success: true, data: lessons });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getLessonHandler(req: Request, res: Response) {
  try {
    const lesson = await lessonService.getLesson(req.params.id);

    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    // If user is authenticated, also fetch their progress
    const user = (req as any).user;
    let progress = null;
    if (user) {
      progress = await lessonService.getUserLessonProgress(user.id, req.params.id);
    }

    return res.json({ 
      success: true, 
      data: { lesson, progress } 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateProgressHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { lessonId } = req.params;
    const { isCompleted, progressPercentage } = req.body;

    const progress = await lessonService.updateLessonProgress(user.id, lessonId, {
      is_completed: isCompleted,
      progress_percentage: progressPercentage,
      last_accessed_at: new Date().toISOString()
    });

    return res.json({ 
      success: true, 
      data: progress,
      message: 'Progress updated successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getUserProgressHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const summary = await lessonService.getUserProgressSummary(user.id);

    return res.json({ success: true, data: summary });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
