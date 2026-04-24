export interface Review {
  _id: string;
  reservation: string;
  user: { _id: string; name: string } | string;
  shop: string;
  service: { _id: string; name: string } | string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ShopReviewsResponse {
  success: boolean;
  count: number;
  avgRating: number;
  reviewCount: number;
  data: Review[];
}
