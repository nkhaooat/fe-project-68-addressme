import { API_URL } from './config';

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