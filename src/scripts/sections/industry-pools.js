import { gsap } from '../core/motion.js'

const SELECTORS = {
  section: '[data-industry-pools]',
  action: '[data-industry-pools-action]',
  item: '[data-industry-pools-item]',
  option: '[data-industry-pools-option]',
}

const setActiveOption = (options, activeOption) => {
  const activeIndex = options.indexOf(activeOption)

  options.forEach((option, index) => {
    const isActive = option === activeOption
    const isAdjacent = activeIndex >= 0 && Math.abs(index - activeIndex) === 1

    option.dataset.state = isActive ? 'active' : 'inactive'
    option.setAttribute('aria-pressed', String(isActive))

    if (isAdjacent) option.dataset.proximity = 'adjacent'
    else delete option.dataset.proximity
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
    gsap.set(action, { y: 32, scale: 0.96, autoAlpha: 0 })
    gsap.set(items, { y: 32, autoAlpha: 0 })

    const reveal = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 45%',
        toggleActions: 'play none none reverse',
      },
    })

    reveal
      .to(items, {
        y: 0,
        autoAlpha: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
      })
      .to(
        action,
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.55,
          ease: 'power3.out',
        },
        '-=0.16',
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
