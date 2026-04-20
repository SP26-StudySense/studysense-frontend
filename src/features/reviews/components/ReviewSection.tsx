'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, Pencil, Trash2, MessageSquarePlus, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { deleteReview, fetchReviewsByRoadmap } from '../api/api';
import { ReviewModal } from './ReviewModal';
import { toast } from '@/shared/lib';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { ReviewDto } from '../api/types';

interface ReviewSectionProps {
  roadmapId: number;
  roadmapTitle: string;
  /** Whether the current user has a StudyPlan for this roadmap */
  hasJoined: boolean;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`}
        />
      ))}
    </div>
  );
}

function TimeAgo({ dateStr }: { dateStr: string }) {
  // Đảm bảo UTC: backend SQL Server thưòng trả về '2026-04-20T03:00:00' (thiếu 'Z')
  // Trình duyệt sẽ parse nhầm thành giờ local, nên ta append 'Z' nếu chưa có
  const utcDateStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
  const date = new Date(utcDateStr);
  
  if (isNaN(date.getTime())) return <span className="text-xs text-neutral-400">Invalid date</span>;

  const diff = Date.now() - date.getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  let label = 'just now';
  if (mins >= 1 && mins < 60) label = `${mins}m ago`;
  else if (hours >= 1 && hours < 24) label = `${hours}h ago`;
  else if (days >= 1) label = days === 1 ? 'yesterday' : `${days} days ago`;

  // Hiển thị tooltip giờ local chính xác khi hover
  const localTimeString = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', 
    hour: '2-digit', minute: '2-digit'
  }).format(date);

  return (
    <span className="text-xs text-neutral-400" title={localTimeString}>
      {label}
    </span>
  );
}

export function ReviewSection({ roadmapId, roadmapTitle, hasJoined }: ReviewSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Custom delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const PAGE_SIZE = 5;

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', roadmapId, page],
    queryFn: () => fetchReviewsByRoadmap(roadmapId, page, PAGE_SIZE),
  });

  const reviews = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  // Find current user's own review
  const myReview = isAuthenticated
    ? reviews.find((r) => r.reviewerId === user?.id)
    : undefined;

  const averageRating =
    totalCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteReview(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      toast.success('Review deleted.');
      queryClient.invalidateQueries({ queryKey: ['reviews', roadmapId] });
      setIsDeleteModalOpen(false);
    },
    onError: (err) => toast.apiError(err, 'Failed to delete review'),
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleOpenCreate = () => {
    setEditingReview(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (review: ReviewDto) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = () => {
    if (deleteTargetId != null) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  return (
    <section className="pt-8 border-t border-neutral-200">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900">Community Reviews</h3>
          {totalCount > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <StarDisplay rating={Math.round(averageRating)} />
              <span className="text-sm text-neutral-500">
                {averageRating.toFixed(1)} · {totalCount} review{totalCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Write review button – only if joined and not already reviewed */}
        {isAuthenticated && hasJoined && !myReview && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl border border-[#00bae2] px-4 py-2 text-sm font-medium text-[#00bae2] transition-colors hover:bg-[#00bae2]/5"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Write a review
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00bae2] border-t-transparent" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && reviews.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-200 py-10 text-center">
          <Star className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-500">No reviews yet.</p>
          {isAuthenticated && hasJoined && (
            <p className="mt-1 text-xs text-neutral-400">
              Be the first to share your experience!
            </p>
          )}
        </div>
      )}

      {/* Review list */}
      {!isLoading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isOwner = review.reviewerId === user?.id;
            const isDeleting = deletingId === review.id;

            return (
              <div
                key={review.id}
                className={`rounded-2xl border p-5 transition-all ${
                  isOwner
                    ? 'border-[#00bae2]/30 bg-[#ebfbff]/40'
                    : 'border-neutral-100 bg-neutral-50'
                }`}
              >
                {/* Review header */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar placeholder */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#00bae2] to-[#fec5fb] text-sm font-semibold text-white">
                      {(review.reviewerName ?? 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-900">
                          {review.reviewerName ?? 'Anonymous'}
                        </span>
                        {isOwner && (
                          <span className="rounded-full bg-[#00bae2]/10 px-2 py-0.5 text-[10px] font-medium text-[#00bae2]">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StarDisplay rating={review.rating} />
                        <TimeAgo dateStr={review.updatedAt ?? review.createdAt} />
                        {review.updatedAt && (
                          <span className="text-[10px] text-neutral-400">(edited)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Owner actions */}
                  {isOwner && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEdit(review)}
                        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-600"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(review.id)}
                        disabled={isDeleting}
                        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm leading-relaxed text-neutral-700">{review.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border border-neutral-200 p-2 transition-colors hover:bg-neutral-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-neutral-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-neutral-200 p-2 transition-colors hover:bg-neutral-50 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Review modal (create / edit) */}
      <ReviewModal
        open={isModalOpen}
        roadmapId={roadmapId}
        roadmapTitle={roadmapTitle}
        existingReview={editingReview}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {isMounted && isDeleteModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
            onClick={() => !deleteMutation.isPending && setIsDeleteModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-red-50 px-6 py-5">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-center text-lg font-bold text-neutral-900">Delete Review</h3>
              <p className="mt-2 text-center text-sm text-neutral-600">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 border-t border-neutral-100 bg-white px-6 py-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
