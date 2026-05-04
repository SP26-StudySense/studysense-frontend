import { del, get, post, put } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { CreateReviewRequest, GetReviewsResponse, ReviewDto, UpdateReviewRequest } from './types';

export async function fetchReviewsByRoadmap(
  roadmapId: number | string,
  pageIndex = 1,
  pageSize = 10,
): Promise<GetReviewsResponse> {
  return get<GetReviewsResponse>(
    `${endpoints.reviews.byRoadmap(roadmapId)}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
  );
}

export async function createReview(body: CreateReviewRequest): Promise<{ success: boolean; data: ReviewDto }> {
  return post<{ success: boolean; data: ReviewDto }>(endpoints.reviews.create, body);
}

export async function updateReview(
  id: number,
  body: Omit<UpdateReviewRequest, 'id'>,
): Promise<{ success: boolean; data: ReviewDto }> {
  return put<{ success: boolean; data: ReviewDto }>(endpoints.reviews.update(id), { id, ...body });
}

export async function deleteReview(id: number): Promise<{ isDeleted: boolean; message: string }> {
  return del<{ isDeleted: boolean; message: string }>(endpoints.reviews.delete(id));
}
