import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  ClipboardCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  Upload,
  FileImage,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StudentAssignmentsPage: React.FC = () => {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAssignments();
      if (res.data?.success) {
        setAssignments(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const totalCount = assignments.length;
  const pendingCount = assignments.filter((a) => !a.submissionStatus || a.submissionStatus === 'pending' || a.submissionStatus === 'resubmission_requested').length;
  const submittedCount = assignments.filter((a) => a.submissionStatus === 'submitted' || a.submissionStatus === 'under_review').length;
  const gradedCount = assignments.filter((a) => a.submissionStatus === 'graded').length;

  const filteredAssignments = assignments.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      (a.courseTitle && a.courseTitle.toLowerCase().includes(q)) ||
      (a.topicTitle && a.topicTitle.toLowerCase().includes(q));

    const status = a.submissionStatus || 'pending';

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return status === 'pending' || status === 'resubmission_requested';
    if (activeTab === 'submitted') return status === 'submitted' || status === 'under_review';
    if (activeTab === 'graded') return status === 'graded';
    return true;
  });

  const getStatusBadge = (status: string, marks?: number, maxMarks?: number) => {
    switch (status) {
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Graded ({marks ?? 0}/{maxMarks ?? 100})
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/60 shadow-2xs">
            <Clock className="w-3.5 h-3.5" />
            Under Review
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-primary-700 text-xs font-bold border border-blue-200/60 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Submitted
          </span>
        );
      case 'resubmission_requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/60 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5" />
            Resubmission Needed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/60 shadow-2xs">
            <Clock className="w-3.5 h-3.5" />
            Pending Submission
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Top Banner */}
      <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-secondary-700 text-xs font-bold mb-2 border border-purple-200/60 shadow-2xs">
            <ClipboardCheck className="w-3.5 h-3.5 text-secondary-600" />
            <span>Classroom Tasks & Code Reviews</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Assignments & Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Complete and submit assignments for teacher evaluation. Accepted formats: <strong>PDF & Images (PNG, JPG, WEBP)</strong>.
          </p>
        </div>

        {/* Search & Tabs Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-50/80 hover:bg-slate-100 text-xs font-medium rounded-2xl border border-slate-200/80 focus:outline-none focus:border-primary-600 focus:bg-white w-full sm:w-56 transition"
            />
          </div>

          <div className="flex rounded-2xl bg-slate-100/90 p-1 border border-slate-200/60">
            {[
              { id: 'all', label: 'All', count: totalCount },
              { id: 'pending', label: 'Pending', count: pendingCount },
              { id: 'submitted', label: 'Submitted', count: submittedCount },
              { id: 'graded', label: 'Graded', count: gradedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-white text-navy-900 shadow-2xs'
                    : 'text-slate-500 hover:text-navy-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id ? 'bg-primary-50 text-primary-700 font-extrabold' : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xs">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900">No assignments found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'No assignments match your search query.' : 'You have no assignments in this category.'}
          </p>
          {searchQuery && (
            <Button onClick={() => setSearchQuery('')} variant="outline" size="sm" className="mt-4">
              Clear Search
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment, idx) => {
            const isPending = !assignment.submissionStatus || assignment.submissionStatus === 'pending' || assignment.submissionStatus === 'resubmission_requested';
            const allowedClean = (assignment.allowed_file_types || ['pdf', 'png', 'jpg', 'jpeg', 'webp']).filter(
              (t: string) => !['zip', 'rar', 'tar', 'gz', '7z'].includes(t.toLowerCase())
            );

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
              >
                <Card
                  className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl shadow-sm hover:border-primary-300 hover:shadow-lg transition-all p-6 flex flex-col justify-between group cursor-pointer h-full"
                  onClick={() => navigate(`/student/assignments/${assignment.id}`)}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60 shadow-2xs">
                        {assignment.courseTitle}
                      </span>
                      {getStatusBadge(assignment.submissionStatus, assignment.mySubmission?.marks, assignment.max_marks)}
                    </div>

                    <h3 className="text-base font-extrabold text-navy-900 group-hover:text-primary-600 transition tracking-tight">
                      {assignment.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                      {assignment.description}
                    </p>

                    <div className="space-y-2 pt-1 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Due Date:{' '}
                          <strong className="text-navy-800">
                            {new Date(assignment.due_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-secondary-600" />
                        <span>Maximum Marks: <strong className="text-navy-800">{assignment.max_marks || 100}</strong></span>
                      </div>
                    </div>

                    {/* Formats banner (PDF & Image only) */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">Allowed Formats:</span>
                      <span className="font-bold text-primary-700 uppercase">
                        PDF & Images
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold truncate max-w-[150px]">
                      {assignment.topicTitle || 'General Topic'}
                    </span>
                    <span className="font-bold text-primary-600 group-hover:translate-x-1 transition flex items-center gap-1">
                      {isPending ? 'Submit Work' : 'Inspect Result'} &rarr;
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
