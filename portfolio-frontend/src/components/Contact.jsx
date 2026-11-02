import { useState } from 'react'
import EmailMenu from './EmailMenu.jsx'
import { api } from '../api.js'
import { useSite } from '../hooks/useSite.jsx'
import { MaskWords, Reveal } from './motion.jsx'
import { ArrowUpRight, GithubIcon, LinkedinIcon, MailIcon } from './Icons.jsx'

const empty = { name: '', email: '', subject: '', message: '', website: '' }

export default function Contact() {
  const { profile, githubUrl } = useSite()
  const [form, setForm] = useState(empty)
  const [state, setState] = useState({ status: 'idle', message: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setState({ status: 'sending', message: '' })
    try {
      const res = await api.contact(form)
      setState({ status: 'ok', message: res?.detail || 'Message sent. Thank you!' })
      setForm(empty)
    } catch (err) {
      setState({ status: 'error', message: err.message })
    }
  }

  const socials = [
    githubUrl && { label: 'GitHub', href: githubUrl, Icon: GithubIcon },
    profile.linkedin_url && { label: 'LinkedIn', href: profile.linkedin_url, Icon: LinkedinIcon },
    profile.email && { label: profile.email, href: `mailto:${profile.email}`, Icon: MailIcon, mail: profile.email },
  ].filter(Boolean)

  return (
    <section className="contact section" id="contact">
      <div className="contact__grid">
        <div>
          {profile.available && (
            <Reveal className="pill pill--solid" y={16}>
              <i className="dot" /> Available for new projects
            </Reveal>
          )}
          <MaskWords as="h2" className="contact__title" text="HAVE A PROJECT IN MIND?" />
          <Reveal as="p" className="contact__lead" delay={0.2}>
            Together we can build something clear and impactful. Tell me what you&apos;re working on and I&apos;ll get back to you.
          </Reveal>
          <Reveal as="ul" className="contact__social" delay={0.3}>
            {socials.map(({ label, href, Icon, mail }) => (
              <li key={label}>
                {mail ? (
                  <EmailMenu email={mail} className="pill pill--solid" align="left">
                    <Icon /> {label}
                  </EmailMenu>
                ) : (
                  <a className="pill pill--solid" href={href} target="_blank" rel="noopener noreferrer">
                    <Icon /> {label}
                  </a>
                )}
              </li>
            ))}
          </Reveal>
        </div>

        <Reveal as="form" className="form" onSubmit={submit} delay={0.15} noValidate={false}>
          <label>
            <span>Your name</span>
            <input value={form.name} onChange={set('name')} required maxLength={120} autoComplete="name" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
          </label>
          <label>
            <span>Subject</span>
            <input value={form.subject} onChange={set('subject')} maxLength={200} />
          </label>
          <label>
            <span>Message</span>
            <textarea rows={5} value={form.message} onChange={set('message')} required minLength={5} maxLength={5000} />
          </label>
          {/* Honeypot: hidden from people, tempting to bots. The backend discards anything that fills it. */}
          <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} name="website" />
          <button className="btn btn--light" type="submit" disabled={state.status === 'sending'}>
            {state.status === 'sending' ? 'Sending…' : 'Send message'} <ArrowUpRight />
          </button>
          {state.message && (
            <p className={`form-msg is-${state.status}`} role="status">
              {state.message}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
