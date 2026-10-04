import { apiRequest } from './api.js';

export async function getDashboardStats() {
  return await apiRequest('/dashboard/stats');
}
