import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-navy-900 tracking-tight">
                SMIT Web Class
              </span>
            </Link>
            <p className="text-sm text-slate-500 font-medium">
              Modern Web Development Learning Platform
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              A dedicated educational space where students master modern frontend, backend, and full-stack engineering through structured guidance.
            </p>
          </div>

          {/* Explore Column */}
          <div>
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
              <li>
                <Link to="/" className="hover:text-primary-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-primary-600 transition">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-primary-600 transition">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Class Column */}
          <div>
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-4">
              Class
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
              <li>
                <Link to="/students" className="hover:text-primary-600 transition">
                  Students
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-600 transition">
                  About Class
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-600 transition">
                  Schedule (Mon & Thu)
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Column */}
          <div>
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-4">
              Account
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link to="/login" className="text-slate-600 hover:text-primary-600 transition">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-slate-600 hover:text-primary-600 transition">
                  Join Class
                </Link>
              </li>
              <li>
                <Link to="/student/dashboard" className="text-slate-600 hover:text-primary-600 transition">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/teacher/dashboard" className="text-slate-600 hover:text-primary-600 transition">
                  Teacher Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-4">
          <p>&copy; 2026 SMIT Web Class. All rights reserved.</p>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary-500" />
              Light Theme
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
              Secure Learning Platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
