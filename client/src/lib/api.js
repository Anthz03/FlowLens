const TOKEN_KEY = 'flowlens_token';
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ } };

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !path.startsWith('/auth/login')) window.dispatchEvent(new Event('flowlens:unauthorized'));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  me: () => request('/auth/me'),
  saveOnboarding: (body) => request('/auth/onboarding', { method: 'POST', body }),
  dashboard: () => request('/dashboard'),
  processes: (q = '') => request(`/processes${q}`),
  process: (id) => request(`/processes/${id}`),
  createProcess: (body) => request('/processes', { method: 'POST', body }),
  updateProcess: (id, body) => request(`/processes/${id}`, { method: 'PUT', body }),
  deleteProcess: (id) => request(`/processes/${id}`, { method: 'DELETE' }),
  duplicate: (id, body) => request(`/processes/${id}/duplicate`, { method: 'POST', body }),
  analysis: (id) => request(`/analysis/process/${id}`),
  runAnalysis: (id) => request(`/analysis/process/${id}`, { method: 'POST' }),
};
