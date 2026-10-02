import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';

export class PublicController {
  /**
   * GET /api/public/stats
   * Dynamic classroom metrics
   */
  public static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const totalStudents = db.users.filter(u => u.role === 'student' && u.is_active).length;
      const totalCourses = db.courses.filter(c => c.is_published).length;
      const totalTopics = db.topics.length;
      const totalVideos = db.videos.length;

      res.json({
        success: true,
        data: {
          totalStudents,
          totalCourses,
          totalTopics,
          totalVideos,
          classDays: 'Monday & Thursday',
          classTiming: '6:00 PM - 8:30 PM',
          cohortName: 'SMIT Web Development Batch',
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch class statistics' });
    }
  }

  /**
   * GET /api/public/courses
   * Published courses catalog for public website
   */
  public static async getCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = db.courses
        .filter(c => c.is_published)
        .map(c => {
          const topics = db.topics.filter(t => t.course_id === c.id);
          const videos = db.videos.filter(v => v.course_id === c.id);
          return {
            id: c.id,
            title: c.title,
            slug: c.slug,
            description: c.description,
            thumbnail_url: c.thumbnail_url,
            level: c.level,
            topicsCount: topics.length,
            videosCount: videos.length,
            created_at: c.created_at,
          };
        });

      res.json({
        success: true,
        data: courses,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch public courses' });
    }
  }

  /**
   * GET /api/public/courses/:id
   * Single course with public syllabus (topics & lesson titles)
   */
  public static async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = String(Array.isArray(rawId) ? rawId[0] : rawId);

      const course = db.courses.find(c => (c.id === id || c.slug === id) && c.is_published);
      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found or is currently unpublished' });
        return;
      }

      const topics = db.topics
        .filter(t => t.course_id === course.id)
        .sort((a, b) => a.order_index - b.order_index)
        .map((t, idx) => {
          const lessons = db.videos
            .filter(v => v.topic_id === t.id)
            .sort((a, b) => a.order_index - b.order_index)
            .map((v, vIdx) => ({
              id: v.id,
              orderIndex: vIdx + 1,
              title: v.title,
              duration: v.duration,
              requiresAuth: true,
            }));

          return {
            id: t.id,
            orderIndex: idx + 1,
            order_index: idx + 1,
            title: t.title,
            description: t.description,
            lessonsCount: lessons.length,
            videoCount: lessons.length,
            lessons: lessons.map(l => ({
              id: l.id,
              title: l.title,
              duration_seconds: l.duration || 0,
              requiresAuth: true,
            })),
          };
        });

      const totalVideos = db.videos.filter(v => v.course_id === course.id).length;

      res.json({
        success: true,
        data: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          thumbnail_url: course.thumbnail_url,
          level: course.level,
          created_at: course.created_at,
          course: {
            id: course.id,
            title: course.title,
            slug: course.slug,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            level: course.level,
            created_at: course.created_at,
          },
          topics,
          totalTopics: topics.length,
          totalVideos,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch course details' });
    }
  }

  /**
   * GET /api/public/students
   * Real student directory from database (privacy safe: only public fields)
   */
  public static async getStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeStudentUsers = db.users.filter(u => u.role === 'student' && u.is_active);
      const activeIds = new Set(activeStudentUsers.map(u => u.id));

      const students = db.student_profiles
        .filter(p => activeIds.has(p.user_id) && p.show_on_public_directory !== false)
        .map(p => {
          const user = activeStudentUsers.find(u => u.id === p.user_id);
          return {
            id: p.id,
            fullName: p.full_name,
            username: p.username,
            rollNumber: p.roll_number,
            avatarUrl: p.avatar_url,
            joinedDate: user?.created_at || p.created_at,
          };
        })
        .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));

      res.json({
        success: true,
        data: students,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch students directory' });
    }
  }

  /**
   * GET /api/public/teacher
   * Dynamically fetch teacher/instructor profile from database
   */
  public static async getTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherProfile = db.teacher_profiles[0] || {
        full_name: 'Lead Instructor',
        username: 'instructor',
        avatar_url: '',
        bio: 'Lead Full-Stack Web Development Architect & Instructor with 12+ years of production experience.',
      };

      res.json({
        success: true,
        data: {
          fullName: teacherProfile.full_name,
          username: teacherProfile.username,
          avatarUrl: teacherProfile.avatar_url,
          bio: teacherProfile.bio,
          role: 'Lead Instructor & Admin',
          institution: 'SMIT Web Development Class',
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch teacher profile' });
    }
  }
}
