import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export class NotificationController {
  public static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const notifications = NotificationService.getUserNotifications(req.user.userId);
      const unreadCount = notifications.filter(n => !n.is_read).length;
      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const rawId = req.params.id;
      const id = String(Array.isArray(rawId) ? rawId[0] : rawId);
      NotificationService.markAsRead(id, req.user.userId);
      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      NotificationService.markAllAsRead(req.user.userId);
      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async registerFCMToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { token, deviceInfo } = req.body;
      if (!token) {
        res.status(400).json({ success: false, message: 'FCM Token is required' });
        return;
      }
      NotificationService.registerDeviceToken(req.user.userId, token, deviceInfo || '');
      res.json({
        success: true,
        message: 'Push notification device token registered successfully',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
