'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { RoadmapGraphDTO, RoadmapNodeDTO } from './api';
import { RoadmapTemplate } from './types';
import { RoadmapPreviewGraph } from './components/RoadmapPreviewGraph';
import { useStartLearning } from './hooks/useStartLearning';
import { fetchPendingTriggerSurvey } from '@/features/survey/api/api';
import { SurveyTriggerType } from '@/features/survey/api/types';
import { SurveyTriggerReason } from '@/features/survey/types';
import { showInfo, showWarning } from '@/shared/lib/toast';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useStudyPlans } from '@/features/study-plan/api';
import { useSessionStore } from '@/store/session.store';
import { get as apiGet } from '@/shared/api/client';
import { STUDY_PLAN } from '@/shared/lib/constants';
import { useUserMembership } from '@/features/membership/api/queries';

interface RoadmapPreviewPageProps {
    roadmapId: string;
}

type TabType = 'overview' | 'roadmap';

function isFreePlan(subscriptionType: unknown): boolean {
    if (typeof subscriptionType === 'number') {
        return subscriptionType <= 1;
    }

    const raw = String(subscriptionType ?? '').trim().toLowerCase();
    if (!raw) return true;

    const asNumber = Number(raw);
    if (!Number.isNaN(asNumber)) {
        return asNumber <= 1;
    }

    if (raw.includes('premium') || raw.includes('pro') || raw.includes('paid')) {
        return false;
    }

    return raw.includes('free');
}

export function RoadmapPreviewPage({ roadmapId }: RoadmapPreviewPageProps) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const { data: studyPlans = [] } = useStudyPlans(isAuthenticated);
    const { data: membership } = useUserMembership(isAuthenticated);
    const setActiveStudyPlanId = useSessionStore((state) => state.setActiveStudyPlanId);
    const [roadmap, setRoadmap] = useState<RoadmapTemplate | null>(null);
    const [roadmapNodes, setRoadmapNodes] = useState<RoadmapNodeDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isCheckingLimit, setIsCheckingLimit] = useState(false);
    const [isCheckingSurvey, setIsCheckingSurvey] = useState(false);
    const [isExpandedNodes, setIsExpandedNodes] = useState(false);
    const { startLearning, isLoading } = useStartLearning();
    const isFreeUser = isFreePlan(membership?.subscriptionType ?? user?.subscriptionType);
    const existingStudyPlanId = roadmap
        ? studyPlans.find((plan) => plan.roadmapId === Number(roadmap.id))?.id
        : undefined;

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                setLoading(true);
                const data = await get<RoadmapGraphDTO>(endpoints.roadmaps.byId(roadmapId));

                console.log('🔍 [RoadmapPreviewPage] API Response:', data);

                if (!data) {
                    setError('Roadmap not found');
                    return;
                }

                const template: RoadmapTemplate = {
                    id: String(data.roadmap.id),
                    subjectId: data.roadmap.subjectId,
                    subjectName: data.roadmap.subjectName ?? undefined,
                    title: data.roadmap.title,
                    description: data.roadmap.description || 'No description available',
                    difficulty: 'intermediate',
                    category: 'other',
                    estimatedHours: 20,
                    totalNodes: data?.nodes?.length ?? 0,
                    icon: 'Map',
                };
                setRoadmap(template);
                setRoadmapNodes(data?.nodes ?? []);
                console.log('✅ [RoadmapPreviewPage] Nodes set:', data?.nodes);
            } catch (err) {
                setError('Failed to load roadmap');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, [roadmapId]);

    useEffect(() => {
        const preventContextMenu = (event: MouseEvent) => {
            event.preventDefault();
        };

        const preventDevtoolsShortcuts = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            const hasCtrlOrMeta = event.ctrlKey || event.metaKey;
            const isBlockedShortcut =
                event.key === 'F12' ||
                (hasCtrlOrMeta && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
                (hasCtrlOrMeta && key === 'u');

            if (isBlockedShortcut) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('keydown', preventDevtoolsShortcuts);

        return () => {
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('keydown', preventDevtoolsShortcuts);
        };
    }, []);

    const handleStartLearning = async () => {
        if (!roadmap || isCheckingLimit || isCheckingSurvey || isLoading) return;

        if (!isAuthenticated) {
            const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
            router.push(`/login?callbackUrl=${callbackUrl}`);
            return;
        }

        if (existingStudyPlanId) {
            setActiveStudyPlanId(String(existingStudyPlanId));
            router.push(`/dashboard/${existingStudyPlanId}`);
            return;
        }

        if (isFreeUser) {
            setIsCheckingLimit(true);
            try {
                const limitCheck = await apiGet<{
                    maxRoadmaps: number;
                    joinedRoadmaps: number;
                    hasReachedLimit: boolean;
                }>(endpoints.studyPlans.checkRoadmapLimit);

                const reachedLimit = limitCheck.hasReachedLimit;
                const maxRoadmaps = limitCheck.maxRoadmaps || STUDY_PLAN.MAX_JOINED_ROADMAPS;

                if (reachedLimit) {
                    showWarning(
                        `Free plan allows up to ${maxRoadmaps} joined roadmaps. Please upgrade to continue.`,
                        { duration: 5000 }
                    );
                    router.push('/membership');
                    return;
                }
            } catch {
                showWarning('Cannot verify your free-plan roadmap limit right now. Please try again.', {
                    duration: 4000,
                });
                return;
            } finally {
                setIsCheckingLimit(false);
            }
        }

        setIsCheckingSurvey(true);
        try {
            const registerSurvey = await fetchPendingTriggerSurvey(SurveyTriggerType.ON_REGISTER);

            if (registerSurvey.hasPendingSurvey && registerSurvey.surveyCode) {
                const params = new URLSearchParams({
                    triggerReason: SurveyTriggerReason.INITIAL,
                    returnTo: `/roadmaps?startRoadmapId=${roadmap.id}`,
                });
                router.push(`/surveys/${registerSurvey.surveyCode}?${params.toString()}`);
                return;
            }

            const roadmapSurvey = await fetchPendingTriggerSurvey(SurveyTriggerType.ON_START_ROADMAP);
            if (roadmapSurvey.hasPendingSurvey && roadmapSurvey.surveyCode) {
                const params = new URLSearchParams({
                    triggerReason: SurveyTriggerReason.RESURVEY,
                    returnTo: `/roadmaps?startRoadmapId=${roadmap.id}`,
                    roadmapId: roadmap.id.toString(),
                });
                router.push(`/surveys/${roadmapSurvey.surveyCode}?${params.toString()}`);
                return;
            }

            if (roadmapSurvey.blockedReason === 'MaxAttemptsExceeded') {
                showInfo(
                    `You have already completed this survey ${roadmapSurvey.completedAttempts} time${roadmapSurvey.completedAttempts !== 1 ? 's' : ''} (max ${roadmapSurvey.maxAttempts}). Proceeding to start learning.`,
                    { duration: 5000 }
                );
            } else if (roadmapSurvey.blockedReason === 'CooldownActive' && roadmapSurvey.cooldownEndsAt) {
                const endsAt = new Date(roadmapSurvey.cooldownEndsAt);
                const diffMs = endsAt.getTime() - Date.now();
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                showWarning(
                    `You need to wait ${diffDays} more day${diffDays !== 1 ? 's' : ''} before retaking this survey (available ${endsAt.toLocaleDateString()}). Proceeding to start learning.`,
                    { duration: 6000 }
                );
            }
        } catch {
            // fail-safe: proceed without survey check
        } finally {
            setIsCheckingSurvey(false);
        }

        await startLearning(Number(roadmap.id));
    };

    const handleOpenFullScreen = () => {
        if (!roadmap) return;
        window.open(`/roadmaps/${roadmap.id}`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-[#00bae2] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading roadmap...</p>
                </div>
            </div>
        );
    }

    if (error || !roadmap) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-neutral-600 mb-4">{error || 'Roadmap not found'}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const Icon = LucideIcons[roadmap.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }> || LucideIcons.Map;

    return (
        <div className="min-h-screen">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pt-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 px-1 py-1 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
                    <button
                        onClick={() => router.push('/roadmaps')}
                        className="font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                        Roadmaps
                    </button>
                    <span>/</span>
                    <span className="font-medium text-neutral-700">Preview</span>
                </div>
            </div>

            <div className="mx-auto mt-2 w-full max-w-6xl overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                {/* Hero Section */}
                <div className="border-b border-neutral-200 bg-gradient-to-br from-[#00bae2]/10 via-white to-[#fec5fb]/10 py-7 sm:py-8">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-start gap-5 sm:flex-row sm:gap-6">
                        <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white shadow-lg text-[#00bae2]">
                            <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
                        </div>
                        <div className="flex-1">
                            <div className="mb-2.5 flex flex-wrap items-center gap-2.5 sm:gap-3">
                                <span className="rounded-full border border-[#b6edfa] bg-[#ebfbff] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#008fad]">
                                    Preview
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">
                                    {roadmap.title}
                                </h2>
                            </div>
                            <p className="mb-5 sm:mb-6 text-sm sm:text-base text-neutral-600 leading-relaxed max-w-4xl">
                                {roadmap.description}
                            </p>

                            {/* Tabs */}
                            <div className="flex flex-wrap gap-2.5">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'overview'
                                        ? 'bg-white text-[#00bae2] shadow-sm border border-neutral-200'
                                        : 'text-neutral-600 hover:bg-white/80 border border-transparent'
                                        }`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('roadmap')}
                                    className={`px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'roadmap'
                                        ? 'bg-white text-[#00bae2] shadow-sm border border-neutral-200'
                                        : 'text-neutral-600 hover:bg-white/80 border border-transparent'
                                        }`}
                                >
                                    Roadmap Graph
                                </button>
                                <button
                                    onClick={handleOpenFullScreen}
                                    className="px-4 sm:px-6 py-2.5 rounded-xl border border-neutral-200 font-medium bg-white text-neutral-700 hover:bg-neutral-50 transition-all flex items-center gap-2 sm:ml-auto"
                                    title="Open in full screen"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Full Screen
                                </button>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Content */}
                <div className="w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                    {activeTab === 'overview' ? (
                        <div className="space-y-8 sm:space-y-10">
                        {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-8 border-b border-neutral-200">
                            <div className="p-1">
                                <div className="text-sm text-neutral-600 mb-2">Total Nodes</div>
                                <div className="text-3xl sm:text-4xl font-bold text-neutral-900">{roadmap.totalNodes}</div>
                            </div>
                            <div className="p-1">
                                <div className="text-sm text-neutral-600 mb-2">Subject</div>
                                <div className="text-xl sm:text-2xl font-semibold text-neutral-900">{roadmap.subjectName ?? 'Unknown subject'}</div>
                            </div>
                        </div>

                        {/* What You'll Learn - Display Nodes */}
                        {roadmapNodes.length > 0 && (
                            <div className="pt-0">
                                <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-5 sm:mb-6">Learning Path</h3>
                                <div className="space-y-3">
                                    {roadmapNodes
                                        .sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0))
                                        .slice(0, isExpandedNodes ? undefined : 5)
                                        .map((node, index) => (
                                            <div key={node.id} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors">
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00bae2]/20 flex items-center justify-center mt-0.5">
                                                    <span className="text-xs font-semibold text-[#00bae2]">{index + 1}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-neutral-900">{node.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                {roadmapNodes.length > 5 && (
                                    <button
                                        onClick={() => setIsExpandedNodes(!isExpandedNodes)}
                                        className="mt-4 px-4 py-2 rounded-lg border border-[#00bae2] text-[#00bae2] font-medium hover:bg-[#00bae2]/5 transition-colors"
                                    >
                                        {isExpandedNodes ? '▲ Show Less' : '▼ Show More'} ({roadmapNodes.length} total)
                                    </button>
                                )}
                            </div>
                        )}
                        </div>
                    ) : (
                        <div className="overflow-hidden border-y border-neutral-200">
                            <div className="h-[65vh] min-h-[560px]">
                                <RoadmapPreviewGraph roadmapId={roadmap.id} disableContentLinks />
                            </div>
                        </div>
                    )}
                </div>
                 {/* Footer */}
                <div className="sticky bottom-0 border-t border-neutral-200 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-6xl gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => router.back()}
                            className="flex-1 rounded-2xl border border-neutral-200 bg-white px-6 py-3 font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleStartLearning}
                            disabled={isCheckingLimit || isCheckingSurvey || isLoading}
                            className="flex-1 rounded-2xl bg-[#00bae2] px-6 py-3 font-semibold text-white shadow-lg shadow-[#00bae2]/20 transition-colors hover:bg-[#00a8d0] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isCheckingLimit || isCheckingSurvey || isLoading
                                ? isCheckingLimit
                                    ? 'Checking limit...'
                                    : isCheckingSurvey
                                        ? 'Checking...'
                                        : 'Creating Plan...'
                                : existingStudyPlanId
                                    ? 'Continue'
                                    : 'Start Learning'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
