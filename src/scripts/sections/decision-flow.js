import { gsap, ScrollTrigger } from '../core/motion.js'

const SELECTORS = {
  section: '[data-decision-flow]',
  header: '[data-decision-flow-header]',
  content: '[data-decision-flow-content]',
  backdrop: '[data-decision-flow-backdrop]',
  reveal: '[data-decision-flow-reveal]',
  divider: '[data-decision-flow-divider]',
  step: '[data-decision-flow-step]',
  trigger: '[data-decision-flow-trigger]',
  details: '[data-decision-flow-details]',
  media: '[data-decision-flow-media]',
  image: '[data-decision-flow-image]',
}

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

const updateImageState = (images, activeIndex) => {
  images.forEach((image, index) => {
    const isActive = index === activeIndex

    image.dataset.state = isActive ? 'active' : 'inactive'

    if (isActive) image.removeAttribute('aria-hidden')
    else image.setAttribute('aria-hidden', 'true')
  })
}

const initDecisionFlow = () => {
  const section = window.document.querySelector(SELECTORS.section)

  if (!section) return

  const revealTargets = gsap.utils.toArray(SELECTORS.reveal, section)
  const header = section.querySelector(SELECTORS.header)
  const content = section.querySelector(SELECTORS.content)
  const backdrop = section.querySelector(SELECTORS.backdrop)
  const divider = section.querySelector(SELECTORS.divider)
  const steps = gsap.utils.toArray(SELECTORS.step, section)
  const mediaElement = section.querySelector(SELECTORS.media)
  const images = gsap.utils.toArray(SELECTORS.image, section)

  if (
    !header ||
    !content ||
    !backdrop ||
    !divider ||
    !steps.length ||
    !mediaElement ||
    images.length !== steps.length
  ) {
    return
  }

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  let activeIndex = 0
  let imageTransition

  const activateStep = (index, immediate = false) => {
    if (index < 0 || index >= steps.length) return

    const previousIndex = activeIndex

    if (index === previousIndex && !immediate) return

    activeIndex = index
    updateStepState(steps, activeIndex)
    imageTransition?.kill()
    gsap.killTweensOf(images)
    updateImageState(images, activeIndex)

    if (immediate || reducedMotion) {
      gsap.set(images, {
        clearProps: 'transform,opacity,visibility,zIndex,willChange',
      })
      return
    }

    const previousImage = images[previousIndex]
    const nextImage = images[activeIndex]

    images.forEach((image, imageIndex) => {
      if (imageIndex === previousIndex || imageIndex === activeIndex) return

      gsap.set(image, { autoAlpha: 0, y: 0, scale: 1, zIndex: 0 })
    })

    gsap.set(previousImage, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      zIndex: 1,
      willChange: 'transform,opacity',
    })
    gsap.set(nextImage, {
      autoAlpha: 0,
      y: 24,
      scale: 0.97,
      zIndex: 2,
      willChange: 'transform,opacity',
    })

    imageTransition = gsap.timeline({
      onComplete: () => {
        gsap.set(images, {
          clearProps: 'transform,opacity,visibility,zIndex,willChange',
        })
      },
    })

    imageTransition
      .to(
        previousImage,
        {
          autoAlpha: 0,
          y: -16,
          scale: 1.02,
          duration: 0.45,
          ease: 'power2.inOut',
        },
        0,
      )
      .to(
        nextImage,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          ease: 'power3.out',
        },
        0.12,
      )
  }

  images.forEach((image) => {
    if (!image.complete) image.decode?.().catch(() => {})
  })

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

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const parallaxTween = gsap.fromTo(
      backdrop,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
          invalidateOnRefresh: true,
          onEnter: () => gsap.set(backdrop, { willChange: 'transform' }),
          onEnterBack: () => gsap.set(backdrop, { willChange: 'transform' }),
          onLeave: () => gsap.set(backdrop, { clearProps: 'willChange' }),
          onLeaveBack: () => gsap.set(backdrop, { clearProps: 'willChange' }),
        },
      },
    )

    return () => {
      parallaxTween.scrollTrigger?.kill()
      parallaxTween.kill()
      gsap.set(backdrop, { clearProps: 'transform,willChange' })
    }
  })

  media.add(
    '(min-width: 56rem) and (prefers-reduced-motion: no-preference)',
    () => {
      section.style.setProperty(
        '--decision-flow-length',
        `${steps.length + 2}00svh`,
      )

      const headerTargets = revealTargets.slice(0, 3)
      const contentTargets = revealTargets.slice(3)

      gsap.set(headerTargets, {
        y: 28,
        autoAlpha: 0,
      })
      gsap.set(divider, {
        scaleX: 0,
        transformOrigin: '0% 50%',
      })
      gsap.set(content, { yPercent: 65, autoAlpha: 0 })
      gsap.set(contentTargets, { y: 28, autoAlpha: 0 })
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

      const headerTransition = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight}`,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })

      headerTransition
        .to(
          header,
          { yPercent: -18, autoAlpha: 0, duration: 1, ease: 'none' },
          0,
        )
        .to(divider, { autoAlpha: 0, duration: 0.45, ease: 'none' }, 0)
        .to(
          content,
          { yPercent: 0, autoAlpha: 1, duration: 1, ease: 'none' },
          0,
        )
        .to(
          contentTargets,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.2,
            stagger: 0.12,
            ease: 'power2.out',
          },
          0.22,
        )
        .to(
          mediaElement,
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.35,
            ease: 'power3.out',
          },
          0.58,
        )

      const progressTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          const contentStart = 1 / (steps.length + 1)
          const contentProgress = Math.max(
            0,
            (progress - contentStart) / (1 - contentStart),
          )
          const nextIndex = Math.min(
            steps.length - 1,
            Math.floor(contentProgress * steps.length),
          )

          if (nextIndex !== activeIndex) activateStep(nextIndex)
        },
      })

      return () => {
        revealTimeline.scrollTrigger?.kill()
        revealTimeline.kill()
        headerTransition.scrollTrigger?.kill()
        headerTransition.kill()
        progressTrigger.kill()
        section.style.removeProperty('--decision-flow-length')
        gsap.set(
          [
            header,
            content,
            ...headerTargets,
            ...contentTargets,
            divider,
            mediaElement,
          ],
          {
            clearProps: 'transform,opacity,visibility',
          },
        )
        imageTransition?.kill()
        gsap.set(images, {
          clearProps: 'transform,opacity,visibility,zIndex,willChange',
        })
        activateStep(0, true)
      }
    },
  )
}

export { initDecisionFlow }
