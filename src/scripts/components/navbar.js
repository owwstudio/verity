import { lenis } from '../core/lenis.js'

const SELECTORS = {
  navbar: '[data-navbar]',
  dropdown: '[data-navbar-dropdown]',
  toggle: '[data-navbar-dropdown-toggle]',
  menu: '[data-navbar-dropdown-menu]',
  mobileToggle: '[data-navbar-mobile-toggle]',
  panel: '[data-navbar-panel]',
  darkSection:
    '[data-problem], [data-decision-flow], [data-ten-to-one], [data-authority-evidence], [data-status-stack]',
}

const TOP_SCROLL_THRESHOLD = 8
const DIRECTION_SCROLL_THRESHOLD = 3

const getMenuLinks = (menu) => [...menu.querySelectorAll('a[href]')]

const initNavbar = () => {
  const navbar = window.document.querySelector(SELECTORS.navbar)

  if (!navbar) return

  const dropdowns = [...navbar.querySelectorAll(SELECTORS.dropdown)]
  const mobileToggle = navbar.querySelector(SELECTORS.mobileToggle)
  const panel = navbar.querySelector(SELECTORS.panel)
  const mobileMedia = window.matchMedia('(width < 64rem)')
  let lastScroll = window.scrollY
  let isNavbarVisible = true

  const setNavbarContrast = () => {
    const navbarHeight = navbar.getBoundingClientRect().height
    const sampleY = Math.min(navbarHeight + 1, window.innerHeight - 1)
    const surface = window.document
      .elementsFromPoint(window.innerWidth / 2, sampleY)
      .find((element) => !navbar.contains(element))
    const section = surface?.closest('section, footer')
    const hasDarkBackground = section?.matches(SELECTORS.darkSection) ?? false

    navbar.dataset.navbarContrast = hasDarkBackground ? 'light' : 'dark'
  }

  const setNavbarTheme = (scrollPosition = window.scrollY) => {
    setNavbarContrast()

    if (scrollPosition <= TOP_SCROLL_THRESHOLD) {
      delete navbar.dataset.navbarTheme
      return
    }

    navbar.dataset.navbarTheme = 'glass'
  }

  const isNavbarEngaged = () =>
    navbar.dataset.state === 'open' ||
    dropdowns.some((dropdown) => dropdown.dataset.state === 'open') ||
    navbar.contains(window.document.activeElement)

  const setNavbarVisibility = (isVisible) => {
    if (!isVisible && isNavbarEngaged()) return

    if (isVisible) setNavbarTheme()
    if (isVisible === isNavbarVisible) return

    isNavbarVisible = isVisible
    navbar.dataset.scrollState = isVisible ? 'visible' : 'hidden'
    navbar.inert = !isVisible

    if (isVisible) navbar.dataset.navbarPosition = 'fixed'
  }

  const handleNavbarScroll = ({ scroll = window.scrollY } = {}) => {
    const currentScroll = Math.max(0, scroll)
    const scrollDelta = currentScroll - lastScroll

    setNavbarTheme(currentScroll)

    if (currentScroll <= TOP_SCROLL_THRESHOLD) {
      setNavbarVisibility(true)
      lastScroll = currentScroll
      return
    }

    if (Math.abs(scrollDelta) < DIRECTION_SCROLL_THRESHOLD) return

    setNavbarVisibility(scrollDelta < 0)
    lastScroll = currentScroll
  }

  const setMobileMenuState = (isOpen) => {
    if (!mobileToggle || !panel) return

    const shouldOpen = mobileMedia.matches && isOpen

    if (shouldOpen) setNavbarVisibility(true)

    navbar.dataset.state = shouldOpen ? 'open' : 'closed'
    mobileToggle.setAttribute('aria-expanded', String(shouldOpen))
    mobileToggle.setAttribute(
      'aria-label',
      shouldOpen ? 'Close navigation menu' : 'Open navigation menu',
    )

    if (mobileMedia.matches) {
      panel.setAttribute('aria-hidden', String(!shouldOpen))
      panel.inert = !shouldOpen
    } else {
      panel.removeAttribute('aria-hidden')
      panel.inert = false
    }
  }

  const setDropdownState = (dropdown, isOpen) => {
    const toggle = dropdown.querySelector(SELECTORS.toggle)
    const menu = dropdown.querySelector(SELECTORS.menu)

    if (!toggle || !menu) return

    dropdown.dataset.state = isOpen ? 'open' : 'closed'
    toggle.setAttribute('aria-expanded', String(isOpen))
    menu.setAttribute('aria-hidden', String(!isOpen))
    menu.inert = !isOpen
  }

  const closeDropdowns = (exception = null) => {
    dropdowns.forEach((dropdown) => {
      if (dropdown !== exception) setDropdownState(dropdown, false)
    })
  }

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(SELECTORS.toggle)
    const menu = dropdown.querySelector(SELECTORS.menu)

    if (!toggle || !menu) return

    let closeTimer

    const openDropdown = () => {
      window.clearTimeout(closeTimer)
      setNavbarVisibility(true)
      closeDropdowns(dropdown)
      setDropdownState(dropdown, true)
    }

    const closeDropdown = () => {
      window.clearTimeout(closeTimer)
      setDropdownState(dropdown, false)
    }

    dropdown.addEventListener('pointerenter', (event) => {
      if (!mobileMedia.matches && event.pointerType === 'mouse') openDropdown()
    })

    dropdown.addEventListener('pointerleave', (event) => {
      if (mobileMedia.matches || event.pointerType !== 'mouse') return

      closeTimer = window.setTimeout(closeDropdown, 120)
    })

    dropdown.addEventListener('focusin', (event) => {
      if (event.target !== toggle) openDropdown()
    })

    dropdown.addEventListener('focusout', (event) => {
      if (!dropdown.contains(event.relatedTarget)) closeDropdown()
    })

    toggle.addEventListener('click', (event) => {
      const supportsHover = window.matchMedia(
        '(hover: hover) and (pointer: fine)',
      ).matches
      const isOpen = dropdown.dataset.state === 'open'

      if (!mobileMedia.matches && supportsHover && event.detail > 0)
        openDropdown()
      else if (isOpen) closeDropdown()
      else openDropdown()
    })

    toggle.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return

      event.preventDefault()
      openDropdown()

      const links = getMenuLinks(menu)
      const targetIndex = event.key === 'ArrowDown' ? 0 : links.length - 1

      links[targetIndex]?.focus()
    })

    menu.addEventListener('keydown', (event) => {
      const links = getMenuLinks(menu)
      const currentIndex = links.indexOf(window.document.activeElement)

      if (event.key === 'Escape') {
        event.preventDefault()
        closeDropdown()
        toggle.focus()
        return
      }

      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return

      event.preventDefault()

      const targetIndex =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? links.length - 1
            : event.key === 'ArrowDown'
              ? (currentIndex + 1) % links.length
              : (currentIndex - 1 + links.length) % links.length

      links[targetIndex]?.focus()
    })
  })

  mobileToggle?.addEventListener('click', () => {
    const isOpen = navbar.dataset.state === 'open'

    closeDropdowns()
    setMobileMenuState(!isOpen)
  })

  panel?.addEventListener('click', (event) => {
    if (!mobileMedia.matches || !event.target.closest('a[href]')) return

    closeDropdowns()
    setMobileMenuState(false)
  })

  mobileMedia.addEventListener('change', () => {
    closeDropdowns()
    setMobileMenuState(false)
  })

  window.document.addEventListener('pointerdown', (event) => {
    if (navbar.contains(event.target)) return

    closeDropdowns()
    setMobileMenuState(false)
  })

  window.document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return

    const openDropdown = dropdowns.find(
      (dropdown) => dropdown.dataset.state === 'open',
    )

    if (openDropdown) {
      setDropdownState(openDropdown, false)
      openDropdown.querySelector(SELECTORS.toggle)?.focus()
      return
    }

    if (navbar.dataset.state !== 'open') return

    setMobileMenuState(false)
    mobileToggle?.focus()
  })

  setNavbarTheme(lastScroll)
  navbar.dataset.scrollState = 'visible'
  lenis.on('scroll', handleNavbarScroll)
  window.addEventListener('resize', setNavbarContrast)
  setMobileMenuState(false)
}

export { initNavbar }
