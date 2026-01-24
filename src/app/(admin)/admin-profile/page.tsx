import { AdminProfile } from "@/features/admin/components";

export default function ProfilePage() {
  // Mock admin profile data
  const adminProfile = {
    name: "Admin User",
    email: "admin@studysense.com",
    role: "System Administrator",
    joinedDate: "January 15, 2024",
    lastLogin: "January 24, 2026, 10:30 AM",
  };

  return <AdminProfile profile={adminProfile} />;
}
