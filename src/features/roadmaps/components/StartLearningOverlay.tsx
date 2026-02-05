'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Sparkles, CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import gsap from 'gsap';

export type StartLearningStep =
  | 'creating-plan'
  | 'loading-modules'
  | 'creating-tasks'
  | 'finalizing'
  | 'success'
  | 'error';

interface StartLearningOverlayProps {
  isOpen: boolean;
  currentStep: StartLearningStep;
  roadmapTitle: string;
  error?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

const steps: { key: StartLearningStep; label: string; description: string }[] = [
  { key: 'creating-plan', label: 'Creating Study Plan', description: 'Setting up your personalized learning journey...' },
  { key: 'loading-modules', label: 'Loading Modules', description: 'Fetching learning materials and resources...' },
  { key: 'creating-tasks', label: 'Creating Tasks', description: 'Organizing your study tasks...' },
  { key: 'finalizing', label: 'Finalizing', description: 'Almost there! Preparing your dashboard...' },
];

function getStepIndex(step: StartLearningStep): number {
  const index = steps.findIndex(s => s.key === step);
  return index >= 0 ? index : 0;
}

export function StartLearningOverlay({
  isOpen,
  currentStep,
  roadmapTitle,
  error,
  onRetry,
  onClose,
}: StartLearningOverlayProps) {
  const [dots, setDots] = useState('');
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const currentStepIndex = getStepIndex(currentStep);
  const isError = currentStep === 'error';
  const isSuccess = currentStep === 'success';

  // Ensure we only portal on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // GSAP Animations
  useEffect(() => {
    if (!mounted || !isOpen) return;

    const ctx = gsap.context(() => {
      // 1. Entrance Animation
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );

      gsap.fromTo(cardRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      );

      // 2. Steps Stagger (only on first open)
      if (stepsRef.current) {
        gsap.fromTo(stepsRef.current.children,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out", delay: 0.2 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isOpen, mounted]);

  // Progress Bar Animation
  useEffect(() => {
    if (!progressBarRef.current) return;

    // Animate width from previous to current
    const percentage = ((currentStepIndex + 1) / steps.length) * 100;

    gsap.to(progressBarRef.current, {
      width: `${percentage}%`,
      duration: 0.6,
      ease: "power2.out"
    });
  }, [currentStepIndex]);

  // Success/Error/Icon Animation
  useEffect(() => {
    if (iconRef.current) {
      gsap.fromTo(iconRef.current,
        { scale: 0.8, rotation: -10 },
        { scale: 1, rotation: 0, duration: 0.4, ease: "elastic.out(1, 0.5)" }
      );
    }
  }, [currentStep]); // Animate whenever step changes (icon state might change)

  // Dots animation
  useEffect(() => {
    if (!isOpen || isError || isSuccess) return;
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, [isOpen, isError, isSuccess]);

  if (!mounted || !isOpen) return null;

  const overlayContent = (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center opacity-0"
    >
      {/* Premium background with gradients - matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] pointer-events-none" />

      {/* Gradient Blobs - matching landing page aesthetic */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#fec5fb]/40 to-[#00bae2]/20 blur-[100px]" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#00bae2]/30 to-[#fec5fb]/10 blur-[120px]" />

      {/* Backdrop blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />

      {/* Main content */}
      <div
        ref={cardRef}
        className="relative w-full max-w-md mx-4 z-10 opacity-0"
      >
        {/* Outer glow frame */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#00bae2]/20 via-[#fec5fb]/10 to-transparent rounded-3xl blur-2xl opacity-60" />

        {/* Card */}
        <div className="relative bg-white border border-neutral-100 rounded-3xl p-8 shadow-2xl overflow-hidden">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />

          {/* Content */}
          <div className="relative">
            {/* Close button */}
            {(isError || isSuccess) && (
              <button
                onClick={onClose}
                className="absolute top-0 right-0 p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                ref={iconRef}
                className={cn(
                  "relative flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300",
                  isError
                    ? 'bg-red-50'
                    : isSuccess
                      ? 'bg-green-50'
                      : 'bg-gradient-to-br from-[#00bae2]/10 to-[#fec5fb]/10'
                )}
              >
                {isError ? (
                  <AlertCircle className="w-10 h-10 text-red-500" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                ) : (
                  <>
                    <BookOpen className="w-10 h-10 text-[#00bae2]" />
                    <div className="absolute -top-1 -right-1 animate-bounce">
                      <Sparkles className="w-5 h-5 text-[#fec5fb]" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-neutral-900 text-center mb-2">
              {isError
                ? 'Something went wrong'
                : isSuccess
                  ? 'All set!'
                  : 'Starting Your Journey'}
            </h2>
            <p className="text-neutral-600 text-center text-sm mb-8">
              {roadmapTitle}
            </p>

            {/* Progress Steps */}
            {!isError && !isSuccess && (
              <div ref={stepsRef} className="space-y-3 mb-8">
                {steps.map((step, index) => {
                  const isActive = index === currentStepIndex;
                  const isCompleted = index < currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className={cn(
                        "flex items-start gap-4 p-3 rounded-xl transition-all duration-300",
                        isActive
                          ? 'bg-gradient-to-r from-[#00bae2]/5 to-[#fec5fb]/5 border border-[#00bae2]/20'
                          : isCompleted
                            ? 'bg-green-50/50 border border-green-100/50'
                            : 'border border-neutral-100'
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center flex-col transition-all duration-300 mt-0.5",
                        isCompleted
                          ? 'bg-green-100'
                          : isActive
                            ? 'bg-[#00bae2]/20'
                            : 'bg-neutral-100'
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : isActive ? (
                          <Loader2 className="w-4 h-4 text-[#00bae2] animate-spin" />
                        ) : (
                          <span className="text-xs font-medium text-neutral-400">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium transition-colors",
                          isActive ? 'text-neutral-900' : isCompleted ? 'text-green-700' : 'text-neutral-600'
                        )}>
                          {step.label}{isActive ? dots : ''}
                        </p>
                        {isActive && (
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="mb-8">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
                  <p className="text-red-700 text-sm">
                    {error?.toLowerCase().includes('already exists')
                      ? 'You already have a study plan for this roadmap.'
                      : error || 'Failed to create your study plan. Please try again.'}
                  </p>
                </div>
                <div className="flex gap-3">
                  {error?.toLowerCase().includes('already exists') ? (
                    <button
                      onClick={onClose}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#00bae2] to-[#00a5c9] hover:shadow-lg hover:shadow-[#00bae2]/30 transition-all duration-300"
                    >
                      Go to Dashboard
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={onRetry}
                        className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#00bae2] to-[#00a5c9] hover:shadow-lg hover:shadow-[#00bae2]/30 transition-all duration-300"
                      >
                        Try Again
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Success State */}
            {isSuccess && (
              <div className="text-center">
                <p className="text-neutral-600 text-sm mb-6">
                  Your study plan is ready. Let&apos;s start learning!
                </p>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00bae2] to-[#fec5fb] w-full"
                  />
                </div>
                <p className="text-neutral-400 text-xs mt-4">Redirecting in a moment...</p>
              </div>
            )}

            {/* Progress bar for non-error states */}
            {!isError && !isSuccess && (
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full bg-gradient-to-r from-[#00bae2] to-[#fec5fb]"
                  style={{ width: '0%' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render overlay outside the card's DOM tree
  return createPortal(overlayContent, document.body);
}
