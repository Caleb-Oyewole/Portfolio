import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useSite } from '../hooks/useSite.jsx'
import { Reveal, SectionHeading, ease } from './motion.jsx'

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.12, 1])
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </>
  )
}

// The paragraph "lights up" word by word as you scroll through it.
function WordReveal({ text }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <p className="about__text" ref={ref}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  )
}

function CountUp({ value }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const match = String(value).match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/)
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!visible || !match) return undefined
    const controls = animate(0, parseFloat(match[2]), { duration: 1.8, ease, onUpdate: setN })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])
  if (!match) return <span ref={ref}>{value}</span>
  const decimals = match[2].includes('.') ? match[2].split('.')[1].length : 0
  return (
    <span ref={ref}>
      {match[1]}
      {n.toFixed(decimals)}
      {match[3]}
    </span>
  )
}

export default function About() {
  const { profile } = useSite()
  return (
    <section className="about section" id="about">
      <SectionHeading title="ABOUT" ghost="PROFILE" aside={profile.location} />
      <WordReveal text={profile.bio} />
      {profile.stats.length > 0 && (
        <ul className="stats">
          {profile.stats.map((s, i) => (
            <Reveal as="li" key={i} delay={i * 0.1} className="stats__item">
              <strong>
                <CountUp value={s.value} />
              </strong>
              <span>{s.label}</span>
            </Reveal>
          ))}
        </ul>
      )}
    </section>
  )
}
