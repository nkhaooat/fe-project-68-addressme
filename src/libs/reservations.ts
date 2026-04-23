import { API_URL } from './config';

export async function getReservations(token: string, myBookings: boolean = false, queryString: string = '') {
  let url = `${API_URL}/reservations`;
  
  const params = new URLSearchParams(queryString);
  if (myBookings) {
    params.set('myBookings', 'true');
  }
  
  const query = params.toString();
  if (query) {
    url += `?${query}`;
  }
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}

export async function getReservation(id: string, token: string) {
  const response = await fetch(`${API_URL}/reservations/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}

export async function createReservation(data: {
  resvDate: string;
  shop: string;
  service: string;
  promotionCode?: string;
}, token: string) {
  const response = await fetch(`${API_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateReservation(
  id: string,
  data: { resvDate?: string; status?: string },
  token: string
) {
  const response = await fetch(`${API_URL}/reservations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteReservation(id: string, token: string) {
  const response = await fetch(`${API_URL}/reservations/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}