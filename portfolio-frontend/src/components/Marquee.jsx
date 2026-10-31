import { useSite } from '../hooks/useSite.jsx'
import { fallbackSkills } from '../content.js'

// Always shown in the band, merged with any skills added from the admin dashboard.
const stackItems = [
  'Python', 'FastAPI', 'React', 'Next.js', 'Docker', 'PostgreSQL', 'pgAdmin 4',
  'SQLAlchemy', 'JavaScript', 'Git & GitHub',
]

// One "group" is a full set of names (even length so the outline/solid pattern
// is identical in both halves). The track holds two identical halves and slides
// exactly one half, so the loop never visibly jumps.
const unique = (list) => {
  const seen = new Set()
  return list.filter((n) => {
    const k = n.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export default function Marquee() {
  const { skills } = useSite()
  const fromApi = skills.length ? skills.map((s) => s.name) : fallbackSkills
  let group = unique([...stackItems, ...fromApi])
  if (group.length % 2) group = [...group, ...group] // keep the pattern even
  const half = Array.from({ length: Math.max(1, Math.ceil(14 / group.length)) }, () => group).flat()
  const track = [...half, ...half]
  return (
    <div className="marquee" aria-label="Skills">
      <div className="marquee__track" style={{ '--marquee-time': `${Math.max(30, half.length * 2.6)}s` }}>
        {track.map((name, i) => (
          <span key={i} className={i % 2 ? 'is-outline' : ''} aria-hidden={i >= half.length}>
            {name}
            <i className="marquee__dot" />
          </span>
        ))}
      </div>
    </div>
  )
}
