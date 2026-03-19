import { API_URL } from './config';

export async function getShops() {
  const response = await fetch(`${API_URL}/shops`);
  return response.json();
}

export async function getShop(id: string) {
  const response = await fetch(`${API_URL}/shops/${id}`);
  return response.json();
}