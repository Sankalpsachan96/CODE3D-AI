import { apiRequest } from './api.js';

export async function getTopics() {
  return await apiRequest('/dsa/topics');
}

export async function getProblems(params = {}) {
  const query = new URLSearchParams();
  if (params.topic) query.append('topic', params.topic);
  if (params.difficulty) query.append('difficulty', params.difficulty);
  if (params.search) query.append('search', params.search);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return await apiRequest(`/dsa/problems${qStr}`);
}

export async function getProblemBySlug(slug) {
  return await apiRequest(`/dsa/problems/${slug}`);
}

export async function getSheets() {
  return await apiRequest('/dsa/sheets');
}

export async function getSheetBySlug(slug) {
  return await apiRequest(`/dsa/sheets/${slug}`);
}

export async function getProgress() {
  return await apiRequest('/dsa/progress');
}

export async function updateProgress({ problemId, status }) {
  return await apiRequest('/dsa/progress', {
    method: 'POST',
    body: JSON.stringify({ problemId, status }),
  });
}
