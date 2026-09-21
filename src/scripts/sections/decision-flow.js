import { gsap, ScrollTrigger } from '../core/motion.js'
import { lenis } from '../core/lenis.js'

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
  evidence: '[data-decision-flow-evidence]',
  evidencePreview: '[data-decision-flow-evidence-preview]',
  progress: '[data-decision-flow-progress]',
  progressBar: '[data-decision-flow-progress-bar]',
}

const DESKTOP_MEDIA = '(min-width: 70rem)'

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
  const evidence = section.querySelector(SELECTORS.evidence)
  const evidencePreview = section.querySelector(SELECTORS.evidencePreview)
  const progress = section.querySelector(SELECTORS.progress)
  const progressBar = section.querySelector(SELECTORS.progressBar)

  if (
    !header ||
    !content ||
    !backdrop ||
    !divider ||
    !steps.length ||
    !mediaElement ||
    images.length !== steps.length ||
    !evidence ||
    !evidencePreview ||
    !progress ||
    !progressBar
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
      const desktopMedia = window.matchMedia(DESKTOP_MEDIA)
      const updateSectionLength = () => {
        const trailingScenes = desktopMedia.matches ? 3 : 2

        section.style.setProperty(
          '--decision-flow-length',
          `${steps.length + trailingScenes}00svh`,
        )
      }

      updateSectionLength()

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
        onRefreshInit: updateSectionLength,
        onUpdate: ({ progress }) => {
          const desktopScrollScenes = steps.length + 2
          const contentStart = desktopMedia.matches
            ? 1 / desktopScrollScenes
            : 1 / (steps.length + 1)
          const contentEnd = desktopMedia.matches
            ? 1 - 1 / desktopScrollScenes
            : 1
          const contentProgress = Math.max(
            0,
            Math.min(
              1,
              (progress - contentStart) / (contentEnd - contentStart),
            ),
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

  media.add(
    '(max-width: 55.99rem) and (prefers-reduced-motion: no-preference)',
    () => {
      const sceneCount = steps.length + 2
      let mobileSceneIndex = 0

      section.style.setProperty(
        '--decision-flow-length',
        `${sceneCount * 80}svh`,
      )
      section.dataset.mobileScene = 'intro'
      gsap.set(progressBar, { scaleX: 0, transformOrigin: '0% 50%' })
      gsap.set(content, { y: 32, autoAlpha: 0 })

      const updateMobilePositions = (sceneIndex) => {
        const isStepScene = sceneIndex > 0 && sceneIndex < sceneCount - 1
        const stepIndex = isStepScene ? sceneIndex - 1 : steps.length

        steps.forEach((step, index) => {
          let position = 'offscreen'

          if (sceneIndex === sceneCount - 1 && index === steps.length - 1) {
            position = 'previous'
          } else if (isStepScene) {
            if (index === stepIndex) position = 'active'
            else if (index === stepIndex - 1) position = 'previous'
            else if (index === stepIndex + 1) position = 'next'
            else if (index < stepIndex) position = 'before'
            else position = 'after'
          } else if (sceneIndex === sceneCount - 1) {
            position = 'before'
          }

          step.dataset.mobilePosition = position
        })

        evidence.dataset.mobilePosition =
          sceneIndex === sceneCount - 1
            ? 'active'
            : stepIndex === steps.length - 1
              ? 'next'
              : 'offscreen'
      }

      const updateMobileScene = (sceneIndex) => {
        mobileSceneIndex = Math.max(0, Math.min(sceneCount - 1, sceneIndex))

        if (mobileSceneIndex === 0) {
          section.dataset.mobileScene = 'intro'
        } else if (mobileSceneIndex === sceneCount - 1) {
          section.dataset.mobileScene = 'evidence'
          activateStep(steps.length - 1)
        } else {
          section.dataset.mobileScene = 'steps'
          activateStep(mobileSceneIndex - 1)
        }

        updateMobilePositions(mobileSceneIndex)
      }

      const introTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 0.7}`,
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      })

      introTimeline
        .to(
          header,
          { yPercent: -12, autoAlpha: 0, duration: 1, ease: 'none' },
          0,
        )
        .to(content, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'none' }, 0.3)

      const progressTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: ({ progress: scrollProgress }) => {
          const nextSceneIndex = Math.min(
            sceneCount - 1,
            Math.floor(scrollProgress * sceneCount),
          )

          gsap.set(progressBar, { scaleX: scrollProgress })
          progress.setAttribute(
            'aria-valuenow',
            String(Math.round(scrollProgress * 100)),
          )

          if (nextSceneIndex !== mobileSceneIndex) {
            updateMobileScene(nextSceneIndex)
          }
        },
      })

      const scrollToScene = (sceneIndex) => {
        const targetScene = Math.max(0, Math.min(sceneCount - 1, sceneIndex))
        const scrollDistance = progressTrigger.end - progressTrigger.start
        const targetProgress = (targetScene + 0.5) / sceneCount

        lenis.scrollTo(
          progressTrigger.start + scrollDistance * targetProgress,
          {
            duration: 1,
            easing: (value) => 1 - Math.pow(1 - value, 3),
          },
        )
      }

      const mobileStepHandlers = steps.map((step, index) => {
        const trigger = step.querySelector(SELECTORS.trigger)
        const handler = () => {
          if (step.dataset.mobilePosition === 'active') return

          updateMobileScene(index + 1)
          scrollToScene(index + 1)
        }

        trigger?.addEventListener('click', handler)

        return { trigger, handler }
      })
      const showEvidenceScene = () => {
        updateMobileScene(sceneCount - 1)
        scrollToScene(sceneCount - 1)
      }

      evidencePreview.addEventListener('click', showEvidenceScene)
      updateMobileScene(0)

      return () => {
        mobileStepHandlers.forEach(({ trigger, handler }) => {
          trigger?.removeEventListener('click', handler)
        })
        evidencePreview.removeEventListener('click', showEvidenceScene)
        introTimeline.scrollTrigger?.kill()
        introTimeline.kill()
        progressTrigger.kill()
        section.style.removeProperty('--decision-flow-length')
        delete section.dataset.mobileScene
        steps.forEach((step) => delete step.dataset.mobilePosition)
        delete evidence.dataset.mobilePosition
        progress.setAttribute('aria-valuenow', '0')
        gsap.set([header, content, progressBar], {
          clearProps: 'transform,opacity,visibility',
        })
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
