'use client';

import { StudyPlanGuard } from '@/features/auth';
import { EnrollmentGuard } from '@/features/study-plan/components/enrollment-guard';

interface StudyPlansLayoutProps {
  children: React.ReactNode;
}

export default function StudyPlansLayout({ children }: StudyPlansLayoutProps) {
  return (
    <StudyPlanGuard>
      <EnrollmentGuard>{children}</EnrollmentGuard>
    </StudyPlanGuard>
  );
}
