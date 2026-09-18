import { gsap } from '../core/motion.js'

const SELECTORS = {
  section: '[data-verity-story]',
  stage: '[data-verity-story-stage]',
  overview: '[data-verity-story-overview]',
  introduction: '[data-verity-story-introduction]',
  metrics: '[data-verity-story-metrics]',
  lesson: '[data-verity-story-lesson]',
  lessonCopy: '[data-verity-story-lesson-copy]',
  portrait: '[data-verity-story-portrait]',
  image: '[data-verity-story-image]',
}

const initVerityStory = () => {
  const section = window.document.querySelector(SELECTORS.section)

  if (!section) return

  const stage = section.querySelector(SELECTORS.stage)
  const overview = section.querySelector(SELECTORS.overview)
  const introduction = section.querySelector(SELECTORS.introduction)
  const metrics = section.querySelector(SELECTORS.metrics)
  const lesson = section.querySelector(SELECTORS.lesson)
  const lessonCopy = gsap.utils.toArray(
    lesson?.querySelectorAll(SELECTORS.lessonCopy),
  )
  const portrait = lesson?.querySelector(SELECTORS.portrait)
  const image = lesson?.querySelector(SELECTORS.image)

  if (
    !stage ||
    !overview ||
    !introduction ||
    !metrics ||
    !lesson ||
    lessonCopy.length !== 2 ||
    !portrait ||
    !image
  ) {
    return
  }

  const media = gsap.matchMedia()

  media.add(
    '(min-width: 70rem) and (prefers-reduced-motion: no-preference)',
    () => {
      section.style.setProperty('--verity-story-length', '400svh')

      const sceneScaleY = () => stage.clientHeight / 880
      const statsMiddleY = () => -656 * sceneScaleY()
      const statsExitY = () => -935 * sceneScaleY()
      const overviewExitY = () => -314 * sceneScaleY()
      const lessonEntryY = () => 772 * sceneScaleY()
      const portraitEntryY = () => 486 * sceneScaleY()
      const imageEntryY = () => 1092 * sceneScaleY()

      gsap.set(overview, { autoAlpha: 1 })
      gsap.set(lesson, { autoAlpha: 0 })
      gsap.set([introduction, metrics], { y: 0 })
      gsap.set(lessonCopy, { y: lessonEntryY })
      gsap.set(portrait, {
        y: portraitEntryY,
        scaleX: 523 / 264,
        scaleY: 529 / 243,
        transformOrigin: '0 0',
      })
      gsap.set(image, {
        y: imageEntryY,
        scaleX: 127 / 664,
        scaleY: 76 / 396,
        transformOrigin: '0 0',
      })

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
          metrics,
          {
            y: statsMiddleY,
            duration: 0.36,
            ease: 'power2.inOut',
          },
          0.08,
        )
        .to(
          introduction,
          {
            y: overviewExitY,
            autoAlpha: 0,
            duration: 0.18,
            ease: 'power2.in',
          },
          0.48,
        )
        .to(
          metrics,
          {
            y: statsExitY,
            autoAlpha: 0,
            duration: 0.2,
            ease: 'power2.inOut',
          },
          0.46,
        )
        .to(
          overview,
          {
            autoAlpha: 0,
            duration: 0.12,
            ease: 'power2.inOut',
          },
          0.48,
        )
        .to(
          lesson,
          {
            autoAlpha: 1,
            duration: 0.1,
            ease: 'power2.out',
          },
          0.58,
        )
        .to(
          lessonCopy,
          {
            y: 0,
            duration: 0.25,
            stagger: 0.025,
            ease: 'power2.inOut',
          },
          0.58,
        )
        .to(
          portrait,
          {
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.27,
            ease: 'power2.inOut',
          },
          0.62,
        )
        .to(
          image,
          {
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.3,
            ease: 'power2.inOut',
          },
          0.63,
        )
        .to({}, { duration: 0.15 })

      return () => {
        timeline.scrollTrigger?.kill()
        timeline.kill()
        section.style.removeProperty('--verity-story-length')
        gsap.set(
          [
            overview,
            introduction,
            metrics,
            lesson,
            ...lessonCopy,
            portrait,
            image,
          ],
          { clearProps: 'transform,opacity,visibility' },
        )
      }
    },
  )

  media.add(
    '(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)',
    () => {
      const targets = [introduction, metrics, ...lessonCopy, portrait, image]
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

export { initVerityStory }
