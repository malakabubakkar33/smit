import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter.js';
import { api } from '../../services/api.js';
import {
  Users,
  BookOpen,
  Folder,
  Video,
  PlusCircle,
  Upload,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  PlayCircle,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await api.getTeacherStats();
      if (res.data?.success) {
        setStats(res.data.data);
      } else {
        setFetchError('Unable to load classroom analytics.');
      }
    } catch (err: any) {
      console.error('Failed to load teacher stats:', err);
      setFetchError('Unable to connect to classroom database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. DASHBOARD WELCOME HERO */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50/90 via-white to-purple-50/80 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Subtle Decorative Educational Shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-80 pointer-events-none opacity-30 hidden lg:block overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 blur-2xl" />
          <div className="absolute right-20 -bottom-10 w-44 h-44 rounded-full bg-blue-300 blur-xl" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100/90 text-primary-800 text-xs font-bold mb-3 border border-primary-200/60 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            <span>Classroom Administrator & Lead Instructor</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-navy-900 tracking-tight leading-snug">
            {getGreeting()},{' '}
            <span className="inline-flex items-center gap-2 align-baseline whitespace-nowrap">
              <span>{user?.fullName?.split(' ')[0] || 'Teacher'}</span>
              <motion.span
                className="inline-block origin-[70%_70%] select-none shrink-0"
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              >
                👋
              </motion.span>
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium leading-relaxed">
            Manage your web development curriculum, lessons, students, attendance and classroom activity from one place.
          </p>
        </div>

        {/* Hero Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => navigate('/teacher/courses?action=new-course')}
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="shadow-sm shadow-primary-500/25"
          >
            Add Course
          </Button>

          <Button
            onClick={() => navigate('/teacher/attendance')}
            variant="secondary"
            size="md"
            leftIcon={<CalendarCheck className="w-4 h-4" />}
            className="shadow-sm shadow-secondary-500/20"
          >
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* API Error State with Try Again Button */}
      {fetchError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-xs">Unable to load classroom data.</p>
              <p className="text-[11px] text-amber-800">Ensure the backend server is active and click to reconnect.</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDashboardData}
            className="text-xs bg-white border-amber-300 hover:bg-amber-100 shrink-0"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TOP MAIN STATISTICS CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Students */}
        <Card className="p-5 sm:p-6 bg-white border border-slate-200/90 hover:border-primary-400 hover:shadow-md transition-all rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Students
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-primary-600 flex items-center justify-center border border-blue-100 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
                <AnimatedCounter value={stats?.totalStudents ?? 0} />
              </p>
            )}

            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats?.totalStudentsTrend || '+4 this month'}</span>
            </div>
          </div>
        </Card>

        {/* Total Courses */}
        <Card className="p-5 sm:p-6 bg-white border border-slate-200/90 hover:border-secondary-400 hover:shadow-md transition-all rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Courses
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-secondary-600 flex items-center justify-center border border-purple-100 shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
                <AnimatedCounter value={stats?.totalCourses ?? 0} />
              </p>
            )}

            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-secondary-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{stats?.totalCoursesTrend || '+1 this month'}</span>
            </div>
          </div>
        </Card>

        {/* Total Topics */}
        <Card className="p-5 sm:p-6 bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Topics
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
              <Folder className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
                <AnimatedCounter value={stats?.totalTopics ?? 0} />
              </p>
            )}

            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>{stats?.totalTopicsTrend || '6 published recently'}</span>
            </div>
          </div>
        </Card>

        {/* Total Videos */}
        <Card className="p-5 sm:p-6 bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Videos
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs">
              <Video className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
                <AnimatedCounter value={stats?.totalVideos ?? 0} />
              </p>
            )}

            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-600">
              <Flame className="w-3.5 h-3.5" />
              <span>{stats?.totalVideosTrend || '+8 this month'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 3. CLASSROOM ANALYTICS (CHARTS & DATA ENGINE) */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 tracking-tight">
              Classroom Analytics
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Monitor learning activity, attendance and course engagement.
            </p>
          </div>

          <Button
            onClick={() => navigate('/teacher/analytics')}
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="text-primary-600 hover:text-primary-700"
          >
            Full Analytics Page
          </Button>
        </div>

        {/* Analytics Row 1: Student Enrollment Line Chart + Attendance Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Enrollment Line Chart (2 Cols) */}
          <Card className="lg:col-span-2 p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-navy-900">Student Enrollment</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Student registrations over time from class database
                </p>
              </div>
              <span className="text-xs font-bold text-primary-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">
                {stats?.totalStudents || 0} Registered
              </span>
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-56 w-full rounded-2xl" />
              </div>
            ) : !stats?.enrollmentGrowth || stats.enrollmentGrowth.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-medium">
                Not enough enrollment history yet.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.enrollmentGrowth}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 text-xs">
                              <p className="font-bold text-navy-900">{label}</p>
                              <p className="text-primary-600 font-bold mt-1">
                                Enrolled: {payload[0].value} students
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#2563EB"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#enrollmentGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Attendance Overview Donut Chart (1 Col) */}
          <Card className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-navy-900">Attendance Overview</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Present vs Absent on Monday & Tuesday sessions (4:00 PM – 6:00 PM)
              </p>
            </div>

            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Skeleton className="w-36 h-36 rounded-full" />
              </div>
            ) : (
              <div className="relative flex items-center justify-center my-2">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.attendanceOverview?.pieData || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="#2563EB" />
                        <Cell fill="#F87171" />
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white px-2.5 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-bold text-navy-900">
                                {payload[0].name}: {payload[0].value} sessions
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Central Attendance Rate Indicator */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-navy-900">
                    <AnimatedCounter value={stats?.attendanceOverview?.attendanceRate ?? 92} suffix="%" />
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Overall Rate
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
              <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100">
                <p className="text-[10px] font-bold text-primary-700 uppercase">Present</p>
                <p className="text-sm font-extrabold text-navy-900 mt-0.5">
                  {stats?.attendanceOverview?.presentCount ?? 0}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-100">
                <p className="text-[10px] font-bold text-rose-700 uppercase">Absent</p>
                <p className="text-sm font-extrabold text-navy-900 mt-0.5">
                  {stats?.attendanceOverview?.absentCount ?? 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Row 2: Course Engagement Bar Chart + Lesson Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Engagement Bar Chart (2 Cols) */}
          <Card className="lg:col-span-2 p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-navy-900">Course Engagement</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Average student completion % across Web Development curriculum
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">Database Progress</span>
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-56 w-full rounded-2xl" />
              </div>
            ) : !stats?.courseEngagement || stats.courseEngagement.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-medium">
                No courses published yet.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.courseEngagement}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="courseName"
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 text-xs">
                              <p className="font-bold text-navy-900">{data.fullTitle}</p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                Level: {data.level} • {data.topicsCount} Topics • {data.videosCount} Videos
                              </p>
                              <p className="text-secondary-600 font-bold mt-1.5">
                                Avg. Completion: {data.avgCompletion}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="avgCompletion"
                      fill="#7C3AED"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Lesson Activity Card (1 Col) */}
          <Card className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-5 flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-navy-900">Lesson Activity</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Video lessons uploaded and student stream milestones
              </p>
            </div>

            <div className="space-y-4 my-auto">
              {/* Videos Uploaded */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-xs">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-900">Videos Uploaded</p>
                    <p className="text-[10px] text-slate-500">Stored in Supabase Storage</p>
                  </div>
                </div>
                <span className="text-lg font-black text-primary-700">
                  <AnimatedCounter value={stats?.videoActivity?.videosUploaded ?? 0} />
                </span>
              </div>

              {/* Videos Watched */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary-600 text-white flex items-center justify-center shadow-xs">
                    <PlayCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-900">Lectures Watched</p>
                    <p className="text-[10px] text-slate-500">Student stream sessions</p>
                  </div>
                </div>
                <span className="text-lg font-black text-secondary-700">
                  <AnimatedCounter value={stats?.videoActivity?.videosWatched ?? 0} />
                </span>
              </div>

              {/* Lessons Completed */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-900">Lessons Completed</p>
                    <p className="text-[10px] text-slate-500">Full 100% progress completions</p>
                  </div>
                </div>
                <span className="text-lg font-black text-emerald-700">
                  <AnimatedCounter value={stats?.videoActivity?.lessonsCompleted ?? 0} />
                </span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] font-semibold text-slate-400">
                All records synchronized from student video_progress
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CLASSROOM QUICK ACTIONS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-navy-900 tracking-tight">
          Classroom Quick Actions
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Add Course */}
          <Card
            hoverable
            onClick={() => navigate('/teacher/courses?action=new-course')}
            className="p-4 cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200/90 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition shadow-2xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs font-bold text-navy-900 group-hover:text-primary-600 transition flex items-center justify-between">
                <span>Add Course</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Create curriculum</p>
            </div>
          </Card>

          {/* Add Topic */}
          <Card
            hoverable
            onClick={() => navigate('/teacher/courses')}
            className="p-4 cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200/90 group"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center group-hover:bg-secondary-600 group-hover:text-white transition shadow-2xs">
              <Folder className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs font-bold text-navy-900 group-hover:text-secondary-600 transition flex items-center justify-between">
                <span>Add Topic</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-secondary-600 group-hover:translate-x-0.5 transition-all" />
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Syllabus modules</p>
            </div>
          </Card>

          {/* Upload Video */}
          <Card
            hoverable
            onClick={() => navigate('/teacher/courses?action=upload-video')}
            className="p-4 cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200/90 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs font-bold text-navy-900 group-hover:text-amber-600 transition flex items-center justify-between">
                <span>Upload Video</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Cloud storage upload</p>
            </div>
          </Card>

          {/* Mark Attendance */}
          <Card
            hoverable
            onClick={() => navigate('/teacher/attendance')}
            className="p-4 cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200/90 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition shadow-2xs">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs font-bold text-navy-900 group-hover:text-emerald-600 transition flex items-center justify-between">
                <span>Mark Attendance</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Mon & Thu roll call</p>
            </div>
          </Card>

          {/* Add Student */}
          <Card
            hoverable
            onClick={() => navigate('/teacher/students?action=add-student')}
            className="p-4 cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200/90 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition shadow-2xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs font-bold text-navy-900 group-hover:text-indigo-600 transition flex items-center justify-between">
                <span>Add Student</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Enroll class member</p>
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. RECENT ACTIVITY & ATTENDANCE SCHEDULE / NEXT CLASS WIDGET */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Classroom Activity Feed (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy-900 tracking-tight">
              Recent Classroom Activity
            </h3>
            <span className="text-xs font-semibold text-slate-400">Live platform event stream</span>
          </div>

          <Card className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs divide-y divide-slate-100">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : !stats?.recentActivities || stats.recentActivities.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-medium">
                No recent classroom activity recorded yet.
              </div>
            ) : (
              stats.recentActivities.map((act: any) => (
                <div
                  key={act.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-navy-700 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/60 shadow-2xs">
                      {act.event_type === 'VIDEO_UPLOADED' ? (
                        <Video className="w-4 h-4 text-primary-600" />
                      ) : act.event_type === 'STUDENT_REGISTERED' ? (
                        <Users className="w-4 h-4 text-secondary-600" />
                      ) : act.event_type === 'COURSE_CREATED' || act.event_type === 'COURSE_UPDATED' ? (
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                      ) : act.event_type === 'TOPIC_CREATED' ? (
                        <Folder className="w-4 h-4 text-purple-600" />
                      ) : (
                        <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-navy-900">{act.title}</h5>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap shrink-0">
                    {new Date(act.created_at || act.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Next Class Widget & Attendance Schedule (1 Col) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-navy-900 tracking-tight">
            Class Schedule & Next Session
          </h3>

          {/* Next Class Countdown Card */}
          <Card className="p-6 bg-gradient-to-br from-blue-50/80 via-white to-purple-50/70 border border-slate-200/90 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider bg-white px-2.5 py-1 rounded-full border border-blue-200 shadow-2xs">
                Next Class
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-secondary-700">
                <Clock className="w-3.5 h-3.5" />
                {stats?.nextClass?.countdownStr || 'Calculating...'}
              </span>
            </div>

            <div>
              <h4 className="text-2xl font-black text-navy-900">
                {stats?.nextClass?.dayName || 'Monday'}
              </h4>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {stats?.nextClass?.dateStr || 'Regular Session'} • {stats?.classSettings?.class_start_time || '6:00 PM'} - {stats?.classSettings?.class_end_time || '8:30 PM'}
              </p>
            </div>

            <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-navy-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Bi-Weekly Class Schedule
              </p>
              <p className="text-[11px] text-slate-500">
                Every <strong>Monday</strong> & <strong>Tuesday</strong> (4:00 PM – 6:00 PM). Attendance records are strictly tied to class dates.
              </p>
            </div>

            <Button
              onClick={() => navigate('/teacher/attendance')}
              variant="primary"
              size="md"
              className="w-full justify-center shadow-xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Attendance Manager
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
