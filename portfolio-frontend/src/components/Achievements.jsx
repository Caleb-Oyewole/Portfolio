import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { useSite } from '../hooks/useSite.jsx'
import { Reveal, SectionHeading, ease } from './motion.jsx'

const FALLBACK = [
  { id: 'a1', title: 'Hackathon Winner (1×)', category: 'GDG OAU', description: 'Winner of a hackathon organised by GDG OAU.', icon: '🏆' },
  { id: 'a2', title: 'Diploma in Data Engineering', category: 'AltSchool Africa', description: 'Completed a diploma in Data Engineering at AltSchool Africa.', icon: '🎓' },
  { id: 'a3', title: 'Logistics Lead', category: 'IEEE SPAW 3.0', description: 'Led logistics for IEEE SPAW 3.0.', icon: '🧭' },
]

export default function Achievements() {
  const { achievements } = useSite()
  const items = achievements.length ? achievements : FALLBACK
  const [active, setActive] = useState(null)
  const sectionRef = useRef(null)

  // The dark panel starts with rounded top corners that flatten as it slides over the section above.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'start 0.2'] })
  const radius = useTransform(scrollYProgress, [0, 1], [64, 0])

  // The floating detail card trails the cursor with a spring.
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 260, damping: 28 })
  const y = useSpring(my, { stiffness: 260, damping: 28 })
  const move = (e) => {
    mx.set(Math.min(e.clientX + 32, window.innerWidth - 320))
    my.set(e.clientY)
  }
  const focusAt = (i) => (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(Math.max(16, r.right - 330))
    my.set(r.top + r.height / 2)
    setActive(i)
  }

  return (
    <motion.section
      className="ach section"
      id="achievements"
      ref={sectionRef}
      style={{ borderTopLeftRadius: radius, borderTopRightRadius: radius }}
    >
      <SectionHeading
        title="ACHIEVEMENTS"
        ghost="MILESTONES"
        aside={`${items.length} ${items.length === 1 ? 'milestone' : 'milestones'}`}
      />
      <ul className="ach__list" onPointerMove={(e) => e.pointerType === 'mouse' && move(e)} onPointerLeave={() => setActive(null)}>
        {items.map((a, i) => (
          <Reveal as="li" key={a.id} delay={(i % 5) * 0.06} y={30}>
            <div
              className={`arow${active === i ? ' is-active' : ''}`}
              tabIndex={0}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
              onFocus={focusAt(i)}
              onBlur={() => setActive(null)}
            >
              <span className="arow__no">{String(i + 1).padStart(2, '0')}</span>
              <div className="arow__main">
                <h3>{a.title}</h3>
                {/* Shown inline on touch screens where there is no hover */}
                <p className="arow__inline">{a.description}</p>
              </div>
              <span className="arow__cat">{a.category}</span>
            </div>
          </Reveal>
        ))}
      </ul>

      <AnimatePresence>
        {active !== null && items[active] && (
          <motion.aside
            key="follow"
            className="follow"
            style={{ x, y }}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            exit={{ opacity: 0, scale: 0.85, rotate: -8 }}
            transition={{ duration: 0.35, ease }}
            aria-hidden="true"
          >
            <span className="follow__icon">{items[active].icon || '★'}</span>
            <strong>{items[active].title}</strong>
            <p>{items[active].description || 'No description yet.'}</p>
            {items[active].category && <span className="chip chip--solid">{items[active].category}</span>}
          </motion.aside>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
