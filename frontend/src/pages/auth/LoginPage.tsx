import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import {
  GraduationCap,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Calendar,
  Layers,
  Video,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Role selector tab
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [isTeacherSetupCompleted, setIsTeacherSetupCompleted] = useState<boolean>(true);
  const [teacherInfo, setTeacherInfo] = useState<{ teacherName?: string; username?: string }>({});

  useEffect(() => {
    const checkTeacherStatus = async () => {
      try {
        const res = await api.getTeacherSetupStatus();
        if (res.data?.success && res.data.data) {
          setIsTeacherSetupCompleted(Boolean(res.data.data.isSetupCompleted));
          setTeacherInfo(res.data.data);
        }
      } catch (err) {
        console.error('Failed to get teacher status', err);
      }
    };
    checkTeacherStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) {
      errors.identifier =
        selectedRole === 'teacher'
          ? 'Teacher username is required'
          : 'Username or Roll Number is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(identifier, password);
      success(`Welcome back, ${user.fullName}!`, 'Authenticated');

      // Auto-route based on role
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSwitch = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    setFieldErrors({});
    setIdentifier('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background blur circles */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-20 mb-4 sm:mb-8">
        <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-navy-900 tracking-tight block">
              SMIT Web Class
            </span>
            <span className="text-[10px] font-bold text-primary-600 tracking-wider uppercase block">
              Unified Portal Login
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Website
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-5xl mx-auto my-auto z-10">
        <div className="bg-white rounded-3xl sm:rounded-4xl shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[590px]">
          {/* Left Side: Modern Platform Features & Cohort Info */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/80 via-slate-50 to-purple-50/70 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 relative overflow-hidden">
            {/* Top Badge & Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-primary-200/60 text-primary-700 shadow-xs mb-6">
                <Sparkles className="w-3.5 h-3.5 text-secondary-600" />
                <span className="text-[11px] font-bold tracking-wide uppercase">
                  Class Access
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight leading-snug">
                One Class. One Teacher. Real Progress.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                Log into your personal learning workspace to stream video lessons, track Monday & Tuesday attendance (4:00 PM – 6:00 PM), and build production projects.
              </p>
            </div>

            {/* Middle Feature Highlights List with Line */}
            <div className="my-8 space-y-3.5 relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-300 via-secondary-300 to-transparent" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-white text-primary-600 flex items-center justify-center border border-primary-100 shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900">Structured Syllabus</h4>
                  <p className="text-[11px] text-slate-500">Folder-style lessons & code exercises</p>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-white text-secondary-600 flex items-center justify-center border border-secondary-100 shadow-xs">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900">HD Video Lectures</h4>
                  <p className="text-[11px] text-slate-500">Recorded and uploaded by your instructor</p>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-white text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900">Monday & Tuesday Sessions</h4>
                  <p className="text-[11px] text-slate-500">4:00 PM – 6:00 PM Live verified attendance</p>
                </div>
              </div>
            </div>

            {/* Bottom Support Badge */}
            <div className="p-3.5 bg-white/90 backdrop-blur-md rounded-2xl border border-white shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-[11px]">
                <p className="font-bold text-navy-900">Secure Database Connection</p>
                <p className="text-slate-500">Protected JWT token and encrypted sessions</p>
              </div>
            </div>
          </div>

          {/* Right Side: Enhanced Sign In Form */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
              {/* Form Title & Role Selector */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                  Sign In to SMIT Class
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Select your role to access your dedicated learning portal.
                </p>

                {/* Role Switcher Tabs */}
                <div className="mt-5 p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('student')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedRole === 'student'
                        ? 'bg-white text-primary-700 shadow-xs'
                        : 'text-slate-600 hover:text-navy-900'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Student Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('teacher')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedRole === 'teacher'
                        ? 'bg-white text-secondary-700 shadow-xs'
                        : 'text-slate-600 hover:text-navy-900'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Teacher & Admin
                  </button>
                </div>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-1.5">
                    {selectedRole === 'teacher' ? 'Teacher Username / Admin ID' : 'Username, Roll Number, or Email'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={
                        selectedRole === 'teacher'
                          ? teacherInfo?.username || 'teacher'
                          : 'Username, Roll Number, or Email'
                      }
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition ${
                        fieldErrors.identifier ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                      autoFocus
                    />
                  </div>
                  {fieldErrors.identifier && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {fieldErrors.identifier}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition underline-offset-2 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-11 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition ${
                        fieldErrors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Teacher First-Time Setup Prompt - HIDDEN IF ALREADY CONFIGURED (ONLY 1 ACCOUNT PERMITTED) */}
                {selectedRole === 'teacher' && !isTeacherSetupCompleted && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-secondary-900 font-medium">
                      <Sparkles className="w-4 h-4 text-secondary-600 shrink-0" />
                      <span>First time opening the portal?</span>
                    </div>
                    <Link
                      to="/teacher/setup"
                      className="text-secondary-700 font-bold hover:text-secondary-900 underline underline-offset-2 ml-2 shrink-0"
                    >
                      Set Up Credentials →
                    </Link>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-bold shadow-md shadow-primary-500/25 justify-center"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Sign In as {selectedRole === 'teacher' ? 'Instructor' : 'Student'}
                  </Button>
                </div>
              </form>

              {/* Bottom Registration Link */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-600">
                <span>Not registered in our class yet?</span>
                <Link
                  to="/signup"
                  className="font-bold text-primary-600 hover:text-primary-700 transition ml-1.5 underline underline-offset-2"
                >
                  Create Student Account →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer text */}
      <footer className="text-center text-xs text-slate-400 py-3">
        © 2026 SMIT Web Class. Light Theme • Secure Learning Platform
      </footer>
    </div>
  );
};
