# Verity

The design-neutral front-end foundation for Verity. It uses Vite, Vituum, Pug, SCSS, vanilla JavaScript, GSAP, ScrollTrigger, and one shared Lenis instance.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Commands

```sh
npm install       # Install dependencies
npm run dev       # Start the development server
npm run build     # Create the production build in dist/
npm run preview   # Preview the production build
npm run format    # Format supported project files
npm run lint      # Check JavaScript, SCSS, and formatting
```

## Architecture

```text
src/
├── assets/
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   └── video/
├── data/                    # Template data
├── pages/                   # Buildable Pug entry pages
├── scripts/
│   ├── core/                # Shared GSAP and Lenis setup
│   ├── components/          # Reusable component modules
│   ├── sections/            # Section-specific modules
│   └── main.js              # JavaScript entry point
├── styles/
│   ├── settings/            # Approved CSS custom-property tokens
│   ├── tools/               # Sass functions and mixins
│   ├── generic/             # Reset and normalization rules
│   ├── elements/            # Unclassed element defaults
│   ├── objects/             # Structural layout objects
│   ├── components/          # Strict BEM component styles
│   ├── utilities/           # Single-purpose utilities
│   └── main.scss            # Ordered SCSS entry point
└── templates/
    ├── layouts/             # Shared Pug page shells
    ├── components/          # Reusable Pug mixins
    └── sections/            # Static Pug includes
```

`src/scripts/core/motion.js` is the only GSAP plugin-registration point. `src/scripts/core/lenis.js` creates and exports the only Lenis instance. Future JavaScript and GSAP modules must select DOM elements through `data-*` attributes rather than BEM classes.

The current page is intentionally minimal. No Figma design, project-specific design tokens, or advanced animation has been implemented.

## Typography

Inter is loaded from Google Fonts in weights 400, 500, 600, and 700 and is the primary font family. Inter Display Regular and Medium are self-hosted from `src/assets/fonts` and are available through `var(--font-family-display)` for display typography.
