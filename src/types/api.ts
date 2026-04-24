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
  pagination?: PaginationData;
}

export interface PaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}
