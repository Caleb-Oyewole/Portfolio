import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSite } from '../hooks/useSite.jsx'
import { Reveal, SectionHeading, ease } from './motion.jsx'
import { ArrowUpRight, ForkIcon, StarIcon } from './Icons.jsx'

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : ''

function ProjectCard({ project: p, index }) {
  const [open, setOpen] = useState(false)
  const lastPointer = useRef('mouse')
  const glyph = (p.title.match(/[A-Za-z0-9]/g) || ['·']).slice(0, 2).join('').toUpperCase()

  return (
    <motion.article
      layout
      className="pcard"
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, ease, delay: (index % 3) * 0.09 }}
      tabIndex={0}
      onPointerDown={(e) => {
        lastPointer.current = e.pointerType
      }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
      onClick={(e) => {
        if (e.target.closest('a')) return
        if (lastPointer.current !== 'mouse') setOpen((o) => !o)
      }}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <div className={`pcard__visual tone-${index % 3}`}>
        {p.image ? <img src={p.image} alt="" loading="lazy" /> : <span className="pcard__glyph" aria-hidden="true">{glyph}</span>}
        <div className="pcard__badges">
          <span className="chip chip--glass">{p.language || 'Project'}</span>
          {p.stars > 0 && (
            <span className="chip chip--glass">
              <StarIcon width={12} height={12} /> {p.stars}
            </span>
          )}
        </div>
        <span className="pcard__hint" aria-hidden="true">
          <span className="hint-mouse">Hover</span>
          <span className="hint-touch">Tap</span> for details
        </span>

        <AnimatePresence>
          {open && (
            <motion.div
              className="pcard__detail"
              initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              exit={{ clipPath: 'inset(100% 0% 0% 0%)' }}
              transition={{ duration: 0.55, ease }}
            >
              <p className="pcard__desc">{p.description || 'No description yet. Add one on GitHub.'}</p>
              {p.details && <p className="pcard__more">{p.details}</p>}
              {p.tags.length > 0 && (
                <ul className="pcard__tags">
                  {p.tags.slice(0, 5).map((t) => (
                    <li key={t} className="chip chip--line">
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              <div className="pcard__stats">
                <span>
                  <StarIcon width={13} height={13} /> {p.stars}
                </span>
                <span>
                  <ForkIcon width={13} height={13} /> {p.forks}
                </span>
                {p.pushed && <span>Updated {fmtDate(p.pushed)}</span>}
              </div>
              <div className="pcard__actions">
                {p.repoUrl && (
                  <a className="btn btn--light btn--sm" href={p.repoUrl} target="_blank" rel="noopener noreferrer">
                    Repository <ArrowUpRight />
                  </a>
                )}
                {p.liveUrl && (
                  <a className="btn btn--ghost btn--sm" href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                    Live <ArrowUpRight />
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="pcard__meta">
        <h3>{p.title}</h3>
        <p>{p.language || (p.tags[0] ?? '')}</p>
      </div>
    </motion.article>
  )
}

export default function Work() {
  const { projects, githubUrl, loading } = useSite()
  const [filter, setFilter] = useState('All')

  const filters = useMemo(() => {
    const counts = {}
    projects.forEach((p) => p.language && (counts[p.language] = (counts[p.language] || 0) + 1))
    const langs = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([l]) => l)
    return ['All', ...(projects.some((p) => p.featured) ? ['Featured'] : []), ...langs]
  }, [projects])

  const visible = projects.filter(
    (p) => filter === 'All' || (filter === 'Featured' ? p.featured : p.language === filter),
  )

  return (
    <section className="work section" id="work">
      <SectionHeading
        title="SELECTED WORK"
        ghost="PORTFOLIO"
        aside={
          githubUrl && (
            <a className="btn btn--line btn--sm" href={githubUrl} target="_blank" rel="noopener noreferrer">
              All on GitHub <ArrowUpRight />
            </a>
          )
        }
      />

      <Reveal className="tabs" role="tablist" aria-label="Filter projects">
        {filters.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            className={`tab${filter === f ? ' is-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
            {f === 'All' && <sup>{projects.length}</sup>}
          </button>
        ))}
      </Reveal>

      {loading ? (
        <div className="grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pcard pcard--skeleton" aria-hidden="true" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="empty">
          Projects will show up here once your GitHub username is set in the backend&apos;s <code>.env</code>.
        </p>
      ) : (
        <motion.div className="grid" layout>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}
