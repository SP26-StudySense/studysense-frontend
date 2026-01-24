"use client";

import { useState } from "react";
import { Mail, Shield, Calendar, Edit, Lock, X } from "lucide-react";

interface AdminProfileData {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  joinedDate: string;
  lastLogin: string;
}

interface AdminProfileProps {
  profile: AdminProfileData;
  onUpdateProfile?: (data: { name: string; email: string }) => void;
  onChangePassword?: (data: { currentPassword: string; newPassword: string }) => void;
}

type ModalType = 'edit' | 'password' | null;

export function AdminProfile({ profile, onUpdateProfile, onChangePassword }: AdminProfileProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  const handleEditProfile = () => {
    setFormData({
      ...formData,
      name: profile.name,
      email: profile.email,
    });
    setActiveModal('edit');
  };

  const handleChangePassword = () => {
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
    setActiveModal('password');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setPasswordError('');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile?.({ name: formData.name, email: formData.email });
    handleCloseModal();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    onChangePassword?.({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
    handleCloseModal();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
          <div className="border-b border-neutral-200/60 bg-gradient-to-r from-[#fec5fb]/10 to-[#00bae2]/10 p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#fec5fb] to-[#00bae2] p-1">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-[#00bae2]">
                        {profile.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {profile.name}
                  </h1>
                  <div className="mt-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#00bae2]" />
                    <span className="text-sm font-medium text-neutral-700">
                      {profile.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleEditProfile}
                  className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
                >
                  <Lock className="h-4 w-4" />
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="divide-y divide-neutral-200/60 p-6">
            <div className="flex items-center gap-4 py-4">
              <Mail className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Email Address</p>
                <p className="font-medium text-neutral-900">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 py-4">
              <Calendar className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Joined Date</p>
                <p className="font-medium text-neutral-900">
                  {profile.joinedDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 py-4">
              <Calendar className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Last Login</p>
                <p className="font-medium text-neutral-900">
                  {profile.lastLogin}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
            <p className="text-sm font-medium text-neutral-600">Total Users</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">1,234</p>
            <p className="mt-1 text-xs text-green-600">+12% from last month</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
            <p className="text-sm font-medium text-neutral-600">
              Active Roadmaps
            </p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">8</p>
            <p className="mt-1 text-xs text-green-600">+2 this week</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
            <p className="text-sm font-medium text-neutral-600">Categories</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">24</p>
            <p className="mt-1 text-xs text-neutral-500">56 subjects total</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200/60 bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                Edit Profile
              </h3>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200/60 bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                Change Password
              </h3>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                  required
                  minLength={8}
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                  required
                />
              </div>

              {passwordError && (
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-sm text-red-600">{passwordError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

