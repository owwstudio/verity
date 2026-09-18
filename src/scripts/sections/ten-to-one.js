import { gsap } from '../core/motion.js'

const SELECTORS = {
  section: '[data-ten-to-one]',
  sticky: '[data-ten-to-one-sticky]',
  panel: '[data-ten-to-one-panel]',
  background: '[data-ten-to-one-background]',
  intro: '[data-ten-to-one-intro]',
  threshold: '[data-ten-to-one-threshold]',
  principle: '[data-ten-to-one-principle]',
  today: '[data-ten-to-one-today]',
}

const initTenToOne = () => {
  const section = window.document.querySelector(SELECTORS.section)

  if (!section) return

  const panel = section.querySelector(SELECTORS.panel)
  const sticky = section.querySelector(SELECTORS.sticky)
  const background = section.querySelector(SELECTORS.background)
  const intro = section.querySelector(SELECTORS.intro)
  const threshold = section.querySelector(SELECTORS.threshold)
  const principles = gsap.utils.toArray(
    section.querySelectorAll(SELECTORS.principle),
  )
  const today = section.querySelector(SELECTORS.today)

  if (
    !sticky ||
    !panel ||
    !background ||
    !intro ||
    !threshold ||
    principles.length !== 5 ||
    !today
  ) {
    return
  }

  const media = gsap.matchMedia()

  media.add(
    '(min-width: 70rem) and (prefers-reduced-motion: no-preference)',
    () => {
      section.style.setProperty('--ten-to-one-length', '600svh')

      const horizontalShift = () => -249 * (panel.clientWidth / 1408)
      const verticalShift = () => 346 * (panel.clientHeight / 833)
      const backgroundEntryY = () => panel.clientHeight * 0.78
      const backgroundParallaxY = () => panel.clientHeight * -0.14

      gsap.set(background, { x: 0, rotation: 0, scale: 1 })
      gsap.set([intro, threshold], { y: 24, autoAlpha: 0 })
      gsap.set(principles, {
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 0,
      })
      gsap.set(today, { y: 32, autoAlpha: 0 })

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
        .fromTo(
          background,
          { autoAlpha: 0, y: backgroundEntryY },
          {
            autoAlpha: 0.5,
            y: 0,
            duration: 0.18,
            ease: 'power2.out',
          },
          0.08,
        )
        .to(
          [intro, threshold],
          { y: 0, autoAlpha: 1, duration: 0.12, ease: 'power2.out' },
          0.16,
        )
        .to(
          principles,
          {
            autoAlpha: 1,
            duration: 0.08,
            stagger: 0.045,
          },
          0.32,
        )
        .to(
          background,
          {
            y: backgroundParallaxY,
            duration: 0.34,
          },
          0.28,
        )
        .to(
          [intro, threshold, ...principles],
          { y: -24, autoAlpha: 0, duration: 0.1, ease: 'power2.in' },
          0.69,
        )
        .to(
          background,
          {
            x: horizontalShift,
            y: verticalShift,
            rotation: 58.79,
            scale: 1.536,
            duration: 0.2,
            ease: 'power2.inOut',
          },
          0.67,
        )
        .to(
          today,
          { y: 0, autoAlpha: 1, duration: 0.13, ease: 'power2.out' },
          0.82,
        )
        .to(
          sticky,
          {
            padding: 0,
            duration: 0.1,
            ease: 'power2.inOut',
          },
          0.84,
        )
        .to(
          panel,
          {
            width: () => sticky.clientWidth,
            maxWidth: () => sticky.clientWidth,
            height: () => sticky.clientHeight,
            borderRadius: 0,
            backgroundColor: '#00130e',
            duration: 0.1,
            ease: 'power2.inOut',
          },
          0.84,
        )
        .to(background, { autoAlpha: 0, duration: 0.1 }, 0.9)
        .to(today, { autoAlpha: 0, duration: 0.07 }, 0.93)

      return () => {
        timeline.scrollTrigger?.kill()
        timeline.kill()
        section.style.removeProperty('--ten-to-one-length')
        gsap.set(sticky, { clearProps: 'padding' })
        gsap.set(panel, {
          clearProps: 'width,maxWidth,height,borderRadius,backgroundColor',
        })
        gsap.set([background, intro, threshold, ...principles, today], {
          clearProps: 'transform,opacity,visibility',
        })
      }
    },
  )

  media.add(
    '(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)',
    () => {
      const targets = [intro, threshold, ...principles, today]
      const tweens = targets.map((target) =>
        gsap.from(target, {
          y: 28,
          autoAlpha: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: target,
            start: 'top 88%',
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

export { initTenToOne }
