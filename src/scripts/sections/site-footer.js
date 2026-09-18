import { gsap } from '../core/motion.js'

const SELECTORS = {
  footer: '[data-site-footer]',
  reveal: '[data-footer-reveal]',
  wordmark: '[data-footer-wordmark]',
}

const initSiteFooter = () => {
  const footer = window.document.querySelector(SELECTORS.footer)

  if (!footer) return

  const revealItems = gsap.utils.toArray(
    footer.querySelectorAll(SELECTORS.reveal),
  )
  const wordmark = footer.querySelector(SELECTORS.wordmark)

  if (!revealItems.length || !wordmark) return

  const media = gsap.matchMedia()

  media.add(
    '(min-width: 70rem) and (prefers-reduced-motion: no-preference)',
    () => {
      gsap.set(revealItems, { y: 24, autoAlpha: 0 })
      gsap.set(wordmark, {
        y: () => Math.min(window.innerHeight * 0.35, 300),
        autoAlpha: 0,
      })

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: footer,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })

      revealItems.forEach((item, index) => {
        timeline.to(
          item,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.12,
            ease: 'power2.out',
          },
          0.04 + index * 0.055,
        )
      })

      timeline
        .to(
          wordmark,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.32,
            ease: 'power3.out',
          },
          0.64,
        )
        .to({}, { duration: 0.04 })

      return () => {
        timeline.scrollTrigger?.kill()
        timeline.kill()
        gsap.set([...revealItems, wordmark], {
          clearProps: 'transform,opacity,visibility',
        })
      }
    },
  )

  media.add(
    '(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)',
    () => {
      const targets = [...revealItems, wordmark]
      const tweens = targets.map((target) =>
        gsap.from(target, {
          y: 40,
          autoAlpha: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: target,
            start: 'top 92%',
            toggleActions: 'play none none reverse',
          },
        }),
      )

      return () => {
        tweens.forEach((tween) => {
          tween.scrollTrigger?.kill()
          tween.kill()
        })
        gsap.set(targets, {
          clearProps: 'transform,opacity,visibility',
        })
      }
    },
  )
}

export { initSiteFooter }
