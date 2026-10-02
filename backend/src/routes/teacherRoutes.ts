import { Router } from 'express';
import { TeacherController } from '../controllers/teacherController.js';
import { authenticate, requireTeacher } from '../middlewares/authMiddleware.js';

const router = Router();

// Dashboard Statistics (supports /dashboard, /dashboard-stats and /dashboard/stats)
router.get('/dashboard', authenticate, requireTeacher, TeacherController.getDashboardStats);
router.get('/dashboard-stats', authenticate, requireTeacher, TeacherController.getDashboardStats);
router.get('/dashboard/stats', authenticate, requireTeacher, TeacherController.getDashboardStats);

// Analytics
router.get('/analytics', authenticate, requireTeacher, TeacherController.getAnalytics);

// Activity Logs
router.get('/activities', authenticate, requireTeacher, TeacherController.getActivities);

// Class Settings
router.get('/class-settings', authenticate, requireTeacher, TeacherController.getClassSettings);
router.put('/class-settings', authenticate, requireTeacher, TeacherController.updateClassSettings);

// Global Search across courses, lessons, topics, assignments, students
router.get('/search', authenticate, TeacherController.globalSearch);

export default router;
