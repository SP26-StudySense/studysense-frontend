'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview, updateReview } from '../api/api';
import { toast } from '@/shared/lib';
import type { ReviewDto } from '../api/types';

interface ReviewModalProps {
  open: boolean;
  roadmapId: number;
  roadmapTitle: string;
  /** Pass existing review to enter edit mode */
  existingReview?: ReviewDto | null;
  onClose: () => void;
  onSuccess?: (review: ReviewDto) => void;
}

function StarRating({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => !disabled && setHovered(0)}
          className={`focus:outline-none transition-transform ${disabled ? 'cursor-not-allowed opacity-70' : 'hover:scale-110'}`}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-neutral-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewModal({
  open,
  roadmapId,
  roadmapTitle,
  existingReview,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [isMounted, setIsMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEditMode = !!existingReview;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync form when existingReview changes
  useEffect(() => {
    setRating(existingReview?.rating ?? 0);
    setComment(existingReview?.comment ?? '');
  }, [existingReview]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 100);
  }, [open]);

  const createMutation = useMutation({
    mutationFn: () => createReview({ roadmapId, rating, comment: comment.trim() || undefined }),
    onSuccess: (res) => {
      toast.success('Review submitted! Thank you for your feedback.');
      queryClient.invalidateQueries({ queryKey: ['reviews', roadmapId] });
      onSuccess?.(res.data);
      onClose();
    },
    onError: (err) => toast.apiError(err, 'Failed to submit review'),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateReview(existingReview!.id, { rating, comment: comment.trim() || undefined }),
    onSuccess: (res) => {
      toast.success('Review updated.');
      queryClient.invalidateQueries({ queryKey: ['reviews', roadmapId] });
      onSuccess?.(res.data);
      onClose();
    },
    onError: (err) => toast.apiError(err, 'Failed to update review'),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (rating === 0) {
      toast.warning('Please select a rating before submitting.');
      return;
    }
    if (isEditMode) updateMutation.mutate();
    else createMutation.mutate();
  };

  if (!isMounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-50 via-white to-[#ebfbff] px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-1 text-2xl">⭐</div>
          <h2 className="text-lg font-bold text-neutral-900">
            {isEditMode ? 'Edit your review' : 'Rate this roadmap'}
          </h2>
          <p className="mt-1 text-sm text-neutral-500 line-clamp-1">{roadmapTitle}</p>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Star rating */}
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700">Your rating *</p>
            <StarRating value={rating} onChange={setRating} disabled={isPending} />
            {rating > 0 && (
              <p className="mt-1 text-xs text-neutral-400">
                {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700" htmlFor="review-comment">
              Your thoughts <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <textarea
              id="review-comment"
              ref={textareaRef}
              value={comment}
              disabled={isPending}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Share your experience with this roadmap…"
              className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-[#00bae2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00bae2]/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <p className="mt-1 text-right text-xs text-neutral-400">{comment.length}/2000</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || rating === 0}
            className="flex-1 rounded-xl bg-[#00bae2] py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#00bae2]/20 transition-colors hover:bg-[#00a8d0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Saving…' : isEditMode ? 'Update review' : 'Submit review'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
