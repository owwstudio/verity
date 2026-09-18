import { gsap } from '../core/motion.js'

const SELECTORS = {
  section: '[data-owned-stack]',
  stage: '[data-owned-stack-stage]',
  titleIntro: '[data-owned-stack-title-intro]',
  titleFinal: '[data-owned-stack-title-final]',
  description: '[data-owned-stack-description]',
  track: '[data-owned-stack-track]',
  followup: '[data-owned-stack-followup]',
}

const initOwnedStack = () => {
  const section = window.document.querySelector(SELECTORS.section)

  if (!section) return

  const stage = section.querySelector(SELECTORS.stage)
  const titleIntro = section.querySelector(SELECTORS.titleIntro)
  const titleFinal = section.querySelector(SELECTORS.titleFinal)
  const description = section.querySelector(SELECTORS.description)
  const track = section.querySelector(SELECTORS.track)
  const followup = section.querySelector(SELECTORS.followup)

  if (
    !stage ||
    !titleIntro ||
    !titleFinal ||
    !description ||
    !track ||
    !followup
  )
    return

  const media = gsap.matchMedia()

  media.add(
    '(min-width: 70rem) and (prefers-reduced-motion: no-preference)',
    () => {
      section.style.setProperty('--owned-stack-length', '500svh')

      gsap.set(titleIntro, {
        width: 'max-content',
        whiteSpace: 'nowrap',
      })

      const titleStartWidth = Math.min(
        Math.ceil(titleIntro.scrollWidth) + 2,
        stage.clientWidth - 96,
      )
      const centeredTitleX = () =>
        stage.clientWidth / 2 - (titleIntro.offsetLeft + titleStartWidth / 2)
      const centeredTitleY = () =>
        stage.clientHeight / 2 -
        (titleIntro.offsetTop + titleIntro.offsetHeight / 2)
      const trackTravel = () =>
        Math.min(
          0,
          stage.clientHeight - 88 - (track.offsetTop + track.offsetHeight),
        )
      const followupTravel = () =>
        Math.min(
          0,
          stage.clientHeight -
            88 -
            (followup.offsetTop + followup.offsetHeight),
        )

      gsap.set(titleIntro, {
        width: titleStartWidth,
        x: centeredTitleX,
        y: centeredTitleY,
        autoAlpha: 0,
      })
      gsap.set(titleFinal, { x: 0, y: 0, autoAlpha: 0 })
      gsap.set(description, { y: 24, autoAlpha: 0 })
      gsap.set(track, { y: 64, autoAlpha: 0 })
      gsap.set(followup, { y: 0, autoAlpha: 0 })

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
        .to(titleIntro, { autoAlpha: 1, duration: 0.12 }, 0.08)
        .to(
          titleIntro,
          {
            x: 0,
            y: 0,
            autoAlpha: 0,
            duration: 0.16,
            ease: 'power2.inOut',
          },
          0.24,
        )
        .to(titleFinal, { autoAlpha: 1, duration: 0.12 }, 0.4)
        .to(description, { y: 0, autoAlpha: 1, duration: 0.12 }, 0.44)
        .to(
          track,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.16,
            ease: 'power2.out',
          },
          0.48,
        )
        .to(
          track,
          {
            y: trackTravel,
            duration: 0.38,
          },
          0.64,
        )
        .to(
          followup,
          {
            y: followupTravel,
            autoAlpha: 1,
            duration: 0.28,
            ease: 'power2.out',
          },
          0.74,
        )

      return () => {
        timeline.scrollTrigger?.kill()
        timeline.kill()
        section.style.removeProperty('--owned-stack-length')
        gsap.set([titleIntro, titleFinal, description, track, followup], {
          clearProps: 'transform,opacity,visibility,width,whiteSpace',
        })
      }
    },
  )

  media.add(
    '(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)',
    () => {
      const targets = [titleFinal, description, track, followup]
      const tweens = targets.map((target) =>
        gsap.from(target, {
          y: 32,
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

export { initOwnedStack }
