"use client";

import { AdminProfilePage } from "@/features/admin/admin-profile";

export default function ProfilePage() {
  // Mock admin profile data
  const adminProfile = {
    name: "Admin User",
    email: "admin@studysense.com",
    role: "System Administrator",
    joinedDate: "January 15, 2024",
    lastLogin: "January 24, 2026, 10:30 AM",
  };

  const handleUpdateProfile = (data: { name: string; email: string }) => {
    console.log("Update profile:", data);
    // UI only - in real implementation would call API
  };

  const handleChangePassword = (data: { currentPassword: string; newPassword: string }) => {
    console.log("Change password");
    // UI only - in real implementation would call API
  };

  return (
    <AdminProfilePage 
      profile={adminProfile}
      onUpdateProfile={handleUpdateProfile}
      onChangePassword={handleChangePassword}
    />
  );
}
