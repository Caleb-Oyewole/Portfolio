import { useState } from 'react'
import { admin } from './adminApi.js'
import { fmtDate, useLoad } from './hooks.js'

export default function Subscribers() {
  const { data, setData, error, loading } = useLoad(() => admin.list('subscribers'))
  const [err, setErr] = useState('')
  const confirmed = (data || []).filter((s) => s.confirmed)

  async function del(s) {
    if (!window.confirm(`Remove ${s.email}?`)) return
    try {
      await admin.deleteSubscriber(s.id)
      setData((d) => d.filter((x) => x.id !== s.id))
    } catch (e) { setErr(e.message) }
  }
  function exportCsv() {
    const rows = ['email,confirmed,subscribed', ...(data || []).map((s) => `${s.email},${s.confirmed},${s.created_at}`)]
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'subscribers.csv' })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="adm__bar">
        <h2 className="adm__h">Subscribers <small>{confirmed.length} confirmed / {data?.length ?? 0} total</small></h2>
        <button type="button" className="adm__btn" onClick={exportCsv} disabled={!data?.length}>Export CSV</button>
      </div>
      {(error || err) && <div className="adm__error">{error || err}</div>}
      {loading && <p className="adm__muted">Loading…</p>}
      {!loading && data?.length === 0 && <p className="adm__muted">No subscribers yet.</p>}
      <ul className="adm__list">
        {(data || []).map((s) => (
          <li key={s.id}>
            <div>
              <strong>{s.email}</strong>
              <small>{s.confirmed ? `Confirmed ${fmtDate(s.confirmed_at)}` : 'Waiting for confirmation'} · joined {fmtDate(s.created_at)}</small>
            </div>
            <div className="adm__actions">
              <span className={`adm__badge ${s.confirmed ? 'is-ok' : ''}`}>{s.confirmed ? 'Confirmed' : 'Pending'}</span>
              <button type="button" className="adm__btn adm__btn--danger" onClick={() => del(s)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
