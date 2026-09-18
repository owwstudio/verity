import { gsap } from '../core/motion.js'

const SELECTORS = {
  section: '[data-status-stack]',
  sticky: '[data-status-stack-sticky]',
  panel: '[data-status-stack-panel]',
  background: '[data-status-stack-background]',
  card: '[data-status-stack-card]',
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
  const background = section.querySelector(SELECTORS.background)
  const cards = gsap.utils.toArray(section.querySelectorAll(SELECTORS.card))
  const action = section.querySelector(SELECTORS.action)

  if (!sticky || !panel || !background || cards.length !== 5 || !action) {
    return
  }

  const media = gsap.matchMedia()

  media.add(
    '(min-width: 70rem) and (prefers-reduced-motion: no-preference)',
    () => {
      section.style.setProperty('--status-stack-length', '800svh')

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
        gsap.set([background, ...cards, action], {
          clearProps: 'transform,width,opacity,visibility,--status-card-offset',
        })
      }
    },
  )

  media.add(
    '(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)',
    () => {
      const targets = [...cards, action]
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
}

export { initStatusStack }
