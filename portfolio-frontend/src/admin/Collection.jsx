import { useState } from 'react'
import { admin } from './adminApi.js'
import { useLoad } from './hooks.js'
import { useConfirm } from './useConfirm.jsx'

// Field configs mirror the backend schemas (ProjectIn, AchievementIn, SkillIn).
export const collections = {
  projects: {
    label: 'Projects', noun: 'project', titleKey: 'title', subKey: 'description',
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Short description', type: 'textarea', rows: 3 },
      { key: 'details', label: 'Details (long write-up)', type: 'textarea', rows: 5 },
      { key: 'tags', label: 'Tags (comma separated)', type: 'tags' },
      { key: 'github_url', label: 'GitHub URL' },
      { key: 'live_url', label: 'Live URL' },
      { key: 'image_url', label: 'Image URL' },
      { key: 'order', label: 'Order', type: 'number' },
    ],
  },
  achievements: {
    label: 'Achievements', noun: 'achievement', titleKey: 'title', subKey: 'category',
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { key: 'icon', label: 'Icon (emoji, max 20 chars)' },
      { key: 'order', label: 'Order', type: 'number' },
    ],
  },
  skills: {
    label: 'Skills', noun: 'skill', titleKey: 'name', subKey: 'category',
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'category', label: 'Category' },
      { key: 'order', label: 'Order', type: 'number' },
    ],
  },
}

const blank = (cfg) =>
  Object.fromEntries(cfg.fields.map((f) => [f.key, f.type === 'tags' ? [] : f.type === 'number' ? 0 : '']))

export default function Collection({ kind }) {
  const cfg = collections[kind]
  const { data, error, loading, reload } = useLoad(() => admin.list(kind), [kind])
  const [editing, setEditing] = useState(null) // { id|null, values }
  const [msg, setMsg] = useState({ error: '', busy: false })
  const [confirm, confirmDialog] = useConfirm()

  const startNew = () => setEditing({ id: null, values: blank(cfg), tagText: '' })
  const startEdit = (item) => {
    const values = Object.fromEntries(cfg.fields.map((f) => [f.key, item[f.key] ?? blank(cfg)[f.key]]))
    setEditing({ id: item.id, values, tagText: Array.isArray(values.tags) ? values.tags.join(', ') : '' })
  }

  async function save(e) {
    e.preventDefault()
    setMsg({ error: '', busy: true })
    const body = { ...editing.values }
    if ('tags' in body) body.tags = editing.tagText.split(',').map((t) => t.trim()).filter(Boolean)
    if ('order' in body) body.order = Number(body.order) || 0
    try {
      if (editing.id == null) await admin.create(kind, body)
      else await admin.update(kind, editing.id, body)
      setEditing(null)
      setMsg({ error: '', busy: false })
      reload()
    } catch (err) {
      setMsg({ error: err.message, busy: false })
    }
  }

  async function remove(item) {
    if (!(await confirm(`Delete "${item[cfg.titleKey]}"? This cannot be undone.`))) return
    try {
      await admin.remove(kind, item.id)
      reload()
    } catch (err) {
      setMsg({ error: err.message, busy: false })
    }
  }

  return (
    <>
      <div className="adm__bar">
        <h2 className="adm__h">{cfg.label}</h2>
        <button type="button" className="adm__btn adm__btn--primary" onClick={startNew}>+ New {cfg.noun}</button>
      </div>
      {(error || msg.error) && !editing && <div className="adm__error">{error || msg.error}</div>}
      {loading && <p className="adm__muted">Loading…</p>}
      {!loading && data?.length === 0 && <p className="adm__muted">Nothing here yet.</p>}
      <ul className="adm__list">
        {(data || []).map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item[cfg.titleKey]}</strong>
              <small>#{item.id} · order {item.order}{item[cfg.subKey] ? ` · ${String(item[cfg.subKey]).slice(0, 90)}` : ''}</small>
            </div>
            <div className="adm__actions">
              <button type="button" className="adm__btn" onClick={() => startEdit(item)}>Edit</button>
              <button type="button" className="adm__btn adm__btn--danger" onClick={() => remove(item)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {confirmDialog}
      {editing && (
        <div className="adm__modal" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <form className="adm__form adm__sheet" onSubmit={save}>
            <h3>{editing.id == null ? `New ${cfg.noun}` : `Edit ${cfg.noun} #${editing.id}`}</h3>
            {cfg.fields.map((f) => (
              <label key={f.key}>
                {f.label}
                {f.type === 'textarea' ? (
                  <textarea rows={f.rows} value={editing.values[f.key]} onChange={(e) => setEditing((s) => ({ ...s, values: { ...s.values, [f.key]: e.target.value } }))} />
                ) : f.type === 'tags' ? (
                  <input value={editing.tagText} onChange={(e) => setEditing((s) => ({ ...s, tagText: e.target.value }))} placeholder="FastAPI, Docker" />
                ) : (
                  <input type={f.type === 'number' ? 'number' : 'text'} required={f.required} value={editing.values[f.key]} onChange={(e) => setEditing((s) => ({ ...s, values: { ...s.values, [f.key]: e.target.value } }))} />
                )}
              </label>
            ))}
            {msg.error && <div className="adm__error">{msg.error}</div>}
            <div className="adm__actions">
              <button type="button" className="adm__btn" onClick={() => { setEditing(null); setMsg({ error: '', busy: false }) }}>Cancel</button>
              <button className="adm__btn adm__btn--primary" disabled={msg.busy}>{msg.busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
