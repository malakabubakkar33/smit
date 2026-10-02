import { Router } from 'express';
import { TopicController } from '../controllers/topicController.js';
import { authenticate, requireTeacher } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/course/:courseId', authenticate, TopicController.getByCourse);
router.post('/', authenticate, requireTeacher, TopicController.create);
router.put('/:id', authenticate, requireTeacher, TopicController.update);
router.delete('/:id', authenticate, requireTeacher, TopicController.delete);

export default router;
