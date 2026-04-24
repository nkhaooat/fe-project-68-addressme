import { User } from '@/types/user';

export interface Reservation {
  _id: string;
  resvDate: string;
  user: User | string;
  shop: any; // Shop type from libs/shops - using any to avoid circular deps
  service: any; // Service type from libs/services
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  promotionCode?: string | null;
  discountAmount?: number;
  originalPrice?: number;
  finalPrice?: number;
  slipImageUrl?: string | null;
  paymentStatus?: 'none' | 'waiting_verification' | 'approved' | 'rejected';
  qrToken?: string;
  qrActive?: boolean;
  createdAt: string;
}

// Re-export types from their canonical locations
export type { User } from '@/types/user';
export type { Review, ShopReviewsResponse } from '@/types/review';
export type { LoginCredentials, RegisterData, ApiResponse, PaginationData } from '@/types/api';
export type { Shop, ShopQueryParams } from '@/libs/shops';
export type { Service, ServiceQueryParams } from '@/libs/services';
