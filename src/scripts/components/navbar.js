const SELECTORS = {
  navbar: '[data-navbar]',
  dropdown: '[data-navbar-dropdown]',
  toggle: '[data-navbar-dropdown-toggle]',
  menu: '[data-navbar-dropdown-menu]',
}

const getMenuLinks = (menu) => [...menu.querySelectorAll('a[href]')]

const initNavbar = () => {
  const navbar = window.document.querySelector(SELECTORS.navbar)

  if (!navbar) return

  const dropdowns = [...navbar.querySelectorAll(SELECTORS.dropdown)]

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
      if (event.pointerType === 'mouse') openDropdown()
    })

    dropdown.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'mouse') return

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

      if (supportsHover && event.detail > 0) openDropdown()
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

  window.document.addEventListener('pointerdown', (event) => {
    if (!navbar.contains(event.target)) closeDropdowns()
  })

  window.document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return

    const openDropdown = dropdowns.find(
      (dropdown) => dropdown.dataset.state === 'open',
    )

    if (!openDropdown) return

    setDropdownState(openDropdown, false)
    openDropdown.querySelector(SELECTORS.toggle)?.focus()
  })
}

export { initNavbar }
