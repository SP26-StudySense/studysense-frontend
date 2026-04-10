'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { createPortal } from 'react-dom';
import { RoadmapTemplate, UserLearningRoadmap } from '../types';
import { cn } from '@/shared/lib/utils';
import { useStartLearning } from '../hooks/useStartLearning';
import { useSessionStore } from '@/store/session.store';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { fetchPendingTriggerSurvey } from '@/features/survey/api/api';
import { SurveyTriggerType } from '@/features/survey/api/types';
import { SurveyTriggerReason } from '@/features/survey/types';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { STUDY_PLAN } from '@/shared/lib/constants';
import { showWarning, showInfo } from '@/shared/lib/toast';
import { useUserMembership } from '@/features/membership/api/queries';

interface RoadmapCardProps {
    roadmap: RoadmapTemplate | UserLearningRoadmap;
    variant: 'template' | 'learning';
    existingRoadmapIds?: Set<number>; // Track existing study plans
    roadmapToStudyPlanMap?: Map<number, number>; // Map roadmapId to studyPlanId
}

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

export function RoadmapCard({ roadmap, variant, existingRoadmapIds, roadmapToStudyPlanMap }: RoadmapCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, user } = useAuth();
    const { data: membership } = useUserMembership(isAuthenticated);
    const [isCheckingLimit, setIsCheckingLimit] = useState(false);
    const [isCheckingSurvey, setIsCheckingSurvey] = useState(false);
    const [autoTriggered, setAutoTriggered] = useState(false);
    const [isRetakeModalOpen, setIsRetakeModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const retakeModalResolverRef = useRef<((value: boolean) => void) | null>(null);

    const isFreeUser = isFreePlan(membership?.subscriptionType ?? user?.subscriptionType);

    // Check if this roadmap already has a study plan
    const hasExistingPlan = existingRoadmapIds?.has(Number(roadmap.id)) ?? false;

    const setActiveStudyPlanId = useSessionStore((state) => state.setActiveStudyPlanId);

    const { startLearning, error, reset, isLoading } = useStartLearning();

    const Icon = LucideIcons[roadmap.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }> || LucideIcons.Map;

    const buildReturnTo = (skipBehaviorSurveyPrompt = false) => {
        const params = new URLSearchParams({
            startRoadmapId: roadmap.id.toString(),
        });

        if (skipBehaviorSurveyPrompt) {
            params.set('skipBehaviorSurveyPrompt', '1');
        }

        return `/roadmaps?${params.toString()}`;
    };

    const handleBehaviorSurveyRetake = async (): Promise<boolean> => {
        setIsCheckingSurvey(true);
        try {
            const retentionSurvey = await fetchPendingTriggerSurvey(SurveyTriggerType.ON_RETENTION_CHECK);

            if (retentionSurvey.hasPendingSurvey && retentionSurvey.surveyCode) {
                const params = new URLSearchParams({
                    triggerReason: SurveyTriggerReason.RESURVEY,
                    returnTo: buildReturnTo(true),
                });

                router.push(`/surveys/${retentionSurvey.surveyCode}?${params.toString()}`);
                return false;
            }

            if (retentionSurvey.blockedReason === 'MaxAttemptsExceeded') {
                showInfo(
                    `You have already completed this survey ${retentionSurvey.completedAttempts} time${retentionSurvey.completedAttempts !== 1 ? 's' : ''} (max ${retentionSurvey.maxAttempts}). Proceeding to start learning.`,
                    { duration: 5000 }
                );
            } else if (retentionSurvey.blockedReason === 'CooldownActive' && retentionSurvey.cooldownEndsAt) {
                const endsAt = new Date(retentionSurvey.cooldownEndsAt);
                const diffMs = endsAt.getTime() - Date.now();
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                showWarning(
                    `You need to wait ${diffDays} more day${diffDays !== 1 ? 's' : ''} before retaking this survey (available ${endsAt.toLocaleDateString()}). Proceeding to start learning.`,
                    { duration: 6000 }
                );
            }

            return true;
        } catch {
            // fail-safe: proceed without survey check
            return true;
        } finally {
            setIsCheckingSurvey(false);
        }
    };

    const handleOnStartRoadmapSurvey = async (): Promise<boolean> => {
        setIsCheckingSurvey(true);
        try {
            const roadmapSurvey = await fetchPendingTriggerSurvey(SurveyTriggerType.ON_START_ROADMAP);

            if (roadmapSurvey.hasPendingSurvey && roadmapSurvey.surveyCode) {
                const params = new URLSearchParams({
                    triggerReason: SurveyTriggerReason.RESURVEY,
                    returnTo: buildReturnTo(true),
                    roadmapId: roadmap.id.toString(),
                });

                router.push(`/surveys/${roadmapSurvey.surveyCode}?${params.toString()}`);
                return false;
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

            return true;
        } catch {
            // fail-safe: proceed without survey check
            return true;
        } finally {
            setIsCheckingSurvey(false);
        }
    };

    const askRetakeBehaviorSurvey = () => {
        return new Promise<boolean>((resolve) => {
            retakeModalResolverRef.current = resolve;
            setIsRetakeModalOpen(true);
        });
    };

    const resolveRetakeBehaviorSurvey = (shouldRetake: boolean) => {
        setIsRetakeModalOpen(false);
        if (retakeModalResolverRef.current) {
            retakeModalResolverRef.current(shouldRetake);
            retakeModalResolverRef.current = null;
        }
    };

    const isLearningRoadmap = (r: RoadmapTemplate | UserLearningRoadmap): r is UserLearningRoadmap => {
        return 'progress' in r;
    };

    // Auto-trigger if startRoadmapId query param matches this card's roadmap
    useEffect(() => {
        const startRoadmapId = searchParams.get('startRoadmapId');
        if (startRoadmapId && !autoTriggered && variant === 'template' && Number(roadmap.id) === parseInt(startRoadmapId, 10)) {
            console.log(`🎯 Auto-triggering startLearning for roadmap #${roadmap.id}`);
            setAutoTriggered(true);
            // Delay slightly to ensure component is ready
            setTimeout(() => handleClickInternal(), 100);
        }
    }, [searchParams, autoTriggered, variant, roadmap.id]);

    useEffect(() => {
        setIsMounted(true);

        return () => {
            if (retakeModalResolverRef.current) {
                retakeModalResolverRef.current(false);
                retakeModalResolverRef.current = null;
            }
        };
    }, []);

    const handleClick = async () => {
        await handleClickInternal();
    };

    const handleClickInternal = async () => {
        if (isCheckingLimit || isCheckingSurvey || isLoading || isRetakeModalOpen) return;

        if (variant === 'learning' && isLearningRoadmap(roadmap)) {
            // Continue learning -> go to dashboard
            setActiveStudyPlanId(roadmap.studyPlanId);
            router.push(`/dashboard/${roadmap.studyPlanId}`);
        } else {
            if (!isAuthenticated) {
                const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
                router.push(`/login?callbackUrl=${callbackUrl}`);
                return;
            }

            // Check if roadmap already has a study plan, redirect to dashboard instead of survey
            if (hasExistingPlan && roadmapToStudyPlanMap) {
                const existingStudyPlanId = roadmapToStudyPlanMap.get(Number(roadmap.id));
                if (existingStudyPlanId) {
                    console.log(`✅ User already has study plan #${existingStudyPlanId} for roadmap #${roadmap.id}. Redirecting to dashboard...`);
                    setActiveStudyPlanId(String(existingStudyPlanId));
                    router.push(`/dashboard/${existingStudyPlanId}`);
                    return;
                }
            }

            // Check free-plan limit first before any survey/create flow.
            if (isFreeUser) {
                setIsCheckingLimit(true);
                try {
                    const limitCheck = await get<{
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

            // Step 6: Check ON_REGISTER first. If pending, redirect immediately and skip popup.
            setIsCheckingSurvey(true);
            try {
                const registerSurvey = await fetchPendingTriggerSurvey(SurveyTriggerType.ON_REGISTER);

                if (registerSurvey.hasPendingSurvey && registerSurvey.surveyCode) {
                    const params = new URLSearchParams({
                        triggerReason: SurveyTriggerReason.INITIAL,
                        returnTo: buildReturnTo(true),
                    });
                    router.push(`/surveys/${registerSurvey.surveyCode}?${params.toString()}`);
                    return;
                }
            } catch {
                // fail-safe: proceed without survey check
            } finally {
                setIsCheckingSurvey(false);
            }

            const skipBehaviorSurveyPrompt = searchParams.get('skipBehaviorSurveyPrompt') === '1';
            if (!skipBehaviorSurveyPrompt) {
                const shouldRetakeBehaviorSurvey = await askRetakeBehaviorSurvey();

                if (shouldRetakeBehaviorSurvey) {
                    const canContinue = await handleBehaviorSurveyRetake();
                    if (!canContinue) {
                        return;
                    }
                }
            }

            const canContinueOnStartRoadmapSurvey = await handleOnStartRoadmapSurvey();
            if (!canContinueOnStartRoadmapSurvey) {
                return;
            }

            // Step 7: start learning
            await startLearning(Number(roadmap.id));
        }
    };

    const formatJoinedDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTimeSpent = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    };

    return (
        <>
            <div
                onClick={handleClick}
                className={cn(
                    "group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-500 cursor-pointer",
                    variant === 'template'
                        ? "bg-white border-neutral-200 hover:shadow-xl hover:-translate-y-1"
                        : "bg-gradient-to-br from-white to-neutral-50 border-neutral-200 hover:shadow-xl hover:scale-[1.02]"
                )}
            >
                {/* Header */}
                <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
                        variant === 'template'
                            ? "bg-neutral-100 text-neutral-900 group-hover:bg-[#00bae2]/10 group-hover:text-[#00bae2]"
                            : "bg-[#00bae2]/10 text-[#00bae2]"
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-[#00bae2] transition-colors">
                    {roadmap.title}
                </h3>
                {'subjectName' in roadmap && roadmap.subjectName && (
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                        {roadmap.subjectName}
                    </p>
                )}
                <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                    {roadmap.description}
                </p>

                {/* Stats */}
                {variant === 'template' ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <LucideIcons.Target className="h-3.5 w-3.5" />
                            <span>{roadmap.totalNodes} nodes</span>
                        </div>
                        {/* Eye Icon for Preview */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/roadmaps/preview/${roadmap.id}`);
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 hover:bg-[#00bae2]/10 hover:text-[#00bae2] text-neutral-600 transition-all duration-200 hover:scale-110"
                            title="Preview roadmap"
                        >
                            <LucideIcons.Eye className="h-4 w-4" />
                        </button>
                    </div>
                ) : isLearningRoadmap(roadmap) && (
                    <div className="space-y-3">
                        {/* Progress Bar */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-medium text-neutral-700">Progress</span>
                                <span className="text-xs font-semibold text-[#00bae2]">{roadmap.progress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#00bae2] to-[#00d4ff] transition-all duration-500"
                                    style={{ width: `${roadmap.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <div className="flex items-center gap-1.5">
                                <LucideIcons.CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                <span>{roadmap.completedNodes}/{roadmap.totalNodes}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <LucideIcons.Clock className="h-3.5 w-3.5" />
                                <span>{formatTimeSpent(roadmap.timeSpent)}</span>
                            </div>
                        </div>

                        {/* Joined date */}
                        <div className="text-xs text-neutral-400">
                            Joined on {formatJoinedDate(roadmap.lastAccessed)}
                        </div>
                    </div>
                )}
                </div>

                {/* Footer Action */}
                <div className="mt-auto border-t border-neutral-100 p-4 bg-neutral-50/50 group-hover:bg-neutral-50 transition-colors">
                    <button
                        disabled={isCheckingLimit || isCheckingSurvey || isLoading}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-neutral-700 group-hover:text-[#00bae2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCheckingLimit || isCheckingSurvey || isLoading ? (
                            <>
                                <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
                                {isCheckingLimit ? 'Checking limit...' : isCheckingSurvey ? 'Checking...' : 'Creating Plan...'}
                            </>
                        ) : (
                            <>
                                {variant === 'learning' ? 'Continue' : (!hasExistingPlan ? 'Start Learning' : 'Continue')}
                                <LucideIcons.ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </div>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#00bae2]/0 via-[#00bae2]/0 to-[#fec5fb]/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />

                {/* Optional inline error display instead of overlay */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs text-center border-t border-red-100">
                        {error.toLowerCase().includes('already exists')
                            ? 'Project already exists.'
                            : 'Failed to create plan. Please try again.'}
                    </div>
                )}
            </div>

            {isMounted && isRetakeModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <div
                        className="absolute inset-0 bg-neutral-900/45 backdrop-blur-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            resolveRetakeBehaviorSurvey(false);
                        }}
                    />

                    <div
                        className="relative z-10 mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-2xl shadow-cyan-900/20"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <div className="bg-gradient-to-r from-[#00bae2]/15 via-[#00d4ff]/10 to-white p-6 pb-4">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#00bae2] shadow-sm">
                                <LucideIcons.Sparkles className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900">Retake Behavior Survey?</h3>
                            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                                We can quickly recalibrate your learning style before starting this roadmap.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 p-6 pt-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    resolveRetakeBehaviorSurvey(false);
                                }}
                                className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                            >
                                Skip for now
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    resolveRetakeBehaviorSurvey(true);
                                }}
                                className="flex-1 rounded-xl bg-[#00bae2] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#02a6cb]"
                            >
                                Retake now
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
