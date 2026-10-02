import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { Course } from '../models/types.js';

export interface CourseWithStats extends Course {
  topicsCount: number;
  videosCount: number;
  completedVideosCount?: number;
  progressPercentage?: number;
}

export class CourseService {
  /**
   * Get all courses with topic and video counts, plus student progress if studentId is provided
   */
  public static getAllCourses(studentId?: string): CourseWithStats[] {
    return db.courses.map(course => {
      const courseTopics = db.topics.filter(t => t.course_id === course.id);
      const courseVideos = db.videos.filter(v => v.course_id === course.id);

      let completedVideosCount = 0;
      let progressPercentage = 0;

      if (studentId) {
        const studentProgress = db.video_progress.filter(
          vp => vp.student_id === studentId && vp.completed
        );
        const completedVideoIds = new Set(studentProgress.map(vp => vp.video_id));
        completedVideosCount = courseVideos.filter(v => completedVideoIds.has(v.id)).length;
        progressPercentage = courseVideos.length > 0
          ? Math.round((completedVideosCount / courseVideos.length) * 100)
          : 0;
      }

      return {
        ...course,
        topicsCount: courseTopics.length,
        videosCount: courseVideos.length,
        completedVideosCount,
        progressPercentage,
      };
    });
  }

  /**
   * Get single course details with structured topics and lessons
   */
  public static getCourseDetails(courseIdOrSlug: string, studentId?: string) {
    const course = db.courses.find(c => c.id === courseIdOrSlug || c.slug === courseIdOrSlug);
    if (!course) throw new Error('Course not found');

    const topics = db.topics
      .filter(t => t.course_id === course.id)
      .sort((a, b) => a.order_index - b.order_index);

    const studentCompletedSet = new Set(
      studentId
        ? db.video_progress
            .filter(vp => vp.student_id === studentId && vp.completed)
            .map(vp => vp.video_id)
        : []
    );

    const detailedTopics = topics.map(topic => {
      const topicVideos = db.videos
        .filter(v => v.topic_id === topic.id)
        .sort((a, b) => a.order_index - b.order_index)
        .map(v => ({
          ...v,
          isCompleted: studentCompletedSet.has(v.id),
        }));

      const completedInTopic = topicVideos.filter(v => v.isCompleted).length;

      return {
        ...topic,
        videos: topicVideos,
        videoCount: topicVideos.length,
        completedCount: completedInTopic,
        isCompleted: topicVideos.length > 0 && completedInTopic === topicVideos.length,
      };
    });

    const allVideos = db.videos.filter(v => v.course_id === course.id);
    const totalCompleted = allVideos.filter(v => studentCompletedSet.has(v.id)).length;
    const progressPercentage = allVideos.length > 0
      ? Math.round((totalCompleted / allVideos.length) * 100)
      : 0;

    return {
      course,
      topics: detailedTopics,
      totalTopics: topics.length,
      totalVideos: allVideos.length,
      totalCompleted,
      progressPercentage,
    };
  }

  /**
   * Create Course (Teacher Only)
   */
  public static createCourse(
    teacherId: string,
    data: {
      title: string;
      description: string;
      level?: 'Beginner' | 'Intermediate' | 'Advanced';
      thumbnail_url?: string;
      is_published?: boolean;
    }
  ): Course {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCourse: Course = {
      id: `course-${slug}-${Date.now().toString().slice(-4)}`,
      title: data.title,
      slug,
      description: data.description,
      level: data.level || 'Beginner',
      thumbnail_url: data.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
      created_by: teacherId,
      is_published: data.is_published ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.courses.push(newCourse);
    db.save();

    db.logActivity({
      actor_user_id: teacherId,
      event_type: 'COURSE_CREATED',
      title: 'New Course Created',
      description: `Created new course "${newCourse.title}".`,
      reference_type: 'course',
      reference_id: newCourse.id,
    });

    return newCourse;
  }

  /**
   * Update Course (Teacher Only)
   */
  public static updateCourse(courseId: string, data: Partial<Course>): Course {
    const course = db.courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');

    if (data.title) {
      course.title = data.title;
      course.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (data.description) course.description = data.description;
    if (data.thumbnail_url) course.thumbnail_url = data.thumbnail_url;
    if (data.level) course.level = data.level;
    if (typeof data.is_published === 'boolean') course.is_published = data.is_published;
    course.updated_at = new Date().toISOString();

    db.save();

    db.logActivity({
      actor_user_id: course.created_by,
      event_type: 'COURSE_UPDATED',
      title: 'Course Updated',
      description: `Updated curriculum details for "${course.title}".`,
      reference_type: 'course',
      reference_id: course.id,
    });

    return course;
  }

  /**
   * Delete Course (Teacher Only)
   */
  public static deleteCourse(courseId: string): void {
    const index = db.courses.findIndex(c => c.id === courseId);
    if (index === -1) throw new Error('Course not found');

    db.courses.splice(index, 1);
    // Cascade delete topics and videos
    const remainingTopics = db.topics.filter(t => t.course_id !== courseId);
    db.topics.length = 0;
    db.topics.push(...remainingTopics);

    const remainingVideos = db.videos.filter(v => v.course_id !== courseId);
    db.videos.length = 0;
    db.videos.push(...remainingVideos);

    db.save();
  }
}
