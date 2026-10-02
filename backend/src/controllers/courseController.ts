import { Response, NextFunction } from 'express';
import { CourseService } from '../services/courseService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export class CourseController {
  public static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user?.role === 'student' ? req.user.userId : undefined;
      const courses = CourseService.getAllCourses(studentId);
      res.json({
        success: true,
        data: courses,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = String(Array.isArray(rawId) ? rawId[0] : rawId);
      const studentId = req.user?.role === 'student' ? req.user.userId : undefined;
      const details = CourseService.getCourseDetails(id, studentId);
      res.json({
        success: true,
        data: details,
      });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message || 'Course not found' });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        res.status(403).json({ success: false, message: 'Teacher access required' });
        return;
      }
      const course = CourseService.createCourse(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course,
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
      const updated = CourseService.updateCourse(id, req.body);
      res.json({
        success: true,
        message: 'Course updated successfully',
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
      CourseService.deleteCourse(id);
      res.json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
