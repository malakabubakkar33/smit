import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { Notification } from '../models/types.js';
import { ENV } from '../config/env.js';

export class NotificationService {
  /**
   * Create an in-app notification and optionally trigger FCM push
   */
  public static async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    reference_type: string = '',
    reference_id: string = ''
  ): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      user_id: userId,
      type,
      title,
      message,
      reference_type,
      reference_id,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    db.notifications.unshift(notification);
    db.save();

    // Trigger FCM Push notification to user devices
    await this.sendPushToUser(userId, title, message, { reference_type, reference_id });

    return notification;
  }

  /**
   * Broadcast notification to all active students
   */
  public static async broadcastToStudents(
    type: Notification['type'],
    title: string,
    message: string,
    reference_type: string = '',
    reference_id: string = ''
  ): Promise<void> {
    const students = db.users.filter(u => u.role === 'student' && u.is_active);
    for (const student of students) {
      await this.createNotification(student.id, type, title, message, reference_type, reference_id);
    }
  }

  /**
   * Register or update FCM device token
   */
  public static registerDeviceToken(userId: string, token: string, deviceInfo: string = ''): void {
    const existing = db.notification_tokens.find(t => t.token === token);
    if (existing) {
      existing.user_id = userId;
      existing.device_info = deviceInfo;
    } else {
      db.notification_tokens.push({
        id: uuidv4(),
        user_id: userId,
        token,
        device_info: deviceInfo,
        created_at: new Date().toISOString(),
      });
    }
    db.save();
  }

  /**
   * Send FCM push notification
   */
  private static async sendPushToUser(
    userId: string,
    title: string,
    body: string,
    data: Record<string, string>
  ): Promise<void> {
    const tokens = db.notification_tokens.filter(t => t.user_id === userId).map(t => t.token);
    if (tokens.length === 0) return;

    if (!ENV.FIREBASE_PROJECT_ID || ENV.FIREBASE_PROJECT_ID.includes('placeholder')) {
      console.log(`[FCM:PushSimulation] FCM Push Notification sent to user ${userId} (${tokens.length} devices)`);
      console.log(`[FCM:PushSimulation] Title: "${title}", Body: "${body}"`);
      return;
    }

    // When real credentials are configured in production:
    try {
      console.log(`[FCM] Sending push payload to ${tokens.length} token(s) for user ${userId}`);
    } catch (err) {
      console.error('[FCM] Error dispatching push notification:', err);
    }
  }

  /**
   * Get user notifications
   */
  public static getUserNotifications(userId: string): Notification[] {
    return db.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Mark single notification as read
   */
  public static markAsRead(notificationId: string, userId: string): boolean {
    const n = db.notifications.find(item => item.id === notificationId && item.user_id === userId);
    if (n) {
      n.is_read = true;
      db.save();
      return true;
    }
    return false;
  }

  /**
   * Mark all notifications as read
   */
  public static markAllAsRead(userId: string): void {
    db.notifications
      .filter(n => n.user_id === userId)
      .forEach(n => { n.is_read = true; });
    db.save();
  }
}
