import { useEffect, useRef, useState } from 'react'

// Email button: opens a small menu so visitors can compose in Gmail (or Outlook /
// Yahoo / their default mail app) instead of relying on a configured mailto handler.
export default function EmailMenu({ email, label, className, children, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const box = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const away = (e) => !box.current?.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const to = encodeURIComponent(email)
  const subject = encodeURIComponent('Hello from your portfolio')
  const options = [
    ['Gmail', `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}`],
    ['Outlook', `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${subject}`],
    ['Yahoo Mail', `https://compose.mail.yahoo.com/?to=${to}&subject=${subject}`],
    ['Default mail app', `mailto:${email}?subject=${subject}`],
  ]

  async function copy() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copy this email address:', email)
    }
  }

  return (
    <span className={`emailmenu emailmenu--${align}`} ref={box}>
      <a
        className={className}
        href={`mailto:${email}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault()
          setOpen((o) => !o)
        }}
      >
        {children || label}
      </a>
      {open && (
        <span className="emailmenu__panel" role="menu">
          <span className="emailmenu__title">Write to {email}</span>
          {options.map(([name, href]) => (
            <a key={name} role="menuitem" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" onClick={() => setOpen(false)}>
              {name}
            </a>
          ))}
          <button type="button" role="menuitem" onClick={copy}>{copied ? 'Copied ✓' : 'Copy address'}</button>
        </span>
      )}
    </span>
  )
}
