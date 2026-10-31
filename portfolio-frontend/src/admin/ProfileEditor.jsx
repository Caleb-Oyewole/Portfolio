import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { admin } from './adminApi.js'

const empty = { name: '', headline: '', bio: '', location: '', email: '', github_url: '', linkedin_url: '', photo_url: '', available: true, stats: [] }

export default function ProfileEditor() {
  const [form, setForm] = useState(empty)
  const [state, setState] = useState({ loading: true, saving: false, error: '', ok: false })

  useEffect(() => {
    api.profile()
      .then((p) => setForm({ ...empty, ...p, stats: Array.isArray(p?.stats) ? p.stats : [] }))
      .catch(() => {})
      .finally(() => setState((s) => ({ ...s, loading: false })))
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const setStat = (i, k, v) => setForm((f) => ({ ...f, stats: f.stats.map((s, j) => (j === i ? { ...s, [k]: v } : s)) }))

  async function save(e) {
    e.preventDefault()
    setState((s) => ({ ...s, saving: true, error: '', ok: false }))
    try {
      const { id, ...body } = form // eslint-disable-line no-unused-vars
      await admin.saveProfile({ ...body, stats: form.stats.filter((s) => s.value || s.label) })
      setState((s) => ({ ...s, saving: false, ok: true }))
    } catch (err) {
      setState((s) => ({ ...s, saving: false, error: err.message }))
    }
  }

  if (state.loading) return <p className="adm__muted">Loading…</p>
  return (
    <form onSubmit={save} className="adm__form">
      <h2 className="adm__h">Profile</h2>
      <div className="adm__grid">
        <label>Name<input value={form.name} onChange={set('name')} required /></label>
        <label>Headline<input value={form.headline} onChange={set('headline')} /></label>
        <label>Location<input value={form.location} onChange={set('location')} /></label>
        <label>Public email<input type="email" value={form.email} onChange={set('email')} /></label>
        <label>GitHub URL<input value={form.github_url} onChange={set('github_url')} placeholder="https://github.com/Caleb-Oyewole" /></label>
        <label>LinkedIn URL<input value={form.linkedin_url} onChange={set('linkedin_url')} /></label>
        <label className="adm__wide">Photo URL<input value={form.photo_url} onChange={set('photo_url')} placeholder="https://… or /me.jpg" /></label>
        <label className="adm__wide">Bio<textarea rows={5} value={form.bio} onChange={set('bio')} /></label>
      </div>
      <label className="adm__check"><input type="checkbox" checked={form.available} onChange={set('available')} /> Available for work</label>

      <h3>Highlight numbers</h3>
      {form.stats.map((s, i) => (
        <div className="adm__row" key={i}>
          <input placeholder="3+" value={s.value || ''} onChange={(e) => setStat(i, 'value', e.target.value)} />
          <input placeholder="Projects shipped" value={s.label || ''} onChange={(e) => setStat(i, 'label', e.target.value)} />
          <button type="button" className="adm__btn adm__btn--danger" onClick={() => setForm((f) => ({ ...f, stats: f.stats.filter((_, j) => j !== i) }))}>Remove</button>
        </div>
      ))}
      <button type="button" className="adm__btn" onClick={() => setForm((f) => ({ ...f, stats: [...f.stats, { value: '', label: '' }] }))}>+ Add number</button>

      {state.error && <div className="adm__error">{state.error}</div>}
      {state.ok && <div className="adm__ok">Saved. Refresh your site to see it.</div>}
      <div><button className="adm__btn adm__btn--primary" disabled={state.saving}>{state.saving ? 'Saving…' : 'Save profile'}</button></div>
    </form>
  )
}
