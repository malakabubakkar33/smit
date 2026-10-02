import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import {
  ShieldAlert,
  AlertOctagon,
  LogOut,
  Mail,
  Calendar,
  Clock,
  UserX,
  FileWarning
} from 'lucide-react';

export const StudentDroppedPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Main Error Box */}
        <Card className="bg-slate-800/90 border-red-500/30 backdrop-blur-xl shadow-2xl p-8 text-center relative overflow-hidden">
          {/* Subtle Top Red Glow Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

          {/* Warning Icon Badge */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-inner">
            <ShieldAlert className="w-10 h-10 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold tracking-wider uppercase mb-3">
            <AlertOctagon className="w-3.5 h-3.5" />
            Class Expulsion Notice
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Enrollment Terminated
          </h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Your enrollment in the <span className="text-white font-medium">SMIT Web Development Cohort</span> has been discontinued due to critical attendance deficit.
          </p>

          {/* Details Card */}
          <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-700/50 text-left mb-6 space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Student Name:</span>
              <span className="text-white font-semibold">{user?.fullName || 'Enrolled Student'}</span>
            </div>
            {user?.rollNumber && (
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Roll Number:</span>
                <span className="text-amber-400 font-mono font-semibold">{user.rollNumber}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Class Schedule:</span>
              <span className="text-slate-300 font-medium">Mon & Tue • 4:00 PM – 6:00 PM</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Enrollment Status:</span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                DROPPED / EXPELLED
              </span>
            </div>
            <div className="pt-1">
              <span className="text-slate-400 text-xs block mb-1">Termination Rationale:</span>
              <p className="text-xs text-rose-300 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40 leading-relaxed font-mono">
                {user?.droppedReason || 'Institutional attendance below minimum requirement (<65%). Mandatory threshold is 70%.'}
              </p>
            </div>
          </div>

          {/* Appeal Information */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-left text-xs text-amber-300/90 leading-relaxed mb-6 flex items-start gap-3">
            <FileWarning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300 mb-1">Academic Appeal Process:</p>
              Students seeking reinstatement must submit an official appeal request to class instructor <span className="font-semibold text-white">Sir Tatheer</span> during scheduled campus office hours.
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-700/50"
              onClick={() => {
                window.location.href = 'mailto:tatheer@smit.edu.pk?subject=Enrollment Appeal - ' + (user?.rollNumber || '');
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Instructor
            </Button>
            <Button
              variant="danger"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
