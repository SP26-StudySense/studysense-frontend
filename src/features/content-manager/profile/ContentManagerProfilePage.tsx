"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { Loader2 } from "lucide-react";
import { ContentManager } from "../types";

interface ProfileHeaderProps {
  profile: ContentManager;
  onAvatarChange?: (url: string) => void;
  isUploadingAvatar?: boolean;
}

function ProfileHeader({ profile, onAvatarChange, isUploadingAvatar }: ProfileHeaderProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#fec5fb] to-[#00bae2]">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-neutral-900">
                {profile.name.charAt(0)}
              </span>
            )}
          </div>
          {isUploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-neutral-900">{profile.name}</h2>
          <p className="mt-1 text-neutral-600">{profile.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#00bae2]/10 px-3 py-1 text-sm font-medium text-[#00bae2]">
              {profile.learningSubjectName}
            </span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
              {profile.categoryName}
            </span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600">
              Joined {new Date(profile.joinedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileInfoCardProps {
  profile: ContentManager;
  onUpdate: (data: Partial<ContentManager>) => void;
  isUpdating: boolean;
}

function ProfileInfoCard({ profile, onUpdate, isUpdating }: ProfileInfoCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: profile.name,
    email: profile.email,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-900">Personal Information</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-[#00bae2] hover:text-[#00bae2]/80 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({ name: profile.name, email: profile.email });
              }}
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Full Name
            </label>
            <p className="text-sm text-neutral-900">{profile.name}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Email
            </label>
            <p className="text-sm text-neutral-900">{profile.email}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Learning Subject
            </label>
            <p className="text-sm text-neutral-900">{profile.learningSubjectName}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Category
            </label>
            <p className="text-sm text-neutral-900">{profile.categoryName}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ContentManagerProfilePageProps {
  profile: ContentManager;
  onUpdate?: (data: Partial<ContentManager>) => void;
  isUpdating?: boolean;
}

export function ContentManagerProfilePage({
  profile,
  onUpdate = () => {},
  isUpdating = false,
}: ContentManagerProfilePageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const elements = container.querySelectorAll("[data-animate]");

    gsap.set(elements, { opacity: 0, y: 30 });
    gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power3.out",
    });
  }, []);

  return (
    <div ref={containerRef} className="mx-auto max-w-4xl space-y-8">
      {/* Profile Header */}
      <div data-animate>
        <ProfileHeader profile={profile} />
      </div>

      {/* Profile Info */}
      <div data-animate>
        <ProfileInfoCard
          profile={profile}
          onUpdate={onUpdate}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
}
