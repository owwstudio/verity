import { gsap } from '../core/motion.js'

const SELECTORS = {
  section: '[data-authority-evidence]',
  stage: '[data-authority-evidence-stage]',
  background: '[data-authority-evidence-background]',
  scene: '[data-authority-evidence-scene]',
  card: '[data-authority-evidence-card]',
  step: '[data-authority-evidence-step]',
  introPanel: '[data-authority-intro-panel]',
  introHeading: '[data-authority-intro-heading]',
  introIcon: '[data-authority-intro-icon]',
  introCopy: '[data-authority-intro-copy]',
  copyParagraph: '[data-authority-copy-paragraph]',
  copyCharacter: '[data-authority-copy-character]',
}

const splitCopyIntoCharacters = (copy) => {
  const paragraphs = copy.querySelectorAll(SELECTORS.copyParagraph)
  const originals = Array.from(paragraphs, (paragraph) => ({
    paragraph,
    text: paragraph.textContent,
  }))

  originals.forEach(({ paragraph, text }) => {
    const fragment = window.document.createDocumentFragment()
    const words = text.split(' ')

    paragraph.setAttribute('aria-label', text)
    paragraph.replaceChildren()

    words.forEach((word, wordIndex) => {
      const wordElement = window.document.createElement('span')

      wordElement.className = 'authority-evidence__copy-word'
      wordElement.setAttribute('aria-hidden', 'true')

      Array.from(word).forEach((character) => {
        const characterElement = window.document.createElement('span')

        characterElement.className = 'authority-evidence__copy-character'
        characterElement.dataset.authorityCopyCharacter = ''
        characterElement.textContent = character
        wordElement.append(characterElement)
      })

      fragment.append(wordElement)

      if (wordIndex < words.length - 1) {
        fragment.append(window.document.createTextNode(' '))
      }
    })

    paragraph.append(fragment)
  })

  return () => {
    originals.forEach(({ paragraph, text }) => {
      paragraph.removeAttribute('aria-label')
      paragraph.textContent = text
    })
  }
}

const initAuthorityEvidence = () => {
  const section = window.document.querySelector(SELECTORS.section)

  if (!section) return

  const stage = section.querySelector(SELECTORS.stage)
  const background = section.querySelector(SELECTORS.background)
  const intro = section.querySelector(
    `${SELECTORS.scene}[data-authority-evidence-scene='intro']`,
  )
  const criteria = section.querySelector(
    `${SELECTORS.scene}[data-authority-evidence-scene='criteria']`,
  )
  const proof = section.querySelector(
    `${SELECTORS.scene}[data-authority-evidence-scene='proof']`,
  )
  const cards = gsap.utils.toArray(section.querySelectorAll(SELECTORS.card))
  const steps = gsap.utils.toArray(section.querySelectorAll(SELECTORS.step))

  if (!stage || !background || !intro || !criteria || !proof) return

  const media = gsap.matchMedia()

  media.add(
    '(min-width: 70rem) and (prefers-reduced-motion: no-preference)',
    () => {
      section.style.setProperty('--authority-evidence-length', '600svh')

      const sceneScaleX = () => stage.clientWidth / 1440
      const sceneScaleY = () => stage.clientHeight / 900
      const sceneTwoX = () => -309 * sceneScaleX()
      const sceneTwoY = () => 155 * sceneScaleY()
      const sceneThreeX = () => -535 * sceneScaleX()
      const sceneThreeY = () => -188 * sceneScaleY()
      const introPanel = intro.querySelector(SELECTORS.introPanel)
      const introHeading = intro.querySelector(SELECTORS.introHeading)
      const introIcon = intro.querySelector(SELECTORS.introIcon)
      const introCopy = intro.querySelector(SELECTORS.introCopy)
      const restoreCopy = splitCopyIntoCharacters(introCopy)
      const copyCharacters = gsap.utils.toArray(
        introCopy.querySelectorAll(SELECTORS.copyCharacter),
      )
      const introCopyEndY = () =>
        Math.min(
          0,
          introPanel.clientHeight -
            40 -
            (introCopy.offsetTop + introCopy.scrollHeight),
        )

      gsap.set(background, { x: 0, y: 0, autoAlpha: 0 })
      gsap.set(intro, { x: -32, scale: 0.985, autoAlpha: 0 })
      gsap.set(introHeading, { y: 0, autoAlpha: 1 })
      gsap.set(introIcon, {
        x: -4,
        y: 274,
        scale: 1.5,
        transformOrigin: '0 0',
      })
      gsap.set(introCopy, { y: 184 })
      gsap.set(copyCharacters, { color: '#334d42' })
      gsap.set(criteria, { y: 24, autoAlpha: 0 })
      gsap.set(cards, { y: 48, scale: 0.96, autoAlpha: 0 })
      gsap.set(proof, { autoAlpha: 0 })
      gsap.set(proof.querySelector('.authority-evidence__proof-heading'), {
        x: -48,
      })
      gsap.set(proof.querySelector('.authority-evidence__proof-panel'), {
        x: 64,
      })
      gsap.set(steps, { y: 32, autoAlpha: 0 })

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
        .to(background, { autoAlpha: 1, duration: 0.12 }, 0)
        .to(
          intro,
          {
            x: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.11,
            ease: 'power2.out',
          },
          0,
        )
        .to(
          introHeading,
          { y: -64, autoAlpha: 0, duration: 0.13, ease: 'power2.in' },
          0.1,
        )
        .to(
          introIcon,
          {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.24,
            ease: 'power2.inOut',
          },
          0.1,
        )
        .to(
          introCopy,
          {
            y: introCopyEndY,
            duration: 0.24,
            ease: 'power2.inOut',
          },
          0.1,
        )
        .to(
          copyCharacters,
          {
            color: '#fff',
            duration: 0.04,
            stagger: { amount: 0.2, from: 'start' },
            ease: 'none',
          },
          0.1,
        )
        .to(
          intro,
          {
            x: -72,
            scale: 0.97,
            autoAlpha: 0,
            duration: 0.13,
            ease: 'power2.inOut',
          },
          0.32,
        )
        .to(
          background,
          {
            x: sceneTwoX,
            y: sceneTwoY,
            duration: 0.2,
            ease: 'power2.inOut',
          },
          0.3,
        )
        .to(
          criteria,
          { y: 0, autoAlpha: 1, duration: 0.12, ease: 'power2.out' },
          0.39,
        )
        .to(
          cards,
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.12,
            stagger: 0.025,
            ease: 'power2.out',
          },
          0.43,
        )
        .to(
          criteria,
          {
            y: -32,
            scale: 0.985,
            autoAlpha: 0,
            duration: 0.13,
            ease: 'power2.inOut',
          },
          0.68,
        )
        .to(
          background,
          {
            x: sceneThreeX,
            y: sceneThreeY,
            duration: 0.2,
            ease: 'power2.inOut',
          },
          0.66,
        )
        .to(proof, { autoAlpha: 1, duration: 0.1 }, 0.75)
        .to(
          [
            proof.querySelector('.authority-evidence__proof-heading'),
            proof.querySelector('.authority-evidence__proof-panel'),
          ],
          { x: 0, duration: 0.15, ease: 'power2.out' },
          0.76,
        )
        .to(
          steps,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.11,
            stagger: 0.018,
            ease: 'power2.out',
          },
          0.79,
        )
        .to({}, { duration: 0.1 })

      return () => {
        timeline.scrollTrigger?.kill()
        timeline.kill()
        section.style.removeProperty('--authority-evidence-length')
        gsap.set([background, intro, criteria, proof, ...cards, ...steps], {
          clearProps: 'transform,opacity,visibility',
        })
        gsap.set([introHeading, introIcon, introCopy], {
          clearProps: 'transform,opacity,visibility',
        })
        gsap.set(copyCharacters, { clearProps: 'color' })
        restoreCopy()
        gsap.set(
          [
            proof.querySelector('.authority-evidence__proof-heading'),
            proof.querySelector('.authority-evidence__proof-panel'),
          ],
          { clearProps: 'transform' },
        )
      }
    },
  )

  media.add(
    '(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)',
    () => {
      const scenes = gsap.utils.toArray(
        section.querySelectorAll(SELECTORS.scene),
      )
      const tweens = scenes.map((scene) =>
        gsap.from(scene, {
          y: 32,
          autoAlpha: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: scene,
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
        gsap.set(scenes, { clearProps: 'transform,opacity,visibility' })
      }
    },
  )
}

export { initAuthorityEvidence }
