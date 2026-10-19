// Shares the Lenis (smooth scroll) instance so navigation can scroll smoothly.
let instance = null

export const setLenis = (lenis) => {
  instance = lenis
}

export const getLenis = () => instance

export function scrollToId(id, offset = -10) {
  const el = document.getElementById(id)
  if (!el) return
  if (instance) instance.scrollTo(el, { offset, duration: 1.5 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export function scrollToTop(immediate = false) {
  if (instance) instance.scrollTo(0, { immediate })
  else window.scrollTo(0, 0)
}
