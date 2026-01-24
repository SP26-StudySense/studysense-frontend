import { AdminProfile } from "../components";

export interface AdminProfileData {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  joinedDate: string;
  lastLogin: string;
}

interface AdminProfilePageProps {
  profile: AdminProfileData;
  onUpdateProfile?: (data: { name: string; email: string }) => void;
  onChangePassword?: (data: { currentPassword: string; newPassword: string }) => void;
}

export function AdminProfilePage({ 
  profile, 
  onUpdateProfile, 
  onChangePassword 
}: AdminProfilePageProps) {
  return (
    <AdminProfile 
      profile={profile} 
      onUpdateProfile={onUpdateProfile}
      onChangePassword={onChangePassword}
    />
  );
}
