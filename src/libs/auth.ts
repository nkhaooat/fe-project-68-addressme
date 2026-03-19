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