import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { Button } from './Button.js';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with smooth blur and fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/80 shadow-2xl space-y-6"
            role="dialog"
            aria-modal="true"
          >
            {/* Close cross button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon & Heading */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <LogOut className="w-6 h-6 text-rose-600" />
              </div>

              <div className="space-y-1 pr-6">
                <h3 className="text-lg font-extrabold text-navy-900 tracking-tight">
                  Sign Out Confirmation
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {userName ? (
                    <>
                      Are you sure you want to end your session, <strong className="text-navy-800">{userName}</strong>?
                    </>
                  ) : (
                    'Are you sure you want to sign out of your SMIT Web Class account?'
                  )}
                </p>
              </div>
            </div>

            {/* Informational Callout */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-800 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>You will need your username/roll number and password to sign back in.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-xl font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onClose();
                  onConfirm();
                }}
                leftIcon={<LogOut className="w-4 h-4" />}
                className="rounded-xl font-bold shadow-md shadow-rose-500/20"
              >
                Yes, Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
