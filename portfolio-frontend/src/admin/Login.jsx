import { useState } from 'react'
import { admin } from './adminApi.js'

export default function Login({ onSuccess, expired }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await admin.login(email.trim(), password)
      onSuccess(res.access_token)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm adm--login">
      <form className="adm__login" onSubmit={submit}>
        <h1>Admin<span>.</span></h1>
        <p>Sign in to manage your portfolio.</p>
        {expired && <div className="adm__note">Your session expired. Please sign in again.</div>}
        {error && <div className="adm__error" role="alert">{error}</div>}
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
        <button className="adm__btn adm__btn--primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <a href="/" className="adm__back">← Back to site</a>
      </form>
    </div>
  )
}
