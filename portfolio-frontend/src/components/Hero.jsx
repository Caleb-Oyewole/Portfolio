import { useRef, useState } from 'react'
import EmailMenu from './EmailMenu.jsx'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useSite } from '../hooks/useSite.jsx'
import { scrollToId } from '../lib/smooth.js'
import { ease } from './motion.jsx'
import { ArrowUpRight, GithubIcon, LinkedinIcon, MailIcon, PinIcon } from './Icons.jsx'

// Each letter rises out of its own mask, one after another.
function Letters({ text, delay = 0, outline = false }) {
  return (
    <span className={`letters${outline ? ' is-outline' : ''}`} aria-label={text}>
      {[...text].map((ch, i) => (
        <span className="letters__mask" key={i} aria-hidden="true">
          <motion.span
            className="letters__char"
            initial={{ y: '118%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1.05, ease, delay: delay + i * 0.05 }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

const firstSentence = (text = '') => {
  const s = text.split(/(?<=[.!?])\s+/)[0] || ''
  return s.length > 160 ? `${s.slice(0, 157).trim()}…` : s
}

export default function Hero() {
  const { profile, githubUrl } = useSite()
  const ref = useRef(null)
  const [broken, setBroken] = useState(false)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const nameY = useTransform(scrollYProgress, [0, 1], [0, -150])
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const fade = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  const parts = profile.name.trim().split(/\s+/)
  const first = parts[0] || ''
  const second = parts[1] || ''
  const chars = Math.max(first.length + second.length + 1, 6)
  const initials = parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase()

  const socials = [
    githubUrl && { label: 'GitHub', href: githubUrl, Icon: GithubIcon },
    profile.linkedin_url && { label: 'LinkedIn', href: profile.linkedin_url, Icon: LinkedinIcon },
    profile.email && { label: 'Email', href: `mailto:${profile.email}`, Icon: MailIcon, mail: profile.email },
  ].filter(Boolean)

  return (
    <section className="hero" id="top" ref={ref} style={{ '--n': chars }}>
      <motion.h1 className="hero__name" style={{ y: nameY }}>
        <Letters text={first.toUpperCase()} outline delay={0.2} />
        {second && (
          <>
            {' '}
            <Letters text={second.toUpperCase()} delay={0.2 + first.length * 0.05} />
          </>
        )}
      </motion.h1>

      <div className="hero__stage">
        <motion.div className="hero__info" style={{ opacity: fade }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.9 }}
          >
            <p className="hero__role">{profile.headline}</p>
            {profile.location && (
              <p className="hero__loc">
                <PinIcon /> {profile.location}
              </p>
            )}
            <p className="hero__tag">{firstSentence(profile.bio)}</p>
            <a
              href="/#contact"
              className="btn btn--dark"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('contact')
              }}
            >
              Let&apos;s collaborate <ArrowUpRight />
            </a>
          </motion.div>
        </motion.div>

        <motion.div className="hero__photo" style={{ y: photoY, scale: photoScale }}>
          <motion.div
            className="hero__photo-inner"
            initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 1.5, ease, delay: 0.45 }}
          >
            {profile.photo_url && !broken ? (
              <motion.img
                src={profile.photo_url}
                alt={`Portrait of ${profile.name}`}
                onError={() => setBroken(true)}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.8, ease, delay: 0.45 }}
              />
            ) : (
              <div className="hero__monogram" aria-hidden="true">
                {initials}
              </div>
            )}
          </motion.div>
        </motion.div>

        <motion.ul className="hero__social" style={{ opacity: fade }}>
          {socials.map(({ label, href, Icon, mail }, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease, delay: 1.1 + i * 0.1 }}
            >
              {mail ? (
                <EmailMenu email={mail} className="pill" align="right">
                  <Icon /> {label}
                </EmailMenu>
              ) : (
                <a className="pill" href={href} target="_blank" rel="noopener noreferrer">
                  <Icon /> {label}
                </a>
              )}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
