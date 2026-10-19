import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { SiteProvider } from './hooks/useSite.jsx'
import { scrollToTop, setLenis } from './lib/smooth.js'
import Home from './pages/Home.jsx'
import NewsletterConfirm from './pages/NewsletterConfirm.jsx'
import NewsletterUnsubscribe from './pages/NewsletterUnsubscribe.jsx'
import NotFound from './pages/NotFound.jsx'

function ScrollToTopOnRoute() {
  const { pathname } = useLocation()
  useEffect(() => {
    scrollToTop(true)
  }, [pathname])
  return null
}

export default function App() {
  // Smooth (eased) scrolling, skipped for people who prefer reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const lenis = new Lenis({ lerp: 0.1 })
    setLenis(lenis)
    let frame = requestAnimationFrame(function raf(t) {
      lenis.raf(t)
      frame = requestAnimationFrame(raf)
    })
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  return (
    <SiteProvider>
      <ScrollToTopOnRoute />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/newsletter/confirm/:token" element={<NewsletterConfirm />} />
        <Route path="/newsletter/unsubscribe/:token" element={<NewsletterUnsubscribe />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SiteProvider>
  )
}
