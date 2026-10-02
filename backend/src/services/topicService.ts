import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { Topic } from '../models/types.js';

export class TopicService {
  public static getTopicsByCourse(courseId: string): Topic[] {
    return db.topics
      .filter(t => t.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  public static createTopic(courseId: string, title: string, description: string = ''): Topic {
    const course = db.courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');

    const existingInCourse = db.topics.filter(t => t.course_id === courseId);
    const orderIndex = existingInCourse.length + 1;

    const topic: Topic = {
      id: `topic-${uuidv4().slice(0, 8)}`,
      course_id: courseId,
      title: title.trim(),
      description: description.trim(),
      order_index: orderIndex,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.topics.push(topic);
    db.save();

    db.logActivity({
      actor_user_id: course.created_by,
      event_type: 'TOPIC_CREATED',
      title: 'New Topic Added',
      description: `Added topic "${topic.title}" to ${course.title}.`,
      reference_type: 'topic',
      reference_id: topic.id,
    });

    return topic;
  }

  public static updateTopic(topicId: string, title: string, description?: string): Topic {
    const topic = db.topics.find(t => t.id === topicId);
    if (!topic) throw new Error('Topic not found');

    topic.title = title.trim();
    if (description !== undefined) topic.description = description.trim();
    topic.updated_at = new Date().toISOString();

    db.save();
    return topic;
  }

  public static deleteTopic(topicId: string): void {
    const index = db.topics.findIndex(t => t.id === topicId);
    if (index === -1) throw new Error('Topic not found');

    db.topics.splice(index, 1);
    // Cascade delete topic videos
    const remainingVideos = db.videos.filter(v => v.topic_id !== topicId);
    db.videos.length = 0;
    db.videos.push(...remainingVideos);

    db.save();
  }
}
