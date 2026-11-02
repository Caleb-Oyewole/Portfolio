import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSite } from '../hooks/useSite.jsx'
import { niches } from '../content.js'
import { getLenis, scrollToId } from '../lib/smooth.js'

// Creative feature: a tiny command line that lets visitors explore the portfolio by typing.
// Open it with the floating "Try my terminal" button or by pressing the ` (backtick) key.

const SECTIONS = ['top', 'about', 'work', 'niches', 'achievements', 'contact']
const COMMANDS = ['help', 'whoami', 'about', 'skills', 'projects', 'open', 'achievements', 'contact', 'github', 'linkedin', 'goto', 'ls', 'hire', 'clear', 'exit']
const CHIPS = ['help', 'whoami', 'skills', 'projects', 'achievements', 'contact']

const gmail = (to) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent('Hello from your portfolio')}`

export default function Terminal() {
  const { profile, skills, projects, achievements, githubUrl } = useSite()
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState([])
  const [value, setValue] = useState('')
  const [hist, setHist] = useState([])
  const [cursor, setCursor] = useState(-1)
  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  const launcherRef = useRef(null)
  const welcomed = useRef(false)

  const firstName = (profile.name || 'friend').split(/\s+/)[0]
  const ghUrl = githubUrl || profile.github_url
  const toolList = useMemo(() => {
    const all = [...skills.map((s) => s.name), ...niches.flatMap((n) => n.tools || [])]
    return [...new Map(all.map((t) => [t.toLowerCase(), t])).values()]
  }, [skills])

  const print = useCallback((...items) => setLines((l) => [...l, ...items.map((i) => (typeof i === 'string' ? { k: 'out', t: i } : i))]), [])

  // Open / close (also with the ` key, unless the visitor is typing in a form field).
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase()
      const typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable
      if (e.key === '`' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      getLenis()?.stop()
      if (!welcomed.current) {
        welcomed.current = true
        print(
          { k: 'out', t: `Welcome, visitor. I'm ${firstName}'s portfolio shell.` },
          { k: 'out', t: 'Type "help" to see commands, or tap one below.' },
        )
      }
      setTimeout(() => inputRef.current?.focus(), 30)
    } else {
      getLenis()?.start()
      // Return focus to the launcher, but not in the same tick as the Enter keypress that closed us
      // (otherwise that Enter would "click" the launcher and reopen the terminal).
      if (welcomed.current) setTimeout(() => launcherRef.current?.focus({ preventScroll: true }), 150)
    }
    return () => getLenis()?.start()
  }, [open, firstName, print])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines, open])

  const find = (arg) => {
    if (!arg) return null
    const n = Number(arg)
    if (Number.isInteger(n) && n >= 1 && n <= projects.length) return projects[n - 1]
    const q = arg.toLowerCase()
    return projects.find((p) => p.title.toLowerCase() === q) || projects.find((p) => p.title.toLowerCase().includes(q)) || null
  }

  function run(raw) {
    const input = raw.trim()
    if (!input) return
    setHist((h) => [...h, input])
    setCursor(-1)
    print({ k: 'cmd', t: input })
    const [cmd, ...rest] = input.split(/\s+/)
    const arg = rest.join(' ')
    const c = cmd.toLowerCase()
    switch (c) {
      case 'help':
        print(
          'Commands:',
          '  whoami          who I am',
          '  about           a short bio',
          '  skills          my tech superpowers',
          '  projects        my GitHub projects (numbered)',
          '  open <n|name>   open a project on GitHub',
          '  achievements    milestones',
          '  contact         how to reach me',
          '  github | linkedin',
          '  goto <section>  about, work, niches, achievements, contact',
          '  ls, hire, clear, exit',
        )
        break
      case 'whoami':
        print(profile.name, `${profile.headline}${profile.location ? ` · ${profile.location}` : ''}`)
        break
      case 'about':
        print(profile.bio)
        break
      case 'skills':
        print('Tech superpowers:', toolList.join('  ·  '))
        break
      case 'projects':
      case 'work':
        if (!projects.length) print('No projects loaded yet. Try again in a moment.')
        else {
          print(...projects.map((p, i) => ({ k: 'out', t: `[${i + 1}] ${p.title}${p.language ? ` (${p.language})` : ''}${p.stars ? ` ★${p.stars}` : ''}${p.description ? ` — ${p.description}` : ''}` })), 'Type "open <number>" to view one on GitHub.')
        }
        break
      case 'open': {
        const p = find(arg)
        if (!arg) print('Usage: open <number|name>  (see "projects")')
        else if (!p) print(`No project matches "${arg}".`)
        else if (!p.repoUrl && !p.liveUrl) print(`${p.title} has no public link yet.`)
        else {
          print(`Opening ${p.title}…`)
          window.open(p.repoUrl || p.liveUrl, '_blank', 'noopener,noreferrer')
        }
        break
      }
      case 'achievements':
      case 'milestones':
        print(...(achievements.length ? achievements.map((a, i) => ({ k: 'out', t: `[${i + 1}] ${a.title}${a.category ? ` — ${a.category}` : ''}` })) : ['Nothing here yet.']))
        break
      case 'contact':
      case 'email':
        if (profile.email) print({ k: 'link', t: `Email: ${profile.email}  (opens Gmail compose)`, href: gmail(profile.email) })
        print('Or use the contact form: type "goto contact".')
        break
      case 'github':
        if (ghUrl) { print('Opening GitHub…'); window.open(ghUrl, '_blank', 'noopener,noreferrer') } else print('GitHub link not set yet.')
        break
      case 'linkedin':
        if (profile.linkedin_url) { print('Opening LinkedIn…'); window.open(profile.linkedin_url, '_blank', 'noopener,noreferrer') } else print('LinkedIn link not set yet.')
        break
      case 'goto':
      case 'cd': {
        const id = arg.replace(/^\//, '').toLowerCase()
        if (!SECTIONS.includes(id)) print(`Unknown section "${arg}". Try: ${SECTIONS.join(', ')}`)
        else { setOpen(false); setTimeout(() => scrollToId(id), 120) }
        break
      }
      case 'ls':
        print(SECTIONS.map((s) => `${s}/`).join('  '))
        break
      case 'hire':
      case 'sudo':
        print('[sudo] permission granted ✓', `Great choice. ${firstName} is ${profile.available ? 'available for new projects' : 'busy right now, but say hello anyway'}.`, 'Taking you to the contact section…')
        setTimeout(() => { setOpen(false); setTimeout(() => scrollToId('contact'), 120) }, 900)
        break
      case 'clear':
        setLines([])
        break
      case 'exit':
      case 'quit':
        setOpen(false)
        break
      default:
        print(`command not found: ${cmd}. Type "help".`)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      run(value)
      setValue('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!hist.length) return
      const i = cursor < 0 ? hist.length - 1 : Math.max(0, cursor - 1)
      setCursor(i)
      setValue(hist[i])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (cursor < 0) return
      const i = cursor + 1
      if (i >= hist.length) { setCursor(-1); setValue('') } else { setCursor(i); setValue(hist[i]) }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const hit = COMMANDS.filter((c) => c.startsWith(value.toLowerCase()))
      if (value && hit.length === 1) setValue(`${hit[0]} `)
    }
  }

  return (
    <>
      <button ref={launcherRef} type="button" className="term-launch" onClick={() => setOpen(true)} aria-label="Open the interactive terminal" aria-haspopup="dialog">
        <span className="term-launch__icon" aria-hidden="true">›_</span>
        <span className="term-launch__text">Try my terminal<kbd>`</kbd></span>
      </button>
      {open && (
        <div className="term" role="dialog" aria-modal="true" aria-label="Interactive terminal" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="term__win">
            <div className="term__bar">
              <span className="term__dots" aria-hidden="true"><i /><i /><i /></span>
              <span className="term__title">{firstName.toLowerCase()}@portfolio ~</span>
              <button type="button" className="term__close" onClick={() => setOpen(false)} aria-label="Close terminal">Esc ✕</button>
            </div>
            <div className="term__body" ref={bodyRef} data-lenis-prevent onClick={() => inputRef.current?.focus()}>
              {lines.map((l, i) =>
                l.k === 'cmd' ? (
                  <div key={i} className="term__line term__line--cmd"><span className="term__prompt">$</span> {l.t}</div>
                ) : l.k === 'link' ? (
                  <div key={i} className="term__line"><a href={l.href} target="_blank" rel="noopener noreferrer">{l.t}</a></div>
                ) : (
                  <div key={i} className="term__line">{l.t}</div>
                ),
              )}
            </div>
            <div className="term__chips">
              {CHIPS.map((c) => (
                <button key={c} type="button" onClick={() => { run(c); inputRef.current?.focus() }}>{c}</button>
              ))}
            </div>
            <label className="term__input">
              <span className="term__prompt">$</span>
              <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKeyDown} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-label="Type a command" placeholder="type a command…" enterKeyHint="send" />
            </label>
          </div>
        </div>
      )}
    </>
  )
}
