import { apiRequest } from './api.js';

export async function executeCode({ code, language, input = '', title = 'Custom Execution', universal = false }) {
  return await apiRequest('/executions/run', {
    method: 'POST',
    body: JSON.stringify({ code, language, input, title, universal }),
  });
}
