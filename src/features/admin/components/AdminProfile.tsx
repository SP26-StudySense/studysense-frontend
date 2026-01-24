"use client";

import { Mail, Shield, Calendar } from "lucide-react";

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
}

export function AdminProfile({ profile }: AdminProfileProps) {
  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="border-b border-neutral-200/60 bg-gradient-to-r from-[#fec5fb]/10 to-[#00bae2]/10 p-8">
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
                  <span className="text-3xl font-bold text-[#fec5fb]">
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
                <Shield className="h-4 w-4 text-[#fec5fb]" />
                <span className="text-sm font-medium text-neutral-700">
                  {profile.role}
                </span>
              </div>
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
  );
}
