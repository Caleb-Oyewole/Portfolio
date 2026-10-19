import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api.js'
import { fallbackProfile } from '../content.js'

const SiteContext = createContext(null)

const prettify = (name = '') => name.replace(/[-_]+/g, ' ').trim()
const repoSlug = (url = '') => url.replace(/\/$/, '').split('/').pop().toLowerCase()

// Merge GitHub repos (primary) with any projects you add manually in the admin API.
function buildProjects(github, manual) {
  const fromGithub = (github?.projects || []).map((r) => ({
    id: `gh-${r.name}`,
    title: prettify(r.name),
    description: r.description || '',
    details: '',
    tags: [...new Set([...(r.language ? [r.language] : []), ...(r.topics || [])])],
    repoUrl: r.url,
    liveUrl: r.homepage || '',
    image: '',
    stars: r.stars ?? 0,
    forks: r.forks ?? 0,
    language: r.language || '',
    pushed: r.pushed_at,
    featured: !!r.featured,
  }))
  const taken = new Set(fromGithub.flatMap((p) => [p.title.toLowerCase(), repoSlug(p.repoUrl)]))
  const fromManual = (manual || [])
    .filter((m) => !taken.has((m.title || '').toLowerCase()) && !taken.has(repoSlug(m.github_url)))
    .map((m) => ({
      id: `m-${m.id}`,
      title: m.title,
      description: m.description || '',
      details: m.details || '',
      tags: m.tags || [],
      repoUrl: m.github_url || '',
      liveUrl: m.live_url || '',
      image: m.image_url || '',
      stars: 0,
      forks: 0,
      language: (m.tags || [])[0] || '',
      pushed: null,
      featured: false,
    }))
  return [...fromGithub, ...fromManual]
}

const clean = (obj) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== '' && v !== null && v !== undefined))

export function SiteProvider({ children }) {
  const [state, setState] = useState({
    loading: true,
    offline: false,
    profile: fallbackProfile,
    achievements: [],
    skills: [],
    projects: [],
    githubUrl: '',
  })

  useEffect(() => {
    let alive = true
    Promise.allSettled([
      api.profile(),
      api.achievements(),
      api.skills(),
      api.projects(),
      api.githubProjects(),
    ]).then(([p, a, s, m, g]) => {
      if (!alive) return
      // Helps debugging: DevTools > Console says exactly which call failed and why.
      ;[['profile', p], ['achievements', a], ['skills', s], ['projects', m], ['GitHub projects', g]].forEach(([name, r]) => {
        if (r.status === 'rejected') console.warn(`[portfolio] could not load ${name}: ${r.reason?.message}`)
      })
      const profile = { ...fallbackProfile, ...clean(p.value) }
      if (!Array.isArray(profile.stats)) profile.stats = []
      setState({
        loading: false,
        offline: [p, a, s, m, g].every((r) => r.status === 'rejected'),
        profile,
        achievements: a.value || [],
        skills: s.value || [],
        projects: buildProjects(g.value, m.value),
        githubUrl: g.value?.profile_url || profile.github_url || '',
      })
    })
    return () => {
      alive = false
    }
  }, [])

  return <SiteContext.Provider value={state}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)
