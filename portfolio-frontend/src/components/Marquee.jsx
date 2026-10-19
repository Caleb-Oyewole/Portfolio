import { useSite } from '../hooks/useSite.jsx'
import { fallbackSkills } from '../content.js'

export default function Marquee() {
  const { skills } = useSite()
  const names = skills.length ? skills.map((s) => s.name) : fallbackSkills
  const base = names.length < 8 ? [...names, ...names, ...names] : names
  const track = [...base, ...base]
  return (
    <div className="marquee" aria-label="Skills">
      <div className="marquee__track">
        {track.map((name, i) => (
          <span key={i} className={i % 2 ? 'is-outline' : ''} aria-hidden={i >= base.length}>
            {name}
            <i className="marquee__dot" />
          </span>
        ))}
      </div>
    </div>
  )
}
