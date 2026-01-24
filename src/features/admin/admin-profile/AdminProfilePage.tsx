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
}

export function AdminProfilePage({ profile }: AdminProfilePageProps) {
  return <AdminProfile profile={profile} />;
}
