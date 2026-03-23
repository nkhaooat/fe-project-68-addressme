import { API_URL } from './config';

export interface Service {
  _id: string;
  name: string;
  area: 'full body' | 'back' | 'foot' | 'head' | 'shoulder' | 'face' | 'other';
  duration: number;
  oil: 'none' | 'aromatherapy' | 'herbal' | 'coconut' | 'jojoba' | 'other';
  price: number;
  sessions: number;
  description?: string;
  shop: string | { _id: string; name: string };
}

export interface ServiceQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  shop?: string;
}

export async function getServices(params?: ServiceQueryParams) {
  const queryParams = new URLSearchParams();

  if (params) {
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.sort) queryParams.set('sort', params.sort);
    if (params.search) queryParams.set('search', params.search);
    if (params.shop) queryParams.set('shop', params.shop);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `${API_URL}/services?${queryString}` : `${API_URL}/services`;

  const response = await fetch(url);
  return response.json();
}

export async function getService(id: string) {
  const response = await fetch(`${API_URL}/services/${id}`);
  return response.json();
}

export async function getShopServices(shopId: string) {
  const response = await fetch(`${API_URL}/shops/${shopId}/services`);
  return response.json();
}

// Admin functions
export async function createService(serviceData: Omit<Service, '_id'>, token: string) {
  const shopId = typeof serviceData.shop === 'string' ? serviceData.shop : serviceData.shop._id;
  const response = await fetch(`${API_URL}/shops/${shopId}/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(serviceData)
  });
  return response.json();
}

export async function updateService(id: string, serviceData: Partial<Service>, token: string) {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(serviceData)
  });
  return response.json();
}

export async function deleteService(id: string, token: string) {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}