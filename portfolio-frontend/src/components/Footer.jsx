import { useState } from 'react'
import { api } from '../api.js'
import { useSite } from '../hooks/useSite.jsx'
import { Reveal } from './motion.jsx'
import { ArrowUpRight } from './Icons.jsx'

export default function Footer() {
  const { profile, githubUrl } = useSite()
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState('')
  const [state, setState] = useState({ status: 'idle', message: '' })

  const submit = async (e) => {
    e.preventDefault()
    setState({ status: 'sending', message: '' })
    try {
      const res = await api.subscribe({ email, website: hp })
      setState({ status: 'ok', message: res?.detail || 'Check your inbox to confirm your subscription' })
      setEmail('')
    } catch (err) {
      setState({ status: 'error', message: err.message })
    }
  }

  return (
    <footer className="footer" id="newsletter">
      <div className="footer__top">
        <Reveal>
          <h2 className="footer__title">Monthly notes</h2>
          <p className="footer__lead">Project updates and what I&apos;m learning, once a month. No spam.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <form className="subscribe" onSubmit={submit}>
            <input
              type="email"
              required
              placeholder="you@example.com"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} name="website" />
            <button className="btn btn--light" type="submit" disabled={state.status === 'sending'}>
              {state.status === 'sending' ? 'Subscribing…' : 'Subscribe'} <ArrowUpRight />
            </button>
          </form>
          {state.message && (
            <p className={`form-msg is-${state.status}`} role="status">
              {state.message}
            </p>
          )}
        </Reveal>
      </div>
      <div className="footer__word" aria-hidden="true" style={{ '--n': Math.max(profile.name.split(/\s+/)[0].length, 4) }}>
        {profile.name.split(/\s+/)[0]}
      </div>
      <div className="footer__bottom">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span className="footer__links">
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
          {profile.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          )}
        </span>
      </div>
    </footer>
  )
}
