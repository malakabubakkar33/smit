import { Router } from 'express';
import { CourseController } from '../controllers/courseController.js';
import { authenticate, requireTeacher } from '../middlewares/authMiddleware.js';

const router = Router();

// Public / Authenticated read
router.get('/', authenticate, CourseController.getAll);
router.get('/:id', authenticate, CourseController.getById);

// Teacher CRUD
router.post('/', authenticate, requireTeacher, CourseController.create);
router.put('/:id', authenticate, requireTeacher, CourseController.update);
router.delete('/:id', authenticate, requireTeacher, CourseController.delete);

export default router;
