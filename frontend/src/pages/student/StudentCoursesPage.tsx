import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { api } from '../../services/api.js';
import {
  BookOpen,
  Video,
  Folder,
  ArrowRight,
  Search,
  CheckCircle2,
  Sparkles,
  Clock,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

export const StudentCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchFilter = searchParams.get('search') || '';

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed' | 'new'>('all');
  const [query, setQuery] = useState(searchFilter);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.getCourses();
        if (res.data?.success) {
          setCourses(res.data.data || []);
        }
      } catch (e) {
        console.error('Failed to load courses', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const nowMs = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const filteredCourses = courses.filter((c) => {
    const matchesQuery =
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(query.toLowerCase()));

    const progress = c.progressPercentage || 0;
    const isCompleted = progress === 100;
    const isInProgress = progress > 0 && progress < 100;
    const isNew = c.created_at ? nowMs - new Date(c.created_at).getTime() <= sevenDaysMs : false;

    if (!matchesQuery) return false;

    if (activeTab === 'in_progress') return isInProgress;
    if (activeTab === 'completed') return isCompleted;
    if (activeTab === 'new') return isNew || progress === 0;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-12"
    >
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Your Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Continue learning from where you left off.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-medium rounded-2xl border border-slate-200/80 focus:outline-none focus:border-primary-600 focus:bg-white w-full sm:w-60 transition"
            />
          </div>

          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200/60">
            {[
              { id: 'all', label: 'All' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
              { id: 'new', label: 'New' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  activeTab === tab.id
                    ? 'bg-white text-navy-900 shadow-2xs'
                    : 'text-slate-500 hover:text-navy-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-80 rounded-3xl" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900">No courses available</h3>
          <p className="text-xs text-slate-500 mt-1">
            {query ? 'No courses match your search criteria.' : 'No courses found in this category.'}
          </p>
          {query && (
            <Button onClick={() => setQuery('')} variant="outline" size="sm" className="mt-4">
              Clear Search
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isFinished = course.progressPercentage === 100;
            const progress = course.progressPercentage || 0;
            const isNew = course.created_at ? nowMs - new Date(course.created_at).getTime() <= sevenDaysMs : false;

            return (
              <Card
                key={course.id}
                hoverable
                className="flex flex-col justify-between group cursor-pointer bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden transition"
                onClick={() => navigate(`/student/courses/${course.id}`)}
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 m-3 mb-4">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge variant="blue" size="sm">{course.level || 'Foundational'}</Badge>
                      {isNew && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-white bg-secondary-600 px-2 py-0.5 rounded-md shadow-2xs">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-5">
                    <h3 className="text-base font-bold text-navy-900 group-hover:text-primary-600 transition tracking-tight">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold mt-3">
                      <span className="flex items-center gap-1">
                        <Folder className="w-3.5 h-3.5 text-primary-600" />
                        {course.topicsCount || 0} Topics
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-secondary-600" />
                        {course.videosCount || 0} Lessons
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-4 border-t border-slate-100 mt-4 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">Progress</span>
                      <span className={isFinished ? 'text-emerald-600' : 'text-primary-600'}>
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFinished ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-600 to-secondary-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {isFinished ? '✓ Completed' : progress > 0 ? 'In Progress' : 'Not Started'}
                    </span>
                    <span className="text-xs font-bold text-primary-600 group-hover:translate-x-1 transition flex items-center gap-1">
                      {progress > 0 ? 'Continue' : 'Start'} &rarr;
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
