import { gsap, ScrollTrigger } from '../core/motion.js'

const SELECTORS = {
  section: '[data-status-stack]',
  sticky: '[data-status-stack-sticky]',
  panel: '[data-status-stack-panel]',
  header: '[data-status-stack-header]',
  background: '[data-status-stack-background]',
  card: '[data-status-stack-card]',
  cardToggle: '[data-status-stack-card-toggle]',
  cardContent: '[data-status-stack-card-content]',
  action: '[data-status-stack-action]',
}

const BACKGROUND_STATES = [
  [1155, -816],
  [898, -654],
  [632, -417],
  [409, -244],
  [0, 7],
  [-316, 338],
  [-540, 467],
]

const initStatusStack = () => {
  const section = window.document.querySelector(SELECTORS.section)

  if (!section) return

  const sticky = section.querySelector(SELECTORS.sticky)
  const panel = section.querySelector(SELECTORS.panel)
  const header = section.querySelector(SELECTORS.header)
  const background = section.querySelector(SELECTORS.background)
  const cards = gsap.utils.toArray(section.querySelectorAll(SELECTORS.card))
  const action = section.querySelector(SELECTORS.action)

  if (
    !sticky ||
    !panel ||
    !header ||
    !background ||
    cards.length !== 5 ||
    !action
  ) {
    return
  }

  const headerItems = [...header.children]

  const media = gsap.matchMedia()

  media.add(
    '(min-width: 70rem) and (prefers-reduced-motion: no-preference)',
    () => {
      section.style.setProperty('--status-stack-length', '1000svh')

      const scaleX = () => panel.clientWidth / 1408
      const scaleY = () => panel.clientHeight / 833
      const backgroundX = (state) => BACKGROUND_STATES[state][0] * scaleX()
      const backgroundY = (state) => BACKGROUND_STATES[state][1] * scaleY()
      const cardBaseWidth = () => Math.min(panel.clientWidth - 144, 1264)
      const cardEntryY = () => panel.clientHeight + 448

      gsap.set(sticky, {
        '--status-panel-inset': '0rem',
        '--status-panel-radius': '0rem',
      })
      gsap.set(background, {
        x: () => backgroundX(0),
        y: () => backgroundY(0),
      })
      gsap.set(headerItems, { y: 24, autoAlpha: 0 })
      gsap.set(cards, {
        y: cardEntryY,
        width: cardBaseWidth,
        autoAlpha: 1,
      })
      gsap.set(action, { y: 80, autoAlpha: 0 })

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
      })

      timeline
        .to(
          sticky,
          {
            '--status-panel-inset': '1rem',
            '--status-panel-radius': '2rem',
            duration: 0.1,
            ease: 'power2.inOut',
          },
          0.06,
        )
        .to(
          headerItems,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.12,
            stagger: 0.025,
            ease: 'power2.out',
          },
          0.08,
        )
        .to(
          background,
          {
            x: () => backgroundX(1),
            y: () => backgroundY(1),
            duration: 0.11,
            ease: 'power2.inOut',
          },
          0.18,
        )
        .to(cards[0], { y: 0, duration: 0.11, ease: 'power3.out' }, 0.18)

      cards.slice(1).forEach((card, index) => {
        const cardIndex = index + 1
        const start = 0.32 + index * 0.14
        const visibleCards = cards.slice(0, cardIndex)

        timeline
          .to(
            visibleCards,
            {
              width: (itemIndex) =>
                cardBaseWidth() - 32 * (cardIndex - itemIndex),
              duration: 0.1,
              ease: 'power2.inOut',
            },
            start,
          )
          .to(
            card,
            {
              y: 0,
              width: cardBaseWidth,
              duration: 0.12,
              ease: 'power3.out',
            },
            start,
          )
          .to(
            background,
            {
              x: () => backgroundX(cardIndex + 1),
              y: () => backgroundY(cardIndex + 1),
              duration: 0.13,
              ease: 'power2.inOut',
            },
            start,
          )
      })

      timeline
        .to(
          cards,
          {
            '--status-card-offset': (index) => `${index * 0.5}rem`,
            duration: 0.1,
            ease: 'power2.inOut',
          },
          0.84,
        )
        .to(
          background,
          {
            x: () => backgroundX(6),
            y: () => backgroundY(6),
            duration: 0.12,
            ease: 'power2.inOut',
          },
          0.88,
        )
        .to(
          action,
          { y: 0, autoAlpha: 1, duration: 0.11, ease: 'power3.out' },
          0.88,
        )
        .to({}, { duration: 0.08 })

      return () => {
        timeline.scrollTrigger?.kill()
        timeline.kill()
        section.style.removeProperty('--status-stack-length')
        gsap.set(sticky, {
          clearProps: '--status-panel-inset,--status-panel-radius',
        })
        gsap.set([background, ...headerItems, ...cards, action], {
          clearProps: 'transform,width,opacity,visibility,--status-card-offset',
        })
      }
    },
  )

  media.add(
    '(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)',
    () => {
      const targets = [...headerItems, ...cards, action]
      const tweens = targets.map((target) =>
        gsap.from(target, {
          y: 40,
          autoAlpha: 0,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: target,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }),
      )

      return () => {
        tweens.forEach((tween) => {
          tween.scrollTrigger?.kill()
          tween.kill()
        })
        gsap.set(targets, { clearProps: 'transform,opacity,visibility' })
      }
    },
  )

  media.add('(max-width: 47.999rem)', () => {
    let refreshTimer
    const toggleEntries = cards.map((card) => ({
      card,
      toggle: card.querySelector(SELECTORS.cardToggle),
      content: card.querySelector(SELECTORS.cardContent),
    }))

    if (toggleEntries.some(({ toggle, content }) => !toggle || !content)) return

    const setOpenCard = (activeCard) => {
      toggleEntries.forEach(({ card, toggle, content }) => {
        const isOpen = card === activeCard

        card.dataset.state = isOpen ? 'open' : 'closed'
        toggle.setAttribute('aria-expanded', String(isOpen))
        content.setAttribute('aria-hidden', String(!isOpen))
      })

      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 460)
    }

    const handleToggle = (event) => {
      const activeEntry = toggleEntries.find(
        ({ toggle }) => toggle === event.currentTarget,
      )

      if (!activeEntry || activeEntry.card.dataset.state === 'open') return

      setOpenCard(activeEntry.card)
    }

    toggleEntries.forEach(({ toggle }, index) => {
      toggle.addEventListener('click', handleToggle)
      toggleEntries[index].content.setAttribute(
        'aria-hidden',
        String(index !== 0),
      )
    })
    setOpenCard(toggleEntries[0].card)

    return () => {
      window.clearTimeout(refreshTimer)
      toggleEntries.forEach(({ toggle, content }, index) => {
        toggle.removeEventListener('click', handleToggle)
        toggle.setAttribute('aria-expanded', String(index === 0))
        content.removeAttribute('aria-hidden')
      })
      cards.forEach((card, index) => {
        card.dataset.state = index === 0 ? 'open' : 'closed'
      })
    }
  })
}

export { initStatusStack }
