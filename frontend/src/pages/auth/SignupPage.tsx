import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Code2, ArrowRight, ArrowLeft, Check, User, Mail, Phone, Hash, Lock, Camera, Sparkles, GraduationCap, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    mobileNumber: '',
    rollNumber: '',
    email: '',
    avatarUrl: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.username.trim() || formData.username.length < 3)
      errs.username = 'Username must be at least 3 alphanumeric characters';
    if (!formData.mobileNumber.trim()) errs.mobileNumber = 'Mobile number is required';
    if (!formData.rollNumber.trim()) errs.rollNumber = 'Roll number is required (e.g. WD-2026-004)';
    if (!formData.email.trim() || !formData.email.includes('@'))
      errs.email = 'Please provide a valid email address';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!formData.password || formData.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsLoading(true);
    try {
      await signup(formData);
      success('Student account created successfully! Welcome to the classroom.', 'Registration Complete');
      navigate('/student/dashboard');
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="inline-flex items-center gap-2.5 text-navy-900 hover:text-primary-600 transition font-bold text-sm">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>SMIT Web Class</span>
        </Link>
      </div>

      <div className="max-w-xl w-full mx-auto">
        {/* Step Indicator Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Create Student Account
          </h2>
          <p className="text-xs text-navy-500 mt-2 font-medium">
            Join the Web Development class in 3 quick steps
          </p>

          {/* Stepper Progress */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                    step === s
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25 ring-4 ring-primary-100'
                      : step > s
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 h-1 rounded-full transition-all ${
                      step > s ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl sm:rounded-4xl shadow-soft-lg border border-slate-200/80 p-8 sm:p-10">
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-navy-900">Step 1: Student Information</h3>
                  <p className="text-xs text-slate-500">Provide your official class enrollment details.</p>
                </div>

                <Input
                  label="Full Name"
                  placeholder="e.g. Sarah Chen"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  error={errors.fullName}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Username"
                    placeholder="e.g. sarahc"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    error={errors.username}
                    leftIcon={<User className="w-4 h-4" />}
                  />
                  <div className="space-y-1">
                    <Input
                      label="Roll Number (Institutional ID)"
                      placeholder="e.g. WD-2026-004"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      error={errors.rollNumber}
                      leftIcon={<Hash className="w-4 h-4" />}
                    />
                    <p className="text-[10px] text-slate-400 font-medium pl-1">
                      Must be strictly unique. Permanent and cannot be modified after registration.
                    </p>
                  </div>
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. sarah.chen@student.smit.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Mobile Number"
                  type="tel"
                  placeholder="e.g. +1 (555) 234-5678"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  error={errors.mobileNumber}
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={handleNextStep}
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Profile Picture
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Upload Profile Picture From Device */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="text-left">
                  <h3 className="text-lg font-bold text-navy-900">Step 2: Upload Profile Picture</h3>
                  <p className="text-xs text-slate-500">Upload your real profile photo directly from your device.</p>
                </div>

                {/* Main Avatar Preview */}
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <Avatar
                      src={formData.avatarUrl}
                      name={formData.fullName || 'Student'}
                      size="xl"
                      className="ring-4 ring-primary-100 shadow-md w-28 h-28 text-3xl"
                    />
                    <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-primary-700 transition">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setIsUploadingPhoto(true);
                            setPhotoUploadError(null);
                            try {
                              const uploadData = new FormData();
                              uploadData.append('avatar', file);
                              const res = await api.uploadAvatar(uploadData);
                              if (res.data?.success && res.data.data?.avatarUrl) {
                                setFormData({ ...formData, avatarUrl: res.data.data.avatarUrl });
                              }
                            } catch (err: any) {
                              setPhotoUploadError(err.response?.data?.message || 'Failed to upload photo');
                            } finally {
                              setIsUploadingPhoto(false);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  <span className="text-xs font-semibold text-navy-800 mt-3">{formData.fullName}</span>
                </div>

                {/* Upload Button Box */}
                <div className="p-6 bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-300 hover:border-primary-500 transition text-center space-y-3">
                  <Upload className="w-8 h-8 text-primary-600 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-navy-900">Upload Image from your Device</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Supports JPG, PNG, WEBP up to 10MB</p>
                  </div>

                  <label className="inline-block">
                    <span className="px-4 py-2 bg-white border border-slate-200 hover:border-primary-500 text-primary-600 text-xs font-bold rounded-xl shadow-2xs cursor-pointer inline-flex items-center gap-2 hover:bg-blue-50/50 transition">
                      <Camera className="w-3.5 h-3.5" />
                      {isUploadingPhoto ? 'Uploading from device...' : 'Browse Device Files'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingPhoto}
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setIsUploadingPhoto(true);
                          setPhotoUploadError(null);
                          try {
                            const uploadData = new FormData();
                            uploadData.append('avatar', file);
                            const res = await api.uploadAvatar(uploadData);
                            if (res.data?.success && res.data.data?.avatarUrl) {
                              setFormData({ ...formData, avatarUrl: res.data.data.avatarUrl });
                            }
                          } catch (err: any) {
                            setPhotoUploadError(err.response?.data?.message || 'Failed to upload photo');
                          } finally {
                            setIsUploadingPhoto(false);
                          }
                        }
                      }}
                    />
                  </label>

                  {formData.avatarUrl && (
                    <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1 pt-1">
                      <Check className="w-3.5 h-3.5" /> Photo uploaded from your device
                    </p>
                  )}

                  {photoUploadError && (
                    <p className="text-xs font-bold text-rose-500 pt-1">
                      {photoUploadError}
                    </p>
                  )}
                </div>

                <div className="pt-4 flex justify-between">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    size="md"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Security
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Security & Passwords */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-navy-900">Step 3: Security & Password</h3>
                  <p className="text-xs text-slate-500">Choose a secure password for signing into your student portal.</p>
                </div>

                <Input
                  label="Create Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  error={errors.confirmPassword}
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <div className="pt-6 flex justify-between gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    variant="outline"
                    size="md"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="font-bold shadow-soft-blue flex-1"
                    isLoading={isLoading}
                    rightIcon={<Check className="w-4 h-4" />}
                  >
                    Create Student Account
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-navy-600">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 transition underline underline-offset-2">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
