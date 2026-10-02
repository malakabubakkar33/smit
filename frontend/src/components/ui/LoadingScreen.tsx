import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <div className="relative flex items-center justify-center">
          {/* Animated Glow Halo */}
          <div className="absolute w-24 h-24 bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 rounded-3xl blur-xl animate-pulse" />
          
          {/* Logo Brand Icon */}
          <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-600 via-primary-500 to-secondary-600 shadow-xl shadow-primary-500/25 flex items-center justify-center text-white">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>

        <div className="mt-5 text-center">
          <h2 className="text-xl font-extrabold text-navy-900 tracking-tight">SMIT Web Class</h2>
          <p className="text-xs font-semibold text-primary-600 tracking-wider uppercase mt-0.5">Education Platform</p>
        </div>

        {/* Minimalist Spinner */}
        <div className="mt-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-secondary-600 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </motion.div>
    </div>
  );
};
