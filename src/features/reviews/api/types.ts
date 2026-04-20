export interface ReviewDto {
  id: number;
  roadmapId: number;
  roadmapTitle: string;
  reviewerId: string;
  reviewerName: string | null;
  comment: string | null;
  rating: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface PaginatedReviews {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: ReviewDto[];
}

/** Client unwraps one { data } layer, so the API function returns PaginatedReviews directly */
export type GetReviewsResponse = PaginatedReviews;

export interface CreateReviewRequest {
  roadmapId: number;
  comment?: string;
  rating: number;
}

export interface UpdateReviewRequest {
  id: number;
  comment?: string;
  rating: number;
}
