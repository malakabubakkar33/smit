import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { NotificationItem } from '../../types/index.js';
import {
  Bell,
  CheckCheck,
  Video,
  Calendar,
  Sparkles,
  ClipboardCheck,
  AlertCircle,
  BookOpen,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

export const StudentNotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {}
    }

    // Determine target link based on type or related entity
    const type = notif.type;
    const relatedId = notif.related_entity_id;

    if (type.includes('assignment')) {
      if (relatedId) navigate(`/student/assignments/${relatedId}`);
      else navigate('/student/assignments');
    } else if (type === 'video_uploaded') {
      if (relatedId) navigate(`/student/lessons/${relatedId}`);
      else navigate('/student/courses');
    } else if (type === 'attendance_marked') {
      navigate('/student/attendance');
    } else {
      navigate('/student/dashboard');
    }
  };

  const getNotifIcon = (type: string) => {
    if (type.includes('assignment')) {
      return <ClipboardCheck className="w-5 h-5 text-secondary-600" />;
    }
    if (type === 'video_uploaded') {
      return <Video className="w-5 h-5 text-primary-600" />;
    }
    if (type === 'attendance_marked') {
      return <Calendar className="w-5 h-5 text-emerald-600" />;
    }
    return <Sparkles className="w-5 h-5 text-amber-500" />;
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.is_read;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-12 max-w-4xl mx-auto"
    >
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary-700 text-xs font-bold mb-2 border border-blue-200/60">
            <Bell className="w-3.5 h-3.5" />
            <span>Classroom Alerts & Updates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Stay updated with new lesson releases, assignment reviews, and class notices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'all'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-500 hover:text-navy-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'unread'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-500 hover:text-navy-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs font-medium space-y-2">
            <CheckCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-navy-900">You&apos;re all caught up!</p>
            <p>No {activeTab === 'unread' ? 'unread' : ''} notifications at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-5 flex items-start justify-between gap-4 hover:bg-slate-50/80 cursor-pointer transition ${
                  !n.is_read ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    {getNotifIcon(n.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-navy-900">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-secondary-600 inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed max-w-2xl">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1.5">
                      {new Date(n.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center text-primary-600 text-xs font-bold gap-1 mt-1">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};
