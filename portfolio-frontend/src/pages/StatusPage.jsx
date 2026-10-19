import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSite } from '../hooks/useSite.jsx'
import { ease } from '../components/motion.jsx'
import { ArrowUpRight } from '../components/Icons.jsx'

// Shared layout for the newsletter confirm / unsubscribe / 404 pages.
export default function StatusPage({ tone = 'neutral', title, children }) {
  const { profile } = useSite()
  return (
    <main className={`status status--${tone}`}>
      <Link to="/" className="status__brand">
        {profile.name}
      </Link>
      <motion.div
        className="status__card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease }}
      >
        <h1>{title}</h1>
        <div className="status__body">{children}</div>
        <Link to="/" className="btn btn--dark">
          Back to site <ArrowUpRight />
        </Link>
      </motion.div>
    </main>
  )
}
