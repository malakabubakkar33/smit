import { Response, NextFunction } from 'express';
import { TopicService } from '../services/topicService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export class TopicController {
  public static async getByCourse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawCourseId = req.params.courseId;
      const courseId = String(Array.isArray(rawCourseId) ? rawCourseId[0] : rawCourseId);
      const topics = TopicService.getTopicsByCourse(courseId);
      res.json({
        success: true,
        data: topics,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        res.status(403).json({ success: false, message: 'Teacher access required' });
        return;
      }
      const { courseId, title, description } = req.body;
      if (!courseId || !title) {
        res.status(400).json({ success: false, message: 'courseId and title are required' });
        return;
      }
      const topic = TopicService.createTopic(courseId, title, description);
      res.status(201).json({
        success: true,
        message: 'Topic created successfully',
        data: topic,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        res.status(403).json({ success: false, message: 'Teacher access required' });
        return;
      }
      const rawId = req.params.id;
      const id = String(Array.isArray(rawId) ? rawId[0] : rawId);
      const { title, description } = req.body;
      const updated = TopicService.updateTopic(id, title, description);
      res.json({
        success: true,
        message: 'Topic updated successfully',
        data: updated,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        res.status(403).json({ success: false, message: 'Teacher access required' });
        return;
      }
      const rawId = req.params.id;
      const id = String(Array.isArray(rawId) ? rawId[0] : rawId);
      TopicService.deleteTopic(id);
      res.json({
        success: true,
        message: 'Topic deleted successfully',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
