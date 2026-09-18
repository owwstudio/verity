const SELECTORS = {
  navbar: '[data-navbar]',
  dropdown: '[data-navbar-dropdown]',
  toggle: '[data-navbar-dropdown-toggle]',
  menu: '[data-navbar-dropdown-menu]',
  mobileToggle: '[data-navbar-mobile-toggle]',
  panel: '[data-navbar-panel]',
}

const getMenuLinks = (menu) => [...menu.querySelectorAll('a[href]')]

const initNavbar = () => {
  const navbar = window.document.querySelector(SELECTORS.navbar)

  if (!navbar) return

  const dropdowns = [...navbar.querySelectorAll(SELECTORS.dropdown)]
  const mobileToggle = navbar.querySelector(SELECTORS.mobileToggle)
  const panel = navbar.querySelector(SELECTORS.panel)
  const mobileMedia = window.matchMedia('(width < 64rem)')

  const setMobileMenuState = (isOpen) => {
    if (!mobileToggle || !panel) return

    const shouldOpen = mobileMedia.matches && isOpen

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

  setMobileMenuState(false)
}

export { initNavbar }
