'use client';

import { StudyPlanGuard } from '@/features/auth';

interface StudyPlansLayoutProps {
  children: React.ReactNode;
}

export default function StudyPlansLayout({ children }: StudyPlansLayoutProps) {
  return <StudyPlanGuard>{children}</StudyPlanGuard>;
}
