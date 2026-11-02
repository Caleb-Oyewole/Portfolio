import { useState } from 'react'
import { admin } from './adminApi.js'
import { fmtDate, useLoad } from './hooks.js'
import { useConfirm } from './useConfirm.jsx'

export default function Newsletter() {
  const issues = useLoad(() => admin.issues())
  const stats = useLoad(() => admin.stats())
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [state, setState] = useState({ busy: false, error: '', ok: '' })
  const [confirm, confirmDialog] = useConfirm()
  const count = stats.data?.subscribers ?? 0

  async function send(e) {
    e.preventDefault()
    if (!(await confirm(`Send "${subject}" to ${count} confirmed subscriber${count === 1 ? '' : 's'}?`, { confirmLabel: 'Send', danger: false }))) return
    setState({ busy: true, error: '', ok: '' })
    try {
      const issue = await admin.sendNewsletter(subject, body)
      setState({ busy: false, error: '', ok: `Sending to ${issue.recipient_count} subscriber(s).` })
      setSubject('')
      setBody('')
      issues.reload()
    } catch (err) {
      setState({ busy: false, error: err.message, ok: '' })
    }
  }

  return (
    <>
      <h2 className="adm__h">Newsletter</h2>
      {confirmDialog}
      <form className="adm__form" onSubmit={send}>
        <p className="adm__muted">Plain text. An unsubscribe link is added automatically. Goes to <b>{count}</b> confirmed subscriber{count === 1 ? '' : 's'}.</p>
        <label>Subject<input value={subject} onChange={(e) => setSubject(e.target.value)} required /></label>
        <label>Message<textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} required /></label>
        {state.error && <div className="adm__error">{state.error}</div>}
        {state.ok && <div className="adm__ok">{state.ok}</div>}
        <div><button className="adm__btn adm__btn--primary" disabled={state.busy || !count}>{state.busy ? 'Sending…' : 'Send newsletter'}</button></div>
      </form>
      <h3 className="adm__sub">Sent issues</h3>
      {issues.data?.length === 0 && <p className="adm__muted">Nothing sent yet.</p>}
      <ul className="adm__list">
        {(issues.data || []).map((i) => (
          <li key={i.id}><div><strong>{i.subject}</strong><small>{fmtDate(i.sent_at)} · {i.recipient_count} recipient(s)</small></div></li>
        ))}
      </ul>
    </>
  )
}
