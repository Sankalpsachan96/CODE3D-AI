import { apiRequest } from './api.js';

export async function getSettings() {
  return await apiRequest('/settings');
}

export async function updateSettings(settingsData) {
  return await apiRequest('/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  });
}
