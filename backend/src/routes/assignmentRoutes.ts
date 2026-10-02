import { Router } from 'express';
import { AssignmentController } from '../controllers/assignmentController.js';
import { authenticate, requireTeacher, requireStudent } from '../middlewares/authMiddleware.js';
import { uploadAssignment } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Student & Teacher general view
router.get('/', authenticate, AssignmentController.getAssignments);
router.get('/:id', authenticate, AssignmentController.getById);

// Student assignment submission
router.post('/:id/submit', authenticate, requireStudent, uploadAssignment.single('file'), AssignmentController.submit);

// Teacher assignment administration
router.post('/', authenticate, requireTeacher, AssignmentController.create);
router.put('/:id', authenticate, requireTeacher, AssignmentController.update);
router.delete('/:id', authenticate, requireTeacher, AssignmentController.delete);
router.get('/:id/submissions', authenticate, requireTeacher, AssignmentController.getSubmissions);
router.post('/:id/grade', authenticate, requireTeacher, AssignmentController.gradeSubmission);

export default router;
