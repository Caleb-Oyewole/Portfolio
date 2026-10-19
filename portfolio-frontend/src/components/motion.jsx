import { Fragment, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export const ease = [0.22, 1, 0.36, 1]
const inView = { once: true, margin: '0px 0px -10% 0px' }

// Fades and lifts its children into place when scrolled into view.
export function Reveal({ children, delay = 0, y = 40, className = '', as = 'div', ...rest }) {
  const Tag = motion[as] || motion.div
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: 0.9, ease, delay }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

// Big headlines: every word slides up out of its own mask.
// (The scroll trigger sits on the mask itself: a child that starts fully clipped can never be seen by the observer.)
export function MaskWords({ text, className = '', delay = 0, as: Tag = 'h2' }) {
  return (
    <Tag className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <Fragment key={i}>
          <motion.span className="mw" aria-hidden="true" initial="hidden" whileInView="show" viewport={inView}>
            <motion.span
              className="mw__in"
              variants={{
                hidden: { y: '112%' },
                show: { y: 0, transition: { duration: 0.95, ease, delay: delay + i * 0.07 } },
              }}
            >
              {word}
            </motion.span>
          </motion.span>{' '}
        </Fragment>
      ))}
    </Tag>
  )
}

// "/WORK" style section label with a large ghost watermark that drifts as you scroll.
export function SectionHeading({ title, ghost, aside }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [90, -90])
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.7, 1], [0, 1, 1, 0])
  return (
    <div className="sh" ref={ref}>
      <motion.span className="sh__ghost" aria-hidden="true" style={{ y, opacity }}>
        {ghost}
      </motion.span>
      <div className="sh__row">
        <h2 className="sh__title">
          <motion.span className="mw" initial="hidden" whileInView="show" viewport={inView}>
            <motion.span
              className="mw__in"
              variants={{ hidden: { y: '112%' }, show: { y: 0, transition: { duration: 0.9, ease } } }}
            >
              /{title}
            </motion.span>
          </motion.span>
        </h2>
        {aside && (
          <Reveal className="sh__aside" y={16}>
            {aside}
          </Reveal>
        )}
      </div>
    </div>
  )
}
