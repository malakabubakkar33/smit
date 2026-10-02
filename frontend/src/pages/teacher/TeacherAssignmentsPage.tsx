import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { Avatar } from '../../components/ui/Avatar.js';
import {
  ClipboardCheck,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Users,
  Award,
  Download,
  Trash2,
  Edit,
  Eye,
  X,
  FileCheck,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Folder
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Zod validation schema for Teacher Assignment Creation / Editing
const assignmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  course_id: z.string().min(1, 'Please select a course'),
  topic_id: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  due_at: z.string().min(1, 'Please specify a due date'),
  max_marks: z.coerce.number().min(1, 'Marks must be at least 1').max(1000, 'Max marks 1000'),
  allowed_file_types: z.string().min(1, 'Specify allowed file extensions (e.g. zip, pdf)'),
  max_file_size_mb: z.coerce.number().min(1, 'Min 1MB').max(200, 'Max 200MB'),
  max_submissions: z.coerce.number().min(1, 'Min 1 submission').max(10, 'Max 10 submissions'),
  allow_resubmission: z.boolean().default(true),
  published: z.boolean().default(true),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

export const TeacherAssignmentsPage: React.FC = () => {
  const { success, error, info } = useToast();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);

  // Submissions drawer state
  const [viewingAssignment, setViewingAssignment] = useState<any | null>(null);
  const [submissionsData, setSubmissionsData] = useState<any | null>(null);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // Review single submission modal state
  const [reviewingSubmission, setReviewingSubmission] = useState<any | null>(null);
  const [gradingMarks, setGradingMarks] = useState<number>(100);
  const [gradingFeedback, setGradingFeedback] = useState<string>('');
  const [isGrading, setIsGrading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      max_marks: 100,
      max_file_size_mb: 20,
      max_submissions: 1,
      allowed_file_types: 'zip, pdf, docx',
      allow_resubmission: true,
      published: true,
    },
  });

  const selectedCourseId = watch('course_id');

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const [assignRes, coursesRes] = await Promise.all([
        api.getAssignments(),
        api.getCourses(),
      ]);
      if (assignRes.data?.success) {
        setAssignments(assignRes.data.data || []);
      }
      if (coursesRes.data?.success) {
        setCourses(coursesRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load assignments or courses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Update topics when course selection changes in modal
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedCourseId) {
        setTopics([]);
        return;
      }
      try {
        const res = await api.getTopicsByCourse(selectedCourseId);
        if (res.data?.success) {
          setTopics(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load topics for course', err);
      }
    };
    fetchTopics();
  }, [selectedCourseId]);

  const handleOpenCreateModal = () => {
    setEditingAssignment(null);
    reset({
      title: '',
      course_id: courses[0]?.id || '',
      topic_id: '',
      description: '',
      instructions: '',
      due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      max_marks: 100,
      allowed_file_types: 'zip, pdf, docx',
      max_file_size_mb: 20,
      max_submissions: 1,
      allow_resubmission: true,
      published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (assignment: any) => {
    setEditingAssignment(assignment);
    reset({
      title: assignment.title,
      course_id: assignment.course_id,
      topic_id: assignment.topic_id || '',
      description: assignment.description,
      instructions: assignment.instructions || '',
      due_at: assignment.due_at ? new Date(assignment.due_at).toISOString().slice(0, 16) : '',
      max_marks: assignment.max_marks || 100,
      allowed_file_types: (assignment.allowed_file_types || ['zip', 'pdf']).join(', '),
      max_file_size_mb: assignment.max_file_size_mb || 20,
      max_submissions: assignment.max_submissions || 1,
      allow_resubmission: assignment.allow_resubmission ?? true,
      published: assignment.published ?? true,
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = async (data: AssignmentFormData) => {
    try {
      const payload = {
        ...data,
        allowed_file_types: data.allowed_file_types
          .split(',')
          .map((s) => s.trim().toLowerCase().replace('.', ''))
          .filter(Boolean),
      };

      if (editingAssignment) {
        const res = await api.updateAssignment(editingAssignment.id, payload);
        if (res.data?.success) {
          success('Assignment updated successfully!');
          setIsModalOpen(false);
          fetchAssignments();
        }
      } else {
        const res = await api.createAssignment(payload);
        if (res.data?.success) {
          success('New assignment created and students notified!');
          setIsModalOpen(false);
          fetchAssignments();
        }
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save assignment');
    }
  };

  const handleDeleteAssignment = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${title}"?`)) return;
    try {
      const res = await api.deleteAssignment(id);
      if (res.data?.success) {
        success('Assignment deleted successfully');
        fetchAssignments();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete assignment');
    }
  };

  // Open submissions drawer for an assignment
  const handleViewSubmissions = async (assignment: any) => {
    setViewingAssignment(assignment);
    setIsLoadingSubmissions(true);
    try {
      const res = await api.getAssignmentSubmissions(assignment.id);
      if (res.data?.success) {
        setSubmissionsData(res.data.data);
      }
    } catch (err: any) {
      error('Failed to load submissions for this assignment');
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleOpenReview = (submission: any) => {
    setReviewingSubmission(submission);
    setGradingMarks(submission.marks ?? (viewingAssignment?.max_marks || 100));
    setGradingFeedback(submission.teacher_feedback || 'Great work! Solid code structure.');
  };

  const handleSaveGrade = async (status: 'graded' | 'resubmission_requested') => {
    if (!viewingAssignment || !reviewingSubmission) return;
    setIsGrading(true);
    try {
      const res = await api.gradeSubmission(viewingAssignment.id, {
        submissionId: reviewingSubmission.id,
        marks: status === 'graded' ? Number(gradingMarks) : 0,
        teacherFeedback: gradingFeedback,
        status,
      });

      if (res.data?.success) {
        success(
          status === 'graded'
            ? 'Submission graded and student notified!'
            : 'Resubmission requested from student!'
        );
        setReviewingSubmission(null);
        handleViewSubmissions(viewingAssignment);
        fetchAssignments();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to grade submission');
    } finally {
      setIsGrading(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      (a.courseTitle && a.courseTitle.toLowerCase().includes(q)) ||
      (a.topicTitle && a.topicTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-50 text-secondary-700 text-xs font-bold mb-2 border border-secondary-200/60">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Teacher Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Class Assignments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Create tasks, set file constraints, review student code, and provide feedback.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-medium rounded-2xl border border-slate-200/80 focus:outline-none focus:border-primary-600 focus:bg-white w-full sm:w-56 transition"
            />
          </div>

          <Button
            onClick={handleOpenCreateModal}
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="shadow-sm shadow-primary-500/20"
          >
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Assignments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-72 rounded-3xl" />
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900">No assignments created</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Click &quot;Create Assignment&quot; to assign a project to your students.
          </p>
          <Button onClick={handleOpenCreateModal} variant="primary" size="sm">
            Create Assignment
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => {
            const totalSubs = assignment.totalSubmissions || 0;
            const pending = assignment.pendingReview || 0;
            const graded = assignment.gradedCount || 0;

            return (
              <Card
                key={assignment.id}
                className="bg-white border border-slate-200/90 rounded-3xl shadow-xs hover:border-primary-200 hover:shadow-md transition p-6 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      {assignment.courseTitle}
                    </span>
                    <Badge variant={assignment.published ? 'emerald' : 'slate'} size="sm">
                      {assignment.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-navy-900 group-hover:text-primary-600 transition tracking-tight">
                    {assignment.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {assignment.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 pb-1 border-y border-slate-100 text-center">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Submissions</span>
                      <span className="text-sm font-black text-navy-900">{totalSubs}</span>
                    </div>
                    <div className="p-2 bg-amber-50/60 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-600 uppercase block">Pending</span>
                      <span className="text-sm font-black text-amber-700">{pending}</span>
                    </div>
                    <div className="p-2 bg-emerald-50/60 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase block">Graded</span>
                      <span className="text-sm font-black text-emerald-700">{graded}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Due {new Date(assignment.due_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span>Max {assignment.max_marks || 100} Marks</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    onClick={() => handleViewSubmissions(assignment)}
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs font-bold"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    View Submissions ({totalSubs})
                  </Button>

                  <button
                    onClick={() => handleOpenEditModal(assignment)}
                    className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-slate-100 transition"
                    title="Edit Assignment"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE / EDIT ASSIGNMENT MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden my-8"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-bold text-navy-900">
                    {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure instructions, due date, marks, and allowed file formats.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-navy-900 block mb-1">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    placeholder="e.g. HTML Semantic Web Architecture"
                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-medium rounded-xl border border-slate-200/80 focus:outline-none focus:border-primary-600 transition"
                  />
                  {errors.title && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Course & Topic Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-navy-900 block mb-1">Course *</label>
                    <select
                      {...register('course_id')}
                      className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-medium rounded-xl border border-slate-200/80 focus:outline-none focus:border-primary-600 transition"
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    {errors.course_id && (
                      <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.course_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-navy-900 block mb-1">Topic (Optional)</label>
                    <select
                      {...register('topic_id')}
                      className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-medium rounded-xl border border-slate-200/80 focus:outline-none focus:border-primary-600 transition"
                    >
                      <option value="">General Course Assignment</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date & Marks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-navy-900 block mb-1">Due Date *</label>
                    <input
                      type="datetime-local"
                      {...register('due_at')}
                      className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-medium rounded-xl border border-slate-200/80 focus:outline-none focus:border-primary-600 transition"
                    />
                    {errors.due_at && (
                      <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.due_at.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-navy-900 block mb-1">Total Marks *</label>
                    <input
                      type="number"
                      {...register('max_marks')}
                      placeholder="100"
                      className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-medium rounded-xl border border-slate-200/80 focus:outline-none focus:border-primary-600 transition"
                    />
                    {errors.max_marks && (
                      <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.max_marks.message}</p>
                    )}
                  </div>
                </div>

                {/* Allowed File Types & Max Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-navy-900 block mb-1">
                      Allowed File Formats *
                    </label>
                    <input
                      type="text"
                      {...register('allowed_file_types')}
                      placeholder="zip, pdf, docx, png, jpg"
                      className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-medium rounded-xl border border-slate-200/80 focus:outline-none focus:border-primary-600 transition"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Comma-separated: zip, pdf, docx, mp4</p>
                    {errors.allowed_file_types && (
                      <p className="text-[11px] text-rose-500 font-bold mt-1">
                        {errors.allowed_file_types.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-navy-900 block mb-1">
                      Max File Size (MB) *
                    </label>
                    <input
                      type="number"
                      {...register('max_file_size_mb')}
                      placeholder="20"
                      className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-medium rounded-xl border border-slate-200/80 focus:outline-none focus:border-primary-600 transition"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="text-xs font-bold text-navy-900 block mb-1">Short Description *</label>
                  <textarea
                    rows={2}
                    {...register('description')}
                    placeholder="Brief summary of the assignment task..."
                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-medium rounded-xl border border-slate-200/80 focus:outline-none focus:border-primary-600 transition resize-none"
                  />
                  {errors.description && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Detailed Instructions */}
                <div>
                  <label className="text-xs font-bold text-navy-900 block mb-1">
                    Requirements & Instructions *
                  </label>
                  <textarea
                    rows={4}
                    {...register('instructions')}
                    placeholder="Provide step-by-step instructions or requirements for students..."
                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-medium rounded-xl border border-slate-200/80 focus:outline-none focus:border-primary-600 transition resize-none"
                  />
                  {errors.instructions && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.instructions.message}</p>
                  )}
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register('allow_resubmission')}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-navy-900">Allow Resubmission</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register('published')}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-navy-900">Publish Immediately</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" size="md">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                    {editingAssignment ? 'Save Changes' : 'Create & Publish'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SUBMISSIONS LIST DRAWER / MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {viewingAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl overflow-hidden my-8"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="text-[10px] font-black uppercase text-primary-600 bg-blue-50 px-2 py-0.5 rounded">
                    {viewingAssignment.courseTitle}
                  </span>
                  <h3 className="text-lg font-bold text-navy-900 mt-1">
                    Submissions: {viewingAssignment.title}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingAssignment(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Submissions Stats Strip */}
              {submissionsData?.metrics && (
                <div className="grid grid-cols-4 gap-4 p-6 bg-slate-50/50 border-b border-slate-100 text-center">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total</span>
                    <span className="text-lg font-black text-navy-900">
                      {submissionsData.metrics.totalSubmissions}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-amber-200/70 shadow-2xs">
                    <span className="text-[10px] font-bold text-amber-600 uppercase block">Pending</span>
                    <span className="text-lg font-black text-amber-700">
                      {submissionsData.metrics.pendingReview}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-emerald-200/70 shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase block">Graded</span>
                    <span className="text-lg font-black text-emerald-700">
                      {submissionsData.metrics.gradedCount}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-rose-200/70 shadow-2xs">
                    <span className="text-[10px] font-bold text-rose-600 uppercase block">Missing</span>
                    <span className="text-lg font-black text-rose-700">
                      {submissionsData.metrics.missingCount}
                    </span>
                  </div>
                </div>
              )}

              {/* Submissions Table */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {isLoadingSubmissions ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : !submissionsData?.submissions || submissionsData.submissions.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-medium">
                    No submissions received yet from enrolled students.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="pb-3 pl-2">Student</th>
                          <th className="pb-3">Roll Number</th>
                          <th className="pb-3">Submitted At</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">File</th>
                          <th className="pb-3">Score</th>
                          <th className="pb-3 pr-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-navy-900">
                        {submissionsData.submissions.map((sub: any) => (
                          <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 pl-2 flex items-center gap-2.5">
                              <Avatar src={sub.studentAvatar} name={sub.studentName} size="sm" />
                              <span className="font-bold">{sub.studentName}</span>
                            </td>
                            <td className="py-3.5 text-slate-500 font-semibold">{sub.studentRoll}</td>
                            <td className="py-3.5 text-slate-500">
                              {new Date(sub.submitted_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                  sub.status === 'graded'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : sub.status === 'resubmission_requested'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-blue-50 text-primary-700'
                                }`}
                              >
                                {sub.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5">
                              {sub.file_path ? (
                                <a
                                  href={sub.file_path}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary-600 hover:underline flex items-center gap-1 font-bold"
                                >
                                  <Download className="w-3 h-3" />
                                  File
                                </a>
                              ) : (
                                <span className="text-slate-400">N/A</span>
                              )}
                            </td>
                            <td className="py-3.5 font-bold">
                              {sub.status === 'graded' ? (
                                <span className="text-emerald-600">
                                  {sub.marks} / {viewingAssignment.max_marks || 100}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-3.5 pr-2 text-right">
                              <Button
                                onClick={() => handleOpenReview(sub)}
                                size="sm"
                                variant={sub.status === 'graded' ? 'outline' : 'primary'}
                                className="text-xs font-bold"
                              >
                                Review &rarr;
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* REVIEW & GRADE SUBMISSION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {reviewingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden my-8"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    Grade Submission: {reviewingSubmission.studentName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Roll: {reviewingSubmission.studentRoll}
                  </p>
                </div>
                <button
                  onClick={() => setReviewingSubmission(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Submitted file info */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-primary-600" />
                    <div>
                      <p className="text-xs font-bold text-navy-900">{reviewingSubmission.file_name}</p>
                      <p className="text-[10px] text-slate-400">
                        {Math.round((reviewingSubmission.file_size || 0) / 1024)} KB
                      </p>
                    </div>
                  </div>
                  {reviewingSubmission.file_path && (
                    <a
                      href={reviewingSubmission.file_path}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-primary-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-primary-700 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  )}
                </div>

                {reviewingSubmission.submission_note && (
                  <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 text-xs">
                    <span className="font-bold text-navy-900 block mb-1">Student Note:</span>
                    <p className="text-slate-600 font-medium">{reviewingSubmission.submission_note}</p>
                  </div>
                )}

                {/* Score Input */}
                <div>
                  <label className="text-xs font-bold text-navy-900 block mb-1">
                    Enter Marks (Max: {viewingAssignment?.max_marks || 100})
                  </label>
                  <input
                    type="number"
                    value={gradingMarks}
                    onChange={(e) => setGradingMarks(Number(e.target.value))}
                    max={viewingAssignment?.max_marks || 100}
                    min={0}
                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-bold rounded-xl border border-slate-200/80 focus:outline-none focus:border-primary-600 transition"
                  />
                </div>

                {/* Feedback Input */}
                <div>
                  <label className="text-xs font-bold text-navy-900 block mb-1">
                    Teacher Feedback & Review Note
                  </label>
                  <textarea
                    rows={3}
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    placeholder="Provide constructive feedback for the student..."
                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-medium rounded-xl border border-slate-200/80 focus:outline-none focus:border-primary-600 transition resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    onClick={() => handleSaveGrade('resubmission_requested')}
                    variant="outline"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 border-rose-200"
                    isLoading={isGrading}
                  >
                    Request Resubmission
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleSaveGrade('graded')}
                    variant="primary"
                    size="md"
                    isLoading={isGrading}
                    className="shadow-sm shadow-primary-500/20"
                  >
                    Grade & Notify Student
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
