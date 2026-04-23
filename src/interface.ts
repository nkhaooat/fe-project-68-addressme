export interface User {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: 'user' | 'admin' | 'merchant';
  merchantStatus?: 'pending' | 'approved' | 'rejected';
  merchantShop?: string | Shop;
}

export interface Shop {
  _id: string;
  name: string;
  address: string;
  location: string;
  tel: string;
  map: string;
  openTime: string;
  closeTime: string;
  priceRangeMin: number;
  priceRangeMax: number;
  rating?: number;
  photo?: string;
  photoProxy?: string; // backend-provided proxy to Google Places Photos with fallback
  placeId?: string;
  hasGooglePhoto?: boolean;  // EPIC 3: true if Google Place photo is available
  platformRating?: number;   // EPIC 5: average review rating from platform users
  platformReviewCount?: number; // EPIC 5: number of platform reviews
  description?: string;
  tiktokLinks?: string[];
}

export interface Service {
  _id: string;
  name: string;
  area: string;
  duration: number;
  oil: string;
  price: number;
  shop: string;
}

export interface Reservation {
  _id: string;
  resvDate: string;
  user: User | string;
  shop: Shop | string;
  service: Service | string;
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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  telephone: string;
  password: string;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  count?: number;
}