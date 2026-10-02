import { Router } from 'express';
import { StudentController } from '../controllers/studentController.js';
import { StudentPortalController } from '../controllers/studentPortalController.js';
import { authenticate, requireTeacher, requireStudent } from '../middlewares/authMiddleware.js';

const router = Router();

// Student Portal endpoints
router.get('/dashboard', authenticate, StudentPortalController.getDashboard);
router.get('/courses/:id/roadmap', authenticate, StudentPortalController.getCourseRoadmap);

// Teacher student management
router.get('/', authenticate, requireTeacher, StudentController.getAll);
router.post('/', authenticate, requireTeacher, StudentController.createStudent);
router.get('/:id', authenticate, requireTeacher, StudentController.getById);
router.patch('/:id/toggle-status', authenticate, requireTeacher, StudentController.toggleStatus);
router.patch('/:id/toggle-visibility', authenticate, requireTeacher, StudentController.togglePublicVisibility);
router.post('/:id/drop', authenticate, requireTeacher, StudentController.dropStudent);
router.post('/:id/send-warning', authenticate, requireTeacher, StudentController.sendAttendanceWarning);
router.put('/:id', authenticate, requireTeacher, StudentController.updateStudent);

export default router;
