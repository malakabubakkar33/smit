import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar.js';
import { PublicFooter } from '../../components/layout/PublicFooter.js';
import { api } from '../../services/api.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  Code2,
  Sparkles,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Video,
  CheckCircle2,
  Laptop,
  Terminal,
  Layers,
  Database,
  Flame,
  FileCode,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<{ fullName?: string; avatarUrl?: string; bio?: string } | null>(null);

  useEffect(() => {
    api.getPublicTeacher().then(res => {
      if (res.data?.success && res.data.data) {
        setTeacher(res.data.data);
      }
    }).catch(() => {});
  }, []);

  const coursesList = [
    {
      title: 'HTML5 Semantic Web Architecture',
      slug: 'html',
      icon: FileCode,
      level: 'Beginner',
      topics: '6 Topics',
      desc: 'Master document hierarchies, accessible form validation, and semantic foundation tags.',
      color: 'blue' as const,
    },
    {
      title: 'Modern CSS3 & Responsive Design',
      slug: 'css',
      icon: Layers,
      level: 'Beginner',
      topics: '5 Topics',
      desc: 'Flexbox, CSS Grid, custom properties, smooth transitions, and Tailwind utility systems.',
      color: 'purple' as const,
    },
    {
      title: 'JavaScript Deep Dive & DOM Engineering',
      slug: 'javascript',
      icon: Terminal,
      level: 'Intermediate',
      topics: '8 Topics',
      desc: 'Asynchronous event loops, Promises, async/await, closures, and reactive DOM interfaces.',
      color: 'blue' as const,
    },
    {
      title: 'TypeScript for Production Web Apps',
      slug: 'typescript',
      icon: Code2,
      level: 'Intermediate',
      topics: '6 Topics',
      desc: 'Strong typing, generics, interfaces, union types, and production type configuration.',
      color: 'purple' as const,
    },
    {
      title: 'React 18 & Enterprise Component Architecture',
      slug: 'react',
      icon: Laptop,
      level: 'Intermediate',
      topics: '7 Topics',
      desc: 'Modern hooks, custom hook design, TanStack Query caching, and state management.',
      color: 'blue' as const,
    },
    {
      title: 'Firebase Cloud Mastery & Push Notifications',
      slug: 'firebase',
      icon: Flame,
      level: 'Advanced',
      topics: '4 Topics',
      desc: 'FCM push notifications, Firestore real-time collections, storage, and authentication.',
      color: 'amber' as const,
    },
    {
      title: 'Supabase & PostgreSQL Full-Stack Architecture',
      slug: 'supabase',
      icon: Database,
      level: 'Advanced',
      topics: '5 Topics',
      desc: 'Relational data modeling, Row-Level Security (RLS) policies, and storage buckets.',
      color: 'emerald' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-blue-100 selection:text-blue-700">
      <PublicNavbar />

      {/* Hero Section */}
      <section id="home" className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 shadow-xs mb-6">
              <Sparkles className="w-4 h-4 text-secondary-600" />
              <span className="text-xs font-bold text-navy-800 tracking-wide uppercase">
                Official Web Development Class Platform
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-navy-900 tracking-tight leading-[1.1] max-w-4xl mx-auto"
          >
            Learn. Practice.{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Build.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-navy-600 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            The dedicated classroom learning management platform for our Web Development course. Stream high-definition video lessons, complete folder-style topics, and track your progress and attendance.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={() => navigate('/signup')}
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Join Class
            </Button>
            <Button
              onClick={() => {
                const el = document.getElementById('courses');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              size="lg"
              variant="outline"
              leftIcon={<BookOpen className="w-5 h-5 text-primary-600" />}
              className="w-full sm:w-auto"
            >
              Explore Courses
            </Button>
          </motion.div>

          {/* Dashboard Preview Graphic */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 max-w-5xl mx-auto relative rounded-3xl p-3 bg-gradient-to-b from-blue-100/60 to-purple-100/40 border border-slate-200/80 shadow-2xl shadow-blue-900/10"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 text-left border border-slate-100 overflow-hidden shadow-inner">
              {/* Fake Dashboard Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-slate-400 ml-2">webcraft-classroom.internal</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Next Class: Mon & Tue @ 4:00 PM – 6:00 PM</span>
                </div>
              </div>

              {/* Sample Dashboard Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <div className="text-xs font-bold text-primary-800 uppercase tracking-wider">Active Cohort</div>
                  <div className="text-2xl font-extrabold text-navy-900 mt-2">Full-Stack Web Dev</div>
                  <div className="text-xs text-navy-600 mt-1 font-medium">Instructor: {teacher?.fullName || 'Lead Instructor'}</div>
                </div>
                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <div className="text-xs font-bold text-secondary-800 uppercase tracking-wider">Topics Mastered</div>
                  <div className="text-2xl font-extrabold text-navy-900 mt-2">38 Lessons</div>
                  <div className="text-xs text-secondary-700 mt-1 font-medium">HTML, CSS, JS, React, Supabase</div>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Class Days</div>
                  <div className="text-2xl font-extrabold text-navy-900 mt-2">Mon & Tue</div>
                  <div className="text-xs text-emerald-700 mt-1 font-medium">4:00 PM – 6:00 PM Live Attendance</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Courses Section */}
      <section id="courses" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="blue" size="md">Complete Curriculum</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-3">
              Our Courses
            </h2>
            <p className="text-sm text-navy-600 mt-2 leading-relaxed font-normal">
              From semantic markup to enterprise React and Supabase databases. Designed sequentially for comprehensive mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesList.map((course) => {
              const Icon = course.icon;
              return (
                <Card
                  key={course.slug}
                  hoverable
                  className="flex flex-col justify-between group cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition duration-200 shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant={course.color} size="sm">
                        {course.level}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-navy-900 group-hover:text-primary-600 transition tracking-tight">
                      {course.title}
                    </h3>
                    <p className="text-xs text-navy-600 mt-2 leading-relaxed">
                      {course.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-primary-500" />
                      {course.topics}
                    </span>
                    <span className="text-primary-600 group-hover:translate-x-1 transition flex items-center gap-1">
                      Learn More <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="purple" size="md">About the Classroom</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-3 leading-snug">
                One Dedicated Teacher.<br />
                A Close-Knit Class of Future Engineers.
              </h2>
              <p className="text-sm text-navy-600 mt-4 leading-relaxed font-normal">
                Unlike generic online MOOC platforms where students are left on their own, WebCraft LMS is tailored specifically for our private cohort. All lectures, code repositories, attendance records, and feedback come straight from your class instructor.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">Monday & Thursday Sessions</h4>
                    <p className="text-xs text-navy-600 mt-0.5 leading-relaxed">
                      Rigorous class schedule with verified attendance checks and lesson assignments.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">Folder-Style Topic Organization</h4>
                    <p className="text-xs text-navy-600 mt-0.5 leading-relaxed">
                      Every course is structured cleanly into modular folders and high-definition video walkthroughs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">Instant Resend & FCM Push Alerts</h4>
                    <p className="text-xs text-navy-600 mt-0.5 leading-relaxed">
                      Never miss a newly published video lesson or attendance update.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Spotlight Card */}
            <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={teacher?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"}
                  alt={teacher?.fullName || "Instructor"}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-primary-50 shadow-md"
                />
                <div>
                  <h3 className="text-lg font-bold text-navy-900">{teacher?.fullName || 'Lead Instructor'}</h3>
                  <p className="text-xs text-primary-600 font-semibold">Lead Instructor & Admin</p>
                  <p className="text-[11px] text-slate-500">SMIT Web Development Class</p>
                </div>
              </div>
              <p className="text-xs text-navy-600 italic leading-relaxed border-l-2 border-primary-500 pl-3.5 mb-6">
                "Our mission is simple: provide each student with the exact real-world engineering standards, discipline, and code review required to thrive as professional software engineers."
              </p>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Access Classroom Portal &rarr;
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-700 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Begin Your Web Development Journey?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 mt-3 max-w-xl mx-auto leading-relaxed">
            Create your student account with your Roll Number to access your custom dashboard and start watching video lessons right now.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/signup')}
              size="lg"
              className="bg-white text-primary-700 hover:bg-slate-100 shadow-xl shadow-black/10 w-full sm:w-auto font-bold"
              rightIcon={<ArrowRight className="w-5 h-5 text-primary-700" />}
            >
              Register Student Account
            </Button>
            <Button
              onClick={() => navigate('/login')}
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/10 w-full sm:w-auto border border-white/20"
            >
              Sign In to Existing Account
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
