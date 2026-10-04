import { apiRequest } from './api.js';

export async function registerUser({ username, email, password }) {
  return await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function loginUser({ usernameOrEmail, username, email, password }) {
  const identifier = usernameOrEmail || username || email;
  return await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usernameOrEmail: identifier, password }),
  });
}

export async function logoutUser() {
  return await apiRequest('/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser() {
  return await apiRequest('/auth/me', {
    method: 'GET',
  });
}
