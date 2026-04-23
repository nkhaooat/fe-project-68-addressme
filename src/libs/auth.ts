import { API_URL } from './config';

export async function userLogin(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

export async function userRegister(name: string, email: string, telephone: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, telephone, password }),
  });
  return response.json();
}

export async function getMe(token: string) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}

export async function logout(token: string) {
  const response = await fetch(`${API_URL}/auth/logout`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}

export async function forgotPassword(email: string) {
  const response = await fetch(`${API_URL}/auth/forgotpassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response.json();
}

export async function resetPassword(token: string, password: string) {
  const response = await fetch(`${API_URL}/auth/resetpassword`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  return response.json();
}

export async function changePassword(currentPassword: string, newPassword: string, token: string) {
  const response = await fetch(`${API_URL}/auth/changepassword`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return response.json();
}

export async function registerMerchant(name: string, email: string, telephone: string, password: string, shopId: string) {
  const response = await fetch(`${API_URL}/auth/register/merchant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, telephone, password, shopId }),
  });
  return response.json();
}

export async function getMerchants(token: string, status?: string) {
  const url = status ? `${API_URL}/admin/merchants?status=${status}` : `${API_URL}/admin/merchants`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}

export async function approveMerchant(id: string, token: string) {
  const response = await fetch(`${API_URL}/admin/merchants/${id}/approve`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}

export async function rejectMerchant(id: string, token: string) {
  const response = await fetch(`${API_URL}/admin/merchants/${id}/reject`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}

export async function getMerchantDashboard(token: string) {
  const response = await fetch(`${API_URL}/merchant/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}

export async function getMerchantReservations(token: string) {
  const response = await fetch(`${API_URL}/merchant/reservations`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}

export async function merchantScanQR(token: string, qrToken: string) {
  const response = await fetch(`${API_URL}/merchant/qr/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ token: qrToken }),
  });
  return response.json();
}
