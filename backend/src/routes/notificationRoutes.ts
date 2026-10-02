import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, NotificationController.getAll);
router.patch('/:id/read', authenticate, NotificationController.markRead);
router.post('/read-all', authenticate, NotificationController.markAllRead);
router.post('/fcm-token', authenticate, NotificationController.registerFCMToken);

export default router;
