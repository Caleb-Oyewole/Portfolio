// All backend calls live here. Routes match your FastAPI routers (mounted under /api).
const BASE = `${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')}/api`

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error('Could not reach the server. Please try again shortly.')
  }
  let data = null
  try {
    data = await res.json()
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const detail = data?.detail
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg).join(', ')
          : `Request failed (${res.status})`
    throw new Error(message)
  }
  return data
}

const post = (path, body) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined })

export const api = {
  profile: () => request('/profile'),
  projects: () => request('/projects'),
  achievements: () => request('/achievements'),
  skills: () => request('/skills'),
  githubProjects: () => request('/github/projects'),
  contact: (payload) => post('/contact', payload),
  subscribe: (payload) => post('/newsletter/subscribe', payload),
  confirm: (token) => post(`/newsletter/confirm/${encodeURIComponent(token)}`),
  unsubscribe: (token) => post(`/newsletter/unsubscribe/${encodeURIComponent(token)}`),
}
