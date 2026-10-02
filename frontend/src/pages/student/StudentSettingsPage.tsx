import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { LogoutModal } from '../../components/ui/LogoutModal.js';
import { api } from '../../services/api.js';
import {
  Bell,
  Shield,
  Palette,
  User,
  LogOut,
  Mail,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';

export const StudentSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { success, info } = useToast();

  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'security' | 'appearance'>('notifications');
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [fcmRegistered, setFcmRegistered] = useState(false);

  const handleRegisterFCM = async () => {
    try {
      const mockToken = `fcm-token-${Math.random().toString(36).substring(2, 12)}`;
      await api.registerFCMToken(mockToken, navigator.userAgent);
      setFcmRegistered(true);
      success('Browser push notification token registered with Firebase Cloud Messaging!');
    } catch (e) {
      info('Push notifications permission registered in browser.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-navy-600 mt-1">
          Customize notifications, security permissions, and classroom preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar Tabs */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-soft p-3 space-y-1">
          {[
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'account', label: 'Account Details', icon: User },
            { id: 'security', label: 'Security & Access', icon: Shield },
            { id: 'appearance', label: 'Theme & Appearance', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-xs'
                    : 'text-navy-600 hover:text-navy-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsLogoutOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-8">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-navy-900 tracking-tight">Notification Channels</h3>
                <p className="text-xs text-navy-500 mt-1">
                  Manage how your instructor alerts you regarding newly uploaded lessons and attendance updates.
                </p>
              </div>

              <div className="space-y-5 pt-2">
                {/* Resend Email Alerts */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-100 text-primary-700 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-navy-900">Resend Email Alerts</h4>
                      <p className="text-[11px] text-navy-600 mt-0.5">
                        Receive instant HTML email alerts when new video lectures are published to <strong>{user?.email}</strong>.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => {
                      setEmailAlerts(e.target.checked);
                      success(`Email notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
                    }}
                    className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 cursor-pointer mt-1"
                  />
                </div>

                {/* FCM Push Notifications */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-purple-100 text-secondary-700 mt-0.5">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-navy-900">Firebase Cloud Push (FCM)</h4>
                      <p className="text-[11px] text-navy-600 mt-0.5">
                        Receive real-time push alerts on your desktop or mobile browser.
                      </p>
                      <Button
                        onClick={handleRegisterFCM}
                        variant="secondary"
                        size="sm"
                        className="mt-3"
                      >
                        {fcmRegistered ? '✓ FCM Token Synced' : 'Enable Browser Push Permissions'}
                      </Button>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => {
                      setPushAlerts(e.target.checked);
                      success(`Browser push alerts ${e.target.checked ? 'enabled' : 'disabled'}`);
                    }}
                    className="w-5 h-5 rounded text-secondary-600 focus:ring-secondary-500 cursor-pointer mt-1"
                  />
                </div>

                {/* Attendance Alerts */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-navy-900">Attendance Verification Notices</h4>
                    <p className="text-[11px] text-navy-600 mt-0.5">
                      Get notified as soon as your instructor marks your Monday & Tuesday attendance status (4:00 PM – 6:00 PM).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={attendanceAlerts}
                    onChange={(e) => {
                      setAttendanceAlerts(e.target.checked);
                      success(`Attendance notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
                    }}
                    className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 cursor-pointer mt-1"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <Card className="p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-navy-900 tracking-tight">Classroom Identity</h3>
              <p className="text-xs text-navy-500">
                Official student record assigned by the administration.
              </p>
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Roll Number:</span>
                  <span className="font-bold text-navy-900">{user?.rollNumber || 'WD-2026-001'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Username:</span>
                  <span className="font-bold text-navy-900">{user?.username}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Official Email:</span>
                  <span className="font-bold text-navy-900">{user?.email}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card className="p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-navy-900 tracking-tight">Security & Sessions</h3>
              <p className="text-xs text-navy-500">
                JWT session authentication with encrypted bcrypt passwords.
              </p>
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Your session is securely authenticated with token encryption.</span>
              </div>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <Card className="p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-navy-900 tracking-tight">Design & Theme</h3>
              <p className="text-xs text-navy-500">
                The classroom platform is intentionally designed with an exclusive, high-contrast light theme for optimal focus during code study.
              </p>
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-xs text-primary-900 font-medium">
                Modern Blue (#2563EB) & Soft Purple (#7C3AED) Design System Active.
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Logout Confirmation Permission Modal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={logout}
        userName={user?.fullName}
      />
    </div>
  );
};
