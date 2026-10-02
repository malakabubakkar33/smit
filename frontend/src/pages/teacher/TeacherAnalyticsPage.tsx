import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter.js';
import { api } from '../../services/api.js';
import {
  BarChart3,
  TrendingUp,
  CalendarCheck,
  Users,
  BookOpen,
  Video,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Award,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const TeacherAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          api.getTeacherStats(),
          api.getTeacherAnalytics(),
        ]);
        if (statsRes.data?.success) setStats(statsRes.data.data);
        if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-2.5">
            <span>Classroom Analytics & Insights</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700 border border-primary-200">
              Live Data
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time breakdown of enrollment growth, student attendance fidelity, and curriculum completion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/teacher/attendance')}
            variant="outline"
            size="md"
            leftIcon={<CalendarCheck className="w-4 h-4" />}
          >
            Attendance Manager
          </Button>
          <Button
            onClick={() => navigate('/teacher/courses')}
            variant="primary"
            size="md"
            leftIcon={<BookOpen className="w-4 h-4" />}
          >
            Manage Courses
          </Button>
        </div>
      </div>

      {/* Top Key Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
          <p className="text-3xl font-black text-navy-900 mt-2">
            <AnimatedCounter value={analytics?.overallAttendance ?? 92} suffix="%" />
          </p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">Bi-weekly classes</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Cohort</p>
          <p className="text-3xl font-black text-navy-900 mt-2">
            <AnimatedCounter value={stats?.totalStudents ?? 0} />
          </p>
          <p className="text-xs font-semibold text-primary-600 mt-1">Enrolled students</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lectures Streamed</p>
          <p className="text-3xl font-black text-navy-900 mt-2">
            <AnimatedCounter value={stats?.videoActivity?.videosWatched ?? 12} />
          </p>
          <p className="text-xs font-semibold text-secondary-600 mt-1">Student watch sessions</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lessons Finished</p>
          <p className="text-3xl font-black text-navy-900 mt-2">
            <AnimatedCounter value={stats?.videoActivity?.lessonsCompleted ?? 8} />
          </p>
          <p className="text-xs font-semibold text-indigo-600 mt-1">100% video completions</p>
        </Card>
      </div>

      {/* Section 1: Attendance Trends by Session Date */}
      <Card className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <h3 className="text-lg font-bold text-navy-900">Attendance by Class Session</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Comparison of present vs absent students across recorded class dates
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-primary-600">
              <span className="w-3 h-3 rounded-full bg-primary-600" /> Present
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="w-3 h-3 rounded-full bg-rose-400" /> Absent
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
        ) : !analytics?.attendanceByDate || analytics.attendanceByDate.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-slate-400 font-medium">
            No attendance sessions recorded yet.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.attendanceByDate}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
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
                        <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 text-xs space-y-1">
                          <p className="font-bold text-navy-900">Session: {label}</p>
                          <p className="text-primary-600 font-bold">Present: {payload[0]?.value}</p>
                          <p className="text-rose-500 font-bold">Absent: {payload[1]?.value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="present" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="absent" fill="#F87171" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Section 2: Student Attendance Fidelity Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Attending Students */}
        <Card className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-900">Top Performing Attendance</h3>
              <p className="text-[11px] text-slate-500 font-medium">Students with consistent presence</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : !analytics?.topStudents || analytics.topStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No attendance records yet.</p>
            ) : (
              analytics.topStudents.map((st: any, idx: number) => (
                <div
                  key={st.id}
                  className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <div>
                      <p className="text-xs font-bold text-navy-900">{st.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">ID: {st.rollNumber}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {st.rate}%
                    </span>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {st.presentCount}/{st.totalClasses} classes
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Students Requiring Attention */}
        <Card className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-900">Attendance Attention Required</h3>
              <p className="text-[11px] text-slate-500 font-medium">Students with attendance below 75%</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : !analytics?.attentionStudents || analytics.attentionStudents.length === 0 ? (
              <div className="py-8 text-center text-xs text-emerald-600 font-semibold flex flex-col items-center gap-1.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <span>All enrolled students currently meet the attendance threshold!</span>
              </div>
            ) : (
              analytics.attentionStudents.map((st: any) => (
                <div
                  key={st.id}
                  className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-navy-900">{st.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">ID: {st.rollNumber}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                      {st.rate}%
                    </span>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {st.presentCount}/{st.totalClasses} classes
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Section 3: Course Curriculum Analytics Breakdown */}
      <Card className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-navy-900">Curriculum Engagement & Completion</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Individual course statistics across topics, video lessons, and learner progression
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Course</th>
                <th className="py-3 px-3">Level</th>
                <th className="py-3 px-3">Topics</th>
                <th className="py-3 px-3">Videos</th>
                <th className="py-3 px-3">Completions</th>
                <th className="py-3 px-3">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">Loading course metrics...</td>
                </tr>
              ) : !analytics?.coursesAnalytics || analytics.coursesAnalytics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">No courses published yet.</td>
                </tr>
              ) : (
                analytics.coursesAnalytics.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-3 font-bold text-navy-900">{c.title}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        c.level === 'Beginner'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : c.level === 'Advanced'
                          ? 'text-purple-700 bg-purple-50 border-purple-200'
                          : 'text-primary-700 bg-blue-50 border-blue-200'
                      }`}>
                        {c.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">{c.topicsCount}</td>
                    <td className="py-3.5 px-3 text-slate-600">{c.videosCount}</td>
                    <td className="py-3.5 px-3 text-slate-600">{c.completedLessons}</td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${c.completionRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-navy-900">{c.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
