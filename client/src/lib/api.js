const TOKEN_KEY = 'flowlens_token';
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ } };

// In development the Vite proxy forwards /api. On a separate host, set VITE_API_URL to the backend address at build time.
const API = `${(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')}/api`;

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !path.startsWith('/auth/login')) window.dispatchEvent(new Event('flowlens:unauthorized'));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Download a file the API generates (needs the Authorization header, so a plain link will not do).
async function download(path, fallbackName) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (res.status === 401) window.dispatchEvent(new Event('flowlens:unauthorized'));
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Download failed (${res.status})`); }
  const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') || '')?.[1] || fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  authConfig: () => request('/auth/config'),
  google: (body) => request('/auth/google', { method: 'POST', body }),
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
  // settings
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body }),
  changePassword: (body) => request('/auth/change-password', { method: 'POST', body }),
  logoutAll: () => request('/auth/logout-all', { method: 'POST' }),
  businesses: () => request('/businesses'),
  updateBusiness: (id, body) => request(`/businesses/${id}`, { method: 'PUT', body }),
  users: () => request('/users'),
  createUser: (body) => request('/users', { method: 'POST', body }),
  updateUser: (id, body) => request(`/users/${id}`, { method: 'PUT', body }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  resetPassword: (id) => request(`/users/${id}/reset-password`, { method: 'POST' }),
  audit: () => request('/audit'),
  analysisRules: () => request('/settings/analysis-rules'),
  saveAnalysisRules: (body) => request('/settings/analysis-rules', { method: 'PUT', body }),
  resetAnalysisRules: () => request('/settings/analysis-rules', { method: 'DELETE' }),
  exportAll: (format) => download(`/export/processes?format=${format}`, `flowlens-processes.${format}`),
  exportProcess: (id, format) => download(`/processes/${id}/export?format=${format}`, `flowlens-process.${format}`),
};
