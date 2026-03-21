import { API_URL } from './config';

export interface ShopQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  searchArea?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'rating' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export async function getShops(params?: ShopQueryParams) {
  const queryParams = new URLSearchParams();

  if (params) {
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.searchArea) queryParams.set('searchArea', params.searchArea);
    if (params.minPrice) queryParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.set('maxPrice', params.maxPrice.toString());
    if (params.minRating) queryParams.set('minRating', params.minRating.toString());
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `${API_URL}/shops?${queryString}` : `${API_URL}/shops`;

  const response = await fetch(url);
  return response.json();
}

export async function getShop(id: string) {
  const response = await fetch(`${API_URL}/shops/${id}`);
  return response.json();
}

export async function getShopAreas() {
  const response = await fetch(`${API_URL}/shops/areas`);
  return response.json();
}