import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { niches } from '../content.js'
import { SectionHeading, Reveal, ease } from './motion.jsx'
import { ArrowUpRight } from './Icons.jsx'

function Details({ niche, className = '' }) {
  return (
    <div className={`niche__inner ${className}`}>
      <div>
        <p className="niche__summary">{niche.summary}</p>
        <ul className="niche__points">
          {niche.points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ul>
      </div>
      <motion.div
        className="niche__card"
        initial={{ rotate: -10, y: 40, opacity: 0 }}
        animate={{ rotate: -4, y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease, delay: 0.1 }}
      >
        <span className="niche__card-label">Toolkit</span>
        <ul>
          {niche.tools.map((t) => (
            <li key={t} className="chip chip--solid">
              {t}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}

export default function Niches() {
  const [active, setActive] = useState(0)
  const shownIndex = Math.max(active, 0)
  const shown = niches[shownIndex]
  const isDesktop = () => window.matchMedia('(min-width: 900px)').matches

  return (
    <section className="niches section" id="niches">
      <SectionHeading title="NICHES" ghost="EXPERTISE" aside="Explore each niche" />
      <div className="niches__layout">
        <ul className="niches__list">
          {niches.map((n, i) => {
            const isOpen = active === i
            return (
              <Reveal as="li" key={n.id} delay={i * 0.08} y={50} className={`niche${isOpen ? ' is-open' : ''}`}>
                <button
                  className="niche__head"
                  aria-expanded={isOpen}
                  aria-controls={`niche-${n.id}`}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                  onFocus={() => setActive(i)}
                  // On desktop the side panel is always showing something, so a click just selects.
                  // On small screens the row is an accordion, so a click toggles it.
                  onClick={() => setActive(isOpen && !isDesktop() ? -1 : i)}
                >
                  <span className="niche__no">0{i + 1}</span>
                  <span className="niche__title">{n.title}</span>
                  <ArrowUpRight className="niche__arrow" width={26} height={26} />
                </button>
                {/* Accordion body: used on small screens only (hidden on desktop by CSS) */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`niche-${n.id}`}
                      className="niche__body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease }}
                    >
                      <Details niche={n} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            )
          })}
        </ul>

        {/* Desktop detail panel: fixed position in the layout, so hovering never shifts the list */}
        <Reveal className="niche-detail" y={60} delay={0.15} aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={shown.id}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease }}
            >
              <span className="niche-detail__label">
                0{shownIndex + 1} / {shown.title}
              </span>
              <Details niche={shown} />
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  )
}
