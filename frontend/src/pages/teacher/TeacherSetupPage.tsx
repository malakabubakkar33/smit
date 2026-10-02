import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Avatar } from '../../components/ui/Avatar.js';
import {
  GraduationCap,
  ShieldCheck,
  User,
  Lock,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  Upload,
  Camera,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const TeacherSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isAlreadySetup, setIsAlreadySetup] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.getTeacherSetupStatus();
        if (res.data?.success && res.data.data) {
          setIsAlreadySetup(Boolean(res.data.data.isSetupCompleted));
          if (res.data.data.teacherName) {
            setFullName(res.data.data.teacherName);
          }
          if (res.data.data.username && res.data.data.username !== 'teacher') {
            setUsername(res.data.data.username);
          }
          if (res.data.data.avatarUrl) {
            setAvatarUrl(res.data.data.avatarUrl);
          }
        }
      } catch (err) {
        console.error('Failed to check teacher setup status', err);
      } finally {
        setIsChecking(false);
      }
    };
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 2) {
      error('Full Name must be at least 2 characters');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      error('Username must be at least 3 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      error('Username can only contain letters, numbers, and underscores');
      return;
    }
    if (!password || password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.setupTeacher({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        avatarUrl: avatarUrl.trim(),
        password,
        confirmPassword,
      });

      if (res.data?.success) {
        const { token, user } = res.data.data;
        localStorage.setItem('smit_token', token);
        localStorage.setItem('smit_user', JSON.stringify(user));

        success('Teacher credentials configured successfully! Launching Portal...', 'Setup Complete 🎉');
        setTimeout(() => {
          window.location.href = '/teacher/dashboard';
        }, 800);
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Setup submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between z-20 mb-6">
        <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-primary-600 to-secondary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-navy-900 tracking-tight block">
              SMIT Web Class
            </span>
            <span className="text-[10px] font-bold text-primary-600 tracking-wider uppercase block">
              Instructor Onboarding
            </span>
          </div>
        </Link>

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Login
        </Link>
      </header>

      {/* Main Setup Card */}
      <main className="w-full max-w-2xl mx-auto my-auto z-10">
        {isAlreadySetup ? (
          <div className="bg-white rounded-3xl sm:rounded-4xl shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-primary-600 flex items-center justify-center mx-auto border border-blue-200 shadow-2xs">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                <span>Instructor Account Configured</span>
              </div>
              <h2 className="text-2xl font-black text-navy-900 tracking-tight">Only One Teacher Account Allowed</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                The official instructor account for <strong className="text-navy-900">{fullName || 'Instructor'}</strong> is already configured. Additional teacher registration is disabled.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-md font-bold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Teacher Portal
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl sm:rounded-4xl shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden p-6 sm:p-10">
            <div className="text-center max-w-lg mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-bold mb-3 border border-primary-200">
                <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                <span>Initial Teacher Portal Configuration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                Set Up Your Instructor Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Configure your personal administrator name, custom username, profile avatar, and secure password for future logins.
              </p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Profile Picture from Device */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative shrink-0">
                <Avatar
                  src={avatarUrl}
                  name={fullName || 'Teacher'}
                  size="xl"
                  className="ring-4 ring-white shadow-md shadow-slate-200 w-24 h-24 text-2xl"
                />
                <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-xs cursor-pointer hover:bg-primary-700 transition">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setIsUploadingPhoto(true);
                        try {
                          const uploadData = new FormData();
                          uploadData.append('avatar', file);
                          const res = await api.uploadAvatar(uploadData);
                          if (res.data?.success && res.data.data?.avatarUrl) {
                            setAvatarUrl(res.data.data.avatarUrl);
                            success('Photo uploaded from your device!');
                          }
                        } catch (err: any) {
                          error(err.response?.data?.message || 'Failed to upload photo');
                        } finally {
                          setIsUploadingPhoto(false);
                        }
                      }
                    }}
                  />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider">
                  Upload Instructor Photo From Device
                </label>
                <p className="text-xs text-slate-500">
                  Select your official photo from your computer or phone (JPG, PNG, WEBP).
                </p>

                <label className="inline-block pt-1">
                  <span className="px-4 py-2 bg-white border border-slate-200 hover:border-primary-500 text-primary-600 text-xs font-bold rounded-xl shadow-2xs cursor-pointer inline-flex items-center gap-2 hover:bg-blue-50/50 transition">
                    <Upload className="w-3.5 h-3.5" />
                    {isUploadingPhoto ? 'Uploading from device...' : 'Choose Photo from Device'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingPhoto}
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setIsUploadingPhoto(true);
                        try {
                          const uploadData = new FormData();
                          uploadData.append('avatar', file);
                          const res = await api.uploadAvatar(uploadData);
                          if (res.data?.success && res.data.data?.avatarUrl) {
                            setAvatarUrl(res.data.data.avatarUrl);
                            success('Photo uploaded from your device!');
                          }
                        } catch (err: any) {
                          error(err.response?.data?.message || 'Failed to upload photo');
                        } finally {
                          setIsUploadingPhoto(false);
                        }
                      }
                    }}
                  />
                </label>

                {avatarUrl && (
                  <p className="text-xs font-bold text-emerald-600 flex items-center justify-center sm:justify-start gap-1 pt-1">
                    <Check className="w-3.5 h-3.5" /> Photo successfully uploaded from device
                  </p>
                )}
              </div>
            </div>

            {/* Name and Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-1.5">
                  Instructor Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Prof. Alex Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-primary-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-1.5">
                  Custom Login Username *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">@</span>
                  <input
                    type="text"
                    placeholder="e.g. alexvance"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    required
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-primary-600 transition"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Letters, numbers, and underscores only.</p>
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider">
                    New Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-semibold text-primary-600 hover:text-primary-700"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-primary-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-primary-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Submission button */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full justify-center shadow-md shadow-primary-500/20 font-bold"
              >
                <span>Save Credentials & Launch Teacher Portal</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </main>

      {/* Footer text */}
      <footer className="text-center text-xs text-slate-400 py-3">
        © 2026 SMIT Web Class. Light Theme • Secure Learning Platform
      </footer>
    </div>
  );
};
