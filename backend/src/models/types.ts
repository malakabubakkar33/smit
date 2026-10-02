export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  role: UserRole;
  username: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  is_dropped?: boolean;
  dropped_reason?: string;
  dropped_at?: string;
  is_setup_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  email: string;
  mobile_number: string;
  roll_number: string;
  avatar_url: string;
  show_on_public_directory?: boolean;
  is_dropped?: boolean;
  dropped_reason?: string;
  dropped_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  email: string;
  mobile_number: string;
  avatar_url: string;
  bio: string;
  is_setup_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  created_by: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  course_id: string;
  topic_id: string;
  title: string;
  description: string;
  video_url: string;
  storage_path: string;
  thumbnail_url: string;
  duration: string;
  order_index: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export type ClassDay = 'monday' | 'tuesday' | 'thursday';
export type AttendanceStatus = 'present' | 'absent' | 'leave';

export interface AttendanceSessionResponse {
  student_id: string;
  student_name: string;
  roll_number: string;
  avatar_url?: string;
  status: 'submitted' | 'approved' | 'rejected';
  submitted_at: string;
  approved_at?: string;
}

export interface AttendanceSession {
  id: string;
  date: string; // YYYY-MM-DD
  class_day: ClassDay;
  start_time: string; // "16:00"
  end_time: string; // "18:00"
  status: 'active' | 'closed';
  initiated_by: string; // teacher user id
  message?: string;
  created_at: string;
  closed_at?: string;
  responses: AttendanceSessionResponse[];
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string; // YYYY-MM-DD
  class_day: ClassDay;
  status: AttendanceStatus;
  marked_by: string;
  created_at: string;
  updated_at: string;
}

export interface VideoProgress {
  id: string;
  student_id: string;
  video_id: string;
  watched: boolean;
  completed: boolean;
  progress_seconds: number;
  completed_at?: string | null;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type:
    | 'video_uploaded'
    | 'course_update'
    | 'topic_created'
    | 'attendance_marked'
    | 'attendance_request'
    | 'assignment_published'
    | 'assignment_graded'
    | 'resubmission_requested'
    | 'attendance_warning'
    | 'student_dropped'
    | 'system';
  title: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationToken {
  id: string;
  user_id: string;
  token: string;
  device_info: string;
  created_at: string;
}

export interface PasswordReset {
  id: string;
  user_id: string;
  email: string;
  otp: string;
  token?: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export type ActivityEventType =
  | 'STUDENT_REGISTERED'
  | 'TEACHER_SETUP'
  | 'COURSE_CREATED'
  | 'COURSE_UPDATED'
  | 'TOPIC_CREATED'
  | 'VIDEO_UPLOADED'
  | 'ATTENDANCE_MARKED'
  | 'LESSON_COMPLETED'
  | 'ASSIGNMENT_CREATED'
  | 'ASSIGNMENT_SUBMITTED'
  | 'ASSIGNMENT_GRADED'
  | 'USER_PASSWORD_RESET';

export interface ActivityLog {
  id: string;
  actor_user_id: string;
  event_type: ActivityEventType;
  title: string;
  description: string;
  reference_type?: string;
  reference_id?: string;
  created_at: string;
}

export interface ClassSettings {
  id: string;
  class_name: string;
  teacher_id: string;
  class_days: string[]; // ['monday', 'thursday']
  class_start_time: string; // '18:00'
  class_end_time: string; // '20:30'
  timezone: string; // 'Asia/Karachi'
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  topic_id?: string;
  teacher_id: string;
  title: string;
  description: string;
  instructions: string;
  requirements?: string[];
  due_at: string;
  max_marks: number;
  allowed_file_types: string[]; // e.g. ['pdf', 'zip', 'docx', 'png', 'jpg']
  max_file_size_mb: number; // e.g. 20
  max_submissions: number;
  allow_resubmission: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type SubmissionStatus = 'submitted' | 'under_review' | 'graded' | 'resubmission_requested';

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  submission_note?: string;
  status: SubmissionStatus;
  marks?: number | null;
  teacher_feedback?: string | null;
  submitted_at: string;
  graded_at?: string | null;
  updated_at: string;
}

