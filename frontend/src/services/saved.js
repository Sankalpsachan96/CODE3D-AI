import { apiRequest } from './api.js';

export async function getSavedList() {
  return await apiRequest('/saved');
}

export async function getSavedItem(id) {
  return await apiRequest(`/saved/${id}`);
}

export async function createSaved(savedData) {
  return await apiRequest('/saved', {
    method: 'POST',
    body: JSON.stringify(savedData),
  });
}

export async function updateSaved(id, savedData) {
  return await apiRequest(`/saved/${id}`, {
    method: 'PUT',
    body: JSON.stringify(savedData),
  });
}

export async function deleteSaved(id) {
  return await apiRequest(`/saved/${id}`, {
    method: 'DELETE',
  });
}
