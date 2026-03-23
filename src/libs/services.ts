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

export async function getServices() {
  const response = await fetch(`${API_URL}/services`);
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