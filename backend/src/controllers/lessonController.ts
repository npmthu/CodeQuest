import { Request, Response } from "express";
import * as lessonService from "../services/lessonService";
import {
  mapLessonToDTO,
  mapLessonWithProgressToDTO,
} from "../mappers/lesson.mapper";

export async function listLessonsHandler(req: Request, res: Response) {
  try {
    const { topicId, published } = req.query;
    const publishedOnly = published !== "false";

    const lessons = await lessonService.listLessons(
      topicId as string | undefined,
      publishedOnly
    );

    // If user is authenticated, fetch their progress for these lessons
    const user = (req as any).user;
    if (user && lessons.length > 0) {
      const lessonIds = lessons.map((l) => l.id);
      const progressMap = await lessonService.getUserLessonsProgress(
        user.id,
        lessonIds
      );

      const lessonsDTO = lessons.map((lesson) => {
        const progress = progressMap.get(lesson.id);
        return mapLessonWithProgressToDTO(lesson, progress || undefined);
      });
      return res.json({ success: true, data: lessonsDTO });
    }

    const lessonsDTO = lessons.map(mapLessonToDTO);
    return res.json({ success: true, data: lessonsDTO });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createLessonHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const body = req.body || {};
    const lesson = await lessonService.createLesson({
      topic_id: body.topicId || body.topic_id,
      title: body.title,
      content_markdown: body.content_markdown || body.content,
      difficulty: body.difficulty,
      estimated_time_min: body.estimatedTimeMin,
      course_id: body.courseId || body.course_id,
    });

    return res.status(201).json({ success: true, data: lesson });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function updateLessonHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const updated = await lessonService.updateLesson(
      req.params.id,
      req.body || {}
    );
    return res.json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function deleteLessonHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    await lessonService.deleteLesson(req.params.id);
    return res.json({ success: true, message: "Lesson deleted" });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function getLessonHandler(req: Request, res: Response) {
  try {
    const lesson = await lessonService.getLesson(req.params.id);

    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    // If user is authenticated, also fetch their progress
    const user = (req as any).user;
    let lessonDTO;
    if (user) {
      const progress = await lessonService.getUserLessonProgress(
        user.id,
        req.params.id
      );
      lessonDTO = mapLessonWithProgressToDTO(lesson, progress || undefined);
    } else {
      lessonDTO = mapLessonToDTO(lesson);
    }

    return res.json({
      success: true,
      data: lessonDTO,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateProgressHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { lessonId } = req.params;
    const { timeSpentSec, completed } = req.body;

    const progress = await lessonService.updateLessonProgress(
      user.id,
      lessonId,
      {
        time_spent_sec: timeSpentSec,
        completed_at: completed ? new Date().toISOString() : undefined,
      }
    );

    return res.json({
      success: true,
      data: progress,
      message: "Progress updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getUserProgressHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const summary = await lessonService.getUserProgressSummary(user.id);

    return res.json({ success: true, data: summary });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCurrentLessonHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { topicId } = req.query;
    const lesson = await lessonService.getCurrentLessonForUser(
      user.id,
      topicId as string | undefined
    );

    return res.json({ success: true, data: lesson || null });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
