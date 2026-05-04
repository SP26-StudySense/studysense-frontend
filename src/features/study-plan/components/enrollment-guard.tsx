'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { routes } from '@/shared/config/routes';
import { useCurrentUser } from '@/features/auth/api/queries';

interface CheckJoinedResponse {
	isJoined: boolean;
}

interface EnrollmentGuardProps {
	children: React.ReactNode;
	studyPlanId?: string | number;
	redirectTo?: string;
}

export function EnrollmentGuard({
	children,
	studyPlanId,
	redirectTo = routes.dashboard.roadmaps.list,
}: EnrollmentGuardProps) {
	const router = useRouter();
	const params = useParams();
	const { data: currentUser, isLoading: isCurrentUserLoading, isError: isCurrentUserError } = useCurrentUser();

	const routeStudyPlanId = useMemo(() => {
		const rawValue = params?.studyPlanId ?? params?.id;
		if (typeof rawValue === 'string') return rawValue;
		if (Array.isArray(rawValue)) return rawValue[0];
		return undefined;
	}, [params]);

	const resolvedStudyPlanId = useMemo(() => {
		if (studyPlanId !== undefined && studyPlanId !== null) return String(studyPlanId);
		return routeStudyPlanId;
	}, [studyPlanId, routeStudyPlanId]);

	const ownershipQuery = useQuery({
		queryKey: ['study-plan-ownership', resolvedStudyPlanId, currentUser?.id] as const,
		queryFn: async () => {
			if (!resolvedStudyPlanId || !currentUser?.id) return false;
			const result = await get<CheckJoinedResponse>(
				endpoints.studyPlans.checkJoined(resolvedStudyPlanId)
			);
			return result.isJoined;
		},
		enabled: !!resolvedStudyPlanId && !!currentUser?.id,
		retry: false,
		staleTime: 30 * 1000,
	});

	useEffect(() => {
		if (isCurrentUserError || ownershipQuery.isError || ownershipQuery.data === false) {
			router.replace(redirectTo);
		}
	}, [isCurrentUserError, ownershipQuery.isError, ownershipQuery.data, router, redirectTo]);

	if (isCurrentUserLoading || ownershipQuery.isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
				<LoadingSpinner size="lg" showText text="Checking study plan access..." />
			</div>
		);
	}

	if (
		!resolvedStudyPlanId ||
		!currentUser ||
		isCurrentUserError ||
		ownershipQuery.isError ||
		ownershipQuery.data === false
	) {
		return null;
	}

	return <>{children}</>;
}
