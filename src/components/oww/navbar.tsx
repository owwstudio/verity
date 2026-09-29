import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import navbarCss from "./navbar.css?inline";

/**
 * OWW navbar.
 *
 * Markup ported from code/handoff/sections/navbar/navbar.html and behaviour from
 * navbar.js. All data-* attributes are preserved verbatim — the initialiser
 * selects on them, not on CSS classes (code/readme.md §6.1). ARIA attributes are
 * likewise preserved (§6.3).
 *
 * Brand: the vendor ships assets/icons/verity-logo.svg. Replaced with the HH
 * signature built to the reference system in Figma (see the useStyles$ block
 * below, and design/brand-logo.md): monogram above, wordmark below, scaled
 * proportionally from a single factor. The HHLogo SVG component is not used
 * here — it draws the wordmark as paths, which can never be GT Maru text.
 */
export const Navbar = component$(() => {
  useStyles$(navbarCss);
  // Brand signature — the HH reference system, read from Figma 2026-09-16
  // (file stg4odPRVjisswnMWP28R8, frame 104:173 "HH Brand Identity").
  //
  // The monogram sits ABOVE the wordmark, and the whole signature scales
  // proportionally from one factor. Reference master, at 36px type:
  //
  //   wordmark   GT Maru Regular, 36px  -> 29px visible height, 249px wide
  //   monogram   2phi x 29 = 93.85 ~ 94px tall, 85px wide
  //   gap        24 / phi ~ 15px, measured ink-to-ink
  //
  // The monogram is therefore 3.24x the visible wordmark height, not a fraction
  // of it. Every value below is derived from --hh-scale so the signature can
  // only ever scale proportionally, which the source calls out explicitly:
  // "The complete signature must be scaled proportionally."
  //
  // --hh-scale 0.34 puts the signature at ~47px tall for the navbar.
  //
  // --hh-wordmark-scale is a DELIBERATE DEPARTURE from the reference system,
  // CEO instruction 2026-09-16: the wordmark is set 20% larger than the master
  // ratio gives. It is a separate factor rather than a hand-picked font size so
  // the departure stays visible and measurable: at 1 the signature is exactly
  // the Figma master, and the monogram-to-wordmark ratio moves from 2phi (3.24)
  // to 2.70 at 1.2. See design/brand-logo.md.
  useStyles$(`
    .navbar__brand {
      --hh-scale: 0.34;
      --hh-wordmark-scale: 1.2;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(15px * var(--hh-scale));
      inline-size: auto;
      block-size: auto;
      color: inherit;
      text-decoration: none;
    }
    .navbar__mark {
      display: block;
      block-size: calc(94.0426px * var(--hh-scale));
      inline-size: calc(85px * var(--hh-scale));
    }
    .navbar__wordmark {
      font-family: "GT Maru", Arial, sans-serif;
      font-weight: 400;
      font-style: normal;
      font-size: calc(36px * var(--hh-scale) * var(--hh-wordmark-scale));
      line-height: 1;
      white-space: nowrap;
    }
  `);

  const navRef = useSignal<HTMLElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      const navbar = navRef.value;
      if (!navbar) return;

      const SELECTORS = {
        dropdown: "[data-navbar-dropdown]",
        toggle: "[data-navbar-dropdown-toggle]",
        menu: "[data-navbar-dropdown-menu]",
        mobileToggle: "[data-navbar-mobile-toggle]",
        panel: "[data-navbar-panel]",
        darkSection:
          "[data-problem], [data-decision-flow], [data-ten-to-one], [data-authority-evidence], [data-status-stack]",
      };

      const listeners: Array<{
        el: EventTarget;
        type: string;
        fn: EventListener;
      }> = [];
      const on = (el: EventTarget, type: string, fn: EventListener) => {
        el.addEventListener(type, fn);
        listeners.push({ el, type, fn });
      };
      const timers: number[] = [];

      const getMenuLinks = (menu: Element) => [
        ...menu.querySelectorAll<HTMLAnchorElement>("a[href]"),
      ];

      // Scoped to navRef, not document — code/readme.md §6.2.
      const dropdowns = [
        ...navbar.querySelectorAll<HTMLElement>(SELECTORS.dropdown),
      ];
      const mobileToggle = navbar.querySelector<HTMLButtonElement>(
        SELECTORS.mobileToggle,
      );
      const panel = navbar.querySelector<HTMLElement>(SELECTORS.panel);
      const mobileMedia = window.matchMedia("(width < 64rem)");
      let lastScroll = window.scrollY;
      let navbarVisible = true;

      const setNavbarContrast = () => {
        const sampleY = Math.min(
          navbar.getBoundingClientRect().height + 1,
          innerHeight - 1,
        );
        const surface = document
          .elementsFromPoint(innerWidth / 2, sampleY)
          .find((element) => !navbar.contains(element));
        const dark =
          surface?.closest("section, footer")?.matches(SELECTORS.darkSection) ??
          false;
        navbar.dataset.navbarContrast = dark ? "light" : "dark";
      };

      const setNavbarTheme = (scroll = window.scrollY) => {
        setNavbarContrast();
        if (scroll <= 8) delete navbar.dataset.navbarTheme;
        else navbar.dataset.navbarTheme = "glass";
      };

      const setNavbarVisibility = (visible: boolean) => {
        if (visible === navbarVisible) return;
        navbarVisible = visible;
        navbar.dataset.scrollState = visible ? "visible" : "hidden";
        navbar.inert = !visible;
      };

      const setMobileMenuState = (open: boolean) => {
        if (!mobileToggle || !panel) return;
        const shouldOpen = mobileMedia.matches && open;
        navbar.dataset.state = shouldOpen ? "open" : "closed";
        mobileToggle.setAttribute("aria-expanded", String(shouldOpen));
        mobileToggle.setAttribute(
          "aria-label",
          shouldOpen ? "Close navigation menu" : "Open navigation menu",
        );
        if (mobileMedia.matches) {
          panel.setAttribute("aria-hidden", String(!shouldOpen));
          panel.inert = !shouldOpen;
        } else {
          panel.removeAttribute("aria-hidden");
          panel.inert = false;
        }
      };

      const setDropdownState = (dropdown: HTMLElement, isOpen: boolean) => {
        const toggle = dropdown.querySelector(SELECTORS.toggle);
        const menu = dropdown.querySelector<HTMLElement>(SELECTORS.menu);
        if (!toggle || !menu) return;
        dropdown.dataset.state = isOpen ? "open" : "closed";
        toggle.setAttribute("aria-expanded", String(isOpen));
        menu.setAttribute("aria-hidden", String(!isOpen));
        menu.inert = !isOpen;
      };

      const closeDropdowns = (exception: HTMLElement | null = null) => {
        dropdowns.forEach((dropdown) => {
          if (dropdown !== exception) setDropdownState(dropdown, false);
        });
      };

      dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector<HTMLElement>(SELECTORS.toggle);
        const menu = dropdown.querySelector<HTMLElement>(SELECTORS.menu);
        if (!toggle || !menu) return;

        let closeTimer = 0;

        const openDropdown = () => {
          window.clearTimeout(closeTimer);
          closeDropdowns(dropdown);
          setDropdownState(dropdown, true);
        };
        const closeDropdown = () => {
          window.clearTimeout(closeTimer);
          setDropdownState(dropdown, false);
        };

        on(dropdown, "pointerenter", ((event: PointerEvent) => {
          if (event.pointerType === "mouse") openDropdown();
        }) as EventListener);

        on(dropdown, "pointerleave", ((event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          closeTimer = window.setTimeout(closeDropdown, 120);
          timers.push(closeTimer);
        }) as EventListener);

        on(dropdown, "focusin", ((event: FocusEvent) => {
          if (event.target !== toggle) openDropdown();
        }) as EventListener);

        on(dropdown, "focusout", ((event: FocusEvent) => {
          if (!dropdown.contains(event.relatedTarget as Node)) closeDropdown();
        }) as EventListener);

        on(toggle, "click", ((event: MouseEvent) => {
          const supportsHover = window.matchMedia(
            "(hover: hover) and (pointer: fine)",
          ).matches;
          const isOpen = dropdown.dataset.state === "open";
          if (supportsHover && event.detail > 0) openDropdown();
          else if (isOpen) closeDropdown();
          else openDropdown();
        }) as EventListener);

        on(toggle, "keydown", ((event: KeyboardEvent) => {
          if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
          event.preventDefault();
          openDropdown();
          const links = getMenuLinks(menu);
          links[event.key === "ArrowDown" ? 0 : links.length - 1]?.focus();
        }) as EventListener);

        on(menu, "keydown", ((event: KeyboardEvent) => {
          const links = getMenuLinks(menu);
          const currentIndex = links.indexOf(
            document.activeElement as HTMLAnchorElement,
          );
          if (event.key === "Escape") {
            event.preventDefault();
            closeDropdown();
            toggle.focus();
            return;
          }
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
            return;
          event.preventDefault();
          links[
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? links.length - 1
                : event.key === "ArrowDown"
                  ? (currentIndex + 1) % links.length
                  : (currentIndex - 1 + links.length) % links.length
          ]?.focus();
        }) as EventListener);
      });

      if (mobileToggle) {
        on(mobileToggle, "click", (() => {
          closeDropdowns();
          setMobileMenuState(navbar.dataset.state !== "open");
        }) as EventListener);
      }

      if (panel) {
        on(panel, "click", ((event: MouseEvent) => {
          if (
            !mobileMedia.matches ||
            !(event.target as Element).closest("a[href]")
          )
            return;
          closeDropdowns();
          setMobileMenuState(false);
        }) as EventListener);
      }

      on(mobileMedia, "change", (() => {
        closeDropdowns();
        setMobileMenuState(false);
      }) as EventListener);

      on(window, "scroll", (() => {
        const current = Math.max(0, window.scrollY);
        const delta = current - lastScroll;
        setNavbarTheme(current);
        if (current <= 8) setNavbarVisibility(true);
        else if (Math.abs(delta) >= 3 && navbar.dataset.state !== "open")
          setNavbarVisibility(delta < 0);
        lastScroll = current;
      }) as EventListener);
      on(window, "resize", setNavbarContrast as EventListener);

      // Document-level dismissal. Registered globally by design (click-outside
      // and global Escape), and therefore explicitly removed in cleanup().
      on(document, "pointerdown", ((event: PointerEvent) => {
        if (!navbar.contains(event.target as Node)) {
          closeDropdowns();
          setMobileMenuState(false);
        }
      }) as EventListener);

      on(document, "keydown", ((event: KeyboardEvent) => {
        if (event.key !== "Escape") return;
        const openDropdown = dropdowns.find(
          (dropdown) => dropdown.dataset.state === "open",
        );
        if (!openDropdown) return;
        setDropdownState(openDropdown, false);
        openDropdown.querySelector<HTMLElement>(SELECTORS.toggle)?.focus();
      }) as EventListener);

      setNavbarTheme(lastScroll);
      navbar.dataset.scrollState = "visible";
      setMobileMenuState(false);

      cleanup(() => {
        listeners.forEach(({ el, type, fn }) =>
          el.removeEventListener(type, fn),
        );
        timers.forEach((t) => window.clearTimeout(t));
      });
    },
    { strategy: "document-ready" },
  );

  return (
    <nav
      ref={navRef}
      class="navbar"
      aria-label="Primary navigation"
      data-navbar="data-navbar"
      data-state="closed"
      data-navbar-position="fixed"
    >
      <a
        class="navbar__brand"
        href="/"
        aria-label="Helge Heupel home"
        data-navbar-logo="data-navbar-logo"
      >
        <img
          class="navbar__mark"
          src="/images/hh-monogram.svg"
          alt=""
          width="85"
          height="94"
        />
        <span class="navbar__wordmark">Helge Heupel</span>
      </a>
      <button
        class="navbar__mobile-toggle"
        type="button"
        aria-label="Open navigation menu"
        aria-expanded="false"
        aria-controls="navbar-menu"
        data-navbar-mobile-toggle
      >
        <img
          class="navbar__mobile-toggle-icon navbar__mobile-toggle-icon--open"
          src="/assets/icons/list.svg"
          alt=""
          width={24}
          height={24}
        />
        <img
          class="navbar__mobile-toggle-icon navbar__mobile-toggle-icon--close"
          src="/assets/icons/close.svg"
          alt=""
          width={24}
          height={24}
        />
      </button>
      <div id="navbar-menu" class="navbar__panel" data-navbar-panel>
        <ul class="navbar__menu" data-navbar-primary="data-navbar-primary">
          <li class="navbar__item">
            <a class="navbar__link" href="/assessment/">
              Assessment
            </a>
          </li>
          <li
            class="navbar__item navbar__item--dropdown"
            data-navbar-dropdown="product"
            data-state="closed"
          >
            <button
              class="navbar__link navbar__dropdown-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="navbar-product-menu"
              aria-haspopup="true"
              data-navbar-dropdown-toggle="data-navbar-dropdown-toggle"
            >
              <span>Product</span>
              <span class="navbar__dropdown-caret" aria-hidden="true">
                <img
                  src="/assets/icons/caret-down.svg"
                  alt=""
                  width={16}
                  height={16}
                />
              </span>
            </button>
            <div
              class="navbar__dropdown navbar__dropdown--product"
              id="navbar-product-menu"
              aria-hidden="true"
              inert={true}
              data-navbar-dropdown-menu="data-navbar-dropdown-menu"
            >
              <span class="navbar__ribbon">Coming soon</span>
              {/*
              Product menu, CEO 2026-09-16: "HH Decisioning" dropped, "HH Value
              Engine" becomes "Decision Pricer", and both remaining entries are
              marked "(soon)" because neither page exists yet — /product/* all
              404 today.

              The "(soon)" is inside the link text rather than a separate badge
              so a screen reader announces it with the name, not as a stray word
              after it.
            */}
              <ul class="navbar__dropdown-list">
                {/* Asset Tokenizer leads the product list, CEO 2026-09-18. */}
                <li class="navbar__dropdown-item">
                  <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                    Asset Tokenizer
                  </span>
                </li>
                <li class="navbar__dropdown-item">
                  <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                    Decision Pricer
                  </span>
                </li>
                <li class="navbar__dropdown-item">
                  <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                    SAP Add-in
                  </span>
                </li>
              </ul>
            </div>
          </li>
          <li
            class="navbar__item navbar__item--dropdown"
            data-navbar-dropdown="solutions"
            data-state="closed"
          >
            <button
              class="navbar__link navbar__dropdown-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="navbar-solutions-menu"
              aria-haspopup="true"
              data-navbar-dropdown-toggle="data-navbar-dropdown-toggle"
            >
              <span>Solutions</span>
              <span class="navbar__dropdown-caret" aria-hidden="true">
                <img
                  src="/assets/icons/caret-down.svg"
                  alt=""
                  width={16}
                  height={16}
                />
              </span>
            </button>
            <div
              class="navbar__dropdown navbar__dropdown--solutions"
              id="navbar-solutions-menu"
              aria-hidden="true"
              inert={true}
              data-navbar-dropdown-menu="data-navbar-dropdown-menu"
            >
              <span class="navbar__ribbon">Coming soon</span>
              <div class="navbar__dropdown-group">
                {/*
                Industry list replaced 2026-09-16 on CEO instruction, content taken
                from the industry-pools section so the menu and that section name the
                same seven industries. It previously listed M&A, Litigation, Banking,
                Tax and Insurance — a mix of service lines and industries.

                The "by industry" heading was dropped on CEO instruction 2026-09-17.
                Labels are reproduced verbatim from the source, including its
                inconsistent capitalisation.
              */}
                <ul class="navbar__dropdown-list">
                  {/* Automotive leads the industries, CEO 2026-09-17. */}
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Automotive
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Connected products
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Insurance
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Banking and payments
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Critical Infrastructure
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Assurance And Professional Services
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Cross-functional enterprise operations
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Cloud and technology platforms
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </li>
          <li class="navbar__item">
            <a class="navbar__link" href="/assurance/">
              Assurance
            </a>
          </li>
        </ul>
        <div class="navbar__actions">
          <ul class="navbar__menu navbar__menu--secondary">
            <li
              class="navbar__item navbar__item--dropdown"
              data-navbar-dropdown="company"
              data-state="closed"
            >
              <button
                class="navbar__link navbar__dropdown-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="navbar-company-menu"
                aria-haspopup="true"
                data-navbar-dropdown-toggle="data-navbar-dropdown-toggle"
              >
                <span>Company</span>
                <span class="navbar__dropdown-caret" aria-hidden="true">
                  <img
                    src="/assets/icons/caret-down.svg"
                    alt=""
                    width={16}
                    height={16}
                  />
                </span>
              </button>
              <div
                class="navbar__dropdown navbar__dropdown--company"
                id="navbar-company-menu"
                aria-hidden="true"
                inert={true}
                data-navbar-dropdown-menu="data-navbar-dropdown-menu"
              >
                <span class="navbar__ribbon">Coming soon</span>
                <ul class="navbar__dropdown-list">
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Careers
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Blog
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Press
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      About
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <a
                      class="navbar__dropdown-link"
                      href="mailto:contact@helgeheupel.com"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </li>
            <li
              class="navbar__item navbar__item--dropdown"
              data-navbar-dropdown="how-it-works"
              data-state="closed"
            >
              <button
                class="navbar__link navbar__dropdown-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="navbar-how-it-works-menu"
                aria-haspopup="true"
                data-navbar-dropdown-toggle="data-navbar-dropdown-toggle"
              >
                <span>How it works</span>
                <span class="navbar__dropdown-caret" aria-hidden="true">
                  <img
                    src="/assets/icons/caret-down.svg"
                    alt=""
                    width={16}
                    height={16}
                  />
                </span>
              </button>
              <div
                class="navbar__dropdown navbar__dropdown--how-it-works"
                id="navbar-how-it-works-menu"
                aria-hidden="true"
                inert={true}
                data-navbar-dropdown-menu="data-navbar-dropdown-menu"
              >
                <span class="navbar__ribbon">Coming soon</span>
                <ul class="navbar__dropdown-list">
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Evidence
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Security
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Trust
                    </span>
                  </li>
                  <li class="navbar__dropdown-item">
                    <span class="navbar__dropdown-link navbar__dropdown-link--pending">
                      Patents pending
                    </span>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
          <div class="navbar__controls">
            {/*
            Language selector removed 2026-09-16 on CEO instruction. The vendor
            markup offered /en/ and /de/; neither route exists, and the site is
            English-only for now. The dropdown toggle it carried was also the last
            control that wrote hh-locale to localStorage — see /cookies.
          */}
            {/*
            CEO instruction 2026-09-16: the CTA opens a mail composer to
            contact@helgeheupel.com. It pointed at /call-with-founder/, which
            404s — no such route exists.

            A mailto is the one route that works today and adds no processor:
            nothing is loaded, stored or transmitted until the visitor acts, so
            the TDDDG §25 position and the privacy notice are both unaffected.
            The Calendly link replaces this when the booking URL is to hand.
          */}
            <a
              class="button button--primary navbar__cta button--compact"
              href="mailto:contact@helgeheupel.com?subject=Call%20with%20Founder"
              data-button="primary"
              data-navbar-cta="data-navbar-cta"
            >
              <span class="button__label">Call with Founder</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
});
