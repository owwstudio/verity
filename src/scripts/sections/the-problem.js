import { gsap, ScrollTrigger } from '../core/motion.js'

const SELECTORS = {
  section: '[data-problem]',
  background: '[data-problem-background]',
  overlay: '[data-problem-overlay]',
  depth: '[data-problem-depth]',
  interlude: '[data-problem-interlude]',
  closing: '[data-problem-closing]',
  layout: '[data-problem-layout]',
  heading: '[data-problem-heading]',
  timelineItem: '[data-problem-timeline-item]',
  principles: '[data-problem-principles]',
  assurance: '[data-problem-assurance]',
  navbar: '[data-navbar]',
}

const BACKGROUND_STATES = [
  { x: 0, y: 0, scale: 1 },
  { x: '-22.014vw', y: '-42.639vw', scale: 1.232 },
  { x: '32.361vw', y: '1.528vw', scale: 1.348 },
  { x: '42.5vw', y: '-30.278vw', scale: 1.152 },
  { x: '40.035vw', y: '0.868vw', scale: 0.737 },
]

const setNavbarTheme = (navbar, theme) => {
  if (!navbar) return

  if (theme === 'glass') {
    navbar.dataset.navbarTheme = theme
    return
  }

  delete navbar.dataset.navbarTheme
}

const setNavbarPosition = (navbar, position) => {
  if (!navbar) return

  navbar.dataset.navbarPosition = position
}

const showNavbar = (navbar, theme, animate = false) => {
  if (!navbar) return

  gsap.killTweensOf(navbar)
  setNavbarPosition(navbar, 'fixed')
  setNavbarTheme(navbar, theme)

  if (!animate) {
    gsap.set(navbar, { clearProps: 'transform,opacity' })
    return
  }

  gsap.fromTo(
    navbar,
    { yPercent: -100, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: true,
    },
  )
}

const releaseNavbar = (navbar, reducedMotion) => {
  if (!navbar || navbar.dataset.navbarPosition !== 'fixed') return

  gsap.killTweensOf(navbar)
  gsap.to(navbar, {
    yPercent: -100,
    opacity: 0,
    duration: reducedMotion ? 0 : 0.4,
    ease: 'power2.inOut',
    overwrite: true,
    onComplete: () => {
      setNavbarPosition(navbar, 'released')
      setNavbarTheme(navbar, 'default')
      gsap.set(navbar, { clearProps: 'transform,opacity' })
    },
  })
}

const addBackgroundState = (timeline, background, state, position) => {
  if (!background) return

  timeline.to(
    background,
    {
      ...state,
      duration: 0.8,
      ease: 'none',
    },
    position,
  )
}

const initTheProblem = () => {
  const section = window.document.querySelector(SELECTORS.section)

  if (!section) return

  const background = section.querySelector(SELECTORS.background)
  const overlay = section.querySelector(SELECTORS.overlay)
  const depth = section.querySelector(SELECTORS.depth)
  const interlude = section.querySelector(SELECTORS.interlude)
  const closing = section.querySelector(SELECTORS.closing)
  const layout = section.querySelector(SELECTORS.layout)
  const heading = section.querySelector(SELECTORS.heading)
  const timelineItems = gsap.utils.toArray(SELECTORS.timelineItem, section)
  const principles = section.querySelector(SELECTORS.principles)
  const assurance = section.querySelector(SELECTORS.assurance)
  const navbar = window.document.querySelector(SELECTORS.navbar)
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  const media = gsap.matchMedia()

  showNavbar(navbar, 'default')

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onEnter: () => showNavbar(navbar, 'glass'),
    onEnterBack: () => showNavbar(navbar, 'glass', !reducedMotion),
    onLeave: () => releaseNavbar(navbar, reducedMotion),
    onLeaveBack: () => showNavbar(navbar, 'default'),
  })

  media.add(
    '(min-width: 56rem) and (prefers-reduced-motion: no-preference)',
    () => {
      if (timelineItems.length < 4) return undefined

      gsap.set(timelineItems, { autoAlpha: 0 })
      gsap.set(timelineItems[0], { y: 0, autoAlpha: 1 })
      gsap.set(timelineItems[1], { y: '36.806vw', autoAlpha: 0.3 })
      gsap.set(timelineItems[2], { y: '73.612vw' })
      gsap.set(timelineItems[3], { y: '113.751vw' })
      gsap.set(principles, { y: '20vh', autoAlpha: 0 })
      gsap.set(assurance, { y: '80vh', autoAlpha: 0 })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })

      if (overlay) {
        timeline.to(
          overlay,
          { opacity: 1, duration: 0.3, ease: 'power1.out' },
          0,
        )
      }

      if (layout) {
        timeline.to(
          layout,
          { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' },
          0.05,
        )
      }

      timeline
        .to(
          timelineItems[0],
          { y: '-23.472vw', autoAlpha: 0.3, duration: 0.8, ease: 'none' },
          0.6,
        )
        .to(
          timelineItems[1],
          { y: 0, autoAlpha: 1, duration: 0.8, ease: 'none' },
          0.6,
        )
        .to(
          timelineItems[2],
          { y: '36.806vw', autoAlpha: 0.3, duration: 0.8, ease: 'none' },
          0.6,
        )

      addBackgroundState(timeline, background, BACKGROUND_STATES[1], 0.6)

      timeline
        .to(
          timelineItems[0],
          { y: '-45vw', autoAlpha: 0, duration: 0.8, ease: 'none' },
          1.7,
        )
        .to(
          timelineItems[1],
          { y: '-24.097vw', autoAlpha: 0.3, duration: 0.8, ease: 'none' },
          1.7,
        )
        .to(
          timelineItems[2],
          { y: 0, autoAlpha: 1, duration: 0.8, ease: 'none' },
          1.7,
        )
        .to(
          timelineItems[3],
          { y: '40.139vw', autoAlpha: 0.3, duration: 0.8, ease: 'none' },
          1.7,
        )

      addBackgroundState(timeline, background, BACKGROUND_STATES[2], 1.7)

      timeline
        .to(
          timelineItems[1],
          { y: '-45vw', autoAlpha: 0, duration: 0.8, ease: 'none' },
          2.8,
        )
        .to(
          timelineItems[2],
          { y: '-36.389vw', autoAlpha: 0.3, duration: 0.8, ease: 'none' },
          2.8,
        )
        .to(
          timelineItems[3],
          { y: 0, autoAlpha: 1, duration: 0.8, ease: 'none' },
          2.8,
        )

      addBackgroundState(timeline, background, BACKGROUND_STATES[3], 2.8)

      timeline
        .to(
          heading,
          { y: '-12vh', autoAlpha: 0, duration: 0.7, ease: 'power1.in' },
          3.9,
        )
        .to(
          timelineItems[2],
          { y: '-60vw', autoAlpha: 0, duration: 0.7, ease: 'none' },
          3.9,
        )
        .to(
          timelineItems[3],
          { y: '-35vw', autoAlpha: 0, duration: 0.7, ease: 'none' },
          3.9,
        )
        .to(
          principles,
          { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out' },
          4,
        )

      addBackgroundState(timeline, background, BACKGROUND_STATES[4], 3.9)

      timeline
        .to(
          principles,
          { y: '-80vh', autoAlpha: 0, duration: 0.8, ease: 'power1.in' },
          5,
        )
        .to(
          assurance,
          { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out' },
          5,
        )
        .to(depth, { opacity: 1, duration: 0.8, ease: 'none' }, 5)

      timeline
        .to(
          assurance,
          { y: '-80vh', autoAlpha: 0, duration: 0.8, ease: 'power1.in' },
          6.1,
        )
        .to(interlude, { opacity: 1, duration: 0.8, ease: 'none' }, 6.1)
        .to(background, { opacity: 0, duration: 0.8, ease: 'none' }, 6.1)

      timeline.to(closing, { opacity: 1, duration: 0.8, ease: 'none' }, 7.6)

      return () => {
        timeline.kill()
      }
    },
  )
}

export { initTheProblem }
