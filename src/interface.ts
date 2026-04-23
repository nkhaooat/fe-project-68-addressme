export interface User {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: 'user' | 'admin';
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  count?: number;
}