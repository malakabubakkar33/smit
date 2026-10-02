import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController.js';
import { authenticate, requireTeacher } from '../middlewares/authMiddleware.js';

const router = Router();

// Live Attendance Session endpoints (Interactive Teacher Request & Student Check-In)
router.post('/session/start', authenticate, requireTeacher, AttendanceController.startSession);
router.get('/session/active', authenticate, AttendanceController.getActiveSession);
router.post('/session/accept', authenticate, AttendanceController.acceptSession);
router.post('/session/approve-student', authenticate, requireTeacher, AttendanceController.approveStudent);
router.post('/session/approve-all', authenticate, requireTeacher, AttendanceController.approveAll);
router.post('/session/close', authenticate, requireTeacher, AttendanceController.closeSession);

// Student personal attendance summary (strictly read-only for student)
router.get('/student/summary', authenticate, AttendanceController.getStudentSummary);
router.get('/student/:studentId', authenticate, AttendanceController.getStudentSummary);

// Teacher attendance operations
router.get('/history', authenticate, requireTeacher, AttendanceController.getHistory);
router.get('/date', authenticate, requireTeacher, AttendanceController.getByDate);
router.post('/save', authenticate, requireTeacher, AttendanceController.saveAttendance);

export default router;
