import { apiRequest } from './api.js';

export async function getHistory() {
  return await apiRequest('/history');
}

export async function getHistoryItem(id) {
  return await apiRequest(`/history/${id}`);
}

export async function deleteHistoryItem(id) {
  return await apiRequest(`/history/${id}`, {
    method: 'DELETE',
  });
}

export async function clearHistory() {
  return await apiRequest('/history', {
    method: 'DELETE',
  });
}
