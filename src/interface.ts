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
  placeId?: string;
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