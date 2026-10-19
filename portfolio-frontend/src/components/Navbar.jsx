import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useSite } from '../hooks/useSite.jsx'
import { scrollToId } from '../lib/smooth.js'
import { ArrowUpRight } from './Icons.jsx'
import { ease } from './motion.jsx'

const links = [
  ['about', 'About'],
  ['work', 'Work'],
  ['niches', 'Niches'],
  ['achievements', 'Achievements'],
  ['contact', 'Contact'],
]

export default function Navbar() {
  const { profile } = useSite()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [hidden, setHidden] = useState(false)
  const [menu, setMenu] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(v > prev && v > 240)
  })

  const go = (id) => (e) => {
    e.preventDefault()
    setMenu(false)
    if (pathname === '/') scrollToId(id)
    else navigate('/', { state: { scrollTo: id } })
  }

  return (
    <>
      <motion.header
        className="nav"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden && !menu ? -90 : 0, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
      >
        <Link to="/" className="nav__status" aria-label="Home">
          {profile.available ? (
            <>
              <i className="dot" /> Available for new projects
            </>
          ) : (
            profile.name
          )}
        </Link>
        <nav className="nav__links" aria-label="Primary">
          {links.map(([id, label]) => (
            <a key={id} href={`/#${id}`} onClick={go(id)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="nav__right">
          <a href="/#contact" onClick={go('contact')} className="btn btn--dark btn--sm">
            Let&apos;s talk <ArrowUpRight />
          </a>
          <button
            className="nav__burger"
            aria-label={menu ? 'Close menu' : 'Open menu'}
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            <span />
            <span />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease }}
          >
            {links.map(([id, label], i) => (
              <motion.a
                key={id}
                href={`/#${id}`}
                onClick={go(id)}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease }}
              >
                {label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
