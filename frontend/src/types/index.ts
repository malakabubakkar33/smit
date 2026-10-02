export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  role: UserRole;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  rollNumber?: string;
  mobileNumber?: string;
  isDropped?: boolean;
  droppedReason?: string;
  droppedAt?: string;
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
  created_at: string;
  is_dropped?: boolean;
  dropped_reason?: string;
  dropped_at?: string;
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
  topicsCount?: number;
  videosCount?: number;
  completedVideosCount?: number;
  progressPercentage?: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  videos?: Video[];
  videoCount?: number;
  completedCount?: number;
  isCompleted?: boolean;
}

export interface Video {
  id: string;
  course_id: string;
  topic_id: string;
  title: string;
  description: string;
  video_url: string;
  storage_path?: string;
  thumbnail_url?: string;
  duration: string;
  order_index: number;
  isCompleted?: boolean;
  topicTitle?: string;
  created_at: string;
}

export interface VideoProgress {
  id: string;
  student_id: string;
  video_id: string;
  watched: boolean;
  completed: boolean;
  progress_seconds: number;
  completed_at?: string | null;
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
  start_time: string;
  end_time: string;
  status: 'active' | 'closed';
  initiated_by: string;
  message?: string;
  created_at: string;
  closed_at?: string;
  responses: AttendanceSessionResponse[];
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  class_day: ClassDay;
  status: AttendanceStatus;
  marked_by: string;
  created_at: string;
}

export interface StudentAttendanceSummary {
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  percentage: number;
  records: AttendanceRecord[];
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  related_entity_id?: string;
  is_read: boolean;
  created_at: string;
}
