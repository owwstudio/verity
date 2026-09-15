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
  text: '[data-problem-text]',
  word: '[data-problem-word]',
  accentText: '[data-problem-accent-text]',
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

const splitTextIntoWords = (element) => {
  if (!element) return null

  const text = element.textContent.trim()
  const markup = element.innerHTML
  const accessibleText = window.document.createElement('span')
  const visualText = window.document.createElement('span')
  const textNodes = []
  const walker = window.document.createTreeWalker(
    element,
    window.NodeFilter.SHOW_TEXT,
  )
  let textNode = walker.nextNode()

  while (textNode) {
    textNodes.push({
      content: textNode.textContent,
      accent: Boolean(textNode.parentElement?.closest(SELECTORS.accentText)),
    })
    textNode = walker.nextNode()
  }

  accessibleText.className = 'the-problem__text-accessible'
  accessibleText.textContent = text

  visualText.className = 'the-problem__text-visual'
  visualText.setAttribute('aria-hidden', 'true')

  textNodes.forEach(({ content, accent }) => {
    content.match(/\S+|\s+/g)?.forEach((token) => {
      if (/^\s+$/.test(token)) {
        visualText.append(window.document.createTextNode(token))
        return
      }

      const wordElement = window.document.createElement('span')

      wordElement.className = accent
        ? 'the-problem__word the-problem__word--accent'
        : 'the-problem__word'
      wordElement.dataset.problemWord = ''
      wordElement.dataset.word = token
      wordElement.textContent = token
      visualText.append(wordElement)
    })
  })

  element.replaceChildren(accessibleText, visualText)

  return {
    element,
    markup,
    words: gsap.utils.toArray(SELECTORS.word, visualText),
  }
}

const groupWordsByLine = (splitTexts) =>
  splitTexts.flatMap(({ words }) => {
    const lines = []

    words.forEach((word) => {
      const top = Math.round(word.offsetTop)
      const currentLine = lines.at(-1)

      if (!currentLine || Math.abs(currentLine.top - top) > 1) {
        lines.push({ top, words: [word] })
        return
      }

      currentLine.words.push(word)
    })

    return lines.map((line) => line.words)
  })

const addLineFill = (timeline, lines, position) => {
  if (!lines.length) return

  const lineDuration = 0.8 / lines.length
  const fillTimeline = gsap.timeline({ defaults: { ease: 'none' } })

  lines.forEach((words) => {
    const wordDuration = lineDuration / words.length

    fillTimeline.to(words, {
      '--problem-word-fill': '100%',
      duration: wordDuration,
      stagger: { each: wordDuration },
    })
  })

  timeline.add(fillTimeline, position)
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

      const splitTextGroups = timelineItems.map((item) =>
        gsap.utils
          .toArray(SELECTORS.text, item)
          .map((text) => splitTextIntoWords(text))
          .filter(Boolean),
      )
      const splitTexts = splitTextGroups.flat()
      const wordLines = splitTextGroups.map((texts) => groupWordsByLine(texts))

      splitTexts.forEach(({ words }) => {
        gsap.set(words, { '--problem-word-fill': '0%' })
      })

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

      addLineFill(timeline, wordLines[0], 0.08)

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

      addLineFill(timeline, wordLines[1], 0.65)
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

      addLineFill(timeline, wordLines[2], 1.75)
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

      addLineFill(timeline, wordLines[3], 2.85)
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

        splitTexts.forEach(({ element, markup, words }) => {
          gsap.set(words, { clearProps: '--problem-word-fill' })
          element.innerHTML = markup
        })
      }
    },
  )
}

export { initTheProblem }
