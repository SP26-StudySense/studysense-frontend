"use client";

import { ContentManagerProfilePage } from "@/features/content-manager/profile";
import { MOCK_CONTENT_MANAGER } from "@/features/content-manager";

export default function ContentProfilePage() {
  const handleUpdate = (data: any) => {
    console.log("Update profile:", data);
  };

  return (
    <ContentManagerProfilePage
      profile={MOCK_CONTENT_MANAGER}
      onUpdate={handleUpdate}
      isUpdating={false}
    />
  );
}
