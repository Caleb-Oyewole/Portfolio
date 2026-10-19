import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSite } from '../hooks/useSite.jsx'
import { scrollToId } from '../lib/smooth.js'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import Marquee from '../components/Marquee.jsx'
import About from '../components/About.jsx'
import Work from '../components/Work.jsx'
import Niches from '../components/Niches.jsx'
import Achievements from '../components/Achievements.jsx'
import Contact from '../components/Contact.jsx'
import Footer from '../components/Footer.jsx'

export default function Home() {
  const { profile } = useSite()
  const location = useLocation()

  useEffect(() => {
    document.title = `${profile.name} | ${profile.headline}`
  }, [profile.name, profile.headline])

  // Arriving from another page (e.g. the confirm page) with a section to scroll to.
  useEffect(() => {
    const id = location.state?.scrollTo || location.hash.replace('#', '')
    if (!id) return undefined
    const t = setTimeout(() => scrollToId(id), 450)
    return () => clearTimeout(t)
  }, [location])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Work />
        <Niches />
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
