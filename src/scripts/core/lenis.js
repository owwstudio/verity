import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './motion.js'

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

const lenis = new Lenis({
  autoRaf: false,
  smoothWheel: !reducedMotionQuery.matches,
})

lenis.on('scroll', ScrollTrigger.update)

const updateLenis = (time) => {
  lenis.raf(time * 1000)
}

gsap.ticker.add(updateLenis)
gsap.ticker.lagSmoothing(0)

export { lenis }
