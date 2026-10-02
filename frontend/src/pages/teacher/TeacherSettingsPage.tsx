import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  Bell,
  Shield,
  Palette,
  User,
  Mail,
  Database,
  Calendar,
  Clock,
  Globe,
  Save,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';

const ALL_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const TeacherSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [fcmAlerts, setFcmAlerts] = useState(true);

  // Class Schedule settings
  const [className, setClassName] = useState('Web & Mobile App Development (Batch 11)');
  const [classDays, setClassDays] = useState<string[]>(['Monday', 'Thursday']);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [timezone, setTimezone] = useState('Asia/Karachi');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getClassSettings();
        if (res.data?.success && res.data.data) {
          const s = res.data.data;
          setClassName(s.class_name || 'Web & Mobile App Development');
          setClassDays(s.class_days || ['Monday', 'Thursday']);
          setStartTime(s.class_start_time || '18:00');
          setEndTime(s.class_end_time || '20:00');
          setTimezone(s.timezone || 'Asia/Karachi');
        }
      } catch (err) {
        console.error('Failed to fetch class settings', err);
      } finally {
        setIsLoadingSchedule(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggleDay = (day: string) => {
    if (classDays.includes(day)) {
      if (classDays.length === 1) {
        error('At least one class day must remain active.');
        return;
      }
      setClassDays(classDays.filter(d => d !== day));
    } else {
      setClassDays([...classDays, day]);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSchedule(true);
    try {
      const res = await api.updateClassSettings({
        class_name: className,
        class_days: classDays,
        class_start_time: startTime,
        class_end_time: endTime,
        timezone: timezone,
      });
      if (res.data?.success) {
        success('Class schedule & timing settings saved successfully!');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update schedule');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword,
      });
      if (res.data?.success) {
        success('Admin password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Password update failed');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          Classroom Settings & Schedule
        </h1>
        <p className="text-xs sm:text-sm text-navy-600 mt-1">
          Configure official class schedules, broadcast notifications, security, and storage architecture.
        </p>
      </div>

      <div className="space-y-6">
        {/* Class Schedule Configuration */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-900 tracking-tight">Class Schedule & Calendar</h3>
              <p className="text-xs text-navy-500 mt-0.5">
                Defines official classroom attendance days and countdown widgets on the Teacher and Student dashboards.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSchedule} className="space-y-5">
            <Input
              label="Class Batch / Program Name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-2">
                Official Class Days (Bi-Weekly)
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const isSelected = classDays.includes(day);
                  const isDefaultDay = day === 'Monday' || day === 'Thursday';
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleToggleDay(day)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                          : 'bg-white text-navy-700 border-slate-200 hover:border-primary-400'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {day}
                      {isDefaultDay && !isSelected && (
                        <span className="text-[10px] opacity-60">(Recommended)</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Selected days determine which dates can have formal attendance recorded.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Class Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-primary-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Class End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-primary-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Timezone
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-primary-600"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingSchedule}
                className="flex items-center gap-2 shadow-soft hover:shadow-glow"
              >
                <Save className="w-4 h-4" />
                <span>Save Schedule Settings</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* Classroom Broadcast & Notification Settings */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary-50 text-secondary-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-900 tracking-tight">Broadcast Notifications</h3>
              <p className="text-xs text-navy-500 mt-0.5">
                Control automated student updates via Resend email delivery and Firebase push notifications.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
              <div>
                <h4 className="text-xs font-bold text-navy-900">Broadcast Email via Resend</h4>
                <p className="text-[11px] text-navy-600 mt-0.5">
                  Automatically dispatch lesson alert emails to students upon new video uploads.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => {
                  setEmailAlerts(e.target.checked);
                  success(`Email broadcasts ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50/50 border border-purple-100 rounded-2xl">
              <div>
                <h4 className="text-xs font-bold text-navy-900">Push Notifications via FCM</h4>
                <p className="text-[11px] text-navy-600 mt-0.5">
                  Send instant Firebase Cloud Messaging notifications to enrolled student devices.
                </p>
              </div>
              <input
                type="checkbox"
                checked={fcmAlerts}
                onChange={(e) => {
                  setFcmAlerts(e.target.checked);
                  success(`FCM push alerts ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                className="w-5 h-5 rounded text-secondary-600 focus:ring-secondary-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Security / Password Change */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-900 tracking-tight">Security & Credentials</h3>
              <p className="text-xs text-navy-500 mt-0.5">
                Update instructor administrator credentials.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="outline"
              size="sm"
              isLoading={isChangingPassword}
              className="mt-2"
            >
              Update Password
            </Button>
          </form>
        </Card>

        {/* System & Storage Architecture */}
        <Card className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-900 tracking-tight">Database & Media Storage</h3>
              <p className="text-xs text-navy-500 mt-0.5">
                System status for PostgreSQL, Supabase Storage buckets, and realtime synchronization.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
              <span className="text-[11px] font-bold text-primary-700 uppercase">Bucket: course-videos</span>
              <p className="text-xs text-navy-800 font-semibold mt-1">Supabase Video Storage</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Ready for CDN streaming</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
              <span className="text-[11px] font-bold text-secondary-700 uppercase">Bucket: avatars</span>
              <p className="text-xs text-navy-800 font-semibold mt-1">Student & Teacher Profiles</p>
              <p className="text-[11px] text-slate-500 mt-0.5">High-res avatar storage</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Database Engine</span>
              <p className="text-xs text-navy-800 font-semibold mt-1">PostgreSQL Active</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Transactions & Activity logs</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
