# Verity

Verity landing page built with Qwik City, TypeScript, CSS, GSAP, ScrollTrigger, and one shared Lenis instance.

## Requirements

- Node.js 20.3 or newer
- npm

## Commands

```sh
npm install
npm run dev
npm run build.types
npm run lint
npm run build
```

## Structure

```text
public/
└── assets/                  # Fonts, icons, images, and video
src/
├── components/
│   └── oww/                 # Page sections: TSX markup/behaviour + paired CSS
├── routes/
│   ├── index.tsx            # Home-page section composition
│   └── layout.tsx           # Navbar, footer, Lenis, and shared ScrollTrigger setup
├── entry.ssr.tsx
├── global.css
├── root.tsx
└── styles-oww-shared.css
```

Each page section owns its markup and interaction logic in a `.tsx` file and imports a paired `.css` file. Section scripts use `data-*` hooks rather than styling classes. Lenis is initialized only once in `src/routes/layout.tsx`.

The stable pre-refactor Pug implementation remains available on the `Dev` branch.
