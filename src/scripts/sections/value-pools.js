import { gsap } from '../core/motion.js'

const SELECTORS = {
  section: '[data-value-pools]',
  title: '[data-value-pools-title]',
  tableScreen: '[data-value-pools-table-screen]',
  tableContent: '[data-value-pools-content]',
  tableScroll: '[data-value-pools-table-scroll]',
  tableRunway: '[data-value-pools-table-runway]',
  tableHead: '[data-value-pools-table-head]',
  row: '[data-value-pools-row]',
  rowTrigger: '[data-value-pools-row-trigger]',
  rowDetails: '[data-value-pools-row-details]',
}

const setRowExpanded = (row, expanded) => {
  const trigger = row.querySelector(SELECTORS.rowTrigger)
  const details = row.querySelector(SELECTORS.rowDetails)

  row.dataset.state = expanded ? 'expanded' : 'collapsed'
  trigger?.setAttribute('aria-expanded', String(expanded))
  details?.setAttribute('aria-hidden', String(!expanded))
}

const initRowInteractions = (rows) => {
  const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
  const initialRow =
    rows.find((row) => row.dataset.state === 'expanded') ?? rows[0]

  const expandRow = (targetRow) => {
    rows.forEach((row) => setRowExpanded(row, row === targetRow))
  }

  expandRow(initialRow)

  rows.forEach((row) => {
    const trigger = row.querySelector(SELECTORS.rowTrigger)

    if (!trigger) return

    row.addEventListener('pointerenter', () => {
      if (hoverQuery.matches) expandRow(row)
    })

    trigger.addEventListener('focus', () => {
      expandRow(row)
    })

    trigger.addEventListener('click', () => {
      expandRow(row)
    })

    trigger.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return

      expandRow(initialRow)
      initialRow.querySelector(SELECTORS.rowTrigger)?.focus()
    })
  })
}

const initValuePools = () => {
  const section = window.document.querySelector(SELECTORS.section)

  if (!section) return

  const title = section.querySelector(SELECTORS.title)
  const tableScreen = section.querySelector(SELECTORS.tableScreen)
  const tableContent = section.querySelector(SELECTORS.tableContent)
  const tableScroll = section.querySelector(SELECTORS.tableScroll)
  const tableRunway = section.querySelector(SELECTORS.tableRunway)
  const tableHead = section.querySelector(SELECTORS.tableHead)
  const rows = gsap.utils.toArray(SELECTORS.row, section)

  if (
    !title ||
    !tableScreen ||
    !tableContent ||
    !tableScroll ||
    !tableRunway ||
    !tableHead ||
    !rows.length
  )
    return

  initRowInteractions(rows)

  const media = gsap.matchMedia()

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const titleReveal = gsap.fromTo(
      title,
      { y: 48, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: title,
          start: 'top 92%',
          end: 'center 52%',
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      },
    )

    const titleOverlap = gsap.to(title, {
      scale: 0.82,
      color: '#858585',
      transformOrigin: 'center center',
      ease: 'none',
      scrollTrigger: {
        trigger: tableScreen,
        start: 'top bottom',
        end: 'top 48%',
        scrub: 0.7,
        invalidateOnRefresh: true,
      },
    })

    const tableReveal = gsap.timeline({
      scrollTrigger: {
        trigger: tableScreen,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      },
    })

    tableReveal
      .fromTo(
        tableHead,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power2.out' },
      )
      .fromTo(
        rows,
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          stagger: 0.11,
          ease: 'power3.out',
        },
        '-=0.12',
      )

    return () => {
      titleReveal.scrollTrigger?.kill()
      titleOverlap.scrollTrigger?.kill()
      tableReveal.scrollTrigger?.kill()
      titleReveal.kill()
      titleOverlap.kill()
      tableReveal.kill()
    }
  })

  media.add(
    '(min-width: 56rem) and (prefers-reduced-motion: no-preference)',
    () => {
      let tableTravel = 0

      const updateTableTravel = () => {
        const contentStyles = window.getComputedStyle(tableContent)
        const padding =
          Number.parseFloat(contentStyles.paddingBlockStart) +
          Number.parseFloat(contentStyles.paddingBlockEnd)
        const requiredHeight = tableScroll.scrollHeight + padding

        tableTravel = Math.max(
          0,
          requiredHeight - tableScreen.clientHeight + 24,
        )
        tableRunway.style.blockSize = `${tableTravel}px`
      }

      updateTableTravel()

      const tablePan = gsap.to(tableScroll, {
        y: () => -tableTravel,
        ease: 'none',
        scrollTrigger: {
          trigger: tableScreen,
          start: 'top top',
          end: () => `+=${Math.max(tableTravel, 1)}`,
          scrub: 0.7,
          invalidateOnRefresh: true,
          onRefreshInit: updateTableTravel,
        },
      })

      return () => {
        tablePan.scrollTrigger?.kill()
        tablePan.kill()
        tableRunway.style.removeProperty('block-size')
        gsap.set(tableScroll, { clearProps: 'transform' })
      }
    },
  )
}

export { initValuePools }
