import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Badge } from '../../components/ui/Badge.js';
import { Modal } from '../../components/ui/Modal.js';
import { LogoutModal } from '../../components/ui/LogoutModal.js';
import {
  User,
  Mail,
  Phone,
  Hash,
  Lock,
  Edit2,
  LogOut,
  Camera,
  CheckCircle2,
  Calendar,
  Upload,
  Loader2,
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { success, error } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // Edit form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Keep form and preview synchronized with authenticated user state
  React.useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.mobileNumber) setMobileNumber(user.mobileNumber);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  const [teacherName, setTeacherName] = useState<string>('Lead Instructor');

  React.useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await api.getPublicTeacher();
        if (res.data?.success && res.data.data?.fullName) {
          setTeacherName(res.data.data.fullName);
        }
      } catch (err) {
        console.error('Failed to load instructor', err);
      }
    };
    fetchTeacher();
  }, []);


  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({ fullName, mobileNumber, avatarUrl });
      await refreshUser();
      success('Profile details updated successfully');
      setIsEditOpen(false);
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }
    setIsChangingPass(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      success('Password changed successfully');
      setIsPasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Password update failed');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-navy-600 mt-1">
            Manage your personal profile and security credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setFullName(user?.fullName || '');
              setMobileNumber(user?.mobileNumber || '');
              setAvatarUrl(user?.avatarUrl || '');
              setIsEditOpen(true);
            }}
            variant="outline"
            size="sm"
            leftIcon={<Edit2 className="w-4 h-4" />}
          >
            Edit Profile
          </Button>
          <Button
            onClick={() => setIsPasswordOpen(true)}
            variant="outline"
            size="sm"
            leftIcon={<Lock className="w-4 h-4" />}
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-100">
          <div className="relative">
            <Avatar
              src={avatarUrl || user?.avatarUrl}
              name={fullName || user?.fullName || 'Student'}
              size="xl"
              className="ring-4 ring-primary-100 shadow-md w-24 h-24 text-2xl"
            />
            <label
              className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-sm hover:bg-primary-700 transition cursor-pointer"
              title="Upload new photo from device"
            >
              {isUploadingPhoto ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <input
                type="file"
                accept="image/*"
                disabled={isUploadingPhoto}
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setIsUploadingPhoto(true);
                    try {
                      const uploadData = new FormData();
                      uploadData.append('avatar', file);
                      const res = await api.uploadAvatar(uploadData);
                      if (res.data?.success && res.data.data?.avatarUrl) {
                        const newAvatar = res.data.data.avatarUrl;
                        await api.updateProfile({ avatarUrl: newAvatar });
                        await refreshUser();
                        setAvatarUrl(newAvatar);
                        success('Profile photo updated successfully from device!');
                      }
                    } catch (err: any) {
                      error(err.response?.data?.message || 'Failed to upload photo');
                    } finally {
                      setIsUploadingPhoto(false);
                    }
                  }
                }}
              />
            </label>
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">
                {user?.fullName}
              </h2>
              <Badge variant="blue" size="sm">Enrolled Student</Badge>
            </div>
            <p className="text-xs text-navy-500 font-medium">@{user?.username}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg">
                <Hash className="w-3.5 h-3.5" />
                Roll: {user?.rollNumber || 'N/A'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-700 bg-secondary-50 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5" />
                Mon & Thu Cohort
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
            <p className="text-sm font-semibold text-navy-900 mt-1">{user?.fullName}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Username</p>
            <p className="text-sm font-semibold text-navy-900 mt-1">{user?.username}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Roll Number</p>
            <p className="text-sm font-semibold text-navy-900 mt-1">{user?.rollNumber || 'WD-2026-001'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
            <p className="text-sm font-semibold text-navy-900 mt-1">{user?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Class Program</p>
            <p className="text-sm font-semibold text-navy-900 mt-1">Full-Stack Web Development</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Teacher</p>
            <p className="text-sm font-semibold text-navy-900 mt-1">{teacherName}</p>
          </div>
        </div>

        {/* Danger Zone / Logout */}
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <Button
            onClick={() => setIsLogoutOpen(true)}
            variant="danger"
            size="sm"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out of Account
          </Button>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profile Information"
        description="Update your display name, contact number, or upload your photo from device."
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          {/* Institutional Roll Number - Locked / Permanent */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-navy-700 uppercase tracking-wide flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Roll Number (Institutional ID)
              </label>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                🔒 Permanent (Cannot be changed)
              </span>
            </div>
            <input
              type="text"
              value={user?.rollNumber || 'WD-2026-001'}
              disabled
              readOnly
              className="w-full px-3.5 py-2.5 bg-slate-100/90 text-slate-500 font-bold text-xs rounded-xl border border-slate-200 cursor-not-allowed select-none tracking-wide"
            />
            <p className="text-[11px] text-slate-400">
              Institutional roll numbers are strictly unique and cannot be modified after registration.
            </p>
          </div>

          <Input
            label="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />

          {/* Device Profile Photo Upload */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wide">
              Profile Photo (Upload from Device)
            </label>
            <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <Avatar
                src={avatarUrl || user?.avatarUrl}
                name={fullName || user?.fullName || 'Student'}
                size="lg"
                className="w-14 h-14 ring-2 ring-primary-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-navy-900">Select Image from Device</p>
                <p className="text-[11px] text-slate-500 truncate">JPEG, PNG, WebP up to 10MB</p>
                <div className="mt-2">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-primary-500 text-primary-600 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer hover:bg-primary-50/50 transition">
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingPhoto}
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setIsUploadingPhoto(true);
                          try {
                            const uploadData = new FormData();
                            uploadData.append('avatar', file);
                            const res = await api.uploadAvatar(uploadData);
                            if (res.data?.success && res.data.data?.avatarUrl) {
                              setAvatarUrl(res.data.data.avatarUrl);
                              success('Device photo uploaded');
                            }
                          } catch (err: any) {
                            error(err.response?.data?.message || 'Failed to upload photo');
                          } finally {
                            setIsUploadingPhoto(false);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving || isUploadingPhoto}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
        title="Change Account Password"
        description="Ensure your new password contains at least 6 characters."
        maxWidth="sm"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPasswordOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isChangingPass}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Logout Confirmation Permission Modal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={logout}
        userName={user?.fullName}
      />
    </div>
  );
};
