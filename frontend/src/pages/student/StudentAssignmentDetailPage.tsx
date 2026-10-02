import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { getMediaUrl } from '../../utils/media.js';
import { useToast } from '../../context/ToastContext.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Award,
  Upload,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  Download,
  MessageSquare,
  Sparkles,
  Info,
  Check,
  X,
  FileImage,
  Eye,
  File
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StudentAssignmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const [assignment, setAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showResubmitForm, setShowResubmitForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssignment = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await api.getAssignmentById(id);
      if (res.data?.success) {
        setAssignment(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load assignment', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [selectedFile]);

  const handleFileSelect = (file: File) => {
    setValidationError(null);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    // Strictly forbid zip and archive formats
    if (['zip', 'rar', 'tar', 'gz', '7z', 'bz2'].includes(ext)) {
      setValidationError('ZIP and archive files are not allowed. Please submit your work as a PDF document or image (PNG, JPG, WEBP).');
      return;
    }

    const allowed = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
    if (!allowed.includes(ext)) {
      setValidationError(`Invalid file format (.${ext}). Only PDF and Image files (PNG, JPG, WEBP) are accepted.`);
      return;
    }

    // Validate size
    const maxMb = assignment?.max_file_size_mb || 25;
    if (file.size > maxMb * 1024 * 1024) {
      setValidationError(`File exceeds maximum size of ${maxMb}MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError('Please select a PDF or image file to submit.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(15);

    // Simulate animated upload progress
    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('submissionNote', submissionNote);

      const res = await api.submitAssignment(id!, formData);
      clearInterval(timer);
      setUploadProgress(100);

      if (res.data?.success) {
        success('Your assignment has been submitted successfully!', 'Submission Complete 🎉');
        setSelectedFile(null);
        setSubmissionNote('');
        setShowResubmitForm(false);
        fetchAssignment();
      } else {
        error(res.data?.message || 'Failed to submit assignment');
      }
    } catch (err: any) {
      clearInterval(timer);
      error(err.response?.data?.message || 'Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <Card className="p-12 text-center max-w-lg mx-auto my-12 bg-white/80 rounded-3xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-navy-900">Assignment Not Found</h3>
        <Button onClick={() => navigate('/student/assignments')} variant="primary" className="mt-4">
          Back to Assignments
        </Button>
      </Card>
    );
  }

  const submission = assignment.mySubmission;
  const isSubmitted = !!submission;
  const canResubmit = assignment.allow_resubmission || submission?.status === 'resubmission_requested';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12 max-w-5xl mx-auto"
    >
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/student/assignments')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-navy-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </button>
      </div>

      {/* Assignment Header Card */}
      <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60 shadow-2xs">
                {assignment.courseTitle}
              </span>
              <span className="text-xs text-slate-400 font-semibold">• {assignment.topicTitle}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              {assignment.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              {assignment.description}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start sm:items-end gap-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-secondary-700 font-bold text-xs border border-purple-200/60 shadow-2xs">
              <Award className="w-4 h-4 text-secondary-600" />
              <span>{assignment.max_marks || 100} Points</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Instructor: {assignment.teacherName}
            </span>
          </div>
        </div>

        {/* Assignment Meta Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Due Date</span>
            <span className="text-xs font-bold text-navy-900 mt-1 block">
              {new Date(assignment.due_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 block">Accepted Formats</span>
            <span className="text-xs font-black text-primary-800 mt-1 block">
              PDF & Images Only
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Max File Size</span>
            <span className="text-xs font-bold text-navy-900 mt-1 block">
              {assignment.max_file_size_mb || 25} MB
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Resubmission</span>
            <span className="text-xs font-bold text-navy-900 mt-1 block">
              {assignment.allow_resubmission ? 'Allowed' : 'Single Attempt'}
            </span>
          </div>
        </div>

        {/* Instructions & Requirements */}
        {assignment.instructions && (
          <div className="p-5 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-2">
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary-600" />
              Submission Instructions
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {assignment.instructions}
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUBMISSION STATUS / FEEDBACK CARD */}
      {/* ========================================================================= */}
      {isSubmitted && !showResubmitForm && (
        <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Submission</span>
              <h3 className="text-lg font-bold text-navy-900 tracking-tight mt-0.5">
                Status:{' '}
                <span className="capitalize text-primary-600 font-extrabold">
                  {submission.status.replace('_', ' ')}
                </span>
              </h3>
            </div>

            {submission.status === 'graded' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-base shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>
                  {submission.marks} / {assignment.max_marks || 100} Marks
                </span>
              </div>
            )}
          </div>

          {/* Graded Feedback Box */}
          {submission.teacher_feedback && (
            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Instructor Review & Feedback:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                &quot;{submission.teacher_feedback}&quot;
              </p>
            </div>
          )}

          {/* Submitted File Info */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary-600 shadow-2xs">
                {submission.file_name?.endsWith('.pdf') ? (
                  <FileText className="w-5 h-5 text-rose-600" />
                ) : (
                  <FileImage className="w-5 h-5 text-primary-600" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-navy-900">{submission.file_name}</p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Submitted on {new Date(submission.submitted_at).toLocaleString()} •{' '}
                  {Math.round((submission.file_size || 0) / 1024)} KB
                </p>
              </div>
            </div>

            {submission.file_path && (
              <a
                href={getMediaUrl(submission.file_path)}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-xl hover:bg-white transition border border-slate-200/60 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download / View File
              </a>
            )}
          </div>

          {submission.submission_note && (
            <div className="text-xs text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <span className="font-bold text-navy-900 block mb-1">Your Submission Note:</span>
              {submission.submission_note}
            </div>
          )}

          {/* Resubmit CTA if allowed */}
          {canResubmit && (
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                {submission.status === 'resubmission_requested'
                  ? 'Your instructor requested an updated submission.'
                  : 'You are permitted to submit an updated version.'}
              </p>
              <Button onClick={() => setShowResubmitForm(true)} variant="outline" size="sm">
                Resubmit Assignment
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* UPLOAD FORM (FOR NEW SUBMISSION OR RESUBMISSION) */}
      {/* ========================================================================= */}
      {(!isSubmitted || showResubmitForm) && (
        <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-extrabold text-navy-900 tracking-tight">
                {showResubmitForm ? 'Resubmit Assignment' : 'Submit Your Work'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Upload your assignment as a <strong>PDF document</strong> or <strong>image file (PNG, JPG, WEBP)</strong>.
              </p>
            </div>
            {showResubmitForm && (
              <Button onClick={() => setShowResubmitForm(false)} variant="ghost" size="sm">
                Cancel
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-primary-500 hover:bg-blue-50/40 transition-all rounded-3xl p-8 text-center cursor-pointer bg-slate-50/60 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div className="w-14 h-14 rounded-2xl bg-white text-primary-600 flex items-center justify-center mx-auto mb-3 shadow-xs border border-slate-200/80 group-hover:scale-105 transition">
                <Upload className="w-6 h-6" />
              </div>

              <h4 className="text-sm font-bold text-navy-900">
                Choose a PDF or Image from your device
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Accepted: <strong>PDF, PNG, JPG, WEBP</strong> • Max file size: {assignment.max_file_size_mb || 25}MB
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/60">
                <X className="w-3 h-3 stroke-[3]" /> ZIP files are not allowed
              </div>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Selected File Preview Card */}
            {selectedFile && (
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-blue-200 shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white text-rose-600 border border-slate-200 flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
                      PDF
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-navy-900 truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {Math.round(selectedFile.size / 1024)} KB • Ready to submit
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-white rounded-lg transition border border-rose-200 shrink-0 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            )}

            {/* Upload Progress Bar */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Uploading work...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all duration-200 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submission Note Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-navy-800 uppercase tracking-wide">
                Submission Comments / Note (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Include any notes or references for your instructor..."
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-navy-900 rounded-2xl border border-slate-200/90 focus:border-primary-600 focus:outline-none p-3.5 transition"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                disabled={!selectedFile || isSubmitting}
                leftIcon={<Upload className="w-4 h-4" />}
                className="shadow-sm shadow-primary-500/20"
              >
                {showResubmitForm ? 'Upload Updated Submission' : 'Submit Assignment'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </motion.div>
  );
};
