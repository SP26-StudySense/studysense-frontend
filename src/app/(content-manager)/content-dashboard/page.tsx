"use client";

import { useEffect, useMemo, useState } from "react";
import { ContentManagerDashboard } from "@/features/content-manager/dashboard";
import { ContentManagerLoading } from "@/features/content-manager/components";
import { useContentManagerStats, useSubjectsByContentManager } from "@/features/content-manager/api";
import { useAuth } from "@/features/auth/hooks/use-auth";

export default function ContentDashboardPage() {
  const { user } = useAuth();
  const { data: subjectsResponse } = useSubjectsByContentManager();
  const subjects = subjectsResponse?.subjects ?? [];
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (subjects.length === 1) {
      setSelectedSubjectId(subjects[0].id);
      return;
    }

    if (selectedSubjectId != null && !subjects.some((subject) => subject.id === selectedSubjectId)) {
      setSelectedSubjectId(undefined);
    }
  }, [selectedSubjectId, subjects]);

  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    error,
  } = useContentManagerStats({ subjectId: selectedSubjectId });

  const displayName = useMemo(() => {
    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    if (fullName) return fullName;
    return user?.email?.split("@")[0] || "Content Manager";
  }, [user]);

  const selectedSubjectName = useMemo(() => {
    if (subjects.length === 1) return subjects[0].name;
    if (!selectedSubjectId) return "All assigned subjects";
    return subjects.find((subject) => subject.id === selectedSubjectId)?.name || "Selected subject";
  }, [selectedSubjectId, subjects]);

  if (isLoadingStats && !statsResponse) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <ContentManagerLoading variant="inline" size="lg" title="Loading dashboard stats..." />
        </div>
      </div>
    );
  }

  if (error || !statsResponse?.stats) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6 text-sm text-red-700">
        Failed to load content manager stats. Please refresh and try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ContentManagerDashboard
        stats={statsResponse.stats}
        contentManager={{
          name: displayName,
          learningSubjectName: selectedSubjectName,
        }}
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={setSelectedSubjectId}
      />
    </div>
  );
}
