# Verity Development Guide

## Branch safety

- Work only on the current `Dev` branch.
- Do not switch to, merge into, or modify `main`.

## Stack

- Vite and Vituum
- Pug templates through `@vituum/vite-plugin-pug`
- SCSS with strict BEM naming
- Vanilla JavaScript ES modules
- GSAP with ScrollTrigger
- One shared Lenis instance

## Pug conventions

- Pages live in `src/pages` and extend `src/templates/layouts/base.pug`.
- Use includes from `src/templates/sections` for static, page-level sections.
- Use mixins in `src/templates/components` only for genuinely reusable components.
- Keep nesting shallow, use semantic HTML, and write explicit accessibility attributes.
- Keep complex JavaScript expressions out of templates. Put structured content in `src/data`.

## CSS conventions

- Follow the ITCSS directory order established in `src/styles/main.scss`.
- Add approved CSS custom properties in `src/styles/settings`; do not invent design tokens.
- Every styling class must follow strict BEM: `.block`, `.block__element`, or `.block--modifier`.
- Do not use BEM classes as JavaScript or animation selectors.
- Respect `prefers-reduced-motion` for every transition and animation.

## JavaScript conventions

- Use `data-*` attributes as JavaScript and GSAP selector hooks.
- Split behavior by component or section under the matching `src/scripts` directory.
- Keep GSAP plugin registration centralized in `src/scripts/core/motion.js`.
- Import the Lenis singleton from `src/scripts/core/lenis.js`; never initialize another Lenis instance.
- Prefer small, explicit initialization functions and progressive enhancement.

## Verification

- Run `npm run format` when editing supported source files.
- Run `npm run lint` and `npm run build` before handing off changes.
- Resolve all build and lint errors before finishing.
