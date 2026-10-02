import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { db } from '../config/database.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { Assignment, AssignmentSubmission } from '../models/types.js';
import { NotificationService } from '../services/notificationService.js';

export class AssignmentController {
  /**
   * GET /api/assignments
   * Get assignments list (student sees own submission status, teacher sees review stats)
   */
  public static async getAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const isTeacher = req.user.role === 'teacher';
      const studentId = req.user.userId;

      const assignments = db.assignments
        .filter((a) => (isTeacher ? true : a.published))
        .map((a) => {
          const course = db.courses.find((c) => c.id === a.course_id);
          const topic = a.topic_id ? db.topics.find((t) => t.id === a.topic_id) : null;
          const teacher = db.teacher_profiles[0] || { full_name: 'Prof. Alex Vance' };

          if (isTeacher) {
            const submissions = db.assignment_submissions.filter((s) => s.assignment_id === a.id);
            const totalSubmissions = submissions.length;
            const pendingReview = submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length;
            const gradedCount = submissions.filter((s) => s.status === 'graded').length;

            return {
              ...a,
              courseTitle: course ? course.title : 'Web Development',
              topicTitle: topic ? topic.title : 'General Curriculum',
              teacherName: teacher.full_name,
              totalSubmissions,
              pendingReview,
              gradedCount,
            };
          } else {
            // Student perspective
            const studentSubmission = db.assignment_submissions.find(
              (s) => s.assignment_id === a.id && s.student_id === studentId
            );

            const status = studentSubmission ? studentSubmission.status : 'pending';

            return {
              ...a,
              courseTitle: course ? course.title : 'Web Development',
              topicTitle: topic ? topic.title : 'General Curriculum',
              teacherName: teacher.full_name,
              submissionStatus: status,
              mySubmission: studentSubmission || null,
            };
          }
        })
        .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

      res.json({
        success: true,
        data: assignments,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/assignments/:id
   * Get single assignment with detailed requirements
   */
  public static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignmentId = String(req.params.id);
      const assignment = db.assignments.find((a) => a.id === assignmentId);
      if (!assignment) {
        res.status(404).json({ success: false, message: 'Assignment not found' });
        return;
      }

      const course = db.courses.find((c) => c.id === assignment.course_id);
      const topic = assignment.topic_id ? db.topics.find((t) => t.id === assignment.topic_id) : null;
      const teacher = db.teacher_profiles[0] || { full_name: 'Prof. Alex Vance' };

      const isStudent = req.user?.role === 'student';
      let studentSubmission: AssignmentSubmission | null = null;

      if (isStudent && req.user) {
        studentSubmission =
          db.assignment_submissions.find(
            (s) => s.assignment_id === assignmentId && s.student_id === req.user!.userId
          ) || null;
      }

      res.json({
        success: true,
        data: {
          ...assignment,
          courseTitle: course ? course.title : 'Web Development',
          topicTitle: topic ? topic.title : 'General Curriculum',
          teacherName: teacher.full_name,
          submissionStatus: studentSubmission ? studentSubmission.status : 'pending',
          mySubmission: studentSubmission,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/assignments/:id/submit
   * Student submits an assignment file + note
   */
  public static async submit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'student') {
        res.status(403).json({ success: false, message: 'Only students can submit assignments' });
        return;
      }

      const assignmentId = String(req.params.id);
      const assignment = db.assignments.find((a) => a.id === assignmentId);
      if (!assignment) {
        res.status(404).json({ success: false, message: 'Assignment not found' });
        return;
      }

      const studentId = req.user.userId;
      const existingSubmission = db.assignment_submissions.find(
        (s) => s.assignment_id === assignmentId && s.student_id === studentId
      );

      if (existingSubmission && !assignment.allow_resubmission && existingSubmission.status !== 'resubmission_requested') {
        res.status(400).json({ success: false, message: 'Resubmission is not permitted for this assignment.' });
        return;
      }

      const file = req.file;
      const { submissionNote, fileUrlFallback } = req.body;

      let filePath = '';
      let fileName = 'assignment_submission';
      let fileSize = 0;
      let fileType = 'application/octet-stream';

      if (file) {
        filePath = `/uploads/assignments/${path.basename(file.path)}`;
        fileName = file.originalname;
        fileSize = file.size;
        fileType = file.mimetype;

        // Validate allowed file extensions
        const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
        const allowed = (assignment.allowed_file_types || []).map((t) => t.toLowerCase());
        if (allowed.length > 0 && !allowed.includes(ext)) {
          res.status(400).json({
            success: false,
            message: `Invalid file type (.${ext}). Only ${allowed.map((t) => t.toUpperCase()).join(', ')} files are accepted.`,
          });
          return;
        }

        // Validate file size
        const maxBytes = (assignment.max_file_size_mb || 20) * 1024 * 1024;
        if (file.size > maxBytes) {
          res.status(400).json({
            success: false,
            message: `File exceeds maximum allowed size of ${assignment.max_file_size_mb || 20}MB.`,
          });
          return;
        }
      } else if (fileUrlFallback) {
        filePath = fileUrlFallback;
        fileName = 'submission_document.pdf';
        fileSize = 1024 * 1024;
        fileType = 'application/pdf';
      } else {
        res.status(400).json({ success: false, message: 'Please upload a PDF or image file (PNG, JPG, WEBP) to submit.' });
        return;
      }

      const studentProfile = db.student_profiles.find((p) => p.user_id === studentId);
      const studentName = studentProfile ? studentProfile.full_name : 'Student';

      let submission: AssignmentSubmission;

      if (existingSubmission) {
        existingSubmission.file_path = filePath;
        existingSubmission.file_name = fileName;
        existingSubmission.file_size = fileSize;
        existingSubmission.file_type = fileType;
        existingSubmission.submission_note = submissionNote || existingSubmission.submission_note;
        existingSubmission.status = 'submitted';
        existingSubmission.submitted_at = new Date().toISOString();
        existingSubmission.updated_at = new Date().toISOString();
        submission = existingSubmission;
      } else {
        submission = {
          id: `sub-${uuidv4().slice(0, 8)}`,
          assignment_id: assignmentId,
          student_id: studentId,
          file_path: filePath,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          submission_note: submissionNote || '',
          status: 'submitted',
          marks: null,
          teacher_feedback: null,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        db.assignment_submissions.push(submission);
      }

      db.logActivity({
        actor_user_id: studentId,
        event_type: 'ASSIGNMENT_SUBMITTED',
        title: 'Assignment Submitted',
        description: `${studentName} submitted work for "${assignment.title}".`,
        reference_type: 'assignment',
        reference_id: assignmentId,
      });

      db.save();

      // Notify teacher
      const teacherUser = db.users.find((u) => u.role === 'teacher');
      if (teacherUser) {
        await NotificationService.createNotification(
          teacherUser.id,
          'system',
          'Assignment Submission Received',
          `${studentName} submitted "${assignment.title}".`,
          'assignment',
          assignment.id
        );
      }

      res.status(200).json({
        success: true,
        message: 'Assignment submitted successfully! Your teacher will review your submission.',
        data: submission,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Submission failed' });
    }
  }

  /**
   * POST /api/assignments (Teacher Only)
   * Create assignment
   */
  public static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        res.status(403).json({ success: false, message: 'Teacher access required' });
        return;
      }

      const {
        courseId,
        topicId,
        title,
        description,
        instructions,
        requirements,
        dueAt,
        maxMarks,
        allowedFileTypes,
        maxFileSizeMb,
        maxSubmissions,
        allowResubmission,
        published,
      } = req.body;

      if (!courseId || !title || !instructions) {
        res.status(400).json({ success: false, message: 'Course, title, and instructions are required.' });
        return;
      }

      const newAssignment: Assignment = {
        id: `assign-${uuidv4().slice(0, 8)}`,
        course_id: courseId,
        topic_id: topicId || undefined,
        teacher_id: req.user.userId,
        title: title.trim(),
        description: description?.trim() || '',
        instructions: instructions.trim(),
        requirements: Array.isArray(requirements) ? requirements : ['Follow provided classroom instructions.'],
        due_at: dueAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        max_marks: Number(maxMarks) || 100,
        allowed_file_types: Array.isArray(allowedFileTypes) && allowedFileTypes.length > 0 ? allowedFileTypes : ['pdf', 'zip'],
        max_file_size_mb: Number(maxFileSizeMb) || 20,
        max_submissions: Number(maxSubmissions) || 2,
        allow_resubmission: allowResubmission !== false,
        published: published !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.assignments.push(newAssignment);

      db.logActivity({
        actor_user_id: req.user.userId,
        event_type: 'ASSIGNMENT_CREATED',
        title: 'New Assignment Published',
        description: `Published task "${newAssignment.title}".`,
        reference_type: 'assignment',
        reference_id: newAssignment.id,
      });

      db.save();

      // Notify students
      if (newAssignment.published) {
        await NotificationService.broadcastToStudents(
          'assignment_published',
          'New Assignment Available',
          `Your instructor published a new assignment: "${newAssignment.title}".`,
          'assignment',
          newAssignment.id
        );
      }

      res.status(201).json({
        success: true,
        message: 'Assignment published successfully',
        data: newAssignment,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to create assignment' });
    }
  }

  /**
   * PUT /api/assignments/:id (Teacher Only)
   */
  public static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        res.status(403).json({ success: false, message: 'Teacher access required' });
        return;
      }

      const id = String(req.params.id);
      const assignment = db.assignments.find((a) => a.id === id);
      if (!assignment) {
        res.status(404).json({ success: false, message: 'Assignment not found' });
        return;
      }

      const b = req.body;
      if (b.title) assignment.title = b.title.trim();
      if (b.description !== undefined) assignment.description = b.description.trim();
      if (b.instructions) assignment.instructions = b.instructions.trim();
      if (Array.isArray(b.requirements)) assignment.requirements = b.requirements;
      if (b.dueAt) assignment.due_at = b.dueAt;
      if (b.maxMarks) assignment.max_marks = Number(b.maxMarks);
      if (Array.isArray(b.allowedFileTypes)) assignment.allowed_file_types = b.allowedFileTypes;
      if (b.maxFileSizeMb) assignment.max_file_size_mb = Number(b.maxFileSizeMb);
      if (typeof b.allowResubmission === 'boolean') assignment.allow_resubmission = b.allowResubmission;
      if (typeof b.published === 'boolean') assignment.published = b.published;
      assignment.updated_at = new Date().toISOString();

      db.save();

      res.json({
        success: true,
        message: 'Assignment updated successfully',
        data: assignment,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Update failed' });
    }
  }

  /**
   * DELETE /api/assignments/:id (Teacher Only)
   */
  public static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        res.status(403).json({ success: false, message: 'Teacher access required' });
        return;
      }

      const id = String(req.params.id);
      const index = db.assignments.findIndex((a) => a.id === id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Assignment not found' });
        return;
      }

      db.assignments.splice(index, 1);
      // Remove submissions
      const remainingSubs = db.assignment_submissions.filter((s) => s.assignment_id !== id);
      db.assignment_submissions.length = 0;
      db.assignment_submissions.push(...remainingSubs);

      db.save();

      res.json({
        success: true,
        message: 'Assignment deleted successfully',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/assignments/:id/submissions (Teacher Only)
   */
  public static async getSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        res.status(403).json({ success: false, message: 'Teacher access required' });
        return;
      }

      const id = String(req.params.id);
      const assignment = db.assignments.find((a) => a.id === id);
      if (!assignment) {
        res.status(404).json({ success: false, message: 'Assignment not found' });
        return;
      }

      const submissions = db.assignment_submissions
        .filter((s) => s.assignment_id === id)
        .map((s) => {
          const studentProfile = db.student_profiles.find((p) => p.user_id === s.student_id);
          const studentUser = db.users.find((u) => u.id === s.student_id);
          return {
            ...s,
            studentName: studentProfile ? studentProfile.full_name : 'Unknown Student',
            rollNumber: studentProfile ? studentProfile.roll_number : 'N/A',
            avatarUrl: studentProfile ? studentProfile.avatar_url : '',
            studentEmail: studentUser ? studentUser.email : '',
          };
        })
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

      res.json({
        success: true,
        data: {
          assignment,
          submissions,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/assignments/:id/grade (Teacher Only)
   */
  public static async gradeSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        res.status(403).json({ success: false, message: 'Teacher access required' });
        return;
      }

      const assignmentId = String(req.params.id);
      const { submissionId, marks, teacherFeedback, status } = req.body;

      const submission = db.assignment_submissions.find(
        (s) => s.id === submissionId && s.assignment_id === assignmentId
      );

      if (!submission) {
        res.status(404).json({ success: false, message: 'Submission not found' });
        return;
      }

      const assignment = db.assignments.find((a) => a.id === assignmentId);
      submission.marks = marks !== undefined ? Number(marks) : submission.marks;
      submission.teacher_feedback = teacherFeedback !== undefined ? teacherFeedback : submission.teacher_feedback;
      submission.status = status || 'graded';
      submission.graded_at = new Date().toISOString();
      submission.updated_at = new Date().toISOString();

      db.logActivity({
        actor_user_id: req.user.userId,
        event_type: 'ASSIGNMENT_GRADED',
        title: 'Assignment Graded',
        description: `Graded submission for "${assignment?.title || 'an assignment'}" (${submission.marks}/${assignment?.max_marks || 100}).`,
        reference_type: 'assignment',
        reference_id: assignmentId,
      });

      db.save();

      // Notify student
      await NotificationService.createNotification(
        submission.student_id,
        submission.status === 'resubmission_requested' ? 'resubmission_requested' : 'assignment_graded',
        submission.status === 'resubmission_requested' ? 'Resubmission Requested' : 'Assignment Graded',
        submission.status === 'resubmission_requested'
          ? `Your teacher requested a resubmission for "${assignment?.title || 'Assignment'}". Feedback: ${teacherFeedback || 'Please review requirements.'}`
          : `Your assignment "${assignment?.title || 'Assignment'}" has been graded: ${submission.marks}/${assignment?.max_marks || 100} marks.`,
        'assignment',
        assignmentId
      );

      res.json({
        success: true,
        message: 'Submission graded successfully',
        data: submission,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Grading failed' });
    }
  }
}
