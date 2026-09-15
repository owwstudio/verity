import { gsap } from '../core/motion.js'

const SELECTORS = {
  section: '[data-industry-pools]',
  action: '[data-industry-pools-action]',
  item: '[data-industry-pools-item]',
  option: '[data-industry-pools-option]',
}

const setActiveOption = (options, activeOption) => {
  options.forEach((option) => {
    const isActive = option === activeOption

    option.dataset.state = isActive ? 'active' : 'inactive'
    option.setAttribute('aria-pressed', String(isActive))
  })
}

const initOptionInteractions = (section, options) => {
  const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)')

  setActiveOption(options, null)

  section.addEventListener('pointerleave', () => {
    if (
      hoverQuery.matches &&
      !section.contains(window.document.activeElement)
    ) {
      setActiveOption(options, null)
    }
  })

  section.addEventListener('focusout', (event) => {
    if (!section.contains(event.relatedTarget)) {
      setActiveOption(options, null)
    }
  })

  options.forEach((option) => {
    option.addEventListener('pointerenter', () => {
      if (hoverQuery.matches) setActiveOption(options, option)
    })

    option.addEventListener('focus', () => {
      setActiveOption(options, option)
    })

    option.addEventListener('click', () => {
      if (hoverQuery.matches) {
        setActiveOption(options, option)
        return
      }

      const nextOption = option.dataset.state === 'active' ? null : option

      setActiveOption(options, nextOption)
    })

    option.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return

      setActiveOption(options, null)
      option.blur()
    })
  })
}

const initIndustryPools = () => {
  const section = window.document.querySelector(SELECTORS.section)

  if (!section) return

  const action = section.querySelector(SELECTORS.action)
  const items = gsap.utils.toArray(SELECTORS.item, section)
  const options = gsap.utils.toArray(SELECTORS.option, section)

  if (!action || !items.length || !options.length) return

  initOptionInteractions(section, options)

  const media = gsap.matchMedia()

  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(action, { y: 24, autoAlpha: 0 })
    gsap.set(items, { y: 32, autoAlpha: 0 })

    const reveal = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 45%',
        toggleActions: 'play none none reverse',
      },
    })

    reveal
      .to(action, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power2.out' })
      .to(
        items,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
        },
        '-=0.08',
      )

    return () => {
      reveal.scrollTrigger?.kill()
      reveal.kill()
      gsap.set([action, ...items], {
        clearProps: 'transform,opacity,visibility',
      })
    }
  })
}

export { initIndustryPools }
