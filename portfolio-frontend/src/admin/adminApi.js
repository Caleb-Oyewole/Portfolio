// Admin calls. The JWT lives in sessionStorage (cleared when the tab closes).
const BASE = `${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')}/api`
const KEY = 'portfolio_admin_token'

export const token = {
  get: () => {
    try { return sessionStorage.getItem(KEY) || '' } catch { return '' }
  },
  set: (v) => {
    try { sessionStorage.setItem(KEY, v) } catch { /* private mode */ }
  },
  clear: () => {
    try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
  },
}

let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

async function call(path, { method = 'GET', body } = {}) {
  const t = token.get()
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Could not reach the server. Is the backend running?')
  }
  if (res.status === 204) return null
  let data = null
  try { data = await res.json() } catch { /* empty */ }
  if (!res.ok) {
    if (res.status === 401 && path !== '/admin/login') onUnauthorized()
    const d = data?.detail
    throw new Error(
      typeof d === 'string' ? d : Array.isArray(d) ? d.map((x) => `${(x.loc || []).slice(1).join('.')}: ${x.msg}`).join('; ') : `Request failed (${res.status})`,
    )
  }
  return data
}

export const admin = {
  login: (email, password) => call('/admin/login', { method: 'POST', body: { email, password } }),
  me: () => call('/admin/me'),
  stats: () => call('/admin/stats'),
  list: (kind) => call(`/admin/${kind}`),
  create: (kind, body) => call(`/admin/${kind}`, { method: 'POST', body }),
  update: (kind, id, body) => call(`/admin/${kind}/${id}`, { method: 'PUT', body }),
  remove: (kind, id) => call(`/admin/${kind}/${id}`, { method: 'DELETE' }),
  saveProfile: (body) => call('/admin/profile', { method: 'PUT', body }),
  markRead: (id) => call(`/admin/messages/${id}/read`, { method: 'PATCH' }),
  deleteMessage: (id) => call(`/admin/messages/${id}`, { method: 'DELETE' }),
  deleteSubscriber: (id) => call(`/admin/subscribers/${id}`, { method: 'DELETE' }),
  issues: () => call('/admin/newsletter/issues'),
  sendNewsletter: (subject, body) => call('/admin/newsletter/send', { method: 'POST', body: { subject, body } }),
}
