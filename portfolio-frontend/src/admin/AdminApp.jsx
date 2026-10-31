import { useCallback, useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { admin, setUnauthorizedHandler, token } from './adminApi.js'
import Login from './Login.jsx'
import Overview from './Overview.jsx'
import ProfileEditor from './ProfileEditor.jsx'
import Collection, { collections } from './Collection.jsx'
import Messages from './Messages.jsx'
import Subscribers from './Subscribers.jsx'
import Newsletter from './Newsletter.jsx'
import './admin.css'

const nav = [
  ['overview', 'Overview'],
  ['profile', 'Profile'],
  ['projects', 'Projects'],
  ['achievements', 'Achievements'],
  ['skills', 'Skills'],
  ['messages', 'Messages'],
  ['subscribers', 'Subscribers'],
  ['newsletter', 'Newsletter'],
]

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => !!token.get())
  const [expired, setExpired] = useState(false)
  const [email, setEmail] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const logout = useCallback((isExpired = false) => {
    token.clear()
    setAuthed(false)
    setExpired(isExpired)
  }, [])

  useEffect(() => {
    document.title = 'Admin | Portfolio'
    setUnauthorizedHandler(() => logout(true))
    return () => setUnauthorizedHandler(() => {})
  }, [logout])

  useEffect(() => {
    if (!authed) return
    admin.me().then((m) => setEmail(m?.email || '')).catch(() => {})
  }, [authed])

  if (!authed) {
    return (
      <Login
        expired={expired}
        onSuccess={(t) => {
          token.set(t)
          setExpired(false)
          setAuthed(true)
          navigate('/admin/overview', { replace: true })
        }}
      />
    )
  }

  return (
    <div className="adm">
      <aside className={`adm__side ${open ? 'is-open' : ''}`}>
        <div className="adm__brand">Admin<span>.</span></div>
        <nav>
          {nav.map(([to, label]) => (
            <NavLink key={to} to={`/admin/${to}`} onClick={() => setOpen(false)}>{label}</NavLink>
          ))}
        </nav>
        <div className="adm__foot">
          {email && <p title={email}>{email}</p>}
          <a href="/" target="_blank" rel="noreferrer">View site ↗</a>
          <button type="button" onClick={() => logout(false)}>Log out</button>
        </div>
      </aside>
      <div className="adm__main">
        <header className="adm__top">
          <button type="button" className="adm__burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">☰</button>
          <span>Manage your portfolio content</span>
        </header>
        <main className="adm__content">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="profile" element={<ProfileEditor />} />
            {Object.keys(collections).map((k) => (
              <Route key={k} path={k} element={<Collection kind={k} />} />
            ))}
            <Route path="messages" element={<Messages />} />
            <Route path="subscribers" element={<Subscribers />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
