import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Play,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Folder,
  Clock,
  Sparkles,
} from 'lucide-react';

export const VideoLessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, info } = useToast();

  const [lessonData, setLessonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchLesson = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await api.getVideoById(id);
      if (res.data?.success) {
        const data = res.data.data;
        setLessonData(data);
        setIsCompleted(data.progress?.completed || false);
      }
    } catch (err) {
      console.error('Failed to load video lesson', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const handleToggleComplete = async () => {
    if (!id) return;
    const newStatus = !isCompleted;
    setIsSaving(true);
    try {
      const currentTime = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;
      await api.updateVideoProgress(id, {
        completed: newStatus,
        progressSeconds: currentTime,
      });
      setIsCompleted(newStatus);
      if (newStatus) {
        success('Lesson marked as completed! Course progress updated.', 'Great Job! 🎉');
      } else {
        info('Lesson marked as incomplete.');
      }
    } catch (err) {
      console.error('Failed to update progress', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVideoEnded = async () => {
    if (!isCompleted && id) {
      try {
        await api.updateVideoProgress(id, { completed: true, progressSeconds: 100 });
        setIsCompleted(true);
        success('You finished watching the lesson! Progress recorded.', 'Lesson Completed! 🚀');
      } catch (e) {}
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="aspect-video w-full rounded-3xl" />
          <Skeleton className="h-10 w-3/4 rounded-xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-[500px] w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-navy-900">Lesson Not Found</h3>
        <Button onClick={() => navigate('/student/courses')} className="mt-4" variant="primary">
          Back to Courses
        </Button>
      </div>
    );
  }

  const { video, course, topic, teacher, allCourseVideos, prevVideoId, nextVideoId } = lessonData;

  const uniqueCourseVideos = Array.from(
    new Map(((allCourseVideos || []) as any[]).map((v: any) => [v.id, v])).values()
  );

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          to={`/student/courses/${course.id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {course.title}
        </Link>

        <div className="flex items-center gap-2">
          {prevVideoId ? (
            <Button
              onClick={() => navigate(`/student/videos/${prevVideoId}`)}
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Previous
            </Button>
          )}

          {nextVideoId ? (
            <Button
              onClick={() => navigate(`/student/videos/${nextVideoId}`)}
              variant="primary"
              size="sm"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next Lesson
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled rightIcon={<ChevronRight className="w-4 h-4" />}>
              Next Lesson
            </Button>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Video Player & Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Video Player */}
          <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl shadow-blue-900/15 aspect-video border border-slate-900">
            <video
              ref={videoRef}
              src={video.video_url}
              controls
              onEnded={handleVideoEnded}
              className="w-full h-full object-contain"
              poster={video.thumbnail_url || course.thumbnail_url}
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Metadata & Actions Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="blue" size="sm">{course.title}</Badge>
                  <span className="text-xs text-slate-400 font-semibold">• {topic.title}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 tracking-tight">
                  {video.title}
                </h1>
              </div>

              {/* Mark as Completed Button */}
              <Button
                onClick={handleToggleComplete}
                variant={isCompleted ? 'secondary' : 'primary'}
                size="md"
                isLoading={isSaving}
                className={isCompleted ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'shadow-soft-blue'}
                leftIcon={isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              >
                {isCompleted ? 'Completed' : 'Mark as Completed'}
              </Button>
            </div>

            {/* Instructor Info */}
            <div className="flex items-center gap-4">
              <Avatar
                src={teacher.avatar_url}
                name={teacher.full_name}
                size="lg"
                className="ring-2 ring-primary-100"
              />
              <div>
                <h4 className="text-sm font-bold text-navy-900">{teacher.full_name}</h4>
                <p className="text-xs text-slate-500 font-medium">Class Instructor • SMIT Web Class</p>
              </div>
            </div>

            {/* Lesson Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lesson Overview</h4>
              <p className="text-xs sm:text-sm text-navy-700 leading-relaxed font-normal whitespace-pre-line">
                {video.description || `Comprehensive lesson tutorial on ${video.title}. Follow along in your IDE and submit any questions during our Monday/Thursday sessions.`}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Course Contents Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden sticky top-24">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <h3 className="text-sm font-bold text-navy-900">Course Contents</h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {uniqueCourseVideos.filter((v: any) => v.isCompleted).length} of {uniqueCourseVideos.length} lessons completed
            </p>
          </div>

          <div className="max-h-[550px] overflow-y-auto divide-y divide-slate-100">
            {uniqueCourseVideos.map((item: any, idx: number) => {
              const isCurrent = item.id === video.id;

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/student/videos/${item.id}`)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition ${
                    isCurrent ? 'bg-blue-50/70 border-l-4 border-primary-600' : ''
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {item.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <Play className="w-4 h-4 text-primary-600 fill-primary-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-primary-700' : 'text-navy-900'
                      }`}
                    >
                      {idx + 1}. {item.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {item.topicTitle}
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.duration}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
