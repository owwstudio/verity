import { gsap, ScrollTrigger } from '../core/motion.js'

const SELECTORS = {
  section: '[data-decision-flow]',
  reveal: '[data-decision-flow-reveal]',
  divider: '[data-decision-flow-divider]',
  step: '[data-decision-flow-step]',
  trigger: '[data-decision-flow-trigger]',
  details: '[data-decision-flow-details]',
  media: '[data-decision-flow-media]',
  image: '[data-decision-flow-image]',
}

const ROTATION_STEP = 30

const updateStepState = (steps, activeIndex) => {
  steps.forEach((step, index) => {
    const isActive = index === activeIndex
    const trigger = step.querySelector(SELECTORS.trigger)
    const details = step.querySelector(SELECTORS.details)

    step.dataset.state = isActive ? 'active' : 'inactive'
    trigger?.setAttribute('aria-expanded', String(isActive))
    details?.setAttribute('aria-hidden', String(!isActive))
  })
}

const initDecisionFlow = () => {
  const section = window.document.querySelector(SELECTORS.section)

  if (!section) return

  const revealTargets = gsap.utils.toArray(SELECTORS.reveal, section)
  const divider = section.querySelector(SELECTORS.divider)
  const steps = gsap.utils.toArray(SELECTORS.step, section)
  const mediaElement = section.querySelector(SELECTORS.media)
  const image = section.querySelector(SELECTORS.image)

  if (!divider || !steps.length || !mediaElement || !image) return

  let activeIndex = 0

  const activateStep = (index, immediate = false) => {
    if (index < 0 || index >= steps.length) return

    activeIndex = index
    updateStepState(steps, activeIndex)

    const rotation = activeIndex * ROTATION_STEP

    if (immediate) {
      gsap.set(image, { rotation, transformOrigin: '50% 50%' })
      return
    }

    gsap.to(image, {
      rotation,
      transformOrigin: '50% 50%',
      duration: 0.7,
      ease: 'power3.inOut',
      overwrite: true,
    })
  }

  activateStep(0, true)

  steps.forEach((step, index) => {
    const trigger = step.querySelector(SELECTORS.trigger)

    if (!trigger) return

    trigger.addEventListener('click', () => activateStep(index))

    trigger.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return

      event.preventDefault()

      const targetIndex =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? steps.length - 1
            : event.key === 'ArrowDown'
              ? (index + 1) % steps.length
              : (index - 1 + steps.length) % steps.length

      activateStep(targetIndex)
      steps[targetIndex].querySelector(SELECTORS.trigger)?.focus()
    })
  })

  const media = gsap.matchMedia()

  media.add(
    '(min-width: 56rem) and (prefers-reduced-motion: no-preference)',
    () => {
      section.style.setProperty(
        '--decision-flow-length',
        `${steps.length + 1}00svh`,
      )

      const headerTargets = revealTargets.slice(0, 3)
      const stepTargets = revealTargets.slice(3)

      gsap.set([...headerTargets, ...stepTargets], {
        y: 28,
        autoAlpha: 0,
      })
      gsap.set(divider, {
        scaleX: 0,
        transformOrigin: '0% 50%',
      })
      gsap.set(mediaElement, { y: 32, scale: 0.94, autoAlpha: 0 })

      const revealTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 35%',
          toggleActions: 'play none none reverse',
        },
      })

      revealTimeline
        .to(headerTargets, {
          y: 0,
          autoAlpha: 1,
          duration: 0.45,
          stagger: 0.14,
          ease: 'power3.out',
        })
        .to(divider, { scaleX: 1, duration: 0.45, ease: 'power2.out' })
        .to(stepTargets, {
          y: 0,
          autoAlpha: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power3.out',
        })
        .to(mediaElement, {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.65,
          ease: 'power3.out',
        })

      const progressTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onEnter: () => gsap.set(image, { willChange: 'transform' }),
        onEnterBack: () => gsap.set(image, { willChange: 'transform' }),
        onLeave: () => gsap.set(image, { clearProps: 'willChange' }),
        onLeaveBack: () => gsap.set(image, { clearProps: 'willChange' }),
        onUpdate: ({ progress }) => {
          const nextIndex = Math.min(
            steps.length - 1,
            Math.floor(progress * steps.length),
          )

          if (nextIndex !== activeIndex) activateStep(nextIndex)
        },
      })

      return () => {
        revealTimeline.scrollTrigger?.kill()
        revealTimeline.kill()
        progressTrigger.kill()
        section.style.removeProperty('--decision-flow-length')
        gsap.set([...headerTargets, ...stepTargets, divider, mediaElement], {
          clearProps: 'transform,opacity,visibility',
        })
        gsap.set(image, { clearProps: 'transform,willChange' })
        activateStep(0, true)
      }
    },
  )
}

export { initDecisionFlow }
