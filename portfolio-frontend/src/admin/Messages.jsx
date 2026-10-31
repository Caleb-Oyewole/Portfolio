import { useState } from 'react'
import { admin } from './adminApi.js'
import { fmtDate, useLoad } from './hooks.js'

export default function Messages() {
  const { data, setData, error, loading } = useLoad(() => admin.list('messages'))
  const [openId, setOpenId] = useState(null)
  const [err, setErr] = useState('')

  async function open(m) {
    setOpenId(openId === m.id ? null : m.id)
    if (!m.is_read) {
      try {
        const u = await admin.markRead(m.id)
        setData((d) => d.map((x) => (x.id === m.id ? u : x)))
      } catch (e) { setErr(e.message) }
    }
  }
  async function del(m) {
    if (!window.confirm('Delete this message?')) return
    try {
      await admin.deleteMessage(m.id)
      setData((d) => d.filter((x) => x.id !== m.id))
    } catch (e) { setErr(e.message) }
  }

  return (
    <>
      <h2 className="adm__h">Messages</h2>
      {(error || err) && <div className="adm__error">{error || err}</div>}
      {loading && <p className="adm__muted">Loading…</p>}
      {!loading && data?.length === 0 && <p className="adm__muted">No messages yet. They arrive from your contact form.</p>}
      <ul className="adm__list">
        {(data || []).map((m) => (
          <li key={m.id} className={`adm__msg ${m.is_read ? '' : 'is-unread'}`}>
            <div className="adm__msghead" onClick={() => open(m)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && open(m)}>
              <div>
                <strong>{m.name} <em>&lt;{m.email}&gt;</em></strong>
                <small>{m.subject || '(no subject)'} · {fmtDate(m.created_at)}</small>
              </div>
              {!m.is_read && <span className="adm__badge">New</span>}
            </div>
            {openId === m.id && (
              <div className="adm__msgbody">
                <p>{m.message}</p>
                <div className="adm__actions">
                  <a className="adm__btn adm__btn--primary" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Your message'}`)}`}>Reply</a>
                  <button type="button" className="adm__btn adm__btn--danger" onClick={() => del(m)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
